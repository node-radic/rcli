import { AbstractService } from "./AbstractService";
import { Credential } from "../database/Models/Credential";
import { AxiosRequestConfig } from "axios";
import { service } from "../decorators";
import { AuthMethod } from "./AuthMethod";
import { get } from "lodash";
import { IService, ServiceExtraFields } from "../interfaces";

export interface GitServiceExtraFields extends ServiceExtraFields {

}
export interface IGitService extends IService<GitServiceExtraFields> {
    user: GitServiceUser
    createRepository(name: string, owner?: string, priv?: boolean): Promise<boolean>
    listRepositories(owner?: string): Promise<string[]>
    getUserGroups(owner?: string): Promise<string[]>
    deleteRepository(name: string, owner?: string): Promise<boolean>
}
export interface GitServiceUser {
    username?: string
    email?: string
    name?: string
    avatar?: string
    groups?: string[]
    raw?: any
}
export abstract class AbstractGitService extends AbstractService<GitServiceExtraFields> {
    user: GitServiceUser
    protected userDataConversion: Dictionary<string> = {}

    protected convertUserData(userData: any): GitServiceUser {
        let user: GitServiceUser = {}
        Object.keys(this.userDataConversion).forEach(key => user[ key ] = get(userData, this.userDataConversion[ key ]))
        user.raw = userData;
        return user;
    }

    async setCredentials(creds: Credential): Promise<this> {
        await super.setCredentials(creds);
        this.enableCache();
        this.user = await this.getCurrentUser()
        return Promise.resolve(this);
    }

    abstract getCurrentUser(): Promise<GitServiceUser>
}

@service({
    name   : 'github',
    methods: [ AuthMethod.token, AuthMethod.basic ],
    extra  : {}
})
export class GithubService extends AbstractGitService implements IGitService {
    userDataConversion = { username: 'login', avatar: 'avatar_url', name: 'name', email: 'email' }

    async getCurrentUser() {
        if ( this.user ) {
            return Promise.resolve(this.user)
        }
        let rawUser      = await this.get('/user');
        this.user        = this.convertUserData(rawUser.data)
        this.user.groups = await this.getUserGroups()
        return Promise.resolve(this.user)
    }

    configure(options: AxiosRequestConfig = {}) {
        options    = {
            timeout        : 5000,
            ...options,
            baseURL        : 'https://api.github.com',
            withCredentials: true,
            headers        : {
                'Accept': 'application/vnd.github.v3+json'

            }
        }
        let method = this.credentials.method

        if ( AuthMethod.basic.equals(method) ) {
            options.auth = {
                username: this.credentials.key,
                password: this.credentials.secret
            }
        } else if ( AuthMethod.token.equals(method) ) {
            options.headers[ 'Authorization' ] = 'token ' + this.credentials.secret
        }

        return options
    }

    async getUserGroups(user?: string): Promise<string[]> {
        let groups = await this.get(`/users/${user || this.user.username}/orgs`)
        return Promise.resolve(groups.data.map(group => group.login))
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

    async getRepository(owner: string, name: string): Promise<any> {
        return;
    }

    async deleteRepository(name: string, owner: string): Promise<boolean> {
        let res = await this.delete(`/repos/${owner}/${name}`)
        return Promise.resolve(res.status === 204)
    }

    async createRepository(name: string, owner?: string, priv: boolean = false) {
        let user = await this.getCurrentUser();
        let res
        if ( ! owner || owner.toLowerCase() === user.username.toLowerCase() ) {
            res = await this.post(`/user/repos`, {
                name,
                'private': priv
            })
        }
        else {
            res = await this.post(`/orgs/${owner}/repos`, {
                'name'   : owner + '/' + name,
                'private': priv
            })
        }
        return res;
    }
}

@service({
    name   : 'bitbucket',
    methods: [ AuthMethod.basic ],
    extra  : {}
})
export class BitbucketService extends AbstractGitService implements IGitService {
    userDataConversion = { username: 'username', avatar: 'links.avatar.href', name: 'display_name', email: 'email' }

    async getCurrentUser() {
        if ( this.user ) {
            return Promise.resolve(this.user);
        }
        let rawUser      = await this.get('/user');
        this.user        = this.convertUserData(rawUser.data);
        this.user.groups = await this.getUserGroups()
        return Promise.resolve(this.user)
    }


    configure(options: AxiosRequestConfig = {}) {
        options    = {
            timeout        : 5000,
            ...options,
            baseURL        : 'https://api.bitbucket.org/2.0',
            withCredentials: true,
            headers        : {
                // 'Accept': 'application/vnd.github.v3+json'

            }
        }
        let method = this.credentials.method

        if ( AuthMethod.basic.equals(method) ) {
            options.auth = {
                username: this.credentials.key,
                password: this.credentials.secret
            }
        } else if ( AuthMethod.token.equals(method) ) {
            options.headers[ 'Authorization' ] = 'token ' + this.credentials.secret
        }

        return options
    }


    async getUserGroups(user?: string): Promise<string[]> {
        if ( user === undefined || user === this.user.username ) user = ''
        let groups = await this.get(`/teams/${user}`, { params: { role: 'member' }})
        return Promise.resolve(groups.data.values.map(group => group.username))
    }

    public createRepository(name: string, owner?: string, priv?: boolean): Promise<boolean> {
        return undefined;
    }

    async listRepositories(owner?: string): Promise<string[]> {
        let getRepos = async (owner:string): Promise<string[]> => {
            let res = await this.get(`/repositories/${owner}`, {
                params: { pagelen: 100, role: 'member' }
            });
            return Promise.resolve(res.data.values.map(val => val.full_name))
        }
        if(!owner){
            let promises: Promise<string[]> [] = [getRepos(this.user.username)];
            this.user.groups.forEach(group => promises.push(getRepos(group)))
            let groups = await Promise.all(promises);
            let repos:string[] = []
            groups.forEach(group => repos = repos.concat(group));
            return Promise.resolve(repos);
        }
        return getRepos(owner);
    }

    public deleteRepository(name: string, owner?: string): Promise<boolean> {
        return undefined;
    }
}