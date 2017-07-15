import { PersistentFileConfig } from "./config";
import { paths } from "./paths";
import { container } from "@radic/console";
import { IConfig } from "@radic/util";
// const cache = new PersistentFileConfig({}, paths.userCache, true, true, false);
//
// container.constant<PersistentFileConfig>('r.cache', cache);

export interface ICache extends IConfig {
    set(prop: string, value: any, expires?: number)
}

export class Cache extends PersistentFileConfig implements ICache {
    expires: number = 60000 * 1000;

    constructor() {
        super({}, paths.userCache, true, true, false);
    }

    set(prop: string, value: any, expires?: number): ICache {
        expires       = expires || this.expires;
        let meta: any = { expires: 0 }
        if ( expires !== 0 ) {
            meta = { expires, expires_at: Date.now() + expires }
        }
        super.set(prop + '.data', value);
        super.set(prop + '.meta', meta);
        return this;
    }


    get<T extends any>(prop?: any, defaultReturnValue?: any): T {
        if ( ! prop ) {
            return super.get<T>();
        }
        if ( ! this.has(prop) ) {
            return defaultReturnValue;
        }
        return super.get<T>(prop + '.data', defaultReturnValue);
    }


    has(prop?: any): boolean {
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


}

const cache = new Cache();
container.constant('r.cache', cache);