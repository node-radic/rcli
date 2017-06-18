import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as _ from "lodash";
import { AuthMethod } from "../auth/methods";
import { services } from "../core/static";
import { provide } from "@radic/console";

export abstract class AbstractGitRestClient {
    protected client: AxiosInstance;
    private config: AxiosRequestConfig;

    constructor() {
        this.client = this.createClient();
    }

    protected init() {

    }

    protected createClient(config: AxiosRequestConfig = {}): AxiosInstance {
        config = _.merge({
            baseUrl: '',
            timeout: 1000,
            headers: {}
        }, config)
        return Axios.create(config);
    }

    protected configure(config: AxiosRequestConfig) {
        this.config = _.merge(this.config, config)
        this.client = this.createClient(this.config);
    }

    abstract getAuthMethods(): Array<AuthMethod>

    setAuth(method: AuthMethod, loginId: string, loginAuth?: string) {
        switch ( method ) {
            case AuthMethod.basic:
                this.configure({ auth: { username: loginId, password: loginAuth } });
                break;
            case AuthMethod.oauth2:

        }
    }
}

export class GithubRestClient extends AbstractGitRestClient {
    getAuthMethods(): Array<AuthMethod> {
        return [ AuthMethod.basic, AuthMethod.token ];
    }

}


export class Rest {

}

export abstract class GitServer {
    creds: Credential
    client: AxiosInstance

    setCredentials(creds: Credential) {
        this.creds = creds;
        this.createClient();
    }

    protected abstract createClient(): AxiosInstance
}
@provide('services.github')
export class GitHubServer extends GitServer {
    protected createClient(): AxiosInstance {
        let method = this.creds.method
        let config:AxiosRequestConfig = _.merge({
            baseUrl: 'https://api.github.com',
            timeout: 1000,
            withCredentials: true,
            headers: {
                common: {
                    'Accept': 'application/vnd.github.v3+json'

                }
            }
        })
        if(method === AuthMethod.basic.toString()){
            config.auth.username = this.creds.key
            config.auth.password = this.creds.secret;
        } else if(method === AuthMethod.token.toString()){
            config.headers.common['Authorization'] = 'token ' + this.creds.secret
        }

        return Axios.create(config);
    }
}