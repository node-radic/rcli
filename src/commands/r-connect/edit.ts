import { command, Input, inject, option, lazyInject, Log, Output } from "@radic/console";
import { RConfig } from "../../";

@command('edit {name:the connection name}', 'edit a connections',{
    usage: 'edit <name> [options]'
})
export default class RcliConnectEditCmd {

    @inject('cli.helpers.output')
    out: Output;

    @inject('cli.log')
    log: Log;

    @inject('config')
    config: RConfig;

    @option('H', 'server ip or hostname')
    host: string;

    @option('p', 'server ssh port')
    port: string

    @option('u', 'username for login')
    user: string

    @option('m', 'method of connecting (key|password)')
    method: string;

    @option('L', 'path to local mount point (sshfs)')
    mountLocal: string;

    @option('R', 'path on the remote server to mount (sshfs)')
    mountRemote: string;



    handle(...args: any[]) {
        if(args.length !== 1){
            this.log.error('Expected 1 argument')
        }

    }
}