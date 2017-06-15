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

    connect:SSHConnection

    async handle(args: ConnectEditArguments, ...argv: any[]) {

        if ( this.interactive ) {
            return this.startInteractive();
        }

        let name = 'connect.' + args.name;
        if ( ! this.config.has(name) ) {
            this.log.error('First argument : No such connection named ' + args.name)
            if(await this.ask.confirm('Go interactive?')){
                this.interactive = true;
                return this.startInteractive()
            }
            return;
        }

        this.connect = this.config.get<SSHConnection>(name);

        ['host', 'port', 'user', 'localPath', 'mountPath'].forEach(name => {
            if(this[name]){
                this.set(name, this[name])
            }
        })

        this.out.dump(this.connect);
        let ok = this.ask.confirm('Verify the settings before save')
        if ( ok ) {
            this.config.set(name, this.connect);
            this.log.info('Settings saved')
        } else {
            this.log.warn('Canceled. Settings where not saved')
        }

    }


    /**
     * @link https://stackoverflow.com/questions/44564544/async-wait-loop-with-readline-inquirer-questions
     * @returns {Promise<void>}
     */
    async startInteractive() {


        let names = Object.keys(this.config('connect'));
        let name  = await this.ask.list('name', names);
        console.log('need to edit ', name);
        let availableFields       = [ 'user', 'host', 'port', 'method', 'localPath', 'hostPath' ]
        let chosenFields: Answers = await this.ask.checkbox('Choose fields to edit', availableFields)
        let current               = this.config('connect.' + name);

        let answers = {}
        for (let field of chosenFields) {
            answers[ field ] = await this.ask.ask(field)
        }
    }


    protected set(prop, val){
        if(prop === 'port') val = parseInt(val);

        this.connect[prop] = val;
        return this;
    }
}
export default RcliConnectEditCmd