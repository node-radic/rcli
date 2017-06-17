import { lazyInject, singleton } from "@radic/console";
import { AuthMethod } from "./methods";
import { DB } from "../core/db";
import { AuthService, BaseAuthMethod, Credential, LoginCredential, User } from "../../interfaces";


@singleton('r.auth')
export class Auth {
    protected _user: User
    public get user(): User {return this._user};

    public users: LokiCollection<User>;
    public creds: LokiCollection<Credential>;

    @lazyInject('r.db')
    db: DB

    ready: boolean = false;


    constructor() {
        this.users = this.db.getCollection<User>('users')
        this.creds = this.db.getCollection<Credential>('credentials')
        // this.db.loadCollection(this.users)
        // this.db.loadCollection(this.creds)

        let user = this.users.findOne({ logged_in: true });
        if ( user ) this._user = user;
    }

    async register(name: string, password: string, password2: string) {
        if ( password !== password ) {
            return false;
        }
        this.users.insert(<any>{ name, password });

        return true;

    }

    unregister(name: string, password: string) {
        this.users.remove(<any>{  name, password });
        return true;
    }

    isLoggedIn() { return ! ! this._user }

    logout() {
        if ( this.isLoggedIn() ) {
            return false;
        }
        this._user.logged_in = false
        this.users.update(this._user);

        this._user.name     = null
        this._user.password = null
        this._user.$loki    = null
    }

    login(name, password) {
        if ( this.isLoggedIn() ) {
            return false;
        }
        let login = this.users.findOne({ name, password });
        if ( login ) {
            this._user      = login;
            login.logged_in = true;
            this.users.update(login)
            return true;
        }
        return false;
    }

    addCredential(credential: Credential) {
        if ( ! credential.user ) {
            credential.user = this._user.name;
        }
        if ( credential.method instanceof AuthMethod ) {
            credential.method = credential.method.toString()
        }
        return this.creds.insert(credential);
    }

    getCredential<T extends BaseAuthMethod>(name:string ): LoginCredential<T> {
        let cred = this.db.getCollection<Credential>('credentials').find({ user: this._user.name, name })
        if ( ! cred ) {
            return
        }
        cred[ 'login' ]                                          = {}
        cred[ 'login' ][ AuthMethod.getKeyName(<any>cred.method) ]    = cred.key
        cred[ 'login' ][ AuthMethod.getSecretName(<any>cred.method) ] = cred.secret
        cred[ 'login' ].method                                   = AuthMethod[ cred.method.toString() ]
        return < LoginCredential<T>> cred;
    }

}

