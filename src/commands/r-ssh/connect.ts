import { CommandArguments, CommandConfig, CommandDescriptionHelper, inject, injectable, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { ISSHConnection } from "../../interfaces";
import { ensureDirSync } from "fs-extra";
import { execSync } from "child_process";
import { rmdirSync } from "fs";
import { Credential } from "../../database/Models/Credential";
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

        let choices = await Credential.query()
            .column('name')
            .where('service', 'github')
            .orWhere('service', 'bitbucket')

        let name       = args.name || await this.ask.list('Service connection name?', Object.keys(this.config.get('connect'))),
            type       = args.type,
            validTypes = [ 'ssh', 'mount', 'umount' ];


        if ( false === validTypes.includes(type) ) {
            this.log.error(`Given type [${type}] does not exist. Use any of: [${validTypes.join(',')}]`)
            return false
        }

        if ( false === this.config.has('connect.' + name) ) {
            this.log.error(`Given name [${name}] does not exist.`)
            return false
        }

        let connect = this.config.get<ISSHConnection>('connect.' + name);
        this[ type ](connect);
    }


    mount(target: ISSHConnection) {
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

    umount(target: ISSHConnection) {
        let cmd: string = `sudo ${this.bins.umount} ${target.localPath} -f`;
        execSync(cmd);
        rmdirSync(target.localPath);
        this.log.info(`Unmounted ${target.localPath} success`);
    }

    ssh(target: ISSHConnection) {
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