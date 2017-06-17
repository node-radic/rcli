import { command, CommandArguments, CommandConfig, container, inject, InputHelper, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { dotize } from "@radic/util";
import { PersistentFileConfig, RConfig } from "../";
import { readdirSync } from "fs";

@command(`config 
[path:string@dot notated string] 
[value:any@A JSON parseable value]`,  'View/edit rcli configuration', <CommandConfig> {
    onMissingArgument: 'help',
    example:`
$ config -l                     # list
$ config dgram.server.port      # view
$ config dgram.server.port 80   # edit
`
})
export class ConfigCmd {
    showHelp: () => void

    @inject('r.config.core')
    configCore: PersistentFileConfig

    @lazyInject('cli.helpers.help')
    help: OutputHelper;

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.output')
    ask: InputHelper;

    @inject('r.config')
    config: RConfig

    @lazyInject('r.log')
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
                this.listLocalBackups();
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
                this.log.warn(`A value alredy exist for path [${args.path}] You could use -f|--force to override`)
            } else {
                this.log.info(`Value ${args.value} for path [${args.path}] set`)
            }
        }

        return true;

    }

    protected createBackup(path?: string) {
        this.configCore.backupWithoutEncryption()
        return this;
    }

    protected restoreBackup(filePath?:string) {
        this.configCore.restore(filePath)
    }


    protected listLocalBackups() {
        this.configCore.getLocalBackupFiles().forEach(filePath => {
            this.out.line(' - ' + filePath)
        })
    }

    protected listPath(path, rootConfig = false) {
        let dotted = dotize(this[rootConfig ? 'configCore' : 'config'].get(path || ''),'')
        Object.keys(dotted).forEach(key => {
            this.out.line(`'{darkorange}${key}{/darkorange} : {green}${dotted[ key ]}{/green}`)
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