import { command, CommandArguments, container } from "@radic/console";

@command('contacs {command}', 'Google Contacts', ['list'], {
    onMissingArgument: 'help',
    usage: `Google services like Contacts, Calendar etc`
})
export class GoogleConnectCmd{

    handle(args: CommandArguments) {

    }
}
export default GoogleConnectCmd