import { Cli, command, CommandConfig, inject, lazyInject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../";

@command('r {command:string@any of the listed commands}', <CommandConfig> {
    subCommands: [ 'connect', 'git', 'config', 'info', 'scaf' ],
    alwaysRun  : true,
    onMissingArgument: 'help'
})
export class RcliCmd {
    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;

    @lazyInject('cli.log')
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
    }
}
export default RcliCmd