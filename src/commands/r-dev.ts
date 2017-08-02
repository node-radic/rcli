import { command, CommandArguments, Container } from "radical-console";
import { RConfig } from "../core/config";

@command('dev {command}', 'Dev stuff', { // , [ 'cache', 'config', 'db', 'paths', 'serve', 'socket' ]
    isGroup: true,
    enabled          : (container: Container) => {
        return container.get<RConfig>('r.config').get('debug', false) === true
    },
})
export class ConnectCmd {

    handle(args: CommandArguments) {

    }
}
export default ConnectCmd