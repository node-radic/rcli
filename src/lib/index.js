(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./core/paths", "./core/index", "./auth/index", "./git/index", "@radic/console", "lokijs", "lokijs/src/loki-fs-structured-adapter.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    var paths_1 = require("./core/paths");
    __export(require("./core/index"));
    __export(require("./auth/index"));
    __export(require("./git/index"));
    var console_1 = require("@radic/console");
    var loki = require("lokijs");
    var lfsa = require("lokijs/src/loki-fs-structured-adapter.js");
    var adapter = new lfsa();
    var db = new loki(paths_1.paths.userDatabase, {
        autoload: true,
        adapter: adapter,
        autoloadCallback: function () {
        },
        autosave: true,
        autosaveInterval: 1000
    });
    console_1.container.constant('r.db', db);
});
//# sourceMappingURL=index.js.map