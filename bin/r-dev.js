#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
src_1.bootstrapRcli().then(function (cli) {
    cli.start(__dirname + '/../src/commands/r');
})
    .catch(function (reason) {
    throw new Error(reason);
});
