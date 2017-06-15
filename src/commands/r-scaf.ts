import { OutputHelper, command, option, Config, inject, lazyInject, CommandArguments, InputHelper } from "@radic/console";
import { PKG } from "../lib/core/static";

@command('scaf', 'Project scaffolding', ['init', 'add', 'remove'])
export default class ScaffCmd {

    @inject('cli.helpers.output')
    out:OutputHelper;

    @inject('cli.helpers.input')
    in:InputHelper

    handle(args:CommandArguments){

    }
}
