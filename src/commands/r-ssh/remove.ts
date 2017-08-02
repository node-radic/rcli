import { command, CommandArguments, inject, InputHelper, LoggerInstance, OutputHelper } from "radical-console";
import { SSHConnection, SshBashHelper ,RConfig } from "../../";


@command('remove [name:string@the connection to remote]', 'Remove one, multiple or all connections')
export class RcliConnectRemoveCmd {

    @inject('r.log')
    log: LoggerInstance

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.config')
    config: RConfig;

    @inject('cli.helpers.ssh.bash')
    ssh: SshBashHelper;


    public async handle(args: CommandArguments, ...argv: any[]) {
        let io   = SSHConnection.interact(),
            name = args.name || (await io.pick<SSHConnection>()).name;
        if ( await io.remove(name) ) {
            return this.log.info(`Removed [${name}]`);
        }
        return this.log.error(`Unknown error while removing [${name}]`)
    }

}
export default RcliConnectRemoveCmd