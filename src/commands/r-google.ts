import { command, CommandArguments, container } from "@radic/console";

@command('google {command}', 'Google services', ['contacts'], {
    onMissingArgument: 'help',
    usage: `Google services like Contacts, Calendar etc`
})
export class GoogleCmd {

    handle(args: CommandArguments) {

    }
}
export default GoogleCmd