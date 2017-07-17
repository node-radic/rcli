import { command, CommandArguments, inject, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { PKG } from "../core/static";

@command('info', 'General information')
export class InfoCmd {

    @inject('r.log')
    log: Log

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    in: InputHelper

    @option('d', 'lists all dependencies and development dependencies')
    deps: boolean

    async handle(args: CommandArguments) {
        const deps    = Object.keys(PKG.dependencies)
        const devDeps = Object.keys(PKG.devDependencies);
        this.out.line(`
Created by Robin Radic. 
Copyright 2017 MIT.

Current version: ${PKG.version}
Depends on ${deps.length} other packages to run
And requires ${devDeps.length} packages to be build 

For a complete list, run this command with --deps
        `)

        if ( this.deps )
            deps.concat(devDeps.map(dep => `{grey}${dep}{grey}`)).sort().forEach(name => this.out.line(' -  ' + name))

        let msg = 'log level: ' + this.log.level
        this.log.error(msg)
        this.log.warn(msg)
        this.log.alert(msg)
        this.log.notice(msg)
        this.log.help(msg)
        this.log.info(msg)
        this.log.verbose(msg)
        this.log.data(msg)
        this.log.debug(msg)
        this.log.silly(msg);
    }

}
export default InfoCmd
