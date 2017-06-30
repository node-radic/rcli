import { command, CommandArguments, InputHelper, inject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../../core/config";
import { ISSHConnection } from "../../interfaces";
import * as inquirer from "inquirer";
import { Answers, ChoiceType } from "inquirer";
import { SshBashHelper } from "../../helpers/helper.ssh.bash";
import { SSHConnection } from "../../database/Models/SSHConnection";


@command('remove [name:string@the connection to remote]', 'Remove one, multiple or all connections')
export class RcliConnectRemoveCmd {

    @inject('r.log')
    log:Log

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.config')
    config: RConfig;

    @inject('cli.helpers.ssh.bash')
    ssh:SshBashHelper;


    public async handle(args: CommandArguments, ...argv: any[]) {
        let io         = SSHConnection.interact(),
            name       = args.name || (await io.pick<SSHConnection>()).name;
        if(await io.remove(name)) {
            return this.log.info(`Removed [${name}]`);
        }
        return this.log.error(`Unknown error while removing [${name}]`)
    }

}
export default RcliConnectRemoveCmd