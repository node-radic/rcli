import Axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";
import { inject, injectable, lazyInject, Log, provide,container } from "@radic/console";
import { Credential } from "../../database/Models/Credential";
import * as _ from "lodash";
import { AuthMethod } from "../AuthMethod";
import * as flatCache from 'flat-cache';


@injectable()
export abstract class GitServer {
    creds: Credential
    cache:FlatCache
    protected client: AxiosInstance


    user: { username?: string, email?: string, name?: string, avatar?: string, raw?:any }
    userDataConversion = { username: 'login', avatar: 'avatar_url', name: 'name', email: 'email' }


    setCredentials(creds: Credential): this {
        this.creds = creds;
        this.setOptions()
        this.cache = flatCache.load('git-server-' + creds.id)
        this.cache.save(true);
        let user = this.cache.getKey('user')
        if(user){
            this.user = user;
        } else {
            this.getCurrentUser().then(user => {
                this.cache.setKey('user', user);
                this.cache.save();
            })
        }
        return this
    }

    abstract setOptions(options?: AxiosRequestConfig)
    abstract getCurrentUser();

    //
    handleCatchedError(reason: any) {
        let log:Log = container.get<Log>('cli.log')
        log.error(reason.response.data.message );
        if(reason.response.data.errors) {
            reason.response.data.errors.forEach(err => {
                log.error('- ', err.message)
            })
        }
        log.debug(reason.response.data.message,{ response: reason.response }, {depth: 6, colors: true});
        process.exit(1)
        // console.dir({ response: reason.response }, {depth: 6, colors: true});
    }

    request(config: AxiosRequestConfig): AxiosPromise {
        return this.client.request(config).catch(this.handleCatchedError); }

    get(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.client.get(url, config).catch(this.handleCatchedError) }

    delete(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.client.delete(url, config).catch(this.handleCatchedError) }

    head(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.client.head(url, config).catch(this.handleCatchedError) }

    post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.client.post(url, data, config).catch(this.handleCatchedError) }

    put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.client.put(url, data, config).catch(this.handleCatchedError) }

    patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.client.patch(url, data, config).catch(this.handleCatchedError) }

}

@provide('r.api.github')
export class GitHubServer extends GitServer {

    setOptions(options: AxiosRequestConfig = {}) {
        let method                     = this.creds.method
        let config: AxiosRequestConfig = {
            baseURL        : 'https://api.github.com',
            timeout        : 5000,
            withCredentials: true,
            headers        : {
                'Accept': 'application/vnd.github.v3+json'

            }
        }
        if ( method === AuthMethod.basic.toString() ) {
            config.auth.username = this.creds.key
            config.auth.password = this.creds.secret;
        } else if ( method === AuthMethod.token.toString() ) {
            config.headers[ 'Authorization' ] = 'token ' + this.creds.secret
        }

        _.merge(config, options);
        this.client = Axios.create(config);
    }

    async getCurrentUser() {
        let user  = await this.get('/user');
        user = user.data;
        this.user = {}
        Object.keys(this.userDataConversion).forEach(key => {
            let val          = this.userDataConversion[ key ]
            this.user[ key ] = _.get(user, val);
        })
        this.user.raw = user;
        return Promise.resolve(this.user)
    }

    async listRepositories(user: string): Promise<string[]> {
        //  /user/repos
        // /users/:username/repos
        // /users/:org/repos

        let all      = [];
        let resolved = 0;

        this.get('/user/repos', {
            params: { type: 'all', per_page: 500 }
        }).then((repos: any) => {
            all = all.concat(repos.data.map(repo => repo.full_name));
            resolved ++;
        })

        this.get(`/users/${user}/repos`, {
            params: { type: 'all', per_page: 500 }
        }).then(repos => {
            all = all.concat(repos.data.map(repo => repo.full_name));
            resolved ++;
        })

        return <any> new Promise((resolve, reject) => {
            let id = setInterval(() => {
                if ( resolved === 2 ) {
                    clearInterval(id);
                    resolve(all)
                }
            }, 20)
        })
    }


    getRepository(owner: string, name: string) {

    }

    async deleteRepository(name:string, owner:string){
        let res = await this.delete(`/repos/${owner}/${name}`)
        return res.status === 204;
    }

    async createRepository(name: string, owner?: string, priv: boolean = false) {
        let user = await this.getCurrentUser();
        let res
        if ( ! owner || owner.toLowerCase() === user.username.toLowerCase()) {
            res = await this.post(`/user/repos`, {
                name,
                'private': priv
            })
        }
        else
        {
            res = await this.post(`/orgs/${owner}/repos`, {
                'name'   : owner + '/' + name,
                'private': priv
            })
        }
        return res;
    }

}