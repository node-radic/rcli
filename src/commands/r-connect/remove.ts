import { command, CommandArguments, InputHelper, lazyInject, OutputHelper } from "@radic/console";
import { RConfig } from "../../lib/core/config";
import { SSHConnection } from "../../interfaces";
import * as inquirer from "inquirer";
import { Answers, ChoiceType } from "inquirer";
import ChoiceOption = inquirer.objects.ChoiceOption;


@command('remove', 'Remove one, multiple or all connections')
export class RcliConnectRemoveCmd {

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

    @lazyInject('r.config')
    public config: RConfig;


    async askChecklist(message: string, choices: ChoiceType[]): Promise<Answers> {
        return <Promise<Answers>> new Promise((resolve, reject) => {
            inquirer.prompt({ name: 'ask', choices, type: 'checkbox', message })
                .then(answers => resolve(answers))
        });
    }


    public async handle(args: CommandArguments, ...argv: any[]) {
        console.dir('lets trly it');

        let res:any      = await this.askChecklist('Select items to remove', this.getChoices());
        let removals = res.ask.map(name => '\n - ' + name)
        let confirm  = await this.ask.confirm('Absolutely sure to remove connctions:' + removals);
        if ( confirm ) {

        }
        console.dir('good asnwer' + res);
    }

    getChoices(): ChoiceType[] {

        let keys    = Object.keys(this.config.get('connect'));
        let choices = [ new inquirer.Separator('--------') ]
        keys.forEach((key) => {
            const conn: SSHConnection = this.config.get<SSHConnection>('connect.' + key)
            let label: string         = [ conn.name, ' :: ', conn.user, '@', conn.host, ':', conn.port, ':', conn.hostPath, ' -> ', conn.localPath, ' using ', conn.method ].join('');
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