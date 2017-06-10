import { command, Input, lazyInject, Log, Output } from "@radic/console";
import { RConfig, SSHConnection } from "../../";


@command(`add 
{name:string@the connection name} 
{user:string@the user to login} 
{host:string@the host to connect} 
{method:string@the connect method`
    , 'add a connection')
export default class RcliConnectAddCmd {

    @lazyInject('cli.helpers.output')
    out: Output;

    @lazyInject('cli.helpers.input')
    ask: Input;

    @lazyInject('cli.log')
    lazyInject: Log;

    @lazyInject('rcli.config')
    config: RConfig;


    async handle(args: { [name: string]: any }, ...argv: any[]) {
        const cons = this.config.get<Dictionary<SSHConnection>>('connect', {})
        const keys = Object.keys(cons);

        //
        // args[ 'name' ]
        // args[ 'user' ]
        // args[ 'host' ]
        // return;
        let rows = []
        keys.forEach((key: string, index: number) => {
            let c   = cons[ key ];
            let col = [
                c.name,
                c.port,
                c.user,
                c.method,
                c.path,
                c.hostPath
            ]

            rows.push(col);
        })
        this.out.columns(rows, { showHeaders: true })
    }
}