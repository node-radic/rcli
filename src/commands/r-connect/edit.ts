import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, inject, Log, OutputHelper } from "@radic/console";
import { RConfig,Credential } from "../../";

@command(`edit 
[name:string@the service connection name]
[field:string@the field you want to edit]
[value:string@the value you want to give it]`
    , 'Login to the system', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class EditCmd {

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


    async handle(args: CommandArguments, ...argv: any[]) {

        let name  = args.name || await this.ask.ask('Name?')
        let field = args.field || await this.ask.ask('Field?')
        let value = args.value || await this.ask.ask('Value?')

        return Credential.query().where('name', name).patch({ [field]: value }).then((cred) => {
            return this.log.info(`You have changed ${field} to ${value} for ${name}`)
        }).catch((err) => {
            return this.log.error(err);
        });
    }

}
export default EditCmd