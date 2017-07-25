import Axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { container, injectable, lazyInject, Log } from "@radic/console";
import { Credential } from "../database/Models/Credential";
import { IService, ServiceConfig, ServiceExtraFields } from "../interfaces";
import { MD5 } from "crypto-js";
import { Cache } from "../core/cache";
import { MINUTE } from "../core/static";
@injectable()
export abstract class AbstractService<T extends ServiceExtraFields=ServiceExtraFields> implements IService<T> {

    @lazyInject('r.log')
    protected log: Log

    private _credentials: Credential<T>
    private _client: AxiosInstance

    @lazyInject('r.cache')
    protected _cache: Cache
    // private cacheRequestInterceptorId: number  = null
    private cacheResponseInterceptorId: number = null

    public service: ServiceConfig<T>


    public get credentials(): Credential<T> { return this._credentials; }

    public get client(): AxiosInstance { return this._client; }

    public get cache(): Cache { return this._cache; }

    abstract configure(options?: AxiosRequestConfig): AxiosRequestConfig

    async setCredentials(creds: Credential<T>): Promise<this> {
        this._cache.expires = MINUTE * 10;
        this._credentials = creds;
        this._client      = Axios.create(this.configure({
            timeout: 5000
        }));
        return Promise.resolve(this);
    }

    enableCache(): this {
        if ( this.isCacheEnabled() ) {
            return this;
        }
        this.cacheResponseInterceptorId = this._client.interceptors.response.use((res) => {
            if ( res.config.method.toLowerCase() === 'get' ) {
                this._cache.set(this.getCacheKey(res.config.url, res.config.params), {
                    status: res.status,
                    statusText: res.statusText,
                    data: res.data,
                });
            }
            return res;
        }, this.handleInterceptorError)
        return this;
    }

    disableCache(): this {
        if ( ! this.isCacheEnabled() ) {
            return this;
        }
        // this._client.interceptors.request.eject(this.cacheRequestInterceptorId);
        this._client.interceptors.response.eject(this.cacheResponseInterceptorId);
        this.cacheResponseInterceptorId = null
        return this;
    }

    isCacheEnabled() {
        return this.cacheResponseInterceptorId !== null
    }

    protected getCacheKey(url: string, params?: any): string {
        let key = `service.${this.service.name}.${url.replace(/\./g, '__')}`
        if ( params ) {
            key += '?' + this.getParamsHash(params);
        }
        return key
    }

    protected getParamsHash(params: { [key: string]: any }): string {
        if ( params === undefined ) return '';
        let objectText = Object.keys(params).map(key => {
            let val = params[ key ];
            if ( typeof val === 'undefined' ) {
                throw new Error('as this is on key ' + key)
            }
            return key + val.toString()
        }).join('');
        return MD5(objectText, 'params')
    }

    //
    protected handleCatchedError(error: any) {
        let log: Log = container.get<Log>('cli.log')

        if ( error.response ) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            log.error('Server responded with a status code outside of range 2xx', { status: error.response.status, headers: error.response.headers, data: error.response.data });
        } else if ( error.request ) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            log.error('The request was made but no response was received')
        } else {
            // Something happened in setting up the request that triggered an Error
            log.error('Something happened in setting up the request that triggered an Error: ' + error.message);
        }
        log.error('Config', error.config);

        process.exit(1)
        // console.dir({ response: reason.response }, {depth: 6, colors: true});
    }

    protected handleInterceptorError(error) {
        return Promise.reject(error);
    }

    request(config: AxiosRequestConfig): AxiosPromise {
        if ( this.isCacheEnabled() && config.method.toLowerCase() === 'get' ) {
            let key = this.getCacheKey((config.baseURL || this.client.defaults.baseURL) + config.url, config.params);
            if ( this._cache.has(key) ) {
                return Promise.resolve(this._cache.get<AxiosResponse>(key, {}))
            }
        }
        return this._client.request(config).then((res: AxiosResponse) => Promise.resolve(res)).catch(this.handleCatchedError);
    }

    protected options(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'OPTIONS', url, ...config }) }

    protected get(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'GET', url, ...config }) }

    protected delete(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'DELETE', url, ...config }) }

    protected head(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'HEAD', url, ...config }) }

    protected post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'POST', url, data, ...config }) }

    protected put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'PUT', url, data, ...config }) }

    protected patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.request({ method: 'PATCH', url, data, ...config }) }

}