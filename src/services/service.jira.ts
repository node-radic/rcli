import { AbstractService } from "./AbstractService";
import { AxiosRequestConfig } from "axios";
import { service } from "../decorators";
import { AuthMethod } from "./AuthMethod";
import { ServiceExtraFields } from "../interfaces";

export interface JiraServiceExtraFields extends ServiceExtraFields {
    url?: string
    version?: string
}

namespace data {
    export type AvatarDimension = '48x48' | '32x32' | '24x24' | '16x16'
    export interface AvatarUrls { '48x48': string, '32x32': string, '24x24': string, '16x16': string }

    export interface IssueType {
        self: string
        id: string
        description: string
        iconUrl: string
        name: string
        subtask: boolean
        avatarId: number
    }
    export interface User { self: string, key: string,accountId: string,name: string,avatarUrls: AvatarUrls,displayName: string,active: boolean }
    export interface Project {
        self: string
        expand: string
        id: string
        key: string
        name: string
        projectTypeKey: string
        avatarUrls: AvatarUrls
        projectCategory: { self: string, id: string, name: string, description: string }
        projectKeys?: string[]
        issueTypes?: IssueType[]
        lead?: User
        description?: string
    }
}
export { data as jiraData }

@service({
    name   : 'jira',
    methods: [ AuthMethod.oauth, AuthMethod.basic ],
    extra  : {
        url    : 'string',
        version: 'string'
    }
})
export class JiraService extends AbstractService<JiraServiceExtraFields> {
    public configure(options?: AxiosRequestConfig): AxiosRequestConfig {
        options = {
            timeout: 5000,
            ...options,
            baseURL: this.credentials.extra.url + '/rest/api/' + this.credentials.extra.version,
            // withCredentials: false,
            headers: {
                'Content-Type': 'application/json'
            }
        }

        let method = this.credentials.method
        if ( AuthMethod.basic.equals(method) ) {
            options.auth = {
                username: this.credentials.key,
                password: this.credentials.secret
            }
            // options.headers['Authorization'] = 'Basic ' + new Buffer(this.credentials.key + ':' + this.credentials.secret).toString('base64')
        } else if ( AuthMethod.oauth.equals(method) ) {

        }
        this.disableCache();

        return options;
    }


    protected handleCatchedError(error: any): any {
        console.dir(error, {colors: true, depth: 10})
        process.exit(1)
        // return super.handleCatchedError(error);
    }

    async listProjects(): Promise<data.Project[]> {
        return this.get('/project', {
            params: { expand: 'description,lead,issueTypes,url,projectKeys' }
        }).then(res => Promise.resolve(res.data))
    }
}