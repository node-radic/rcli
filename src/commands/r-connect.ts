import { command, CommandArguments, CommandConfig, inject, Log, option, OptionConfig, OutputHelper } from "@radic/console";
import { Paths, RConfig } from "..";

@command('connect {command}', 'SSH connection helper', [ 'add', 'bulk', 'list', 'edit', 'ssh', 'remove' ], {
    onMissingArgument: 'help',
    helpers          : {
        help: {
            app: { title: 'SSH Connection Helper' }
        }
    }
})
export class RcliConnectCmd {

    _config: CommandConfig
    _options: OptionConfig[]
    showHelp: () => void

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.log')
    log: Log


    @inject('r.paths')
    paths:Paths

    @option('e', 'open the givein connectionin editor')
    editor:string




    handle(args: CommandArguments, argv: any[]) {
        if(this.editor){
        }
    }
}
export default RcliConnectCmd