import { OutputHelper ,command, option ,Config,inject, lazyInject } from "@radic/console";

@command('git')
export class GitCmd {
    @inject('r.config')
    config: Config

    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;


    @option('l', 'list configuration, or part of it')
    list: boolean

    @option('d', 'delete configuration on [path] ')
    delete: boolean

    handle(args: { [name: string]: any }) {
        let path, value, list, del;
        if ( args[ 'path' ] ) path = args[ 'path' ]
        if ( args[ 'value' ] ) value = args[ 'value' ]
        list = this.list;
        del  = this.delete;
        this.out.dump({path, value, list, del})

    }
}
export default GitCmd