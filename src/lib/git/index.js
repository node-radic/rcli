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
var axios_1 = require("axios");
var _ = require("lodash");
var methods_1 = require("../../services/methods");
var AbstractGitRestClient = (function () {
    function AbstractGitRestClient() {
        this.client = this.createClient();
    }
    AbstractGitRestClient.prototype.init = function () {
    };
    AbstractGitRestClient.prototype.createClient = function (config) {
        if (config === void 0) { config = {}; }
        config = _.merge({
            baseUrl: '',
            timeout: 1000,
            headers: {}
        }, config);
        return axios_1.default.create(config);
    };
    AbstractGitRestClient.prototype.configure = function (config) {
        this.config = _.merge(this.config, config);
        this.client = this.createClient(this.config);
    };
    AbstractGitRestClient.prototype.setAuth = function (method, loginId, loginAuth) {
        switch (method) {
            case methods_1.AuthMethod.basic:
                this.configure({ auth: { username: loginId, password: loginAuth } });
                break;
            case methods_1.AuthMethod.oauth2:
        }
    };
    return AbstractGitRestClient;
}());
exports.AbstractGitRestClient = AbstractGitRestClient;
var GithubRestClient = (function (_super) {
    __extends(GithubRestClient, _super);
    function GithubRestClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GithubRestClient.prototype.getAuthMethods = function () {
        return [methods_1.AuthMethod.basic, methods_1.AuthMethod.token];
    };
    return GithubRestClient;
}(AbstractGitRestClient));
exports.GithubRestClient = GithubRestClient;
var Rest = (function () {
    function Rest() {
    }
    return Rest;
}());
exports.Rest = Rest;
//# sourceMappingURL=index.js.map