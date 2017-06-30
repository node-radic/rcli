import { command, CommandArguments } from "@radic/console";
import { RcliSshConnect } from "./connect";
@command(`umount
[name:string@Name of the connection]`,
    'umount the connection')
export class RcliSshUMountCmd extends RcliSshConnect{
    async handle(args:CommandArguments) {
        return super.handle({
            name: args.name,
            type: 'umount'
        })
    }
}
export default RcliSshUMountCmd