import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, inject, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";

@command(`repo` , 'Git repository actions', ['create', 'list'], <CommandConfig> {
        onMissingArgument: 'help'
    })
export class GitRepoCmd {
    showHelp: () => void

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
        if(this.service){

        }

        this.showHelp();
    }

}
export default GitRepoCmd