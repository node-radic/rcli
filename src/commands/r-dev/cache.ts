import { command, CommandArguments, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { BaseCommand ,Cache } from "../../";


@command(`cache`, {
    description: 'Cache manager'
})
export class DevCacheCmd extends BaseCommand {

    @lazyInject('r.cache')
    cache: Cache;

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('r.log')
    log: Log

    @option('d', 'dump cache to console')
    dump: boolean

    @option('D', 'dump raw cache to console')
    dumpRaw: boolean

    @option('g', 'get cache item and dump')
    get:string

    @option({ key: 's', description: 'set cache item', type: 'string', arguments: 2 })
    set: string[]

    @option('u', 'unset cache item')
    unset:string

    @option('c', 'clear cache')
    clear:boolean

    handle(args: CommandArguments) {
        if ( this.dump ) {
            return this.dumpVal(this.cache.get())
        }
        if ( this.dumpRaw ) {
            return this.dumpVal(this.cache.raw())
        }
        if(this.set){
            this.cache.set(this.set[0], JSON.parse(this.set[1]))
            return this.returnInfo(`Cache item [${this.set[0]}] set to`, JSON.parse(this.set[1]))
        }
        if(this.get){
            return this.dumpVal(this.cache.get(this.get));
        }
        if(this.clear){
            this.cache.reset();
            return this.returnInfo('Cache cleared');
        }
        if(this.unset){
            if(!this.cache.has(this.unset)){
                return this.returnError(`Cache item [${this.unset}] does not exist`)
            }
            this.cache.unset(this.unset)
            return this.returnInfo(`Cache item [${this.unset}] unset`)
        }
    }

    protected dumpVal(val:any){
        this.out.dump(val);
        return true;
    }

}
export default DevCacheCmd
