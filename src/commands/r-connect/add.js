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
        define(["require", "exports", "@radic/console", "open-in-editor", "../../lib/core/paths"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("@radic/console");
    var editor = require("open-in-editor");
    var paths_1 = require("../../lib/core/paths");
    var RcliConnectAddCmd = (function () {
        function RcliConnectAddCmd() {
            this.pass = false;
            this.key = true;
            this.port = 22;
            this.hostPath = '/';
            this.force = false;
            this.interactive = false;
            this.help = false;
        }
        RcliConnectAddCmd.prototype.handle = function (args) {
            var argv = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argv[_i - 1] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var data, host, success, key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.editor) {
                                this.askInEditor();
                                return [2];
                            }
                            this.events.on('add:help', function () { return _this.help = true; });
                            if (this.interactive)
                                return [2, this.interact()];
                            data = {
                                name: args.name,
                                user: args.user,
                                host: args.host,
                                method: 'key',
                                password: null,
                                port: this.port,
                                localPath: this.localPath || '/mnt/' + args.name,
                                hostPath: this.hostPath || '/'
                            };
                            if (args.host.includes(':')) {
                                host = args.host.split(':');
                                data.port = parseInt(host.shift());
                            }
                            if (!(this.pass === true)) return [3, 2];
                            return [4, this.askPassword(data, 3)];
                        case 1:
                            success = _a.sent();
                            if (!success) {
                                process.exit(1);
                            }
                            _a.label = 2;
                        case 2:
                            key = 'connect.' + data.name;
                            if (false === this.config.has(key) || this.force) {
                                this.config.set(key, data);
                                this.log.info("The config for " + key + " has been " + (this.force ? 'forcefully' : '') + " set");
                            }
                            else {
                                this.log.warn("The config for " + key + " has already been set. in order to force it, use --force option");
                            }
                            return [2, true];
                    }
                });
            });
        };
        RcliConnectAddCmd.prototype.askPassword = function (data, left) {
            if (left === void 0) { left = 3; }
            return __awaiter(this, void 0, void 0, function () {
                var password, password2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.ask.password('Enter password')];
                        case 1:
                            password = _a.sent();
                            return [4, this.ask.password('Verify password')];
                        case 2:
                            password2 = _a.sent();
                            if (password === password2) {
                                data.password = password;
                                data.method = 'password';
                                return [2, true];
                            }
                            else {
                                this.log.notice("Invalid combination. " + left + " tries left");
                                if (left === 0)
                                    this.log.warn('It seems your password did not match the other for the maximum ammount of tries');
                                this.log.error('operation canceled');
                            }
                            return [2, this.askPassword(data, left - 1)];
                    }
                });
            });
        };
        RcliConnectAddCmd.prototype.interact = function () {
            return __awaiter(this, void 0, void 0, function () {
                var name, user, host, port, method, password, localPath, hostPath, seg, _a, key, force;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, this.ask.ask('Connection name')];
                        case 1:
                            name = _b.sent();
                            return [4, this.ask.ask('Username')];
                        case 2:
                            user = _b.sent();
                            return [4, this.ask.ask('Host/IP')];
                        case 3:
                            host = _b.sent();
                            if (!host.includes(':')) return [3, 4];
                            seg = host.split(':');
                            host = seg.shift();
                            port = parseInt(seg.shift());
                            return [3, 6];
                        case 4:
                            _a = parseInt;
                            return [4, this.ask.ask('Port', '22')];
                        case 5:
                            port = _a.apply(void 0, [_b.sent()]);
                            _b.label = 6;
                        case 6: return [4, this.ask.ask('Authentication method (password/sshkey)', 'key')];
                        case 7:
                            method = _b.sent();
                            if (!(method === 'password')) return [3, 9];
                            return [4, this.askPassword({ password: password, method: method })];
                        case 8:
                            password = _b.sent();
                            _b.label = 9;
                        case 9: return [4, this.ask.ask('Local mount point using SSHFS', '/mnt/' + name)];
                        case 10:
                            localPath = _b.sent();
                            return [4, this.ask.ask('Host path to mount using SSHFS', '/')];
                        case 11:
                            hostPath = _b.sent();
                            key = 'connect.' + name;
                            force = false;
                            if (!this.config.has(key)) return [3, 13];
                            return [4, this.ask.confirm('The given connection has already ben set. Backup and override it?')];
                        case 12:
                            force = _b.sent();
                            if (force) {
                                this.config.set('_backup:' + name, this.config.get(name));
                            }
                            _b.label = 13;
                        case 13:
                            this.config.set("connect." + name, { name: name, user: user, host: host, port: port, method: method, password: password, localPath: localPath, hostPath: hostPath });
                            this.log.info("Connection <" + name + "> added");
                            return [2, true];
                    }
                });
            });
        };
        RcliConnectAddCmd.prototype.handleInvalid = function () {
            return this.interactive || this.help;
        };
        RcliConnectAddCmd.prototype.askInEditor = function () {
            var editors = ['atom', 'code', 'sublime', 'webstorm', 'phpstorm', 'idea14ce', 'vim', 'visualstudio', 'emacs'];
            editor.configure({
                cmd: process.env.EDITOR
            }, function (err) {
                console.error('Something went wrong: ' + err);
            });
            editor.open(paths_1.paths.userDataConfig);
        };
        return RcliConnectAddCmd;
    }());
    __decorate([
        console_1.lazyInject('cli.helpers.output'),
        __metadata("design:type", console_1.OutputHelper)
    ], RcliConnectAddCmd.prototype, "out", void 0);
    __decorate([
        console_1.lazyInject('cli.helpers.input'),
        __metadata("design:type", console_1.InputHelper)
    ], RcliConnectAddCmd.prototype, "ask", void 0);
    __decorate([
        console_1.lazyInject('cli.log'),
        __metadata("design:type", Object)
    ], RcliConnectAddCmd.prototype, "log", void 0);
    __decorate([
        console_1.lazyInject('r.config'),
        __metadata("design:type", Function)
    ], RcliConnectAddCmd.prototype, "config", void 0);
    __decorate([
        console_1.lazyInject('cli.events'),
        __metadata("design:type", console_1.Dispatcher)
    ], RcliConnectAddCmd.prototype, "events", void 0);
    __decorate([
        console_1.option('P', 'login using a password (enter later)'),
        __metadata("design:type", Boolean)
    ], RcliConnectAddCmd.prototype, "pass", void 0);
    __decorate([
        console_1.option('s', 'Login using your ~/id_psa.pub key (default)'),
        __metadata("design:type", Boolean)
    ], RcliConnectAddCmd.prototype, "key", void 0);
    __decorate([
        console_1.option('p', 'use the given port (default: 22)'),
        __metadata("design:type", Number)
    ], RcliConnectAddCmd.prototype, "port", void 0);
    __decorate([
        console_1.option('l', 'local mount path for sshfs (default: /mnt/<name>)'),
        __metadata("design:type", String)
    ], RcliConnectAddCmd.prototype, "localPath", void 0);
    __decorate([
        console_1.option('H', 'host path to mount for sshfs (default: / )'),
        __metadata("design:type", String)
    ], RcliConnectAddCmd.prototype, "hostPath", void 0);
    __decorate([
        console_1.option('f', 'forces adjuments even though already exists'),
        __metadata("design:type", Boolean)
    ], RcliConnectAddCmd.prototype, "force", void 0);
    __decorate([
        console_1.option('i', 'interactive mode'),
        __metadata("design:type", Boolean)
    ], RcliConnectAddCmd.prototype, "interactive", void 0);
    __decorate([
        console_1.option('e', 'define in editor'),
        __metadata("design:type", Boolean)
    ], RcliConnectAddCmd.prototype, "editor", void 0);
    RcliConnectAddCmd = __decorate([
        console_1.command("add \n[name:string@the connection name] \n[user:string@the user to login] \n[host:string@the host to connect]", 'Add a connection', {
            onMissingArgument: 'help',
            example: "\nInteractive method works fastest. Answer some questions and done!\n$ r connect add -i \n\nMinimal:\n$ r connect add <name> <login> <host>\n$ r connect add srv1 admin 123.124.214.55\n$ r connect add srv1 admin 123.124.214.55:6666\n$ r connect add srv1 admin 123.124.214.55 -p 6666\n\nTo login by password, use -P. You will be prompted for it\n$ r connect add srv1 admin 123.124.214.55 -p 6666 -P\n\nFull\n$ r connect add srv1 admin 123.123.123.123 --port 5050 \\\n    --local-path /path/to/local/mountpoint --host-path /home/admin \\\n    --force --password\n"
        })
    ], RcliConnectAddCmd);
    exports.RcliConnectAddCmd = RcliConnectAddCmd;
    exports.default = RcliConnectAddCmd;
});
//# sourceMappingURL=add.js.map