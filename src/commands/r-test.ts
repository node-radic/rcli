import { Container,Dispatcher, Cli, CliExecuteCommandParsedEvent, command, CommandConfig, CommandDescriptionHelper, inject, lazyInject, Log, option, OutputHelper, Event } from "@radic/console";
import { RConfig } from "../";
import { Services } from "../services/Services";
import { ConnectHelper } from "../helpers/helper.connect";
import { CommandArguments } from "@radic/console/lib";
import { AbstractGitService, IGitService } from "../services/service.git";

@command(`test
[connection:string@auth credentials]
`, 'Dev test command', <CommandConfig> {
    enabled: (c:Container) => c.get<RConfig>('r.config').get('debug', false) === true
})
export class TestCmd {

    @lazyInject('cli.events')
    protected events: Dispatcher;

    @lazyInject('r.log')
    protected log: Log;

    @lazyInject('r.config')
    protected config: RConfig;

    @lazyInject('r.services')
    protected services:Services;

    @lazyInject('cli.helpers.connect')
    protected connect:ConnectHelper;

    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;


    async handle(args: CommandArguments, ...argv: any[]) {
        let git = await this.connect.getService<IGitService>('bitbucket', args.connection)
        let repos = await git.listRepositories()
        this.out.dump(repos);
    }
}
export default TestCmd