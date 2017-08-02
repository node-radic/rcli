"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var radical_console_1 = require("radical-console");
function startTestingBootstrap(options, startCommandFile) {
    if (options === void 0) { options = {}; }
    radical_console_1.cli.config(options.cli || {});
    if (options.helpers.length > 0) {
        options.helpers.forEach(function (helper) { return radical_console_1.cli.helper(helper); });
    }
    var names = Object.keys(options.helpersCustomised);
    if (names.length > 0)
        names.forEach(function (name, index) { return radical_console_1.cli.helper(name, options.helpersCustomised[name] || {}); });
    if (startCommandFile)
        radical_console_1.cli.start(__dirname + '/../src/commands/' + startCommandFile);
}
exports.startTestingBootstrap = startTestingBootstrap;
