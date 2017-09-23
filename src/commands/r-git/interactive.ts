

import { PrepareArgumentsFunction, command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, LoggerInstance, option, OutputHelper } from "radical-console";
import { RConfig } from "../../";
import { ConnectHelper } from "../../helpers/helper.connect";
import { IGitService } from "../../services/service.git";

@command(`interactive|i`, 'interact with git', <CommandConfig> {
    onMissingArgument: 'help',
})
export class GitInteractiveCmd {
    showHelp: () => void

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('cli.helpers.connect')
    connect: ConnectHelper

    @inject('r.log')
    log: LoggerInstance;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;

    async handle(args: CommandArguments, ...argv: any[]) {
        this.connect.getService(['github', 'bitbucket'])

    }


}

export default GitInteractiveCmd