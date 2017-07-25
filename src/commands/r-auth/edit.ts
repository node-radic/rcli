import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, Log, OutputHelper } from "@radic/console";
import { BaseCommand, Credential, RConfig } from "../../";
import { ConnectHelper } from "../../helpers/helper.connect";

@command(`edit 
[name:string@the service connection name]
[field:string@the field you want to edit]
[value:string@the value you want to give it]`
    , 'Login to the system', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthEditCmd extends BaseCommand {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('cli.helpers.connect')
    connect: ConnectHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;


    async handle(args: CommandArguments, ...argv: any[]) {
        let cred   = await this.connect.getCredentialForService('*', args.name)
        let name   = cred.name
        this.log.debug('properties',Credential.jsonSchema.properties)
        let fields = Object.keys(Credential.jsonSchema.properties);
        this.log.debug('fields',fields)
        let field  = args.field || await this.ask.prompt<string>(<any>{ message: 'Field?', type: 'autocomplete', source: (answers, input) => Promise.resolve(fields.filter((name) => name.startsWith(input))) })
        let value  = args.value || await this.ask.ask('Value?')
        let props   = Credential.jsonSchema.properties;
        if ( props[ field ] === undefined ) {
            return this.returnError(`Field [${field}] does not exist`)
        }
        if ( props[ field ].type !== 'string' ) {
            value = JSON.parse(value);
        }

        return Credential.query().where('name', name).patch({ [field]: value }).then((cred) => {
            return this.log.info(`You have changed ${field} to ${value} for ${name}`)
        }).catch((err) => {
            return this.log.error(err);
        });
    }

}
export default AuthEditCmd