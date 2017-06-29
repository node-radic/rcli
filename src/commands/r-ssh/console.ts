import { command, CommandArguments } from "@radic/console";
import { RcliSshConnect } from "./connect";
@command(`console
[name:string@Name of the connection]`,
    'ssh console to connection')
export class RcliSshConsoleCmd extends RcliSshConnect{
    async handle(args:CommandArguments) {
        return super.handle({
            name: args.name,
            type: 'ssh'
        })
    }
}
export default RcliSshConsoleCmd