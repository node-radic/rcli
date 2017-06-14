import { command,CommandArguments, inject, Log, OutputHelper } from "@radic/console";
import { RConfig, SSHConnection} from "../../";

import * as _ from "lodash";


@command('list', 'list all connections')
export class RcliConnectListCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.log')
    log: Log;

    @inject('r.config')
    config: RConfig;


    handle(args:CommandArguments, ...argv: any[]) {

        let connect = this.config.get<SSHConnection[]>('connect', {});
//         Object.keys(connect).fo/*rEach(key => {return;
//             let v   = connect[ key ];
//             let row = [
//                 v.name,
//                 v.user,
//                 v.host,
//                 v.port,
//                 v.method,
//                 v.localPath,
//                 v.hostPath
//             ]
//             rows.push(row);
//         })
// */
        let rows = Object.keys(connect).map(key => {
            return _.omit(connect[ key ], 'password');
        });
        this.out.columns( rows, {
            columnSplitter  : '   ',
            showHeaders     : true,
            preserveNewLines: true
        })


    }
}
export default RcliConnectListCmd