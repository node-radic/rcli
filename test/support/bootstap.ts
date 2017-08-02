import { cli, CliConfig, HelperOptionsConfig } from "radical-console";


export interface TestingBoostrapOptions {
    cli?: CliConfig
    helpers?: string[]
    helpersCustomised?: { [name: string]: HelperOptionsConfig }
}

export function startTestingBootstrap(options: TestingBoostrapOptions = {}, startCommandFile?: string) {

    cli.config(<CliConfig> options.cli || {})

    if ( options.helpers.length > 0 ) {
        options.helpers.forEach(helper => cli.helper(helper));
    }

    let names = Object.keys(options.helpersCustomised);
    if ( names.length > 0 ) names.forEach((name, index) => cli.helper(name, options.helpersCustomised[ name ] || {}));

    if ( startCommandFile ) cli.start(__dirname + '/../src/commands/' + startCommandFile)


}