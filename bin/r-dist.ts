#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { Cli } from "@radic/console";
import { bootstrapRcli } from "../lib";

bootstrapRcli().then((cli: Cli) => {
    cli.start(__dirname + '/../lib/commands/r')
})
    .catch((reason) => {
        throw new Error(reason);
    })