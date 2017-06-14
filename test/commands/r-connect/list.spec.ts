import { Output } from "gulp-typescript/release/output";
let consol = require('@radic/console')
let lib    = require('../../src')
import { RcliConnectListCmd ,startTestingBootstrap  } from "../../support"
import { container } from "@radic/console";
import { SshBashHelper } from "../../../src";
let out:Output = container.get('cli.output')
let in:Output = container.get('cli.input')

describe('r connect', () => {

    beforeEach(done => {
        let ssh = container.get<SshBashHelper>('cli.output.ssh')
        ssh.runCleaner()
        ssh.runSeeder()
        startTestingBootstrap({
            helpers: ['output', 'input']
        })
    })

    describe('list', () => {
        let list = container.resolve(RcliConnectListCmd);
        it('should be an istance', () => {
            expect(list).toBeDefined();
        })
    })

})