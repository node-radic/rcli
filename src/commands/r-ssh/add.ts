import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../core/config";
import * as editor from "open-in-editor";
import { paths } from "../../core/paths";
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

    async handle2(args: ConnectAddArguments, ...argv: any[]) {

        if ( this.editor ) {
            this.askInEditor()
            return
        }

        this.events.on('add:help', () => this.help = true)
        if ( this.interactive || ! args.name ) return this.interact();

        let data: any = {
            name     : args.name,
            user     : args.user,
            host     : args.host,
            method   : 'key',
            password : null,
            port     : this.port,
            localPath: this.localPath || '/mnt/' + args.name,
            hostPath : this.hostPath || '/'
        }
        if ( args.host.includes(':') ) {
            let host: any[] = args.host.split(':')
            data.port       = parseInt(host.shift())
        }
        if ( this.pass === true ) {
            let success = await this.askPassword(data, 3)
            if ( ! success ) {
                process.exit(1);
            }
        }

        let key = 'connect.' + data.name;
        if ( false === this.config.has(key) || this.force ) {
            this.config.set(key, data)
            this.log.info(`The config for ${key} has been ${this.force ? 'forcefully' : ''} set`)
        } else {
            this.log.warn(`The config for ${key} has already been set. in order to force it, use --force option`)
        }

        return true;
    }

    async askPassword(data, left = 3) {
        let password  = await this.ask.password('Enter password')
        let password2 = await this.ask.password('Verify password')
        if ( password === password2 ) {
            data.password = password
            data.method   = 'password'
            return true;
        } else {
            this.log.notice(`Invalid combination. ${left} tries left`)
            if ( left === 0 )
                this.log.warn('It seems your password did not match the other for the maximum ammount of tries')
            this.log.error('operation canceled')
        }
        return this.askPassword(data, left - 1)
    }

    async interact() {
        let name: string, user: string, host: string, port: number, method: string, password: string, localPath: string, hostPath: string
        name = await this.ask.ask('Connection name')
        user = await this.ask.ask('Username')
        host = await this.ask.ask('Host/IP');
        if ( host.includes(':') ) {
            let seg = host.split(':')
            host    = seg.shift()
            port    = parseInt(seg.shift());
        } else {
            port = parseInt(await this.ask.ask('Port', '22'))
        }
        method = await this.ask.ask('Authentication method (password/sshkey)', 'key')
        if ( method === 'password' ) {
            password = await this.askPassword({ password, method })
        }
        localPath = await this.ask.ask('Local mount point using SSHFS', '/mnt/' + name)
        hostPath  = await this.ask.ask('Host path to mount using SSHFS', '/')

        let key            = 'connect.' + name;
        let force: boolean = false
        if ( this.config.has(key) ) {
            force = await this.ask.confirm('The given connection has already ben set. Backup and override it?')
            if ( force ) {
                this.config.set('_backup:' + name, this.config.get(name))
            }
        }
        this.config.set(`connect.${name}`, { name, user, host, port, method, password, localPath, hostPath });

        this.log.info(`Connection <${name}> added`)
        return true;
    }

    handleInvalid() {
        return this.interactive || this.help
    }

    askInEditor() {
        let editors = [ 'atom', 'code', 'sublime', 'webstorm', 'phpstorm', 'idea14ce', 'vim', 'visualstudio', 'emacs' ];
        editor.configure({
            cmd: process.env.EDITOR
        }, function (err) {
            console.error('Something went wrong: ' + err);

        });
        editor.open(paths.userDataConfig)

    }
}
export default RcliConnectAddCmd