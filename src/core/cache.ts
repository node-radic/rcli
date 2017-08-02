import { PersistentFileConfig } from "./config";
import { paths } from "./paths";
import { container, lazyInject } from "radical-console";
import { IConfig, kindOf } from "@radic/util";
import { DAY } from "./static";
// const cache = new PersistentFileConfig({}, paths.userCache, true, true, false);
//
// container.constant<PersistentFileConfig>('r.cache', cache);

export interface ICache extends IConfig {
    set(prop: string, value: any, expires?: number)
}

export class Cache extends PersistentFileConfig implements ICache {
    expires: number = DAY

    @lazyInject('r.config')
    config: IConfig;

    constructor() {
        super({}, paths.userCache, true, true, false);
        this.saveEnabled = true;
    }

    protected isDebug(): boolean {
        return this.config.get('debug', false) === true
    }

    set(prop: string, value: any, expires?: number): ICache {
        expires = expires || this.expires;
        let meta: any = { expires: 0 }
        if ( expires !== 0 ) {
            meta = { expires, expires_at: Date.now() + expires }
        }
        super.set(prop + '.data', value);
        super.set(prop + '.meta', meta);
        return this;
    }


    get<T extends any>(prop?: any, defaultReturnValue?: ((res: any, rej: any) => Promise<T> | T) | any, expires?: number): T {
        if ( ! prop || prop.toString().length === 0 ) {
            return super.get<T>();
        }
        if ( ! this.has(prop) && kindOf(defaultReturnValue) === 'function' ) {
            let value   = defaultReturnValue.apply(this);
            if(kindOf(value['then']) === 'function'){
                value = (async() => await value)();
            }
            // console.log('value',  value )
            //
            // let value = (async () => await (new Promise((res, rej) => {
            //     let resolve = (val: any) => {
            //         console.log('resolve', { val });
            //         res(val);
            //     }
            //     let value   = defaultReturnValue.apply(this, [ resolve, rej ]);
            //     if ( value !== undefined ) {
            //         console.log('value not underinfed', { value })
            //         res(value);
            //     }
            // })))()
            this.set(prop, value, expires || this.expires);
        }
        return super.get<T>(prop + '.data', defaultReturnValue);
    }


    has(prop?: any): boolean {
        if ( prop.toString().endsWith('.meta') || prop.toString().endsWith('.data') ) {
            return super.has(prop);
        }
        if ( ! super.has(prop + '.meta') ) {
            return false;
        }
        let meta: any = super.get(prop + '.meta');
        if ( meta.expires === 0 ) {
            return true;
        }
        if ( meta.expires && meta.expires_at && Date.now() > meta.expires_at ) {
            return false;
        }
        return true;
    }


    save(): this {
        return super.save();
    }


    load(): this {
        return super.load();
    }
}

const cache = new Cache();
container.constant('r.cache', cache);