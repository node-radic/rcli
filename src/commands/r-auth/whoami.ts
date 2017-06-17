import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";
import { Credential } from "../../interfaces";

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


        if ( this.auth.isLoggedIn() === false ) {
            this.log.error('You have not been logged in.')
            return;
        }

        this.out.line('You are logged in as: ' + this.auth.user.name);
        let creds: Credential[] = <any> this.auth.creds.find({ user: this.auth.user.name })
        this.out.line(`You have ${creds.length} service connections associated on this user`)
        if ( creds.length > 0 ) {
            this.out.nl.columns(creds, {
                columns    : [ 'name', 'service', 'method' ],
                showHeaders: true
            })
        }
    }

}
export default AuthWhoAmICmd