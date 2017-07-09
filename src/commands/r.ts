import { Cli, CliExecuteCommandParsedEvent, command, CommandConfig, CommandDescriptionHelper, Dispatcher, inject, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../";
import * as omelette from "omelette";

@command('r {command:string@any of the listed commands}', <CommandConfig> {
    subCommands: [ 'ssh', 'connect', 'git', 'config', 'info', 'socket','serve', 'tree', 'completion', 'db', 'jira'],
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



    @inject('cli.helpers.help')
    protected help: CommandDescriptionHelper;

    @inject('r.log')
    protected log: Log;

    @inject('r.config')
    protected config: RConfig;

    always(){
        if ( this.config('debug') === true ) {
            this.log.level = 'debug';
        }
    }


    handle(...args: any[]) {
        return true;
    }
}
export default RcliCmd