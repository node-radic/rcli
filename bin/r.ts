#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { Cli } from "@radic/console";
import {bootstrapRcli,bootstrapRaven } from "../src";
// bootstrapRcli().start(__dirname + '/../src/commands/r')
bootstrapRaven()
bootstrapRcli().then((cli: Cli) => {
    cli.start(__dirname + '/../src/commands/r')
})