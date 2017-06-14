(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "lodash", "fs-extra", "fs", "@radic/console", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path_1 = require("path");
    var _ = require("lodash");
    var fs_extra_1 = require("fs-extra");
    var fs_1 = require("fs");
    var console_1 = require("@radic/console");
    var shelljs_1 = require("shelljs");
    var root = path_1.join(__dirname, '..', '..'), home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, cwd = process.cwd();
    function setPermissions(paths) {
        [paths.userData, paths.dbBackups].filter(function (dir) { return !fs_1.existsSync(dir); }).forEach(function (dir) {
            shelljs_1.mkdir('-p', dir);
            shelljs_1.chmod(755, dir);
        });
        var homeStats = fs_1.statSync(paths.home);
    }
    exports.setPermissions = setPermissions;
    function setPaths(overrides, _root, _home, r) {
        if (overrides === void 0) { overrides = {}; }
        if (_root === void 0) { _root = null; }
        if (_home === void 0) { _home = null; }
        if (r === void 0) { r = '.rcli'; }
        if (_root)
            root = _root;
        if (_home)
            home = _home;
        exports.paths = {
            root: root, home: home, cwd: cwd,
            env: path_1.join(cwd, '.env'),
            bin: path_1.join(root, 'bin'),
            src: path_1.join(root, 'src'),
            packageFile: path_1.join(root, 'package.json'),
            tsconfig: path_1.join(root, 'tsconfig.json'),
            tsd: path_1.join(root, 'tsd.json'),
            user: home,
            rcFile: path_1.join(home, '.rclirc'),
            userData: path_1.join(home, r),
            userCache: path_1.join(home, r, 'r.cache'),
            userDatabase: path_1.join(home, r, 'r.db'),
            userDataConfig: path_1.join(home, r, 'r.conf'),
            userSecretKeyFile: path_1.join(home, r, 'secret.key'),
            userPublicKeyFile: path_1.join(home, r, 'public.key'),
            backups: path_1.join(home, r, 'backups'),
            dbBackups: path_1.join(home, r, 'backups', 'db')
        };
        _.merge(exports.paths, overrides);
        if (console_1.container.isBound('paths')) {
            console_1.container.unbind('paths');
        }
        console_1.container.bind('r.paths').toConstantValue(exports.paths);
        setPermissions(exports.paths);
        return exports.paths;
    }
    exports.setPaths = setPaths;
    setPaths();
    if (fs_1.existsSync(exports.paths.rcFile)) {
        var rcli = fs_extra_1.readJSONSync(exports.paths.rcFile);
        if (rcli.location) {
            setPaths({}, null, null, rcli.location);
        }
    }
});
//# sourceMappingURL=paths.js.map