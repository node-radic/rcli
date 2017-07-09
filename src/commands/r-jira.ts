import { command, CommandArguments, inject, InputHelper, option, OutputHelper } from "@radic/console";
import { PKG } from "../";
import { SSHConnection } from "../database/Models/SSHConnection";

@command('info', 'General information')
export class InfoCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    in: InputHelper

    @option('d', 'lists all dependencies and development dependencies')
    deps: boolean

    async handle(args: CommandArguments) {
        const deps    = Object.keys(PKG.dependencies)
        const devDeps = Object.keys(PKG.devDependencies);
        let o         = this.out;
        o.line(`
Created by Robin Radic. 
Copyright 2017 MIT.

Current version: ${PKG.version}
Depends on ${deps.length} other packages to run
And requires ${devDeps.length} packages to be build 

For a complete list, run this command with --deps
        `)

        if ( this.deps )
            deps.concat(devDeps.map(dep => `{grey}${dep}{grey}`)).sort().forEach(name => this.out.line(' -  ' + name))

    }

}
export default InfoCmd
