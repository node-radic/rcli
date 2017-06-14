"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var console_1 = require("@radic/console");
function startTestingBootstrap(options, startCommandFile) {
    if (options === void 0) { options = {}; }
    console_1.cli.config(options.cli || {});
    if (options.helpers.length > 0) {
        options.helpers.forEach(function (helper) { return console_1.cli.helper(helper); });
    }
    var names = Object.keys(options.helpersCustomised);
    if (names.length > 0)
        names.forEach(function (name, index) { return console_1.cli.helper(name, options.helpersCustomised[name] || {}); });
    if (startCommandFile)
        require(__dirname + '/../src/commands/' + startCommandFile);
}
exports.startTestingBootstrap = startTestingBootstrap;
