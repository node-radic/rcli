import { Output ,command, option ,Config,inject, lazyInject } from "../../src";

@command('config [path] [value]')
export class ConfigCmd {
    @inject('r.config')
    config: Config

    @lazyInject('cli.helpers.output')
    protected out: Output;


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