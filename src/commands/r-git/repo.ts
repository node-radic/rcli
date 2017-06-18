import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";
import { services } from "../../services/static";
import { GitHubServer } from "../../lib/git/index";
import { AuthMethodToken} from "../../interfaces";
import { Database } from "../../database/Database";

@command(`repo 
[service:string@The service (github, bitbucket)]
[name:string@The repo name] 
[action:string@View, remove, edit]`
    , 'Add a service connection (github, etc) to your user', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class GitRepoCmd {

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

    @lazyInject('services.github')
    github: GitHubServer


    @option('s', 'the service connection to use')

    async handle(args: CommandArguments, ...argv: any[]) {
        if(! await this.auth.isLoggedIn() ){
            return this.log.error('You are not logged in')
        }



        let creds = await this.auth.getServiceCredentials('github')

        if(creds > 0)


    }

}
export default GitRepoCmd