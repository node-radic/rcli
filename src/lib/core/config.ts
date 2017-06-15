import * as moment from "moment";
import { Config, IConfig, IConfigProperty } from "@radic/util";
import * as Cryptr from "cryptr";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import * as dotenv from "dotenv";
import { Keys } from "./keys";
import { paths } from "./paths";
import { readdirSync, unlinkSync } from "fs";
import { container } from "@radic/console";
import { isAbsolute, join } from "path";
import * as globule from "globule";

interface RConfig extends IConfigProperty {}


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


class PersistentFileConfig extends Config {
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
        this.save()
        return this;
    }

    reset(): this {
        if ( ! existsSync(paths.userDataConfig) ) return this;
        unlinkSync(paths.userDataConfig);
        return this;
    }

    protected backup(data, encrypt: boolean = true): string {
        let totalFiles  = globule.find(join(paths.dbBackups, '*')).length;
        let prefix      = encrypt ? '.nocrypt.' : '.crypt.'
        let filePath    = join(paths.dbBackups, totalFiles + prefix + moment().format('YYYY-MM-hh:mm:ss'));
        const str       = JSON.stringify(this.data);
        const encrypted = this.cryptr.encrypt(str);
        if ( encrypt ) {
            writeFileSync(filePath + '.json', encrypted, { encoding: 'utf8' });
        }
        writeFileSync(filePath + '.json', JSON.stringify(this.data, undefined, 4), { encoding: 'utf8' });

        return filePath;
    }

    backupWithEncryption(filePath?: string): string {
        return this.backup(this.cryptr.encrypt(this.data), true)
    }

    backupWithoutEncryption(filePath?: string): string {
        return this.backup(JSON.stringify(super.raw(''), '', 4), false)
    }

    restore(filePath: string): this {
        filePath.includes('.crypt');
        let content = readFileSync(isAbsolute(filePath) ? filePath : join(process.cwd(), filePath));
        this.data   = JSON.parse(content);

        this.save();
        this.load()
        return this;
    }

    getLocalBackupFiles() {
        let dir = readdirSync(paths.dbBackups);
        if ( dir.length === 0 ) return [];
        return dir.map(d => d);
    }

    protected loadEnv(): this {
        if ( existsSync(paths.env) ) {
            var denv = dotenv.parse(<any> readFileSync(paths.env));
            Object.keys(denv).forEach((key: string) => {
                let value = parseEnvVal(denv[ key ]);
                key       = key.replace('_', '.');
                // _config.set('env.'+ key, value)
                // only set if its actually a config key
                // if ( this.has(key) )
                this.set(key, value)
            })
        }
        return this;
    }
}



let _config = new PersistentFileConfig(defaultConfig);
_config.load();
// export the wrapped config
const config: RConfig = Config.makeProperty(_config);

container.bind<PersistentFileConfig>('r.config.core').toConstantValue(_config);
container.bind<RConfig>('r.config').toConstantValue(config);

export { RConfig, config, PersistentFileConfig }