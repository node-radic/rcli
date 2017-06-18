import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";

@command(`whoami`
    , 'Shows user name and statistics', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthWhoAmICmd {

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

    @lazyInject('r.auth')
    auth: Auth;

    async handle(args: CommandArguments, ...argv: any[]) {
        if ( ! await this.auth.isLoggedIn() ) {
            return this.log.error('You have not been logged in.')
        }

        const user = await this.auth.user();

        this.out.line('You are logged in as: ' + user.name);
        this.out.line(`You have ${user.credentials.length} service connections associated on this user`)
        if ( user.credentials.length > 0 ) {
            this.out.nl.columns(user.credentials, {
                columns    : [ 'name', 'service', 'method' ],
                showHeaders: true
            })
        }
    }

}
export default AuthWhoAmICmd