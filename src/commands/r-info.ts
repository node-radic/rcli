import { OutputHelper, command, option, Config, inject, lazyInject, CommandArguments, InputHelper } from "@radic/console";
import { PKG } from "../";

@command('info', 'General information')
export class InfoCmd {

    @inject('cli.helpers.output')
    out:OutputHelper;

    @inject('cli.helpers.input')
    in:InputHelper

    @option('d', 'lists all dependencies and development dependencies')
    deps:boolean

    handle(args:CommandArguments){
        const deps = Object.keys(PKG.dependencies)
        const devDeps = Object.keys(PKG.devDependencies);
        let o = this.out;
        o.line(`
This app is created by Robin Radic. 
Copyright 2017 MIT

Current version: ${PKG.version}
Depends on ${deps.length} other packages to run
And requiresi ${devDeps.length} packages to be build
To those developers: {bold}Thank you.{/bold} 

For a complete list, run this command with --deps
        `)

        if(this.deps){
            deps.concat(devDeps).forEach(name => this.out.line(' -  ' +name))

        }
    }
}
export default InfoCmd
