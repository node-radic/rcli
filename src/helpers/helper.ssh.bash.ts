import { helper, HelperOptions, HelperOptionsConfig, InputHelper, lazyInject, Log, OutputHelper } from 'radical-console';
import { RConfig } from '../core/config';
import * as _ from 'lodash';
import { existsSync } from 'fs';
import { readJSONSync } from 'fs-extra';

/**SSH CONNNECT HELPER*/


export interface SshConnectHelperDataSet {

    name     ?: string
    user     ?: string
    host     ?: string
    method   ?: string
    password ?: string
    port     ?: number
    localPath?: string
    hostPath ?: string
}

@helper('ssh.bash', <HelperOptions>{
    depends  : [ 'input', 'output' ],
    configKey: 'connect',
    config   : {
        defaults: {
            method   : 'key',
            localPath: '/mnt/<name>',
            hostPath : '/',
            port     : 60000
        }
    }

})
export class SshBashHelper {
    connect: HelperOptionsConfig;

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

    @lazyInject('cli.log')
    log: Log;

    @lazyInject('r.config')
    config: RConfig

    public validateObject(obj: Object) {

        let total = Object.keys(obj).map(key => {
            return this.keys().includes(key)
        }).length;


        let filled = this.keys().map(key => {
            return obj[ key ] !== undefined
        }).length

        let named = this.keys().map(key => {
        })
        return { keys: this.keys(), total, filled }
    }

    public keys() {
        return Object.keys(this.getDataSet())
    }

    public getDataSet(name?: string, user?: string, host?: string): SshConnectHelperDataSet {
        return <SshConnectHelperDataSet> _.cloneDeep({
            name     : name || '',
            user     : user || '',
            host     : host || '',
            method   : this.connect.defaults.method,
            password : null,
            port     : this.connect.defaults.port,
            localPath: this.connect.defaults.localPath.replace('<name>', name || ''),
            hostPath : this.connect.defaults.hostPath
        })
    }

    public edit(connection) {
        let editor      = {};
        let config      = this.config;
        editor[ 'set' ] = (...fields: string[]) => {
            return {
                to<T extends string | number>(value: T) {
                    fields.forEach(field => {
                        config.set(`connect.${connection}.${field}`, value);
                    })
                    return editor;
                }
            }
        }
        editor[ 'get' ] = (...fields: string[]) => {
            return fields.length === 1 ? config(`connect.${connection}.${fields[ 0 ]}`) : fields.map(field => config(`connect.${connection}.${field}`))
        }
        return editor;
    }

    get(name): SshConnectHelperDataSet {
        return this.config.get('connect.' + name)
    }

    has(name): boolean {
        // SSHConnection.query().where({name}).first().execute();
        return this.config.has('connect.' + name)
    }


    validateImport(file) {

        if ( ! existsSync(file) ) {
            this.log.error('not found ' + file)
            return
        } else {
            const json          = readJSONSync(file);
            let resultTotal     = 0
            let resultFilled    = 0
            let resultKeys: any = 0

            Object.keys(json).forEach(name => {
                const { keys, total, filled } = this.validateObject(json[ name ])
                resultKeys.push(keys)
                resultTotal += total
                resultFilled += filled
            })
            this.out.line(`
                 ${resultKeys}
resultTotal    : ${resultTotal}
resultFilled   : ${resultFilled}`)

            if ( resultFilled < 8 ) {
                this.log.error('not a valid import log')
                return false;
            }
            return true
        }
    }

    //
    // async runImport(file) {
    //     if ( ! this.validateImport(file) ) return;
    //     const json    = readJSONSync(file);
    //     let connect   = this.config.get('connect')
    //     let conflicts = []
    //     Object.keys(json).forEach(name => {
    //         if ( this.config.has('connect.' + name) ) {
    //             conflicts.push(name)
    //         } else {
    //             connect[ name ] = _.cloneDeep(json[ name ])
    //         }
    //     })
    //     this.log.warn(`There are some [${conflicts.length} naming conflicts`)
    //     conflicts.forEach(c => this.log.warn('conflict for: ' + c))
    //     this.out.dump(connect);
    //     let confirm = await this.ask.confirm('Agree with resuilt and merge?')
    //     if ( confirm ) {
    //         this.config.set('connect', connect);
    //     }
    // }
    //
    // async getName(oldName) {
    //     return await this.ask.ask('Rename of' + oldName)
    // }
//
//     validateImport(file) {
//
//         if ( ! existsSync(file) ) {
//             this.log.error('not found ' + file)
//             return
//         } else {
//             const json               = readJSONSync(file);
//             let resultTotal          = 0
//             let resultFilled         = 0
//             let resultKeys: string[] = 0
//
//             Object.keys(json).forEach(name => {
//                 const { keys, total, filled } = this.ssh.validateObject(json[ name ])
//                 resultKeys.push(keys)
//                 resultTotal += total
//                 resultFilled += filled
//             })
//             this.out.line(`
//                  ${resultKeys}
// resultTotal    : ${resultTotal}
// resultFilled   : ${resultFilled}`)
//
//             if ( resultFilled < 8 ) {
//                 this.log.error('not a valid import log')
//                 return false;
//             }
//             return true
//         }
//     }

    async runImport(file) {
        if ( ! this.validateImport(file) ) return;
        const json    = readJSONSync(file);
        let connect   = this.config.get('connect')
        let conflicts = []
        Object.keys(json).forEach(name => {
            if ( this.config.has('connect.' + name) ) {
                conflicts.push(name)
            } else {
                connect[ name ] = _.cloneDeep(json[ name ])
            }
        })
        this.log.warn(`There are some [${conflicts.length} naming conflicts`)
        conflicts.forEach(c => this.log.warn('conflict for: ' + c))
        this.out.dump(connect);
        let confirm = await this.ask.confirm('Agree with resuilt and merge?')
        if ( confirm ) {
            this.config.set('connect', connect);
        }
    }

    async getName(oldName) {
        return await this.ask.ask('Rename of' + oldName)
    }

    async simpleBackup() {
        let confirm = await
            this.ask.confirm('Are you sure you want to backup?');
        this.config.set('connect-backup', this.config.get('connect'))
    }

    async simpleRestore() {
        let confirm = await
            this.ask.confirm('Are you sure you want to restore backup');
        this.config.set('connect', this.config.get('connect-backup'))
    }

    async password(msg = 'Password?', def?: string) {
        await this.ask.password(msg);
    }

    async confirm(msg = 'Confirm', def?: string) {
        await this.ask.confirm(msg, def);
    }

    async question(msg, def?: string) {
        await this.ask.ask(msg, def)
    }

    getAll(): SshConnectHelperDataSet[] {
        return this.keys().map(key => this.config.get<SshConnectHelperDataSet>('connect.' + key))
    }

    _faker: any;
    /**
     * @type Faker.FakerStatic
     */
    protected get faker(): any {
        if ( ! this._faker ) {
            this._faker = require('faker');
        }
        return this._faker;
    }

    async runSeeder(total: number = 50) {
        let confirm = await
            this.ask.confirm('Are you sure you want to seed 50 random connections');
        for ( let i = 0; i < 50; i ++ ) {
            let name    = this.faker.name.findName('server');
            let dataSet = this.getDataSet(name, this.faker.internet.userName(), this.faker.internet.ip())
            if ( 4 % i ) {
                dataSet.method   = 'password'
                dataSet.password = this.faker.internet.password(5)
            }
            dataSet.port      = Math.round((Math.random() * 10000))
            dataSet.hostPath  = 2 % i ? '/' : '/home'
            dataSet.localPath = '/mnt/' + name
            this.config.set('connect.' + name, dataSet);
        }
    }

    async pickNamesAndProperties() {
        let options = Object.keys(this.getDataSet()).map(key => {
            return {
                name : key,
                value: key
            }
        })
        let names   = await this.ask.checkbox('From which naemes you want to edit', options)
        console.log(names);
        //
        // let changes = {}
        // if(names.length > 0){
        //     names.forEach(name => {
        //         changes[name] = await this.ask.checkbox(`What do you want to change for [${name}]`, keys)
        //     })
        // }

    }


    async runCleaner() {
        let confirm = await this.ask.confirm('Are you sure you want to clean all records in connect?');
        if ( confirm ) {
            this.config.set('connect', {});
        }
    }


    trash(name, permanent = false): boolean {
        let trashName = '_trash.conncet.' + name
        if ( permanent ) {
            this.config.unset('connect.' + name)
        } else {
            let trash = _.cloneDeep(this.config.get('conncet.' + name))
            this.config.set(trashName, trash)
            this.config.unset('connect.' + name)
        }
        return true;
    }
}