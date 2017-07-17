import { command, CommandArguments, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { Paths } from "../../core/paths";
import { RCFile, RCFileKey } from "../../core/config";

export interface PathsCommandArguments extends CommandArguments {
    action: 'list' | 'set' | 'revert'
    key?: string
}

@command(`paths
{action:string@list, set or revert}
`, {
    description: 'Paths manager',
    example    : `paths list
paths set `
})
export class PathsCmd {

    @lazyInject('r.paths')
    paths: Paths;

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('r.log')
    log: Log

    @lazyInject('r.rcfile')
    rcfile: RCFile

    @option('l', 'list all paths')
    list: boolean

    @option('s', 'set a .rclirc config key', 'string', { arguments: 2 })
    set: string[]

    @option('u', 'unset a .rclirc config key')
    unset:string

    @option('r', 'reset (empty) the .rclirc')
    reset: boolean

    handle(args: PathsCommandArguments) {
        if ( this.list ) {
            return this.handleList();
        }
        if ( this.reset ) {
            return this.handleReset()
        }
        if ( this.set ) {
            return this.handleSet();
        }
        if(this.unset){
            return this.handleUnset();
        }
    }

    protected handleList() {
        Object.keys(this.paths).forEach(key => {
            this.out.line(`${key} : ${this.paths[ key ]}`)
        })
        return true;
    }

    protected handleSet() {
        this.rcfile.set(<RCFileKey> this.set[ 0 ], this.set[ 1 ])
    }

    protected handleReset() {
        this.rcfile.reset();
        return true;
    }

    protected handleUnset(){
        this.rcfile.unset(<RCFileKey> this.unset)
    }
}
export default PathsCmd
