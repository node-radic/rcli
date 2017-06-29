import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, inject, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";

@command(`create 
{service:string@The service (github,bitbucket)}
[connection:string@the service connection]`
    ,'Create repository', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class GitRepoCreateCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;


    @option('s', 'the service connection to use')
    service:string

    async handle(args: CommandArguments, ...argv: any[]) {




    }

}
export default GitRepoCreateCmd