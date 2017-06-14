import { command, CommandArguments, inject, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { RConfig, SSHConnection , SshBashHelper } from "../../";
export interface ConnectEditArguments extends CommandArguments {
    name?: string
}
@command(`edit 
{name:string@the connection name}`, 'edit a connections')
export class RcliConnectEditCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.ssh.connect')
    ssh: SshBashHelper

    @lazyInject('cli.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    @option('H', 'server ip or hostname')
    host: string;

    @option('p', 'server ssh port')
    port: string

    @option('u', 'username for login')
    user: string

    @option('k', 'set method to key')
    method: string;

    @option('P', 'set a new password (you will be asked for it)')
    pass: string

    @option('L', 'path to local mount point (sshfs)')
    localPath: string;

    @option('R', 'path on the remote server to mount (sshfs)')
    hostPath: string;


    async handle(args: ConnectEditArguments, ...argv: any[]) {
        let name = 'connect.' + args.name;
        if ( ! this.config.has(name) ) {
            this.log.error('No such connection named ' + args.name)
            return;
        }
        let connect = this.config.get<SSHConnection>(name);
        if ( this.host ) {
            connect.host = this.host;
        }
        if ( this.port ) {
            connect.port = parseInt(this.port);
        }
        if ( this.user ) {
            connect.user = this.user;
        }
        if ( this.method ) {
            connect.method = 'key'
        }
        if ( this.pass ) {
            connect.method   = 'password';
            connect.password = this.pass;
        }
        if ( this.localPath ) {
            connect.localPath = this.localPath
        }
        if ( this.hostPath ) {
            connect.hostPath = this.hostPath
        }

        this.out.dump(connect);
        let ok = this.ssh.config('Verify the settings before save')
        if ( ok ) {
            this.config.set(name, connect);
            this.log.info('Settings saved')
        } else {
            this.log.warn('Canceled. Settings where not saved')
        }

    }
}
export default RcliConnectEditCmd