import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";

@command(`logout`
    , 'Logout of the system', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthLogoutCmd {

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

        if ( await this.auth.isLoggedIn()){
            await this.auth.logout();
        }

        this.log.info(`You have been logged out`)
    }

}
export default AuthLogoutCmd