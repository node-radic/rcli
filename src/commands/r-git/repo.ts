import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Auth, RConfig } from "../../";
import { services } from "../../lib/core/static";
import { GitHubServer } from "../../lib/git/index";
import { AuthMethodToken, User } from "../../interfaces";
import { Database } from "../../lib/core/database";

@command(`repo 
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

    @lazyInject('db')
    db: Database

    async handle(args: CommandArguments, ...argv: any[]) {


    }

}
export default GitRepoCmd