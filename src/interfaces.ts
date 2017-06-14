export type SSHConnectionMethod = 'key' | 'password'

export interface SSHConnection {
    host?: string
    port: number,
    method: SSHConnectionMethod,
    localPath?: string
    hostPath?: string
    password?:string
    user?: string
    name?: string
}