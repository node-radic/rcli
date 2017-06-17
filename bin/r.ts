#!/usr/bin/env node
// import { bootstrapRcli } from "../src";
import { bootstrapRaven , init } from "../src";
// bootstrapRcli().start(__dirname + '/../src/commands/r')

bootstrapRaven()
init(__dirname + '/../src/commands/r')