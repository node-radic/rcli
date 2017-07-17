import { command, CommandArguments, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { Services } from "../../../services/Services";
import { GoogleService, GoogleServiceContacts } from "../../../services/service.google";
import { ConnectHelper } from "../../../helpers/helper.connect";

@command(`list
[connection:string?The service connection]`, 'List/Search Google Contacts', {})
export class GoogleContactsListCmd {
    @lazyInject('r.services')
    services: Services;

    @lazyInject('cli.helpers.output')
    out: OutputHelper

    @lazyInject('cli.helpers.connect')
    connect: ConnectHelper

    @lazyInject('r.log')
    log: Log

    @option('s', 'search query string')
    search: string

    async handle(args: CommandArguments) {
        const google = await this.connect.getService<GoogleService>('google', args.connection);
        return google
            .enableCache()
            .getContacts({
                'max-results': 1000,
                q            : this.search ? this.search : ''
            })
            .catch((err) => this.log.error(err))
            .then((data: GoogleServiceContacts) => {
                let rowData = data.entries.map(entry => {
                    return {
                        // id     : entry.id,
                        name   : entry.name,
                        numbers: entry.numbers.map(nr => nr.type + ': ' + nr.number).join('\n')
                    }
                });
                this.out.columns(rowData, {
                    showHeaders: false
                })
                return Promise.resolve(data);
            })
    }
}
export default GoogleContactsListCmd