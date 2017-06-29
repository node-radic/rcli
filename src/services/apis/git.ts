import Axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";
import { injectable, provide } from "@radic/console";
import { Credential } from "../../database/Models/Credential";
import * as _ from "lodash";
import { AuthMethod } from "../AuthMethod";

@injectable()
export abstract class GitServer {
    creds: Credential
    protected client: AxiosInstance



    setCredentials(creds: Credential): this {
        this.creds = creds;
        this.setOptions()
        return this
    }

    abstract setOptions(options?: AxiosRequestConfig)

    request(config: AxiosRequestConfig): AxiosPromise { return this.client.request(config); }

    get(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.client.get(url, config) }

    delete(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.client.delete(url, config) }

    head(url: string, config?: AxiosRequestConfig): AxiosPromise { return this.client.head(url, config) }

    post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.client.post(url, data, config) }

    put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.client.put(url, data, config) }

    patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise { return this.client.patch(url, data, config) }

}

@provide('r.api.github')
export class GitHubServer extends GitServer {

    setOptions(options: AxiosRequestConfig = {}) {
        let method                     = this.creds.method
        let config: AxiosRequestConfig = {
            baseURL: 'https://api.github.com',
            timeout: 5000,
            withCredentials: true,
            headers: {
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

    async listRepositories(user:string) : Promise<string[]> {
        //  /user/repos
        // /users/:username/repos
        // /users/:org/repos

        let all = [];
        let resolved = 0;

        this.get('/user/repos', {
            params: { type: 'all', per_page: 500 }
        }).then((repos: any) => {
            all = all.concat(repos.data.map(repo => repo.full_name));
            resolved++;
        })

        this.get(`/users/${user}/repos`, {
            params: { type: 'all', per_page: 500 }
        }).then(repos => {
            all = all.concat(repos.data.map(repo => repo.full_name));
            resolved++;
        })

        return <any> new Promise((resolve, reject) =>{
            let id = setInterval(() => {
                if(resolved === 2){
                    clearInterval(id);
                    resolve(all)
                }
            }, 20)
        })
    }

    getRepository(owner:string, name:string){

    }

    createRepository(owner:string, name:string, priv:boolean=false){

    }
}