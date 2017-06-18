import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";

@command(`login 
[name:string@the authentication name] 
[password:string@The password associated with the name]`
    , 'Login to the system', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthLoginCmd {

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

        if ( await this.auth.isLoggedIn() ) {
            this.log.info(`You have already been logged in`)
            return;
        }

        let name     = args.name || await this.ask.ask('Name?')
        let password = args.password || await this.ask.password('Password?')

        let success = await this.auth.login(name, password)

        if ( success ) {
            return this.log.info(`Welcome ${name}. You have been logged in`)
        }

        return this.log.error('Could not login due to a bad user/password combination')
    }

}
export default AuthLoginCmd