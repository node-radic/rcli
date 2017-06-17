export type SSHConnectionMethod = 'key' | 'password'

export interface SSHConnection {
    host?: string
    port: number,
    method: SSHConnectionMethod,
    localPath?: string
    hostPath?: string
    password?: string
    user?: string
    name?: string
}
export interface BaseAuthMethod {
    name?: string
}
export interface AuthMethodBasic extends BaseAuthMethod {
    username?: string
    password?: string
}

export interface AuthMethodOAuth extends BaseAuthMethod {
    key?: string
    secret?: string
}
export interface AuthMethodOAuth2 extends BaseAuthMethod {
    id?: string
    secret?: string
}

export interface AuthMethodToken extends BaseAuthMethod {
    username?: string
    token?: string
}

export interface AuthMethodKey extends BaseAuthMethod {
    username?: string
    keyfile?: string
}
export interface User {
    $loki?: number
    name: string
    password: string
    logged_in: boolean
}
export type AuthService = 'github' | 'bitbucket' | 'jira'
export interface Credential {
    $loki?: number
    name: string
    service: AuthService | string
    user?: string
    method: BaseAuthMethod | string
    key?: string,
    secret?: string
}
export interface LoginCredential<T extends BaseAuthMethod> extends Credential {
    login: T
}
