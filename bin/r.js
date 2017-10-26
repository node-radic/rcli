#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('../src').bootstrapRcli().then(function (cli) {
    cli.start(__dirname + '/../src/commands/r');
}).catch(function (reason) {
    throw new Error(reason);
});
//# sourceMappingURL=r.js.map