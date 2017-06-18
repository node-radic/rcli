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
var GitCmd = (function () {
    function GitCmd() {
    }
    GitCmd.prototype.handle = function (args) {
        var path, value, list, del;
        if (args['path'])
            path = args['path'];
        if (args['value'])
            value = args['value'];
        list = this.list;
        del = this.delete;
        this.out.dump({ path: path, value: value, list: list, del: del });
    };
    return GitCmd;
}());
__decorate([
    console_1.inject('r.config'),
    __metadata("design:type", typeof (_a = typeof console_1.Config !== "undefined" && console_1.Config) === "function" && _a || Object)
], GitCmd.prototype, "config", void 0);
__decorate([
    console_1.lazyInject('cli.helpers.output'),
    __metadata("design:type", typeof (_b = typeof console_1.OutputHelper !== "undefined" && console_1.OutputHelper) === "function" && _b || Object)
], GitCmd.prototype, "out", void 0);
__decorate([
    console_1.option('l', 'list configuration, or part of it'),
    __metadata("design:type", Boolean)
], GitCmd.prototype, "list", void 0);
__decorate([
    console_1.option('d', 'delete configuration on [path] '),
    __metadata("design:type", Boolean)
], GitCmd.prototype, "delete", void 0);
GitCmd = __decorate([
    console_1.command('git', 'Remote git communication', ['repo'], {
        onMissingArgument: 'help',
        group: 'API'
    })
], GitCmd);
exports.GitCmd = GitCmd;
exports.default = GitCmd;
var _a, _b;
//# sourceMappingURL=r-git.js.map