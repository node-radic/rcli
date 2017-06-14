var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@radic/console", "@radic/util", "../lib/core/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("@radic/console");
    var util_1 = require("@radic/util");
    var config_1 = require("../lib/core/config");
    var ConfigCmd = (function () {
        function ConfigCmd() {
        }
        ConfigCmd.prototype.handle = function (args) {
            args.path = args.path || '';
            if (this.list && args.path.length > 0) {
                return this.listPath(args.path);
            }
            if (this.list) {
                return this.listPath();
            }
            if (this.unset && args.path.length > 0) {
                if (this.backup) {
                    this.createBackup();
                }
                this.unset(args.path);
                this.log.verbose("config value at [" + arg.path + "] has been removed");
                return;
            }
            if (args.path.length > 0 && args.value) {
                if (this.config.has(args.path)) {
                    this.log.warn("A value exists already undner " + args.path + ". use -f to force it");
                }
                if (false === this.config.has(args.path) || this.force === true) {
                    return this.config.set(args.path, args.value);
                }
            }
            if (this.listBackups) {
                this.listLocalBackups();
                return;
            }
            this.showHelp();
        };
        ConfigCmd.prototype.createBackup = function () {
            this.configCore.backup();
            return this;
        };
        ConfigCmd.prototype.restoreBackup = function (filePath) {
            this.configCore.restore(filePath);
        };
        ConfigCmd.prototype.listLocalBackups = function () {
            var _this = this;
            this.configCore.getLocalBackupFiles().forEach(function (filePath) {
                _this.out.line(' - ' + filePath);
            });
        };
        ConfigCmd.prototype.listPath = function (path) {
            var _this = this;
            var dotted = util_1.dotize(this.config.get(path));
            Object.keys(dotted).forEach(function (key) {
                _this.out.line("'{darkorange}" + key + "{/darkorange} : {green}" + dotted[key] + "{/green}");
            });
            return this;
        };
        ConfigCmd.prototype.set = function (path, value) {
            if (fale === this.config.has(path) || this.force) {
                this.config.set(path, value);
            }
            return this;
        };
        ConfigCmd.prototype.unset = function (path) {
            if (this.config.has(path)) {
                this.config.unset(path);
            }
            return this;
        };
        return ConfigCmd;
    }());
    __decorate([
        console_1.inject('r.config.core'),
        __metadata("design:type", config_1.PersistentFileConfig)
    ], ConfigCmd.prototype, "configCore", void 0);
    __decorate([
        console_1.inject('r.config'),
        __metadata("design:type", Function)
    ], ConfigCmd.prototype, "config", void 0);
    __decorate([
        console_1.lazyInject('cli.helpers.output'),
        __metadata("design:type", console_1.OutputHelper)
    ], ConfigCmd.prototype, "out", void 0);
    __decorate([
        console_1.lazyInject('cli.helpers.output'),
        __metadata("design:type", console_1.InputHelper)
    ], ConfigCmd.prototype, "ask", void 0);
    __decorate([
        console_1.lazyInject('cli.log'),
        __metadata("design:type", Object)
    ], ConfigCmd.prototype, "log", void 0);
    __decorate([
        console_1.option('l', 'list configuration settings'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "list", void 0);
    __decorate([
        console_1.option('r', 'show root config'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "root", void 0);
    __decorate([
        console_1.option('U', 'unset te given option'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "unset", void 0);
    __decorate([
        console_1.option('f', 'force the operation'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "force", void 0);
    __decorate([
        console_1.option('b', 'create a backup before any alteration'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "backup", void 0);
    __decorate([
        console_1.option('r', 'restore a backup'),
        __metadata("design:type", String)
    ], ConfigCmd.prototype, "restore", void 0);
    __decorate([
        console_1.option('L', 'List all local backups'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "listBackups", void 0);
    ConfigCmd = __decorate([
        console_1.command('config [path:string@dot notated string] [value:any@A JSON parseable value]')
    ], ConfigCmd);
    exports.ConfigCmd = ConfigCmd;
    exports.default = ConfigCmd;
});
//# sourceMappingURL=r-config.js.map