import { Cli, CliExecuteCommandParsedEvent, command, CommandConfig, CommandDescriptionHelper, Dispatcher, inject, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../";
import * as omelette from "omelette";

@command('r {command:string@any of the listed commands}', <CommandConfig> {
    // subCommands: [  'dev', 'connect', 'ssh', 'git',  'google','info', 'tree'], //'completion', 'jira',
    isGroup: true,
    alwaysRun  : true,
    // helpers: {
    //     help: {
    //         display: {
    //             arguments: false
    //         }
    //     }
    // }
})
export class RcliCmd {

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