import { command, CommandConfig, HelpHelper, inject, lazyInject, Log, option, OptionConfig, OutputHelper } from "radical-console";
import { RConfig } from "../";
import * as omelette from 'omelette'

@command('completion', 'Generate autocompletion', <CommandConfig> {})
export class RCompletionCmd {

    @inject('cli.helpers.help')
    protected help: HelpHelper;


    @inject('cli.helpers.output')
    protected out: OutputHelper;

    @inject('r.log')
    protected log: Log;

    @inject('r.config')
    protected config: RConfig;


    @option('d', 'show descriptions')
    desc: boolean;

    @option('o', 'show options')
    opts: boolean;

    @option('a', 'show all')
    all: boolean;

    handle(...args: any[]) {
        let tree = this.help.getSubcommandsNameTree(this.help.cli.rootCommand);
        const complete = omelette('r').tree({
            woof: ['foo','bar']
        });
        complete.init();
        this.out.dump(tree);
        this.out.dump(process.argv);
        return true;
    }
}
export default RCompletionCmd