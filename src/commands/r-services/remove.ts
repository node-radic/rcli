import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../../";

@command(`remove
[name:string@the name of the service connection]`
    , 'Remove a service connection', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class RemoveCmd {

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

    @lazyInject('r.log')
    log: Log;

    @lazyInject('r.config')
    config: RConfig

    @lazyInject('cli.events')
    events: Dispatcher;

    async handle(args: CommandArguments, ...argv: any[]) {
        return this.log.warn('Remmoving not yet implemented')
    }

}
export default RemoveCmd