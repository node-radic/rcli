import { StringType } from "@radic/util";
export class AuthMethod extends StringType {
    static basic  = new AuthMethod('basic')
    static oauth  = new AuthMethod('oauth')
    static oauth2 = new AuthMethod('oauth2')
    static token  = new AuthMethod('token')
    static key    = new AuthMethod('key')


    static getKeyName(method: AuthMethod | string) {
        return AuthMethod.getName(method, true);
    }

    static getSecretName(method: AuthMethod | string) {
        return AuthMethod.getName(method, false);
    }

    equals(method: any): boolean {
        if ( typeof method === 'string' ) {
            return this.value === method
        }
        if ( method instanceof AuthMethod ) {
            return this.value === method.value;
        }
        return false;
    }

    private static getName(method: AuthMethod | string, key: boolean = true) {
        switch ( true ) {
            case method == AuthMethod.basic:
                return key ? 'user' : 'password'
            case method == AuthMethod.oauth:
                return key ? 'key' : 'secret'
            case method == AuthMethod.oauth2:
                return key ? 'id' : 'secret'
            case method == AuthMethod.token:
                return key ? 'user' : 'token'
            case method == AuthMethod.key:
                return key ? 'user' : 'keyfile'
        }
    }

    get name(): string {
        return this.value
    }

    get keyName(): string {
        return AuthMethod.getKeyName(AuthMethod[ this.value ])
    }

}