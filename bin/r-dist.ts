#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { Cli } from "@radic/console";
import { bootstrapRcli } from "../src";

bootstrapRcli().then((cli: Cli) => {
    cli.start(__dirname + '/../src/commands/r')
})
    .catch((reason) => {
        throw new Error(reason);
    })