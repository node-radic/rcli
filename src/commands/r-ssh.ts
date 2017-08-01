import { command, CommandConfig, inject, Log, OptionConfig, OutputHelper } from "@radic/console";
import { Paths } from "..";

@command('ssh {command}', 'SSH connection helper', { //, [ 'add', 'list', 'edit', 'remove', 'console', 'mount', 'umount' ]
    isGroup: true,
})
export class RcliSshCmd {

    _config: CommandConfig
    _options: OptionConfig[]

    @inject('cli.helpers.output')
    out: OutputHelper;


    @inject('r.log')
    log: Log


    @inject('r.paths')
    paths: Paths

    handle() {

    }
}
export default RcliSshCmd