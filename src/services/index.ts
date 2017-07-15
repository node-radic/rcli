export * from './AuthMethod'
export * from './Services'
export * from './AbstractService'
export * from './service.google'
export * from './sockets.udp'
export * from './apis/git'
export * from './apis/jira'

export function debugTimeLog(){
    console.log(process.uptime());
}