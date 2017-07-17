import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { GitHubServer } from "../../services/apis/git";
import { Credential } from "../../database/Models/Credential";
import { ConnectHelper } from "../../helpers/helper.connect";

@command(`repo
[action:string@which action to perform(list, create, delete)]
[connection:string@The connection (github,bitbucket)]
[full_name:string@full name for repository]`, 'Git repository actions', <CommandConfig> {
    onMissingArgument: 'help'
})
export class GitRepoCmd {
    showHelp: () => void

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('cli.helpers.connect')
    connect:ConnectHelper

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;

    @option('n', 'do not confirm action')
    noConfirm: boolean

    @option('s', 'the service connection to use')
    service: string

    async handle(args: CommandArguments, ...argv: any[]) {

        let actions = [ 'create', 'delete', 'list' ]
        const cred = await this.connect.getCredentialForService(this.service || ['github', 'bitbucket'], args.connection);
        let api: GitHubServer = <GitHubServer> cred.getApiService()
        let action            = args.action || await this.ask.list('What to do?', actions);

        //
        if ( action === 'create' ) {
            let fullName: string = args.full_name || await this.ask.ask('Full name of repository?')
            if ( fullName.length < 1 || ! fullName.includes('/') ) return this.log.error('Incorrect full name', args)
            return api.createRepository(fullName.split('/')[ 1 ], fullName.split('/')[ 0 ])
        }

        //
        if ( action === 'list' ) {
            let repos = await api.listRepositories(api.user.username)
            return repos.forEach(repo => this.out.line(' - ' + repo))
        }

        //
        if ( action === 'delete' ) {
            let fullName: string = args.full_name
            if ( ! args.full_name ) {
                fullName = await this.ask.list('pick or type the repository full name?', [ 'pick', 'type' ]) === 'pick' ?
                           await this.ask.list('full name of repository?', await api.listRepositories(api.user.username)) :
                           await this.ask.ask('full name of repository?');
            }

            if ( fullName.length < 1 || ! fullName.includes('/') ) return this.log.error('Incorrect full name', args)
            return api.deleteRepository(fullName.split('/')[ 1 ], fullName.split('/')[ 0 ])
        }
    }


}
export default GitRepoCmd