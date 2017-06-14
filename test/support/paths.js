"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../../src");
var path_1 = require("path");
var console_1 = require("@radic/console");
function setFixturePaths() {
    var _root = path_1.resolve('..', 'fixtures', 'files');
    var _home = path_1.resolve('..', 'fixtures', 'home');
    var r = 'rcli';
    exports.paths = src_1.setPaths({}, _root, _home, r);
    if (console_1.container.isBound('paths')) {
        console_1.container.unbind('paths');
    }
    console_1.container.bind('r.paths').toConstantValue(exports.paths);
    return exports.paths;
}
exports.setFixturePaths = setFixturePaths;
setFixturePaths();
