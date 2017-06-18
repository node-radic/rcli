import { command, CommandArguments, inject, InputHelper, OutputHelper } from "@radic/console";
import { Auth, AuthService } from "../";
import { Database } from "../lib/database/Database";

@command('scaf', 'Project scaffolding')
export default class ScaffCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    in: InputHelper

    @inject('r.auth')
    auth:Auth

    handle(args: CommandArguments) {



    }
}
