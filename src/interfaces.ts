export type SSHConnectionMethod = 'key' | 'password'

export interface SSHConnection {
    host?: string
    port: number,
    method: 'key',
    path?: string
    hostPath?: string
    user?: string
    name?: string
}