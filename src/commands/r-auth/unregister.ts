import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth ,RConfig } from '../../'

@command(`unregister 
[name:string@The login name] 
[password:string@The password]`
    , 'Removes a user from the system', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthRegisterCmd {

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

        let name = args.name || await this.ask.ask('Name?')
        let password = args.password || await this.ask.password('Password?')

        if(this.auth.isLoggedIn()){
            if(this.auth.user.name === name){
                this.auth.logout()
            }
        }

        this.auth.unregister(name, password)
        this.log.info(`User ${name} is now removed from the system`)
    }

}
export default AuthRegisterCmd