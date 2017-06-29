import { command, CommandConfig, CommandDescriptionHelper, inject, lazyInject, Log, option, OptionConfig, OutputHelper } from "@radic/console";
import { RConfig } from "../";

@command('tree', 'Show commands as tree structure', <CommandConfig> {})
export class RTreeCmd {

    @inject('cli.helpers.help')
    protected help: CommandDescriptionHelper;


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
        if ( this.all ) {
            this.desc = this.opts = true;
        }
        let types                           = {
            integer: '#8ACCCF',
            boolean: '#EFEFAF',
            string : '#CC9393'
        }
        this.help.config.templates.treeItem = (config: CommandConfig, optionConfigs: OptionConfig[]): string => {
            let args = config.arguments.map(arg => {
                let output = [];
                let name   = arg.name;
                output.push(arg.required ? `<{yellow}${arg.name}{/yellow}` : `[{green}${arg.name}{/green}`);
                // if(arg.type && types[arg.type] ){
                //     output.push(`({${types[arg.type]}}${arg.type}{/${types[arg.type]}})`);
                // }
                if ( this.desc && arg.desc ) {
                    output.push(`:{darkslategray}${arg.desc}{/darkslategray}`)
                }
                output.push(arg.required ? '>' : ']')
                return output.join('')

            }).join(' ');
            let name = `{steelblue}${config.name}{/steelblue}`
            if ( config.subCommands && config.subCommands.length > 0 ) {
                name = `{darkcyan.bold}${config.name}{/darkcyan./bold}`
                args = '';
                if ( this.desc && config.description ) {
                    args = `: {darkslategray}${config.description}{/darkslategray}`;
                }
            }

            let opts = '';
            if ( this.opts && optionConfigs && optionConfigs.length > 0 ) {
                opts = optionConfigs.map(opt => '--' + opt.name).join(' ')
            }

            return `${name} ${args} {darkslategray lighten 40}${opts}{/darkslategray}`;
        };

        this.help.printCommandTree('r')
//         let desc = '{darkslategray}The description{/darkslategray}';
//         this.out.nl.line(`
// {darkcyan.bold}group{/darkcyan./bold}
// {steelblue}command{/steelblue} <{yellow}argument{/yellow}:${desc}>
// {steelblue}command{/steelblue} [{green}argument{/green}={${types.integer}}25{/${types.integer}}:${desc}]
//         `)
        this.out.nl.line(`Legenda: {darkcyan.bold}group{/darkcyan./bold} / {steelblue}command{/steelblue} / <{yellow}required{/yellow}> / [{green}optional{/green}]`)
        return true;
    }
}
export default RTreeCmd