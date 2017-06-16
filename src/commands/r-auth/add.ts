import { command, CommandArguments, CommandConfig, Dispatcher, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "../../lib/core/config";
import * as editor from "open-in-editor";
import { paths } from "../../lib/core/paths";
import { AuthMethod } from "../../lib/auth/methods";
import { AuthService } from "../../lib/auth/auth";

@command(`add 
[name:string@the authentication name] 
[service:string@the service for this authentication]`
    , 'Add a connection', <CommandConfig> {
        onMissingArgument: 'help'
    })
export class AuthAddCmd {

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

    @lazyInject('cli.log')
    log: Log;

    @lazyInject('r.config')
    config: RConfig

    @lazyInject('cli.events')
    events: Dispatcher;

    async handle(args: CommandArguments, ...argv: any[]) {

        let name = args.name || await this.ask.ask('Your name')
        let service = args.service || await this.ask.ask('The service')


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