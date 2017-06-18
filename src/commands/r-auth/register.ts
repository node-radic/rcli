import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { User, Auth, RConfig } from "../../";
import { QueryBuilder } from "objection";

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

        if(await this.auth.isLoggedIn()){
            return this.log.warn('You already have an account and are logged in')
        }

        let name = args.name || await this.ask.ask('Name?')
        let password = args.password || await this.ask.password('Password?')
        let password2 = args.password2 || await this.ask.password('Password again?')

        if ( password !== password ) {
            return this.log.error('Passwords do not match.')
        }

        let exists = await this.auth.exists(name);
        if(exists){
            return this.log.error('You cannot use that name. Pick another.')
        }

        let user = await this.auth.register(name, password)

        if(user){
            this.log.info('You have registered successfully', user.name)
            return true;
        }
        this.log.error('Name is already in use or passwords did not match.')

    }

}
export default AuthRegisterCmd