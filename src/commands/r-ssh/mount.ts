import { command, CommandArguments } from "@radic/console";
import { RcliSshConnect } from "./connect";
@command(`mount
[name:string@Name of the connection]`,
    'sshfs mount the connection')
export class RcliSshMountCmd extends RcliSshConnect{
    async handle(args:CommandArguments) {
        return super.handle({
            name: args.name,
            type: 'mount'
        })
    }
}
export default RcliSshMountCmd