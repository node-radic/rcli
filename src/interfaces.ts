import { Credential, CredentialsExtraField } from "./database/Models/Credential";
import { AxiosInstance } from "axios";
import { AuthMethod } from "./services/AuthMethod";
export type SSHConnectionMethod = 'key' | 'password'

export interface ISSHConnection {
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
export interface IUser {
    name: string
    password: string
    credentials?: ICredential[]
}
export type AuthService = 'github' | 'bitbucket' | 'jira'
export interface ICredential {
    name: string
    service: AuthService | string
    user?: string
    method: BaseAuthMethod | string
    key?: string,
    secret?: string
}
export interface LoginCredential<T extends BaseAuthMethod> extends ICredential {
    login: T
}

export interface List<T> {
    [index: number]: T;
    length: number;
}

export interface Dictionary<T> {
    [index: string]: T;
}

export interface NumericDictionary<T> {
    [index: number]: T;
}

export interface StringRepresentable {
    toString(): string;
}


export interface ServiceConfig<T extends ServiceExtraFields=ServiceExtraFields> {
    name: string
    provides?: string
    methods: AuthMethod[]
    extra?: T
    cls?: Function|IServiceConstructor
}
export interface ServiceExtraFieldConfig {
    type: ServiceExtraFieldType
    default?: any
    description?: string
}
export type ServiceExtraFieldType = string | number | boolean | ServiceExtraFieldConfig
export interface ServiceExtraFields extends CredentialsExtraField {
    [name: string]: ServiceExtraFieldType
}

export interface IService <T extends ServiceExtraFields=ServiceExtraFields> {
    client?: AxiosInstance
    credentials?: Credential
    service?: ServiceConfig<T>
    setCredentials(cred: Credential): Promise<this>
}

export interface IServiceConstructor extends Function {
    new(): IService
}