
import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { provide } from "@radic/console";
import { Credential } from "../../database/Models/Credential";
import * as _ from "lodash";
import { AuthMethod } from "../methods";


export abstract class GitServer {
    creds: Credential
    client: AxiosInstance

    setCredentials(creds: Credential) {
        this.creds = creds;
        this.createClient();
    }

    protected abstract createClient(): AxiosInstance
}
@provide('r.api.github')
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