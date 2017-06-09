#!/usr/bin/env node
import { cli, CliConfig } from "../src";
import * as rcli from '../rcli'
rcli.config({
    
})

cli.config(<CliConfig> {

})


cli
    .helpers('input', 'output')
    .helper('help', {
        option: { key: 'h', name: 'help' }
    })
    .helper('verbose', {
        option: { key: 'v', name: 'verbose' }
    })
    .start(__dirname + '/../rcli/commands/r')


