import { lazyInject, singleton } from "@radic/console";
import { AuthMethod } from "../../services/methods";
import { BaseAuthMethod, LoginCredential } from "../../interfaces";
import { Database } from "../../database/Database";
import { User } from "../../database/Models/User";
import { RConfig } from "../../core/config";
import { Credential } from "../../database/Models/Credential";


@singleton('r.auth')
export class Auth {

    @lazyInject('r.config')
    config: RConfig;

    @lazyInject('r.db')
    db: Database

    ready: boolean = false;

    public async user(): Promise<User> {
        return await User.query()
            .eager('credentials')
            .where('logged_in', true)
            .first()
    }

    constructor() {

    }


    async exists(name: string) {
        let count = await User.query().where('name', name).first()
        return ! ! count
    }

    async register(name: string, password: string) {
        return User.query().insertAndFetch({ name, password })

    }

    unregister(name: string, password: string) {
        // return this.db.unsetBy<User>('users', 'name', name).name === name
    }

    async isLoggedIn() {
        let result = await this.user();

        return ! ! result;
    }

    async logout() {
        if ( ! await this.isLoggedIn()  ) {
            return false;
        }
        const user = await this.user();
        await user.$query().patch({ logged_in: false })
        return true;
    }

    async login(name, password) {
        if ( await this.isLoggedIn() ) {
            return false;
        }

        const user: User = await User.query().where('name', name).andWhere('password', password).first()

        if ( user ) {
            await User.query().patch({ logged_in: false })
            await user.$query().patch({ logged_in: true })
            return user;
        }
        return false;
    }

    async addCredential(credential: Partial<Credential>) {
        const user = await this.user()
        return await user.$relatedQuery('credentials').insert(credential)
    }

    async getServiceCredentials(service:string) : Promise<Credential[]> {
        const user = await this.user()
        return user.credentials.filter((cred) => {
            return cred.service === service;
        })
    }

    async getCredential<T extends BaseAuthMethod>(name: string): LoginCredential<T> {
        const user = await this.user()
        const cred = user.credentials.find((cred) => {
            return cred.name === name;
        })
        // let cred = this.db.get<LoginCredential<T>>(`credentials.${name}`)
        let cred;
        // let cred = this.db.getCollection<Credential>('credentials').find({ user: this._user.name, name })
        if ( ! cred ) {
            return
        }
        cred[ 'login' ]                                               = <any> {}
        cred[ 'login' ][ AuthMethod.getKeyName(<any>cred.method) ]    = cred.key
        cred[ 'login' ][ AuthMethod.getSecretName(<any>cred.method) ] = cred.secret
        cred[ 'login' ][ 'method' ]                                   = <any> AuthMethod[ cred.method.toString() ]
        return < LoginCredential<T>> cred;
    }

}

