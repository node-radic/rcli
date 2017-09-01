import { Cli, command, CommandConfig, container, HelpHelper, inject, lazyInject, Log, option, OptionConfig, OutputHelper, SubCommandsGetFunction } from "radical-console";
import { RConfig } from "../";
import * as omelette from 'omelette'
import { resolve } from "path";
import { IConfigProperty } from "@radic/util";
import { writeFileSync } from "fs";
import { paths } from "../core/paths";

@command('completion', 'Generate autocompletion', <CommandConfig> {})
export class RCompletionCmd {

    @inject('cli')
    protected cli: Cli;

    @inject('cli.helpers.help')
    protected help: HelpHelper;

    @inject('cli.helpers.output')
    protected out: OutputHelper;

    @inject('r.log')
    protected log: Log;

    @inject('r.config')
    protected config: RConfig;

    @inject('cli.config')
    protected cliConfig: IConfigProperty;

    getSubCommands = container.get<SubCommandsGetFunction>('cli.fn.commands.get')

    handle(...args: any[]) {
        let tree = this.getChildren(this.cli.rootCommand);
        this.out.dump(tree)
        writeFileSync(resolve(paths.userData, 'command-tree.json'), JSON.stringify(tree, null, 4), 'utf-8')
        return true;
    }

    protected getChildren(config: CommandConfig) {
        return this.getSubCommands<CommandConfig[]>(config.filePath, false, true)
            .filter(command => command.isGroup)
            .concat(this.getSubCommands<CommandConfig[]>(config.filePath, false, true).filter(command => ! command.isGroup))
            .map(command => {
                if ( command.isGroup ) {
                    return { type: 'group', name: command.name, children: this.getChildren(command) }
                }
                return this.getChild(command)
            })

    }

    protected getChild(command: CommandConfig) {
        let args = []
        let args2 = command.arguments.forEach(arg => {
            args.push(arg.name);
        });
        let opts = []
        let opts2 = command.options.forEach(opt => {
            opts.push('-'+opt.key)
            opts.push('--'+opt.name)
        })
        return { type: 'command', name: command.name, arguments: args, options: opts}
    }
}

export default RCompletionCmd