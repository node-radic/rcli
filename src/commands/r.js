"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
        return true;
    };
    return RcliCmd;
}());
__decorate([
    console_1.inject('cli.helpers.help'),
    __metadata("design:type", console_1.CommandDescriptionHelper)
], RcliCmd.prototype, "help", void 0);
__decorate([
    console_1.inject('r.log'),
    __metadata("design:type", Object)
], RcliCmd.prototype, "log", void 0);
__decorate([
    console_1.inject('r.config'),
    __metadata("design:type", Function)
], RcliCmd.prototype, "config", void 0);
RcliCmd = __decorate([
    console_1.command('r {command:string@any of the listed commands}', {
        subCommands: ['ssh', 'connect', 'git', 'config', 'info', 'socket', 'tree', 'completion'],
        alwaysRun: true,
        onMissingArgument: 'help',
        helpers: {
            help: {
                display: {
                    arguments: false
                }
            }
        }
    })
], RcliCmd);
exports.RcliCmd = RcliCmd;
exports.default = RcliCmd;
//# sourceMappingURL=r.js.map