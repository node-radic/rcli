import { command, CommandArguments, Config, Log, inject, lazyInject, option, OutputHelper, InputHelper } from "@radic/console";
import { dotize, inspect } from "@radic/util";
import { PersistentFileConfig, RConfig } from "../lib/core/config";

@command('config [path:string@dot notated string] [value:any@A JSON parseable value]')
export class ConfigCmd {
    showHelp: () => void

    @inject('r.config.core')
    configCore: PersistentFileConfig

    @inject('r.config')
    config: RConfig

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.output')
    ask: InputHelper;

    @lazyInject('cli.log')
    log: Log

    @option('l', 'list configuration settings')
    list: boolean

    @option('r', 'show root config')
    root: boolean;

    @option('U', 'unset te given option')
    unset: boolean

    @option('f', 'force the operation')
    force: boolean

    @option('b', 'create a backup before any alteration')
    backup:boolean

    @option('r', 'restore a backup')
    restore:string

    @option('L', 'List all local backups')
    listBackups:boolean

    handle(args: CommandArguments) {
        args.path = args.path || ''

        // show selected by dot notated value
        if(this.list && args.path.length > 0){
            return this.listPath(args.path)
        }
        // show all
        if ( this.list ) {
            return this.listPath();
        }
        // delete value or entire subsets
        if ( this.unset && args.path.length > 0) {
            if(this.backup) {
                this.createBackup();
            }
            this.unset(args.path);
            this.log.verbose(`config value at [${arg.path}] has been removed`)
            return
        }

        if ( args.path.length > 0 && args.value ) {
            if(this.config.has(args.path)){
                this.log.warn(`A value exists already undner ${args.path}. use -f to force it`)
            }
            if(false === this.config.has(args.path) || this.force === true) {
                return this.config.set(args.path, args.value)
            }
        }

        if(this.listBackups){
            this.listLocalBackups();
            return;
        }

        this.showHelp()

    }

    protected createBackup(){
        this.configCore.backup();
        return this;
    }

    protected restoreBackup(filePath) {
        this.configCore.restore(filePath)
    }

    protected listLocalBackups() {
        this.configCore.getLocalBackupFiles().forEach(filePath => {
            this.out.line(' - ' + filePath)
        })
    }

    protected listPath(path) {
        let dotted = dotize(this.config.get(path))
        Object.keys(dotted).forEach(key => {
            this.out.line(`'{darkorange}${key}{/darkorange} : {green}${dotted[ key ]}{/green}`)
        })
        return this;
    }

    protected set(path, value): this {
        if ( fale === this.config.has(path) || this.force ) {
            this.config.set(path, value)
        }
        return this
    }

    protected unset(path): this {
        if ( this.config.has(path) ) {
            this.config.unset(path)
        }
        return this
    }
}
export default ConfigCmd