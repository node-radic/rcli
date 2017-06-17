import { OutputHelper, command, option, Config, inject, lazyInject, CommandArguments, InputHelper } from "@radic/console";

@command('init', 'Multi-type project initialisation')
export default class ScaffInitCmd {

    @inject('cli.helpers.output')
    out:OutputHelper;

    @inject('cli.helpers.input')
    in:InputHelper

    handle(args:CommandArguments){

    }
}
