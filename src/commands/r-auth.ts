import { command, CommandArguments, container } from "@radic/console";

@command('auth {command}', 'User authentication', [ 'register', 'login', 'logout', 'whoami', 'unregister', 'add' ], {
    onMissingArgument: 'help'
})
export default class AuthCmd {

    handle(args: CommandArguments) {

    }
}
