import { command, CommandArguments, CommandConfig, inject, Log, option, OptionConfig, OutputHelper } from "@radic/console";
import { Paths, RConfig } from "..";

@command('ssh {operation}', 'SSH connection helper', [ 'add',  'list', 'edit', 'ssh', 'remove' ], { //'bulk',
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

    @inject('r.log')
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