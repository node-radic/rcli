import { CommandArguments, CommandConfig, CommandDescriptionHelper, inject, injectable, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { ensureDirSync } from "fs-extra";
import { execSync } from "child_process";
import { rmdirSync } from "fs";
import { SSHConnection } from "../../database/Models/SSHConnection";
//
// @command(`connect
// {name:string@name of the connection}
// {type:string@ssh mount or umount}`, 'mount/unmount or ssh')
@injectable()
export abstract class RcliSshConnect {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.help')
    help: CommandDescriptionHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig;

    _config: CommandConfig

    @option('d', 'Handle directory create & delete (mounts)', <any> { 'default': true })
    dirs: boolean


    bins = {
        ssh    : 'ssh',
        sshfs  : 'sshfs',
        sshpass: 'sshpass',
        umount : 'umount'
    }

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
        let cmd: string = `${this.bins.sshfs} ${target.user}@${target.host}:${target.hostPath} ${target.localPath} -p ${target.port}`;
        if ( target.method === 'password' ) {
            cmd = `echo ${target.password} | ${cmd} -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o reconnect -o workaround=rename -o password_stdin`
        } else {
            cmd += ' -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=nof -o reconnect -o workaround=rename';
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

        execSync(cmd, {
            stdio: 'inherit'
        });
        // process.stdout.write(cmd);
    }
}
export default RcliSshConnect