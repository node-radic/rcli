import { command, CommandArguments, inject, InputHelper, Log, option, OutputHelper } from 'radical-console';
import { RConfig } from '../../';
import SSHConnection from '../../database/Models/SSHConnection';
import { Database } from '../../database/Database';

export interface ConnectEditArguments extends CommandArguments {
    name?: string
}

@command(`edit 
[name:string@the connection name]`, 'edit a connections')
export class RcliConnectEditCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    @inject('r.db')
    db:Database

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
        let io                 = SSHConnection.interact()
        let name               = args.name || (await io.pick<SSHConnection>()).name
        let con: SSHConnection = await SSHConnection.query().where('name', name).first().execute()
        io.setDefaultsFor(con.toJSON());
        con = await io.update<SSHConnection>(con.id, [
            'name',
            'host',
            'port',
            'user',
            'method',
            'password',
            'localPath',
            'hostPath'
        ], {
            method  : { type: 'list', choices: [ 'key', 'password' ] },
            password: { when: (answers: any) => answers.method === 'password' }
        })
    }
}

export default RcliConnectEditCmd