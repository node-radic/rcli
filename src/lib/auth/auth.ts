import { lazyInject, Log, singleton } from "@radic/console";
import { AuthMethod } from "./methods";
import { DB } from "..";

export enum AuthServices {
    bitbucket = 'bitbucket',
    github    = 'github',
    jira      = 'jira'
}

export type AuthService = AuthServices.github | AuthServices.bitbucket | AuthServices.jira



interface Credentials {
    username?: string
    password?: string
    key?: string
    id?: string

    token?: string
    secret?: string


}
@singleton('r.auth')
export class Auth {

    @lazyInject('r.db')
    db: DB

    @lazyInject('cli.log')
    log: Log;


    public getTable() {
        return this.db.getCollection('auth') || this.db.addCollection('auth')
    }

    public create(name: string, service: AuthService, method: AuthMethod, credentials: Credentials) {

        if ( this.exists(name, service) ) {
            return false
        }

        let data = {
            name,
            service,
            [AuthMethod.getKeyName(method)]   : credentials[ AuthMethod.getKeyName(method) ],
            [AuthMethod.getSecretName(method)]: credentials[ AuthMethod.getSecretName(method) ]
        }
        this.getTable().insert(data)
    }

    public get(name: string, service: AuthService) {
        if ( this.exists(name, service) === false ) {
            this.log.error('Does not exist');
            return;
        }
        return this.getTable().find({ name, service })
    }


    protected exists(name: string, service: AuthService): boolean {
        return ! ! this.getTable().find({ name, service })
    }


}