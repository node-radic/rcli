#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var console_1 = require("@radic/console");
var rcli = require("../src");
rcli.config({});
console_1.cli.config({});
console_1.cli
    .helpers('input', 'output')
    .helper('help', {
    option: { key: 'h', name: 'help' }
})
    .helper('verbose', {
    option: { key: 'v', name: 'verbose' }
})
    .start(__dirname + '/../src/commands/r');
//# sourceMappingURL=r.js.map