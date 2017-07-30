import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, inject, LoggerInstance, OutputHelper } from "@radic/console";
import { RConfig } from "../../";

@command(`remove
[name:string@the name of the service connection]`
    , 'Remove a service connection', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthRemoveCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: LoggerInstance;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;

    async handle(args: CommandArguments, ...argv: any[]) {
        return this.log.warn('Remmoving not yet implemented')
    }

}
export default AuthRemoveCmd