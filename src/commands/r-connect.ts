import { command, CommandArguments, CommandConfig, inject, Log, OptionConfig, OutputHelper } from "@radic/console";

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


    handle(args: CommandArguments, argv: any[]) {
        this.log.info('args', args);
        this.log.info('argv', argv);
        this.log.info('config', this._config)
    }
}
export default RcliConnectCmd