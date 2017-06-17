import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";
import { services } from "../../lib/core/static";
import { Credential } from "../../interfaces";
import { AuthMethod } from "../../lib/auth/methods";

@command(`add 
[name:string@The connection name, can be anything] 
[service:string@The service (jira, github,etc)] 
[method:string@Authentication method to use]`
    , 'Add a service connection (github, etc) to your user', <CommandConfig> {
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

        if ( ! this.auth.isLoggedIn() ) {
            this.log.error(`You have to be logged in`)
            return;
        }
        let name    = args.name || await this.ask.ask('Name?')
        let service = args.service || await this.ask.list('Service?', Object.keys(services))
        let method  = args.method || await this.ask.list('Method?', services[ service ])

        let m: AuthMethod = AuthMethod[ method ]

        let key    = await this.ask.ask(AuthMethod.getKeyName(m))
        let secret = await this.ask.ask(AuthMethod.getSecretName(m))

        let cred: Credential = {
            service,
            method,
            user: this.auth.user.name,
            name, key, secret
        }
        let result = this.auth.addCredential(cred)



    }

}
export default AuthLoginCmd