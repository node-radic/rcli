#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../src/index", "@radic/console", "winston", "raven"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("../src/index");
    var console_1 = require("@radic/console");
    var winston = require("winston");
    var Raven = require("raven");
    var rconfig = console_1.container.get('r.config');
    if (rconfig.has('raven.dsn')) {
        Raven.config(rconfig('raven.dsn')).install();
        winston.transports['Sentry'] = require('winston-sentry');
        winston.add(winston.transports['Sentry'], {
            dsn: rconfig('raven.dsn')
        });
    }
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
    });
    console_1.cli.start(__dirname + '/../src/commands/r');
});
//# sourceMappingURL=r.js.map