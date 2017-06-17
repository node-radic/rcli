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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var _ = require("lodash");
var methods_1 = require("../auth/methods");
var console_1 = require("@radic/console");
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
var GitServer = (function () {
    function GitServer() {
    }
    GitServer.prototype.setCredentials = function (creds) {
        this.creds = creds;
        this.createClient();
    };
    return GitServer;
}());
exports.GitServer = GitServer;
var GitHubServer = (function (_super) {
    __extends(GitHubServer, _super);
    function GitHubServer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GitHubServer.prototype.createClient = function () {
        var method = this.creds.method;
        var config = _.merge({
            baseUrl: 'https://api.github.com',
            timeout: 1000,
            withCredentials: true,
            headers: {
                common: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        });
        if (method === methods_1.AuthMethod.basic.toString()) {
            config.auth.username = this.creds.key;
            config.auth.password = this.creds.secret;
        }
        else if (method === methods_1.AuthMethod.token.toString()) {
            config.headers.common['Authorization'] = 'token ' + this.creds.secret;
        }
        return axios_1.default.create(config);
    };
    return GitHubServer;
}(GitServer));
GitHubServer = __decorate([
    console_1.provide('services.github')
], GitHubServer);
exports.GitHubServer = GitHubServer;
//# sourceMappingURL=index.js.map