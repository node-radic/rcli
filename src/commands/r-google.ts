import { command, CommandArguments, container } from "radical-console";

@command('google|2 {command}', 'Google services', {
    isGroup: true,
    explanation: `Google services like Contacts, Calendar etc`
})
export class GoogleCmd {

    handle(args: CommandArguments) {

    }
}
export default GoogleCmd