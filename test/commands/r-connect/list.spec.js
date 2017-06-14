"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var console_1 = require("@radic/console");
var bootstap_1 = require("../../support/bootstap");
var list_1 = require("../../../src/commands/r-connect/list");
describe('r connect', function () {
    beforeEach(function (done) {
        var ssh = console_1.container.get('cli.output.ssh');
        ssh.runCleaner();
        ssh.runSeeder();
        bootstap_1.startTestingBootstrap({
            helpers: ['cli.log', 'r.config', 'cli.output']
        });
    });
    describe('list', function () {
        var list = new list_1.RcliConnectListCmd();
        it('should be an istance', function () {
            expect(list).toBeDefined();
        });
    });
});
