import { command, CommandArguments, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { Cache } from "../../core/cache";


@command(`cache`, {
    description: 'Cache manager'
})
export class DevCacheCmd {

    @lazyInject('r.cache')
    cache: Cache;

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('r.log')
    log: Log

    @option('d', 'dump cache to console')
    dump: boolean

    @option('g', 'get cache item and dump')
    get:string

    @option({ key: 's', description: 'set cache item', type: 'string', arguments: 2 })
    set: string[]

    @option('c', 'clear cache')
    clear:boolean

    handle(args: CommandArguments) {
        if ( this.dump ) {
            return this.handleDump();
        }
        if(this.set){
            this.cache.set(this.set[0], this.set[1]);
            return true;
        }
        if(this.clear){
            this.cache.reset();
            return true
        }
        if(this.get){
            this.out.dump({get: this.get})
            this.out.dump(this.cache.get(this.get));
            return true;
        }
    }

    protected handleDump() {
        let cache = this.cache;
        let get   = cache.get('');
        let data  = cache[ 'data' ]
        let raw   = cache.raw()
        this.out.dump({ get, data, raw })
        return true;
    }
}
export default DevCacheCmd
