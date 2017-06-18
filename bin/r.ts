#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { bootstrapRaven } from "../src";
import { bootstrapRcli } from "../src/core/bootstrap";
import { Cli } from "@radic/console";
// bootstrapRcli().start(__dirname + '/../src/commands/r')

bootstrapRaven()
bootstrapRcli().then((cli: Cli) => {
    cli.start(__dirname + '/../src/commands/r')
})