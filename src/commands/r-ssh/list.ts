import { command, CommandArguments, inject, Log, option, OutputHelper } from "@radic/console";
import { RConfig, SSHConnection } from "../../";
import * as Chalk from "chalk";


@command('list', 'list all connections')
export class RcliConnectListCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    @option('e', 'exclude columns')
    exclude:string[] = []

    async handle(args: CommandArguments, ...argv: any[]) {
        let cons :SSHConnection[] = await SSHConnection.query().select('*').execute();
        let keys = Object.keys(cons);
        let table = keys.map(i => {
            let con = cons[ i ].toJSON()
            delete con.id
            if ( con.password ) delete con.password
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