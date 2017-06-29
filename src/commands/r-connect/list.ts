import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, inject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { Credential } from "../../database/Models/Credential";

@command(`list`
    , 'List all added service credentials', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class ListCmd {

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