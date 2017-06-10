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
var util_1 = require("@radic/util");
var Cryptr = require("cryptr");
var fs_extra_1 = require("fs-extra");
var dotenv = require("dotenv");
var keys_1 = require("./keys");
var paths_1 = require("./paths");
var fs_1 = require("fs");
var console_1 = require("@radic/console");
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
            port: 41333
        },
        client: {
            port: 41334
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
        _this.saveEnabled = true;
        _this.cryptr = new Cryptr((new keys_1.Keys())._public);
        _this.defaultConfig = obj;
        _this.load();
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
        if (!this.saveEnabled)
            return this;
        var str = JSON.stringify(this.data);
        var encrypted = this.cryptr.encrypt(str);
        fs_extra_1.writeFileSync(paths_1.paths.userDataConfig, encrypted, { encoding: 'utf8' });
        if (true === true) {
            fs_extra_1.writeFileSync(paths_1.paths.userDataConfig + '.debug.json', JSON.stringify(this.data, undefined, 2), { encoding: 'utf8' });
        }
        return this;
    };
    PersistentFileConfig.prototype.load = function () {
        if (!fs_extra_1.existsSync(paths_1.paths.userDataConfig))
            return this;
        this.saveEnabled = false;
        this.data = this.defaultConfig;
        var str = fs_extra_1.readFileSync(paths_1.paths.userDataConfig, 'utf8');
        var decrypted = this.cryptr.decrypt(str);
        var parsed = JSON.parse(decrypted);
        this.merge(parsed);
        this.loadEnv();
        this.saveEnabled = true;
        return this;
    };
    PersistentFileConfig.prototype.reset = function () {
        if (!fs_extra_1.existsSync(paths_1.paths.userDataConfig))
            return this;
        fs_1.unlinkSync(paths_1.paths.userDataConfig);
        return this;
    };
    PersistentFileConfig.prototype.loadEnv = function () {
        var _this = this;
        if (fs_extra_1.existsSync(paths_1.paths.env)) {
            var denv = dotenv.parse(fs_extra_1.readFileSync(paths_1.paths.env));
            Object.keys(denv).forEach(function (key) {
                var value = parseEnvVal(denv[key]);
                key = key.replace('_', '.');
                if (_this.has(key))
                    _this.set(key, value);
            });
        }
        return this;
    };
    return PersistentFileConfig;
}(util_1.Config));
exports.PersistentFileConfig = PersistentFileConfig;
var _config = new PersistentFileConfig(defaultConfig);
exports.config = util_1.Config.makeProperty(_config);
console_1.container.constant('r.config', exports.config);
//# sourceMappingURL=config.js.map