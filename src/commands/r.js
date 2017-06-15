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
    var RcliCmd = (function () {
        function RcliCmd() {
        }
        RcliCmd.prototype.always = function () {
            if (this.config('debug') === true) {
                this.log.level = 'debug';
            }
        };
        RcliCmd.prototype.handle = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this.out.success('Try -h for options');
        };
        return RcliCmd;
    }());
    __decorate([
        console_1.lazyInject('cli.helpers.output'),
        __metadata("design:type", console_1.OutputHelper)
    ], RcliCmd.prototype, "out", void 0);
    __decorate([
        console_1.lazyInject('cli.log'),
        __metadata("design:type", Object)
    ], RcliCmd.prototype, "log", void 0);
    __decorate([
        console_1.inject('r.config'),
        __metadata("design:type", Function)
    ], RcliCmd.prototype, "config", void 0);
    RcliCmd = __decorate([
        console_1.command('r {command:string@any of the listed commands}', {
            subCommands: ['connect', 'git', 'config', 'info', 'scaf'],
            alwaysRun: true,
            onMissingArgument: 'help'
        })
    ], RcliCmd);
    exports.RcliCmd = RcliCmd;
    exports.default = RcliCmd;
});
//# sourceMappingURL=r.js.map