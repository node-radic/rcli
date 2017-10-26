import { CommandArguments, CommandConfig, HelpHelper, inject, injectable, InputHelper, Log, option, OutputHelper } from "radical-console";
import { RConfig } from "../../";
import { ensureDirSync } from "fs-extra";
import { execSync } from "child_process";
import { rmdirSync } from "fs";
import { SSHConnection } from "../../database/Models/SSHConnection";
import { Database } from '../../database/Database';
//
// @command(`connect
// {name:string@name of the connection}
// {type:string@ssh mount or umount}`, 'mount/unmount or ssh')
@injectable()
export abstract class RcliSshConnect {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.help')
    help: HelpHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    @inject('r.db')
    db:Database

    _config: CommandConfig

    @option('d', 'Handle directory create & delete (mounts)', <any> { 'default': true })
    dirs: boolean


    async handle(args: CommandArguments) {

        let io         = SSHConnection.interact(),
            name       = args.name || (await io.pick<SSHConnection>()).name,
            type       = args.type,
            validTypes = [ 'ssh', 'mount', 'umount' ];


        if ( false === validTypes.includes(type) ) {
            this.log.error(`Given type [${type}] does not exist. Use any of: [${validTypes.join(',')}]`)
            return false
        }

        let con: SSHConnection = await SSHConnection.query().where('name', name).first().execute()
        this[ type ](con.toJSON());
    }


    mount(target: SSHConnection) {
        let cmd: string = `${this.config('commands.ssh.bins.sshfs')} ${target.user}@${target.host}:${target.hostPath} ${target.localPath} -p ${target.port}`;
        let opts:string = ' -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o reconnect -o workaround=rename';
        if ( target.method === 'password' ) {
            cmd = `echo ${target.password} | ${cmd} ${opts} -o password_stdin`
        } else {
            cmd += opts;
        }
        if ( this.dirs ) {
            ensureDirSync(target.localPath);
        }
        execSync(cmd, {
            stdio: 'inherit'
        });
        // process.stdout.write(cmd);
    }

    umount(target: SSHConnection) {
        let cmd: string = `sudo ${this.config('commands.ssh.bins.umount')} ${target.localPath} -f`;
        execSync(cmd);
        rmdirSync(target.localPath);
        this.log.info(`Unmounted ${target.localPath} success`);
    }

    ssh(target: SSHConnection) {
        let cmd = '';
        if ( target.method === 'password' ) {
            cmd = `${this.config('commands.ssh.bins.sshpass')} -p ${target.password} `

        }

        // this.log.info(`attempting SSH connection using -o StrictHostKeyChecking=no ${target.user}@${target.host} -p ${target.port}`)
        cmd += `${this.config('commands.ssh.bins.ssh')} -o StrictHostKeyChecking=no ${target.user}@${target.host} -p ${target.port}`;

        execSync(cmd, {
            stdio: 'inherit'
        });
        // process.stdout.write(cmd);
    }
}
export default RcliSshConnect