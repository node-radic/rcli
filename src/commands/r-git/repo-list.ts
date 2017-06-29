import { CommandArguments, CommandConfig , command, option , Dispatcher, InputHelper, inject, Log, OutputHelper } from "@radic/console";
import { GitServer , Credential , RConfig } from "../../";
import { GitHubServer } from "../../services/apis/git";


@command(`list
[name:string@The service connection name]`
// [connection:string@the service connection]`
    , 'Git repository actions', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class GitRepoListCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;


    @option('V', 'Can be one of all, public, or private. Default: all')
    visibility: string

    @option('t', 'Can be one of all, owner, public, private, member. Default: all')
    type: string

    @option('s', 'Can be one of created, updated, pushed, full_name. Default: full_name')
    sort: string

    @option('d', 'Can be one of asc or desc. Default: when using full_name: asc; otherwise desc')
    direction: string

    async handle(args: CommandArguments, ...argv: any[]) {

        let choices = await Credential.query()
            .column('name')
            .where('service', 'github')
            .orWhere('service', 'bitbucket')


        let name           = args.name || await this.ask.list('Service connection name?', choices)
        let cred           = await Credential.query().where('name', name).first()
        let api: GitHubServer = <GitHubServer> cred.getApiService()
        let repos = await api.listRepositories('robinradic')
        repos.forEach(repo => this.out.line(' - ' + repo))
    }

}
export default GitRepoListCmd