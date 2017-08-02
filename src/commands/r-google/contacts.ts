import { command, CommandArguments, container } from "radical-console";

@command('contacts {command:string?The command you want to run}', 'Google Contacts', {
    isGroup: true,
})
export class GoogleContactsCmd{

    handle(args: CommandArguments) {

    }
}
export default GoogleContactsCmd