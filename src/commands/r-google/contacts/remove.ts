import { command, CommandArguments, InputHelper, lazyInject, LoggerInstance, option, OptionConfig, OutputHelper } from "@radic/console";
import { Services } from "../../../services/Services";
import { GoogleService } from "../../../services/service.google";
import { ConnectHelper } from "../../../helpers/helper.connect";

@command(`remove
[connection:string@The service connection]
[name:string@Contact name]`, 'Add/edit a Google Contact', {})
export class GoogleContactsDeleteCmd {
    @lazyInject('r.services')
    services: Services;

    @lazyInject('cli.helpers.output')
    out: OutputHelper

    @lazyInject('cli.helpers.input')
    ask: InputHelper

    @lazyInject('cli.helpers.connect')
    connect: ConnectHelper

    @lazyInject('r.log')
    log: LoggerInstance

    @option(<OptionConfig> {
        key        : 't',
        description: 'Number type (mobile|work|home)'
    })
    type: string;

    @option('p', 'Pick name from list')
    pick: boolean

    async handle(args: CommandArguments) {
        const google   = await this.connect.getService<GoogleService>('google', args.connection);
        const contacts = await google.getContacts({ 'max-results': 1000 });
        const choices  = {}
        contacts.entries.forEach(entry => {
            if ( entry.name ) {
                choices[ entry.name.toLowerCase() ] = entry.id
            }
        })

        let name = args.name;
        if ( ! name && this.pick ) {
            name = await this.ask.list('name?', Object.keys(choices))
        } else if ( ! name ) {
            name = await this.ask.prompt(<any>{
                type   : 'autocomplete',
                message: 'name?',
                source : (answersSoFar, input) => Promise.resolve(Object.keys(choices).filter((choice => choice && input && choice.startsWith(input.toLowerCase()))))
            });
        }

        if ( this.type ) {

        }
        if ( choices[ name ] === undefined ) {
            return this.log.error(`Contact [${name}] does not exist `)
            // add phone number to existing contact
        }
        let id = choices[ name ]
        return google.deleteContact(id);
    }
}
export default GoogleContactsDeleteCmd