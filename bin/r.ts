#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { Cli } from "radical-console";
// import { bootstrapRcli } from "../src";
console.log(process.uptime())
require('../src').bootstrapRcli().then((cli: Cli) => {
    cli.start(__dirname + '/../src/commands/r')
})
    .catch((reason) => {
        throw new Error(reason);
    })