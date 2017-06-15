import { command, CommandArguments, inject, Log, option, OutputHelper } from "@radic/console";
import { RConfig, SSHConnection } from "../../";
import * as Chalk from "chalk";


@command('list', 'list all connections')
export class RcliConnectListCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    @option('e', 'exclude columns')
    exclude:string[] = []

    handle(args: CommandArguments, ...argv: any[]) {



        let connect = this.config.get<SSHConnection[]>('connect', {});
        let keys = Object.keys(connect);
        let table = keys.map(name => {
            let con = connect[ name ]
            if ( con.password ) delete con.password
            con.name = name;
            return con;
        })

        this.out.columns(table, {
            columns         : [ 'name', 'user', 'host', 'port', 'method', 'localPath', 'hostPath' ],
            columnSplitter  : ' | ',
            showHeaders     : true,
            preserveNewLines: true,
            paddingChr: ' ',
            config    : {
                port  : { dataTransform: (data) => parseInt(data) === 22 ? Chalk.yellow(data) : data },
                method: { dataTransform: (data) => data.trim() === 'password' ? Chalk.yellow(data) : data },
            }
        })


    }
}
export default RcliConnectListCmd