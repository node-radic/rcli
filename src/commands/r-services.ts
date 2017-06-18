import { command, CommandArguments, container } from "@radic/console";

@command('services {command}', 'Manage service connections', ['add', 'list', 'edit', 'remove' ], {
    onMissingArgument: 'help',
    usage: `SC's (service connections) you enable interaction with the given service API.
Most SC's require credentials. The app supports them all and will ask for it when adding an SC.
When adding a SC, you'd give it a name. This way you can add multiple SC's using different credentials.
`
})
export default class AuthCmd {

    handle(args: CommandArguments) {

    }
}
