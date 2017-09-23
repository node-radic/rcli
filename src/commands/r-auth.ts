import { command, CommandArguments, container, Container } from "radical-console";

@command('auth|1 {command}', 'Manage service authentications', { // , ['add', 'list', 'edit', 'remove' ]
    isGroup: true,
    explanation: `Authentication for the given service API.
The app supports them all and will ask for it when adding credentials.
When adding authentication credentials, you'd give it a name. 
This way you can add multiple credentials for services.`
})
export class AuthCmd {

    handle(args: CommandArguments) {

    }
}
export default AuthCmd
