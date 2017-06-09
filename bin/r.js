#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
var rcli = require("../rcli");
rcli.config({});
src_1.cli.config({});
src_1.cli
    .helpers('input', 'output')
    .helper('help', {
    option: { key: 'h', name: 'help' }
})
    .helper('verbose', {
    option: { key: 'v', name: 'verbose' }
})
    .start(__dirname + '/../rcli/commands/r');
//# sourceMappingURL=r.js.map