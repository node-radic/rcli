#!/usr/bin/env node
import "../src/index";
import { cli, CliConfig } from "@radic/console";

cli.config(<CliConfig> {
    commands: {
        onMissingArgument: 'help'
    }
})

cli
    .helper('input')
    .helper('output')
    .helper('ssh.bash')
    .helper('help', {
        addShowHelpFunction: true,
        showOnError: true,
        app    : {
            title: 'Radic CLI'
        },
        option : { enabled: true, } //key: 'h', name: 'help' }
    })
    .helper('ssh.bash')
    .helper('verbose', {
        option: { key: 'v', name: 'verbose' }
    })
    .start(__dirname + '/../src/commands/r')


