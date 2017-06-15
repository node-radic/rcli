import { command, CommandArguments, inject, InputHelper, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { RConfig, SshBashHelper, SSHConnection } from "../../";
import { Answers } from "inquirer";
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

    @inject('cli.helpers.ssh.bash')
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

    @option('i', 'Interactive mode')
    interactive: boolean;


    async handle(args: ConnectEditArguments, ...argv: any[]) {

        if ( this.interactive ) {
            return this.startInteractive();
        }


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


    async startInteractive() {
        let name: string, user: string, host: string, port: number, method: string, password: string, localPath: string, hostPath: string


        let availableNames = Object.keys(this.config('connect'));
        let chosenNames    = await this.ask.list('name', availableNames);
        console.log('need to edit ', chosenNames);

        let availableFields       = [ 'user', 'host', 'port', 'method', 'localPath', 'hostPath' ]
        let chosenFields: Answers = await this.ask.checkbox('Choose fields to edit', availableFields)
        console.log('For those useres, edit the fields', chosenFields, chosenFields['toppings'])


        async.forEachOf(chosenNames, (name) => {
            async.forEachOf(chosenFields, (field) => {
            field = this.ask.ask(`Name ${name} wants to change ${field}`);
            console.log(field);
        })

        let totals = {}
        let l = console.log
        for ( let n in chosenNames ) {
            l({ n })
            let name = chosenNames[ n ];
            totals[name] = {}
            l({ name })
            let data = this.config.get('connect.' + name)
            totals[name]['default'] = data;
            l({ data })
            for ( let f in chosenFields ) {
                l({ f })
                let field = chosenFields[ f ]
                l({ field })
                totals[name]['requests'] = [];
                totals[name]['requests'].concat(field)
            }
        }

        l({totals});
        for(let name in totals){
            for (let requests in totals[name]['requests']){
                l(requests)
            }
        }

        return true;
    }

}
export default RcliConnectEditCmd