import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as _ from "lodash";
import { AuthMethod } from "../../services";
import { services } from "../../services/static";
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