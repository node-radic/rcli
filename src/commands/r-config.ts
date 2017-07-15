import { command, CommandArguments, CommandConfig, container, inject, InputHelper, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { dotize } from "@radic/util";
import { PersistentFileConfig, RConfig } from "../";
import { readdirSync } from "fs";

@command(`config 
[path:string@dot notated string] 
[value:any@A JSON parseable value]`,  'View/edit rcli configuration', <CommandConfig> {
    onMissingArgument: 'help',
    example:`
$ config -l                         # list configuration
$ config -L                         # list backups
$ config dgram.server.port          # view
$ config dgram.server.port 80       # set
$ config dgram.server.port 80 -f    # forced set
$ config dgram.server.port 80 -B    # create backup then set
$ config dgram.server.port -d       # unset
`
})
export class ConfigCmd {
    showHelp: () => void

    @inject('r.config.core')
    configCore: PersistentFileConfig

    @inject('cli.helpers.help')
    help: OutputHelper;

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.config')
    config: RConfig

    @inject('r.log')
    log: Log

    @option('l', 'list configuration settings')
    list: boolean

    @option('d', 'unset te given option')
    delete: boolean

    @option('f', 'force the operation')
    force: boolean

    @option('B', 'create a backup before any alteration')
    backup: boolean

    @option('p', 'If backing up, backup as plain json readable file')
    plain:boolean

    @option('r', 'If backing up, backup as plain json readable file')
    root:boolean

    @option('e', 'restore a backup')
    restore: boolean

    @option('L', 'List all local backups')
    listBackups: boolean

    handle(args: CommandArguments): any {
        args.path = args.path || ''

        let list;
        switch ( true ) {
            case this.listBackups:
                this.listBackupIds();
                break
            case this.restore:
                this.restoreBackup(args.path);
                break
            case this.backup:
                this.createBackup();
                this.log.verbose(`config has created a backup`)
                break
            case this.delete:
                this.createBackup();
                this.unset(args.path);
                this.log.verbose(`config value at [${args.path}] has been removed`)
                break;
            case this.root:
                list = this.listPath(args.path, true);
                break;
            case this.list:
                list = this.listPath(args.path);
                break;
        }



        if ( args.path.length > 0 && args.value ) {
            if(!this.set(args.path, args.value)){
                this.log.warn(`A value already exist for path [${args.path}] You could use -f|--force to override`)
            } else {
                this.log.info(`Value ${args.value} for path [${args.path}] set`)
            }
        }

        return true;

    }

    protected createBackup() {
        this.configCore.backupWithEncryption()
        return this;
    }

    protected restoreBackup(id?:string) {
        this.configCore.restore(id)
    }


    protected listBackupIds() {
        this.configCore.getBackupIds().forEach(id => {
            this.out.line(' - ' + id)
        })
    }

    protected listPath(path, rootConfig = false) {
        let dotted = dotize(this[rootConfig ? 'configCore' : 'config'].get(path || ''),'')
        Object.keys(dotted).forEach(key => {
            this.out.line(`{darkorange}${key}{/darkorange} : {green}${dotted[ key ]}{/green}`)
        })
        return this;
    }

    protected set(path, value): this {
        if ( false !== this.config.has(path) || this.force ) {
            this.configCore.unlock()
            this.configCore.set(path, JSON.parse(value))
            this.configCore.lock()
        }
        return this
    }

    protected unset(path:string): boolean {
        path.split(/\s/g).forEach(path => {
            if ( this.config.has(path) ) {
                this.config.unset(path)
                return true
            }
        })
        return false
    }
}
export default ConfigCmd