import { Cli, command, lazyInject, Log, Output } from "@radic/console";
import { RConfig } from "../";
@command('r <command>', {
    subCommands: [ 'connect', 'git', 'config' ],
    alwaysRun  : true
})
export class RcliCmd {
    @lazyInject('cli.helpers.output')
    protected out: Output;

    @lazyInject('cli.log')
    protected log: Log;

    @lazyInject('cli')
    protected cli: Cli;

    @lazyInject('r.config')
    protected config: RConfig;

    always(){

        if ( this.config('debug') === true ) {
            this.log.level = 'debug';
            this.log.debug('Debug is enabled')
        }
    }


    handle(...args: any[]) {
        this.out.success('asdf')
    }
}