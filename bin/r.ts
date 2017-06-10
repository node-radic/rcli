#!/usr/bin/env node
import 'reflect-metadata'
import { cli, CliConfig } from "@radic/console";
import * as rcli from '../src'
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
    .start(__dirname + '/../src/commands/r')


