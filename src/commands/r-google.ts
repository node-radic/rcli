import { command, CommandArguments, container } from "radical-console";

@command('google {command}', 'Google services', {
    isGroup: true,
    usage: `Google services like Contacts, Calendar etc`
})
export class GoogleCmd {

    handle(args: CommandArguments) {

    }
}
export default GoogleCmd