import * as moment from "moment";
import { Config, getRandomId, IConfig, IConfigProperty, kindOf } from "@radic/util";
import { existsSync, readFileSync, writeFileSync, writeJsonSync } from "fs-extra";
import * as dotenv from "dotenv";
import { paths, setPaths } from "./paths";
import { unlinkSync } from "fs";
import { container, lazyInject, singleton } from "@radic/console";
import { basename, join } from "path";
import * as globule from "globule";
import { AES, enc } from "crypto-js";
import { cloneDeep } from "lodash";

export interface RConfig extends IConfigProperty {
    save(): this

    load(): this

    lock(): this

    unlock(): this

    isLocked(): boolean

    reset(): this
}

@singleton('r.config.crypto')
export class ConfigCrypto {
    protected secretKey: string;

    protected generateSecretKey(): string {
        const secretKey = getRandomId(30);
        writeFileSync(paths.userSecretKeyFile, secretKey, 'utf-8');
        return secretKey;
    }

    protected hasGeneratedSecretKey(): boolean {
        return existsSync(paths.userSecretKeyFile);
    }

    protected getSecretKey(): string {
        if ( kindOf(this.secretKey) === 'string' ) {
            return this.secretKey;
        }
        if ( this.hasGeneratedSecretKey() && this.secretKey === undefined ) {
            this.secretKey = readFileSync(paths.userSecretKeyFile, 'utf-8');
        } else if ( this.secretKey === undefined ) {
            this.secretKey = this.generateSecretKey();
        }
        return this.secretKey;
    }

    encrypt(data: any): string {
        return AES.encrypt(JSON.stringify(data), this.getSecretKey()).toString();
    }

    decrypt<T extends Object>(ciphertext: string): T {
        const bytes = AES.decrypt(ciphertext, this.getSecretKey());
        return JSON.parse(bytes.toString(enc.Utf8))
    }
}

@singleton('r.config.backups')
export class ConfigBackupStore {
    @lazyInject('r.config.crypto')
    crypto: ConfigCrypto;


    create(data, encrypt: boolean = true): string {
        const filePath = this.createUniqueFilePath(encrypt);
        writeFileSync(filePath, encrypt ? this.crypto.encrypt(data) : JSON.stringify(data), 'utf-8')
        return basename(filePath, '.js');
    }

    all(): string[] {
        return globule.find(join(paths.dbBackups, '*')).map((filePath: string) => basename(filePath, '.js'));
    }

    get(id: string, decrypt: boolean = true): any {
        const raw = readFileSync(join(paths.dbBackups, id + '.js'), 'utf-8')
        return decrypt ? this.crypto.decrypt(raw) : JSON.parse(raw);
    }

    protected createUniqueFilePath(encrypt: boolean = true): string {
        let totalFiles = globule.find(join(paths.dbBackups, '*')).length;
        let prefix     = encrypt ? '.nocrypt.' : '.crypt.'
        let filePath   = join(paths.backups, totalFiles + prefix + moment().format('YYYY-MM-hh:mm:ss'));

        return filePath;
    }

}

let defaultConfig: any = {
    debug: false,
    env  : {},
    cli  : {
        showCopyright: true
    },
    dgram: {
        server: {
            host: '127.0.0.1',
            port: 41333
        },
        client: {
            host: '127.0.0.1',
            port: Math.round(Math.random() * 10000) + 1000
        }
    },
    pmove: {
        extensions: [ 'mp4', 'wma', 'flv', 'mkv', 'avi', 'wmv', 'mpg' ]
    },
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

    @lazyInject('r.config.crypto')
    crypto: ConfigCrypto;

    @lazyInject('r.config.backups')
    backups: ConfigBackupStore;


    defaultConfig: Object;

    protected saveEnabled: boolean = false;

    constructor(obj: Object, protected filePath: string = null, public useCrypto: boolean = true, autoload: boolean = true, autoloadEnv: boolean = true) {
        super({});
        this.defaultConfig = obj;
        this.filePath      = filePath || paths.userDataConfig;
        if ( autoload ) {
            this.load();
        }
        if ( autoloadEnv ) {
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

    merge(...args): this {
        super.merge.apply(this, args);
        return this.save();
    }

    save(): this {
        if ( this.saveEnabled === false ) return this;
        if ( ! this.useCrypto ) {
            writeJsonSync(this.filePath, this.data);
            return this;
        }
        const encrypted = this.crypto.encrypt(JSON.stringify(this.data));
        writeFileSync(this.filePath, encrypted, 'utf8');
        if ( this.get('debug', false) === true ) {
            writeJsonSync(this.filePath + '.debug.json', this.data);
        }
        return this;
    }

    load(): this {
        this.data = cloneDeep(this.defaultConfig)
        if ( ! existsSync(this.filePath) ) {
            return this.save()
        }
        const config = readFileSync(this.filePath, 'utf8');
        return this.useCrypto ? this.merge(this.crypto.decrypt(config)) : this.merge(JSON.parse(config))
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
        writeJsonSync(this.filePath, {})
        return this;
    }

    backup(encrypt?: boolean): string {
        return this.backups.create(this.data, encrypt !== undefined ? encrypt : this.useCrypto);
    }

    backupWithEncryption(): string {
        return this.backup(true)
    }

    backupWithoutEncryption(): string {
        return this.backup(false)
    }

    restore(id: string, decrypt: boolean = true): this {
        // filePath.includes('.crypt');
        this.data = this.backups.get(id, decrypt);
        return this.save();
    }

    getBackupIds(): string [] {
        return this.backups.all();
    }

    protected loadEnv(): this {
        if ( existsSync(paths.env) ) {
            let denv = dotenv.parse(<any> readFileSync(paths.env));
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

    public static makeProperty(config: PersistentFileConfig): RConfig {
        let prop = Config.makeProperty(config);
        [ 'save', 'load', 'lock', 'unlock', 'reset', 'isLocked' ].forEach(fnName => prop[ fnName ] = config[ fnName ].bind(config))
        return <RConfig> prop;
    }
}

export type RCFileKey = 'directory' | 'prefix'
export interface RCFileConfig {
    directory?: string
    prefix?: string
}
export class RCFile {
    protected config: PersistentFileConfig

    constructor() {
        this.config = new PersistentFileConfig({}, paths.rcFile, false, true, false);
    }

    reset(): this {
        this.config.reset();
        return this;
    }

    set(key: RCFileKey, value: string): this {
        this.config.set(key, value);
        return this;
    }

    unset(key: RCFileKey): this {
        this.config.unset(key)
        return this;
    }

    get(key: RCFileKey, defaultValue?: string): string {
        return this.config.get<string>(key, defaultValue);
    }

    reload() {
        this.config.load();
        setPaths({}, null, this.get('prefix', null), this.get('directory', '.rcli'));
    }
}


let _config = new PersistentFileConfig(defaultConfig);
// _config.load(); = autoloaded
// export the wrapped config
export const config: RConfig = PersistentFileConfig.makeProperty(_config);

container.bind<PersistentFileConfig>('r.config.core').toConstantValue(_config);
container.bind<RConfig>('r.config').toConstantValue(config);

const rcfile = new RCFile();
rcfile.reload();
container.constant<RCFile>('r.rcfile', rcfile)