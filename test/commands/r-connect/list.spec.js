"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
// application container is shared by all unit tests
var radical_console_1 = require("radical-console");
describe("Ninja", function () {
    beforeEach(function () {
        // create a snapshot so each unit test can modify
        // it without breaking other unit tests
        radical_console_1.container.snapshot();
        radical_console_1.container.get('cli')
            .helper('input')
            .helper('output');
    });
    afterEach(function () {
        // Restore to last snapshot so each unit test
        // takes a clean copy of the application container
        radical_console_1.container.restore();
    });
    // each test is executed with a snapshot of the container
    it("Ninja can fight", function () {
        var katanaMock = {
            hit: function () { return "hit with mock"; }
        };
        radical_console_1.container.unbind("Katana");
        radical_console_1.container.bind("Katana").toConstantValue(katanaMock);
        var ninja = radical_console_1.container.get("Ninja");
        chai_1.expect(ninja.fight()).eql("hit with mock");
    });
    it("Ninja can sneak", function () {
        var shurikenMock = {
            throw: function () { return "hit with mock"; }
        };
        radical_console_1.container.unbind("Shuriken");
        radical_console_1.container.bind("Shuriken").toConstantValue(shurikenMock);
        var ninja = radical_console_1.container.get("Shuriken");
        chai_1.expect(ninja.sneak()).eql("hit with mock");
    });
});
