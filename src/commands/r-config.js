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
        define(["require", "exports", "@radic/console", "@radic/util", "../"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("@radic/console");
    var util_1 = require("@radic/util");
    var _1 = require("../");
    var ConfigCmd = (function () {
        function ConfigCmd() {
        }
        ConfigCmd.prototype.handle = function (args) {
            args.path = args.path || '';
            var list;
            switch (true) {
                case this.listBackups:
                    this.listLocalBackups();
                    break;
                case this.restore:
                    this.restoreBackup(args.path);
                    break;
                case this.backup:
                    this.createBackup();
                    this.log.verbose("config has created a backup");
                    break;
                case this.delete:
                    this.createBackup();
                    this.unset(args.path);
                    this.log.verbose("config value at [" + args.path + "] has been removed");
                    break;
                case this.root:
                    list = this.listPath(args.path, true);
                    break;
                case this.list:
                    list = this.listPath(args.path);
                    break;
            }
            if (args.path.length > 0 && args.value) {
                if (!this.set(args.path, args.value)) {
                    this.log.warn("A value alredy exist for path [" + args.path + "] You could use -f|--force to override");
                }
                else {
                    this.log.info("Value " + args.value + " for path [" + args.path + "] set");
                }
            }
        };
        ConfigCmd.prototype.createBackup = function (path) {
            this.configCore.backupWithoutEncryption();
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
        ConfigCmd.prototype.listPath = function (path, rootConfig) {
            var _this = this;
            if (rootConfig === void 0) { rootConfig = false; }
            var dotted = util_1.dotize(this[rootConfig ? 'configCore' : 'config'].get(path || ''), '');
            Object.keys(dotted).forEach(function (key) {
                _this.out.line("'{darkorange}" + key + "{/darkorange} : {green}" + dotted[key] + "{/green}");
            });
            return this;
        };
        ConfigCmd.prototype.set = function (path, value) {
            if (false === this.config.has(path) || this.force) {
                this.config.set(path, JSON.parse(value));
            }
            return this;
        };
        ConfigCmd.prototype.unset = function (path) {
            var _this = this;
            path.split(/\s/g).forEach(function (path) {
                if (_this.config.has(path)) {
                    _this.config.unset(path);
                    return true;
                }
            });
            return false;
        };
        return ConfigCmd;
    }());
    __decorate([
        console_1.inject('r.config.core'),
        __metadata("design:type", _1.PersistentFileConfig)
    ], ConfigCmd.prototype, "configCore", void 0);
    __decorate([
        console_1.inject('r.config'),
        __metadata("design:type", Function)
    ], ConfigCmd.prototype, "config", void 0);
    __decorate([
        console_1.lazyInject('cli.helpers.help'),
        __metadata("design:type", console_1.OutputHelper)
    ], ConfigCmd.prototype, "help", void 0);
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
        console_1.option('d', 'unset te given option'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "delete", void 0);
    __decorate([
        console_1.option('f', 'force the operation'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "force", void 0);
    __decorate([
        console_1.option('B', 'create a backup before any alteration'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "backup", void 0);
    __decorate([
        console_1.option('p', 'If backing up, backup as plain json readable file'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "plain", void 0);
    __decorate([
        console_1.option('r', 'If backing up, backup as plain json readable file'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "root", void 0);
    __decorate([
        console_1.option('e', 'restore a backup'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "restore", void 0);
    __decorate([
        console_1.option('L', 'List all local backups'),
        __metadata("design:type", Boolean)
    ], ConfigCmd.prototype, "listBackups", void 0);
    ConfigCmd = __decorate([
        console_1.command("config \n[path:string@dot notated string] \n[value:any@A JSON parseable value]", {
            onMissingArgument: 'help',
            example: "\n$ config -l                     # list\n$ config dgram.server.port      # view\n$ config dgram.server.port 80   # edit\n"
        })
    ], ConfigCmd);
    exports.ConfigCmd = ConfigCmd;
    exports.default = ConfigCmd;
});
//# sourceMappingURL=r-config.js.map