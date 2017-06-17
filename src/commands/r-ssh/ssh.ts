import { command, InputHelper, inject, option, lazyInject, Log, OutputHelper, CommandArguments } from "@radic/console";
import { RConfig } from "../../";
import { SSHConnection } from "../../interfaces";
import { ensureDirSync } from "fs-extra";
import { execSync } from "child_process";
import { rmdirSync } from "fs";

@command(`ssh
{name:string@name of the connection}
{type:string@ssh mount or umount}`, 'Bash helepr')
export class RcliConnectSshCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    @option('d','Handle directory create & delete (mounts)')
    dirs:boolean


    bins = {
        ssh    : 'ssh',
        sshfs  : 'sshfs',
        sshpass: 'sshpass',
        umount : 'umount'
    }

    handle(args:CommandArguments) {


        let name = args.name,
            type = args.type;

        let validTypes = ['ssh','mount','umount'];
        if(false === validTypes.includes(args.type)){
            this.log.error(`Given type [${args.type}] does not exist. Use any of: [${validTypes.join(',')}]`)
            return
        }

        if(false === this.config.has('connect.' + args.name)){
            this.log.error(`Given name [${args.name}] does not exist.`)
            return
        }

        let connect = this.config.get<SSHConnection>('connect.'+args.name);
        this[args.type](connect);
    }



    mount(target: SSHConnection) {
        let cmd: string = `${this.bins.sshfs} ${target.user}@${target.host}:${target.hostPath} ${target.localPath} -p ${target.port}`;
        if ( target.method === 'password' ) {
            cmd = `echo ${target.password} | ${cmd} -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o reconnect -o workaround=rename -o password_stdin`
        } else {
            cmd += ' -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=nof -o reconnect -o workaround=rename';
        }
        if ( this.dirs ) {
            ensureDirSync(target.localPath);
        }
        process.stdout.write(cmd);
    }

    umount(target: SSHConnection) {
        let cmd: string = `sudo ${this.bins.umount} ${target.localPath} -f`;
        execSync(cmd);
        rmdirSync(target.localPath);
        this.log.info(`Unmounted ${target.localPath} success`);
    }

    ssh(target: SSHConnection) {
        let cmd = '';
        if ( target.method === 'password' ) {
            cmd = `${this.bins.sshpass} -p ${target.password} `

        }

        // this.log.info(`attempting SSH connection using -o StrictHostKeyChecking=no ${target.user}@${target.host} -p ${target.port}`)
        cmd += `${this.bins.ssh} -o StrictHostKeyChecking=no ${target.user}@${target.host} -p ${target.port}`;

        process.stdout.write(cmd);
    }
}
export default RcliConnectSshCmd