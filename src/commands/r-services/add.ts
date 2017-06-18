import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { Credential, RConfig } from "../../";
import { services } from "../../services/static";
import { AuthMethod } from "../../services/AuthMethod";


@command(`add 
[name:string@The connection name, can be anything] 
[service:string@The service (jira, github,etc)] 
[method:string@Authentication method to use]`
    , 'Add a service connection (github, etc) to your user', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AddCmd {

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

    @lazyInject('r.log')
    log: Log;

    @lazyInject('r.config')
    config: RConfig

    @lazyInject('cli.events')
    events: Dispatcher;


    async handle(args: CommandArguments, ...argv: any[]) {

        let name    = args.name || await this.ask.ask('Name?')
        let service = args.service || await this.ask.list('Service?', Object.keys(services))
        let method  = args.method || await this.ask.list('Method?', services[ service ])

        let m: AuthMethod = AuthMethod[ method ]

        let key    = await this.ask.ask(AuthMethod.getKeyName(m))
        let secret = await this.ask.ask(AuthMethod.getSecretName(m))

        let cred: Partial<Credential> = { service, method, name, key, secret }
        return Credential.query()
            .insert(cred)
            .then((cred: Credential) => {
                this.log.debug('add service', cred)
                this.log.info('Added service connection ')
            })
            .catch((err) => {
                this.log.error('Cannot add service connection', cred);
            })


    }

}
export default AddCmd