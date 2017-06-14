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
        define(["require", "exports", "@radic/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("@radic/console");
    var RcliConnectCmd = (function () {
        function RcliConnectCmd() {
        }
        RcliConnectCmd.prototype.handle = function (args, argv) {
            this.log.info('args', args);
            this.log.info('argv', argv);
            this.log.info('config', this._config);
        };
        return RcliConnectCmd;
    }());
    __decorate([
        console_1.inject('cli.helpers.output'),
        __metadata("design:type", console_1.OutputHelper)
    ], RcliConnectCmd.prototype, "out", void 0);
    __decorate([
        console_1.inject('cli.log'),
        __metadata("design:type", Object)
    ], RcliConnectCmd.prototype, "log", void 0);
    RcliConnectCmd = __decorate([
        console_1.command('connect {command}', 'SSH connection helper', ['add', 'bulk', 'list', 'edit', 'ssh', 'remove'], {
            onMissingArgument: 'help',
            helpers: {
                help: {
                    app: { title: 'SSH Connection Helper' }
                }
            }
        })
    ], RcliConnectCmd);
    exports.RcliConnectCmd = RcliConnectCmd;
    exports.default = RcliConnectCmd;
});
//# sourceMappingURL=r-connect.js.map