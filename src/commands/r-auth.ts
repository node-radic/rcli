import { command, CommandArguments, container, Container } from "@radic/console";

@command('auth {command}', 'Manage service authentications', { // , ['add', 'list', 'edit', 'remove' ]
    isGroup: true,
    usage: `Authentication for the given service API.
The app supports them all and will ask for it when adding credentials.
When adding authentication credentials, you'd give it a name. 
This way you can add multiple credentials for services.
`
})
export class AuthCmd {

    handle(args: CommandArguments) {

    }
}
export default AuthCmd