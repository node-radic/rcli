import { Config, IConfig, IConfigProperty } from "@radic/util";
import * as Cryptr from "cryptr";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import * as dotenv from "dotenv";
import { Keys } from "./keys";
import { paths } from "./paths";
import { unlinkSync } from "fs";
import { container } from "@radic/console";

export interface RConfig extends IConfigProperty {}


let defaultConfig: any = {
    debug  : false,
    env    : {},
    cli    : {
        showCopyright: true
    },
    auth   : {
        connections: []
    },
    dgram  : {
        server: {
            port: 41333
        },
        client: {
            port: 41334
        }
    },
    pmove  : {
        extensions: [ 'mp4', 'wma', 'flv', 'mkv', 'avi', 'wmv', 'mpg' ]
    },
    connect: {}
};

// load .env stuff
function parseEnvVal(val: any) {
    if ( val === 'true' || val === 'false' ) {
        return val === 'true'
    }
    if ( isFinite(val) ) return parseInt(val);
    return val
}


export class PersistentFileConfig extends Config {
    cryptr: any;
    defaultConfig: Object;
    protected saveEnabled: boolean = true;

    constructor(obj: Object) {
        super({});
        this.cryptr        = new Cryptr((new Keys())._public)
        this.defaultConfig = obj;
        this.load();
    }

    set(prop: string, value: any): IConfig {
        super.set(prop, value);
        return this.save();
    }


    unset(prop: any): any {
        super.unset(prop);
        return this.save();
    }

    merge(...args): IConfig {
        super.merge.apply(this, args);
        return this.save();
    }

    save(): this {
        if ( ! this.saveEnabled ) return this;
        const str       = JSON.stringify(this.data);
        // process.stdout.write(require('util').inspect(this.data, true, 5, true));
        const encrypted = this.cryptr.encrypt(str);
        writeFileSync(paths.userDataConfig, encrypted, { encoding: 'utf8' });
        if ( true === true ) {
            writeFileSync(paths.userDataConfig + '.debug.json', JSON.stringify(this.data, undefined, 2), { encoding: 'utf8' });
        }
        return this;
    }

    load(): this {
        if ( ! existsSync(paths.userDataConfig) ) return this;
        this.saveEnabled = false;
        this.data        = this.defaultConfig;
        const str        = readFileSync(paths.userDataConfig, 'utf8');
        const decrypted  = this.cryptr.decrypt(str);
        const parsed     = JSON.parse(decrypted);
        this.merge(parsed);
        this.loadEnv();
        this.saveEnabled = true;
        return this;
    }

    reset(): this {
        if ( ! existsSync(paths.userDataConfig) ) return this;
        unlinkSync(paths.userDataConfig);
        return this;
    }

    protected loadEnv(): this {
        if ( existsSync(paths.env) ) {
            var denv = dotenv.parse(<any> readFileSync(paths.env));
            Object.keys(denv).forEach((key: string) => {
                let value = parseEnvVal(denv[ key ]);
                key       = key.replace('_', '.');
                // _config.set('env.'+ key, value)
                // only set if its actually a config key
                if ( this.has(key) )
                    this.set(key, value)
            })
        }
        return this;
    }

}

// The actual config
// let _config : CommandoPersistentConfig = <any> kernel.build(CommandoPersistentConfig, (context: any) => {
//     const keys = context.kernel.get(COMMANDO.KEYS);
//     return new ;
// });

let _config = new PersistentFileConfig(defaultConfig);

// export the wrapped config
export const config: RConfig = Config.makeProperty(_config);

container.constant('r.config', config);
