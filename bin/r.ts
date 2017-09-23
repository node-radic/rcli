#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { Cli } from "radical-console";
console.log(process.uptime(), 'bin')

require('../src').bootstrapRcli().then((cli: Cli) => {
    console.log(process.uptime(), 'start')
    cli.start(__dirname + '/../src/commands/r')
})    .catch((reason) => {

    throw new Error(reason);
    })

