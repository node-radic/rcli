import { Cli, command, CommandConfig, inject, lazyInject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../";

@command('r {command:string@any of the listed commands}', <CommandConfig> {
    subCommands: [ 'ssh', 'services', 'git', 'config', 'info', 'socket' ],
    alwaysRun  : true,
    onMissingArgument: 'help',
    helpers: {
        help: {
            display: {
                arguments: false
            }
        }
    }
})
export class RcliCmd {
    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;

    @lazyInject('r.log')
    protected log: Log;

    @inject('r.config')
    protected config: RConfig;

    always(){

        if ( this.config('debug') === true ) {
            this.log.level = 'debug';
        }
    }


    handle(...args: any[]) {
        this.out.success('Try -h for options')
        return true;
    }
}
export default RcliCmd