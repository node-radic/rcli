#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../src/index", "@radic/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("../src/index");
    var console_1 = require("@radic/console");
    console_1.cli.config({
        commands: {
            onMissingArgument: 'help'
        }
    });
    console_1.cli
        .helper('input')
        .helper('output')
        .helper('ssh.bash')
        .helper('help', {
        addShowHelpFunction: true,
        showOnError: true,
        app: {
            title: 'Radic CLI'
        },
        option: { enabled: true, }
    })
        .helper('ssh.bash')
        .helper('verbose', {
        option: { key: 'v', name: 'verbose' }
    })
        .start(__dirname + '/../src/commands/r');
});
//# sourceMappingURL=r.js.map