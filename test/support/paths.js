"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../../src");
var path_1 = require("path");
var radical_console_1 = require("radical-console");
function setFixturePaths() {
    var _root = path_1.resolve('..', 'fixtures', 'files');
    var _home = path_1.resolve('..', 'fixtures', 'home');
    var r = 'rcli';
    exports.paths = src_1.setPaths({}, _root, _home, r);
    if (radical_console_1.container.isBound('paths')) {
        radical_console_1.container.unbind('paths');
    }
    radical_console_1.container.bind('r.paths').toConstantValue(exports.paths);
    return exports.paths;
}
exports.setFixturePaths = setFixturePaths;
setFixturePaths();
