import { command, Input, inject, option, lazyInject, Log, Output } from "@radic/console";
import { RConfig } from "../../lib";

@command('list', 'list all connections')
export default class RcliConnectListCmd {

    @inject('cli.helpers.output')
    out: Output;

    @inject('cli.log')
    log: Log;

    @inject('r.config')
    config: RConfig;


    handle(...args: any[]) {

        let cons = this.config.get('connect', {});
        Object.keys(cons).forEach(con => {
            this.out.line(' - ' + con)
        })

    }
}