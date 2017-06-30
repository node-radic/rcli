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


interface RConfig extends IConfigProperty {
    save(): this

    load(): this

    lock(): this

    unlock(): this

    isLocked(): boolean

    reset(): this
}


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
            host: '127.0.0.1',
            port: 41333
        },
        client: {
            host: '127.0.0.1',
            port: Math.round(Math.random() * 10000) + 1000
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
    protected autoload: boolean    = true;
    protected filePath: string
    protected saveEnabled: boolean = false;

    constructor(obj: Object) {
        super({});
        this.cryptr        = new Cryptr((new Keys()).public)
        this.defaultConfig = obj;
        this.filePath      = paths.userDataConfig;
        if ( this.autoload ) {
            this.load();
            this.loadEnv();
        }
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
        if ( this.saveEnabled === false ) return this;
        const str       = JSON.stringify(this.data);
        // process.stdout.write(require('util').inspect(this.data, true, 5, true));
        const encrypted = this.cryptr.encrypt(str);
        writeFileSync(this.filePath, encrypted, { encoding: 'utf8' });
        if ( true === true ) {
            writeFileSync(this.filePath + '.debug.json', JSON.stringify(this.data, undefined, 2), { encoding: 'utf8' });
        }
        return this;
    }

    load(): this {
        if ( ! existsSync(this.filePath) ) return this;
        this.saveEnabled = false;
        this.data        = this.defaultConfig;
        const str        = readFileSync(this.filePath, 'utf8');
        const decrypted  = this.cryptr.decrypt(str);
        const parsed     = JSON.parse(decrypted);
        this.merge(parsed);
        this.saveEnabled = true;
        this.save()
        return this;
    }

    lock(): this {
        this.saveEnabled = false;
        return this;
    }

    unlock(): this {
        this.saveEnabled = true;
        return this;
    }

    isLocked(): boolean { return this.saveEnabled }

    reset(): this {
        if ( ! existsSync(this.filePath) ) return this;
        unlinkSync(this.filePath);
        return this;
    }

    protected backup(data, encrypt: boolean = true): string {
        let totalFiles  = globule.find(join(paths.dbBackups, '*')).length;
        let prefix      = encrypt ? '.nocrypt.' : '.crypt.'
        let filePath    = join(paths.backups, totalFiles + prefix + moment().format('YYYY-MM-hh:mm:ss'));
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
        return this.backup(JSON.stringify(super.raw(''), null, 4), false)
    }

    restore(filePath: string, encrypt: boolean = true): this {
        // filePath.includes('.crypt');
        let content = readFileSync(isAbsolute(filePath) ? filePath : join(process.cwd(), filePath));
        if(encrypt) content = this.cryptr.decrypt(content);
        this.data   = JSON.parse(content.toString());
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

        Object.keys(process.env).forEach(key => {
            key = key.replace('_', '.');
            if ( this.has(key) )
                this.set(key, parseEnvVal(process.env[ key ]));
        })

        return this;
    }

    public static makeProperty(config: PersistentFileConfig) :RConfig {
        let prop = Config.makeProperty(config);
        [ 'save', 'load', 'lock', 'unlock', 'reset', 'isLocked' ].forEach(fnName => prop[ fnName ] = config[ fnName ].bind(config))
        return <RConfig> prop;
    }
}


let _config = new PersistentFileConfig(defaultConfig);
_config.load();
// export the wrapped config
const config: RConfig = PersistentFileConfig.makeProperty(_config);

container.bind<PersistentFileConfig>('r.config.core').toConstantValue(_config);
container.bind<RConfig>('r.config').toConstantValue(config);

export { RConfig, config, PersistentFileConfig }