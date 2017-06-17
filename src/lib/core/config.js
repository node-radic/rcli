"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var util_1 = require("@radic/util");
var Cryptr = require("cryptr");
var fs_extra_1 = require("fs-extra");
var dotenv = require("dotenv");
var keys_1 = require("./keys");
var paths_1 = require("./paths");
var fs_1 = require("fs");
var console_1 = require("@radic/console");
var path_1 = require("path");
var globule = require("globule");
var defaultConfig = {
    debug: false,
    env: {},
    cli: {
        showCopyright: true
    },
    auth: {
        connections: []
    },
    dgram: {
        server: {
            host: '127.0.0.1',
            port: 41333
        },
        client: {
            host: '127.0.0.1',
            port: Math.round(Math.random() * 10000) + 1000
        }
    },
    pmove: {
        extensions: ['mp4', 'wma', 'flv', 'mkv', 'avi', 'wmv', 'mpg']
    },
    connect: {}
};
function parseEnvVal(val) {
    if (val === 'true' || val === 'false') {
        return val === 'true';
    }
    if (isFinite(val))
        return parseInt(val);
    return val;
}
var PersistentFileConfig = (function (_super) {
    __extends(PersistentFileConfig, _super);
    function PersistentFileConfig(obj) {
        var _this = _super.call(this, {}) || this;
        _this.autoload = true;
        _this.saveEnabled = false;
        _this.cryptr = new Cryptr((new keys_1.Keys())._public);
        _this.defaultConfig = obj;
        _this.filePath = paths_1.paths.userDataConfig;
        if (_this.autoload) {
            _this.load();
            _this.loadEnv();
        }
        return _this;
    }
    PersistentFileConfig.prototype.set = function (prop, value) {
        _super.prototype.set.call(this, prop, value);
        return this.save();
    };
    PersistentFileConfig.prototype.unset = function (prop) {
        _super.prototype.unset.call(this, prop);
        return this.save();
    };
    PersistentFileConfig.prototype.merge = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        _super.prototype.merge.apply(this, args);
        return this.save();
    };
    PersistentFileConfig.prototype.save = function () {
        if (this.saveEnabled === false)
            return this;
        var str = JSON.stringify(this.data);
        var encrypted = this.cryptr.encrypt(str);
        fs_extra_1.writeFileSync(this.filePath, encrypted, { encoding: 'utf8' });
        if (true === true) {
            fs_extra_1.writeFileSync(this.filePath + '.debug.json', JSON.stringify(this.data, undefined, 2), { encoding: 'utf8' });
        }
        return this;
    };
    PersistentFileConfig.prototype.load = function () {
        if (!fs_extra_1.existsSync(this.filePath))
            return this;
        this.saveEnabled = false;
        this.data = this.defaultConfig;
        var str = fs_extra_1.readFileSync(this.filePath, 'utf8');
        var decrypted = this.cryptr.decrypt(str);
        var parsed = JSON.parse(decrypted);
        this.merge(parsed);
        this.saveEnabled = true;
        this.save();
        return this;
    };
    PersistentFileConfig.prototype.lock = function () {
        this.saveEnabled = false;
        return this;
    };
    PersistentFileConfig.prototype.unlock = function () {
        this.saveEnabled = true;
        return this;
    };
    PersistentFileConfig.prototype.isLocked = function () { return this.saveEnabled; };
    PersistentFileConfig.prototype.reset = function () {
        if (!fs_extra_1.existsSync(this.filePath))
            return this;
        fs_1.unlinkSync(this.filePath);
        return this;
    };
    PersistentFileConfig.prototype.backup = function (data, encrypt) {
        if (encrypt === void 0) { encrypt = true; }
        var totalFiles = globule.find(path_1.join(paths_1.paths.dbBackups, '*')).length;
        var prefix = encrypt ? '.nocrypt.' : '.crypt.';
        var filePath = path_1.join(paths_1.paths.dbBackups, totalFiles + prefix + moment().format('YYYY-MM-hh:mm:ss'));
        var str = JSON.stringify(this.data);
        var encrypted = this.cryptr.encrypt(str);
        if (encrypt) {
            fs_extra_1.writeFileSync(filePath + '.json', encrypted, { encoding: 'utf8' });
        }
        fs_extra_1.writeFileSync(filePath + '.json', JSON.stringify(this.data, undefined, 4), { encoding: 'utf8' });
        return filePath;
    };
    PersistentFileConfig.prototype.backupWithEncryption = function (filePath) {
        return this.backup(this.cryptr.encrypt(this.data), true);
    };
    PersistentFileConfig.prototype.backupWithoutEncryption = function (filePath) {
        return this.backup(JSON.stringify(_super.prototype.raw.call(this, ''), null, 4), false);
    };
    PersistentFileConfig.prototype.restore = function (filePath) {
        filePath.includes('.crypt');
        var content = fs_extra_1.readFileSync(path_1.isAbsolute(filePath) ? filePath : path_1.join(process.cwd(), filePath));
        this.data = JSON.parse(content.toString());
        this.save();
        this.load();
        return this;
    };
    PersistentFileConfig.prototype.getLocalBackupFiles = function () {
        var dir = fs_1.readdirSync(paths_1.paths.dbBackups);
        if (dir.length === 0)
            return [];
        return dir.map(function (d) { return d; });
    };
    PersistentFileConfig.prototype.loadEnv = function () {
        var _this = this;
        if (fs_extra_1.existsSync(paths_1.paths.env)) {
            var denv = dotenv.parse(fs_extra_1.readFileSync(paths_1.paths.env));
            Object.keys(denv).forEach(function (key) {
                var value = parseEnvVal(denv[key]);
                key = key.replace('_', '.');
                _this.set(key, value);
            });
        }
        Object.keys(process.env).forEach(function (key) {
            key = key.replace('_', '.');
            if (_this.has(key))
                _this.set(key, parseEnvVal(process.env[key]));
        });
        return this;
    };
    return PersistentFileConfig;
}(util_1.Config));
exports.PersistentFileConfig = PersistentFileConfig;
var _config = new PersistentFileConfig(defaultConfig);
_config.load();
var config = util_1.Config.makeProperty(_config);
exports.config = config;
console_1.container.bind('r.config.core').toConstantValue(_config);
console_1.container.bind('r.config').toConstantValue(config);
//# sourceMappingURL=config.js.map