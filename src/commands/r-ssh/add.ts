import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, Log, option, OutputHelper } from "radical-console";
import { RConfig } from "../../core/config";
import { SSHConnection } from "../../database/Models/SSHConnection";

export interface ConnectAddArguments extends CommandArguments {
    name: string,
    host: string
    user: string
    method: string
}
@command(`add 
[name:string@the connection name] 
[user:string@the user to login] 
[host:string@the host to connect]`
    , 'Add a connection', <CommandConfig> {
        onMissingArgument: 'help',
        example          : `
Interactive method works fastest. Answer some questions and done!
$ r connect add -i 

Minimal:
$ r connect add <name> <login> <host>
$ r connect add srv1 admin 123.124.214.55
$ r connect add srv1 admin 123.124.214.55:6666
$ r connect add srv1 admin 123.124.214.55 -p 6666

To login by password, use -P. You will be prompted for it
$ r connect add srv1 admin 123.124.214.55 -p 6666 -P

Full
$ r connect add srv1 admin 123.123.123.123 --port 5050 \\
    --local-path /path/to/local/mountpoint --host-path /home/admin \\
    --force --password
`
    })
export class RcliConnectAddCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    public events: Dispatcher;


    @option('P', 'login using a password (enter later)')
    pass: boolean = false

    @option('s', 'Login using your ~/id_psa.pub key (default)')
    key: boolean = true

    @option('p', 'use the given port (default: 22)')
    port: number = 22

    @option('l', 'local mount path for sshfs (default: /mnt/<name>)')
    localPath: string

    @option('H', 'host path to mount for sshfs (default: / )')
    hostPath: string = '/'

    @option('f', 'forces adjuments even though already exists')
    force: boolean = false

    @option('i', 'interactive mode')
    interactive: boolean = false

    @option('e', 'define in editor')
    editor: boolean

    help: boolean = false;

    async handle(args: ConnectAddArguments, ...argv: any[]) {
        let io = SSHConnection.interact()
        io.setDefaultsFor({
            name     : args.name,
            user     : args.user,
            host     : args.host,
            method   : 'key',
            password : null,
            port     : this.port,
            localPath: this.localPath || '/mnt/' + args.name,
            hostPath : this.hostPath || '/'
        });
        let con = await io.create([
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
        }, args)
    }

}
export default RcliConnectAddCmd