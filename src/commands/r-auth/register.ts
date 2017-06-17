import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";

@command(`register 
[name:string@The login name] 
[password:string@The password]
[password2:string@The password again, for verification]`
    , 'Register a user into the system', <CommandConfig> {
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
    auth:Auth;


    async handle(args: CommandArguments, ...argv: any[]) {

        let name = args.name || await this.ask.ask('Name?')
        let password = args.password || await this.ask.password('Password?')
        let password2 = args.password2 || await this.ask.password('Password again?')

        let result = this.auth.register(name, password, password2)
        if(result){
            this.log.info('You have registered successfully')
            return;
        }
        this.log.error('Name is already in use or passwords did not match.', result)
    }

}
export default AuthRegisterCmd