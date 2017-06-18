import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { Credential } from "../../database/Models/Credential";

@command(`list`
    , 'List all added service credentials', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class ListCmd {

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

        return Credential.query()
            .then((creds: Credential[]) => {
                this.out.line(`You have ${creds.length} service credentials`)

                if ( creds.length > 0 ) {
                    this.out.nl.columns(creds, {
                        columns    : [ 'name', 'service', 'method' ],
                        showHeaders: true
                    })
                    this.out.line();
                }
            })
            .catch((err) => {
                return this.log.error(err)
            })

    }

}
export default ListCmd