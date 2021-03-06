import { PrepareArgumentsFunction, command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, LoggerInstance, option, OutputHelper } from "radical-console";
import { RConfig } from "../../";
import { ConnectHelper } from "../../helpers/helper.connect";
import { IGitService } from "../../services/service.git";

@command(`repo|r
[action:string@which action to perform(list, create, delete)]
[connection:string@The connection (github,bitbucket)]
[name:string@repository or owner name]`, 'Git repository actions', <CommandConfig> {
    onMissingArgument: 'help',
})
export class GitRepoCmd {
    showHelp: () => void

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('cli.helpers.connect')
    connect: ConnectHelper

    @inject('r.log')
    log: LoggerInstance;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;

    @option('r', 'exec local git remote add/rm')
    gitRemote: boolean

    @option('R', 'on exec git remote use this name for remote', { default: 'origin' })
    gitRemoteName: string = 'origin'

    @option('H', 'Use HTTP url instead of SSH for git remote')
    gitRemoteHttp: boolean

    @option('o', 'options', { type: 'object', default: {} })
    options: any

    async handle(args: CommandArguments, ...argv: any[]) {

        // this.out.dump({ args, me: this })


        // const cred = await this.connect.getCredentialForService(this.service || ['github', 'bitbucket'], args.connection);
        // let api: GitHubServer = <GitHubServer> cred.getApiService()
        let api     = await this.connect.getService<IGitService>([ 'github', 'bitbucket' ], args.connection);
        let actions = [ 'create', 'delete', 'list' ]
        let action  = args.action || await this.ask.list('What to do?', actions);

        //
        if ( action === 'create' ) {
            let fullName: string = args.name || await this.ask.ask('Full name of repository?')
            if ( fullName.length < 1 || ! fullName.includes('/') ) return this.log.error('Incorrect full name', args)
            return api.createRepository(fullName.split('/')[ 1 ], fullName.split('/')[ 0 ], this.options.private === true).then(() => {
                if ( this.gitRemote ) {
                    api.bin('remote', 'add', this.gitRemoteName, this.gitRemoteHttp ? api.url(fullName) : api.ssh(fullName))
                }
                return Promise.resolve()
            })

        }

        //
        if ( action === 'list' ) {
            let repos = await api.listRepositories(args.name)
            return repos.forEach(repo => this.out.line(' - ' + repo))
        }

        //
        if ( action === 'delete' ) {
            let fullName: string = args.name

            if ( ! fullName ) {
                let repos = await api.listRepositories(api.user.username);
                fullName  = await this.ask.prompt<string>(<any>{ message: 'full name of repository?', type: 'autocomplete', source: async (answersSoFar, input) => repos.filter((name) => name.startsWith(input)) });
            }

            if ( fullName.length < 1 || ! fullName.includes('/') ) {
                return this.log.error('Incorrect full name', args)
            }

            if ( await this.ask.confirm(`Are you sure you want to delete repository [${fullName}] on ${api.credentials.name}(${api.service.name})`) ) {
                return await api.deleteRepository(fullName.split('/')[ 1 ], fullName.split('/')[ 0 ])
            }
            return false;
        }
    }


}

export default GitRepoCmd