#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
var bootstrap_1 = require("../src/core/bootstrap");
src_1.bootstrapRaven();
bootstrap_1.bootstrapRcli().then(function (cli) {
    cli.start(__dirname + '/../src/commands/r');
});
//# sourceMappingURL=r.js.map