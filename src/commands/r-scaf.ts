import { command, CommandArguments, inject, InputHelper, OutputHelper } from "@radic/console";
import { Auth, AuthService } from "../";

@command('scaf', 'Project scaffolding', [ 'init', 'add', 'remove' ])
export default class ScaffCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    in: InputHelper

    @inject('r.auth')
    auth:Auth

    handle(args: CommandArguments) {

        let res = this.auth.get('robin','github');



        let a = 'a';

    }
}
