import { command, CommandConfig, option, TreeCmd } from "radical-console";

@command('tree', 'Show commands as tree structure', <CommandConfig> {})
export class RTreeCmd extends TreeCmd {

    @option('d', 'show descriptions')
    desc: boolean;

    @option('o', 'show options')
    opts: boolean;

    @option('a', 'show all')
    all: boolean;

    handle(...args: any[]) {
        this.printTree('r', this.cli.rootCommand);
        this.out.nl.line(`Legenda: {darkcyan.bold}group{/darkcyan./bold} / {steelblue}command{/steelblue} / <{yellow}required{/yellow}> / [{green}optional{/green}]`)
        return true;
    }
}
export default RTreeCmd