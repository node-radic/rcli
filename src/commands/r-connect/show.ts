import { command, Input, inject, option, lazyInject, Log, Output } from "@radic/console";
import { RConfig } from "../../";

@command('show', 'set a connections')
export default class RcliConnectSetCmd {

    @inject('cli.helpers.output')
    out: Output;

    @inject('cli.log')
    log: Log;

    @inject('r.config')
    config: RConfig;


    handle(...args: any[]) {


    }
}