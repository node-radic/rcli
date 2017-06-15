var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@radic/console", "../../"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("@radic/console");
    var _1 = require("../../");
    var RcliConnectEditCmd = (function () {
        function RcliConnectEditCmd() {
        }
        RcliConnectEditCmd.prototype.handle = function (args) {
            var argv = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argv[_i - 1] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var name, ok;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.interactive) {
                                return [2, this.startInteractive()];
                            }
                            name = 'connect.' + args.name;
                            if (!!this.config.has(name)) return [3, 2];
                            this.log.error('First argument : No such connection named ' + args.name);
                            return [4, this.ask.confirm('Go interactive?')];
                        case 1:
                            if (_a.sent()) {
                                this.interactive = true;
                                return [2, this.startInteractive()];
                            }
                            return [2];
                        case 2:
                            this.connect = this.config.get(name);
                            ['host', 'port', 'user', 'localPath', 'mountPath'].forEach(function (name) {
                                if (_this[name]) {
                                    _this.set(name, _this[name]);
                                }
                            });
                            this.out.dump(this.connect);
                            ok = this.ask.confirm('Verify the settings before save');
                            if (ok) {
                                this.config.set(name, this.connect);
                                this.log.info('Settings saved');
                            }
                            else {
                                this.log.warn('Canceled. Settings where not saved');
                            }
                            return [2];
                    }
                });
            });
        };
        RcliConnectEditCmd.prototype.startInteractive = function () {
            return __awaiter(this, void 0, void 0, function () {
                var names, name, availableFields, chosenFields, current, answers, _i, chosenFields_1, field, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            names = Object.keys(this.config('connect'));
                            return [4, this.ask.list('name', names)];
                        case 1:
                            name = _c.sent();
                            console.log('need to edit ', name);
                            availableFields = ['user', 'host', 'port', 'method', 'localPath', 'hostPath'];
                            return [4, this.ask.checkbox('Choose fields to edit', availableFields)];
                        case 2:
                            chosenFields = _c.sent();
                            current = this.config('connect.' + name);
                            answers = {};
                            _i = 0, chosenFields_1 = chosenFields;
                            _c.label = 3;
                        case 3:
                            if (!(_i < chosenFields_1.length)) return [3, 6];
                            field = chosenFields_1[_i];
                            _a = answers;
                            _b = field;
                            return [4, this.ask.ask(field)];
                        case 4:
                            _a[_b] = _c.sent();
                            _c.label = 5;
                        case 5:
                            _i++;
                            return [3, 3];
                        case 6: return [2];
                    }
                });
            });
        };
        RcliConnectEditCmd.prototype.set = function (prop, val) {
            if (prop === 'port')
                val = parseInt(val);
            this.connect[prop] = val;
            return this;
        };
        return RcliConnectEditCmd;
    }());
    __decorate([
        console_1.inject('cli.helpers.output'),
        __metadata("design:type", console_1.OutputHelper)
    ], RcliConnectEditCmd.prototype, "out", void 0);
    __decorate([
        console_1.inject('cli.helpers.input'),
        __metadata("design:type", console_1.InputHelper)
    ], RcliConnectEditCmd.prototype, "ask", void 0);
    __decorate([
        console_1.inject('cli.helpers.ssh.bash'),
        __metadata("design:type", _1.SshBashHelper)
    ], RcliConnectEditCmd.prototype, "ssh", void 0);
    __decorate([
        console_1.lazyInject('cli.log'),
        __metadata("design:type", Object)
    ], RcliConnectEditCmd.prototype, "log", void 0);
    __decorate([
        console_1.inject('r.config'),
        __metadata("design:type", Function)
    ], RcliConnectEditCmd.prototype, "config", void 0);
    __decorate([
        console_1.option('H', 'server ip or hostname'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "host", void 0);
    __decorate([
        console_1.option('p', 'server ssh port'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "port", void 0);
    __decorate([
        console_1.option('u', 'username for login'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "user", void 0);
    __decorate([
        console_1.option('k', 'set method to key'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "method", void 0);
    __decorate([
        console_1.option('P', 'set a new password (you will be asked for it)'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "pass", void 0);
    __decorate([
        console_1.option('L', 'path to local mount point (sshfs)'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "localPath", void 0);
    __decorate([
        console_1.option('R', 'path on the remote server to mount (sshfs)'),
        __metadata("design:type", String)
    ], RcliConnectEditCmd.prototype, "hostPath", void 0);
    __decorate([
        console_1.option('i', 'Interactive mode'),
        __metadata("design:type", Boolean)
    ], RcliConnectEditCmd.prototype, "interactive", void 0);
    RcliConnectEditCmd = __decorate([
        console_1.command("edit \n[name:string@the connection name]", 'edit a connections')
    ], RcliConnectEditCmd);
    exports.RcliConnectEditCmd = RcliConnectEditCmd;
    exports.default = RcliConnectEditCmd;
});
//# sourceMappingURL=edit.js.map