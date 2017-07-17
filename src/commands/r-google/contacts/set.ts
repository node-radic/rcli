import { command, CommandArguments, InputHelper, lazyInject, Log, option, OptionConfig, OutputHelper } from "@radic/console";
import { Services } from "../../../services/Services";
import { GoogleService } from "../../../services/service.google";
import { ConnectHelper } from "../../../helpers/helper.connect";
import { Dictionary } from "../../../interfaces";

@command(`set
[connection:string@The service connection]
[name:string@Contact name]
[number:string@Phone number]`, 'Add/edit a Google Contact', {
    example: `{bold}Adds a new contact with "mobile" number{/bold}
$ set mygoogle "Robin Radic" 0677799123 --add

{bold}Adds a new contact with "home" number{/bold}
$ set mygoogle "Robin Radic" 0257799123 --add --type home

{bold}Adds a "work" number to an existing contact{/bold}
$ set mygoogle "Robin Radic" 0677799123 --edit --type work

{bold}Adds a "work" number to an existing contact that can be chosen from a list and asks for number{/bold}
$ set mygoogle --edit --pick --type work

{bold}Edit the name of a existing contact{/bold}
$ set mygoogle "Robin Radic" --edit-name "Radic Robin"`
})
export class GoogleContactsSetCmd {
    @lazyInject('r.services')
    services: Services;

    @lazyInject('cli.helpers.output')
    out: OutputHelper

    @lazyInject('cli.helpers.input')
    ask: InputHelper

    @lazyInject('cli.helpers.connect')
    connect: ConnectHelper

    @lazyInject('r.log')
    log: Log

    @option(<OptionConfig> {
        key        : 't',
        description: 'Number type (mobile|work|home)',
        default    : 'mobile'
    })
    type: string;

    @option('p', 'Pick name from list')
    pick: boolean

    @option('a', 'Add new contact')
    add: boolean

    @option('e', 'Edit contact')
    edit: boolean

    @option('N', 'Edit name of contact')
    editName: string

    async handle(args: CommandArguments) {
        if(!this.add && !this.edit){
            return this.log.error(`Either -a|--add or -e|--edit needs to be given`)
        }
        const google   = await this.connect.getService<GoogleService>('google', args.connection);
        const contacts = await google.getContacts({ 'max-results': 1000 });
        const choices  = {}
        contacts.entries.forEach(entry => {
            if ( entry.name ) {
                choices[ entry.name.toLowerCase() ] = entry.id
            }
        })

        let name = await this.getName(choices, args.name);


        if ( this.edit ) {
            let id   = choices[ name ]
            let data = { numbers: [] }
            if ( this.editName ) {
                data[ 'name' ] = this.editName
            } else {
                let number = args.number || await this.ask.ask('number?')
                data.numbers.push({ type: this.type, number })
            }
            return google.setContact(id, data)
        } else if ( this.add ) {
            let number = args.number || await this.ask.ask('number?')
            // add new contact with phone number
            return google
                .createContact(name, number, this.type)
                .then((id) => {
                    this.log.info(`Created contact "${name}" [${id}] ${number} (${this.type})`)
                    return Promise.resolve()
                })
        }

    }

    protected async getName(choices: Dictionary<string>, name?: string): Promise<string> {
        if ( name ) {
            return Promise.resolve(name);
        }
        if ( this.add ) {
            return this.ask.ask('name?')
        }
        if ( this.pick ) {
            return this.ask.list('name?', Object.keys(choices))
        }
        return this.ask.prompt<string>(<any>{
            type   : 'autocomplete',
            message: 'name?',
            source : (answersSoFar, input) => Promise.resolve(Object.keys(choices).filter((choice => choice && input && choice.startsWith(input.toLowerCase()))))
        });
    }
}
export default GoogleContactsSetCmd