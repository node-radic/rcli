import { command, CommandArguments, InputHelper, inject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../../core/config";
import { ISSHConnection } from "../../interfaces";
import * as inquirer from "inquirer";
import { Answers, ChoiceType } from "inquirer";
import { SshBashHelper } from "../../helpers/helper.ssh.bash";


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

        if(args.name){
            this.ssh.trash(args.name)
            return this.log.info('Removed ' + args.name)
        }

        let choices:string[]      = <any> await this.ask.checkbox('Select items to remove', this.getChoices());
        let confirm  = await this.ask.confirm('Absolutely sure to remove connctions:');
        if ( confirm ) {
            choices.forEach(name => this.ssh.trash(name));
            this.log.data(choices.length + ' SSH Connections removed', choices)
        }


    }

    getChoices(): ChoiceType[] {

        let keys    = Object.keys(this.config.get('connect'));
        let choices = [ new inquirer.Separator('--------') ]
        keys.forEach((key) => {
            const conn: ISSHConnection = this.config.get<ISSHConnection>('connect.' + key)
            let label: string         = [ conn.name ||  key, ' :: ', conn.user, '@', conn.host, ':', conn.port, ':', conn.hostPath, ' -> ', conn.localPath, ' using ', conn.method ].join('');
            choices.push(<any> {
                name : label,
                value: key
            })
        })
        // console.log({ choices })
        return choices;
    }


}
export default RcliConnectRemoveCmd