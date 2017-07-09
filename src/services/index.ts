export * from './static'
export * from './sockets.udp'
export * from './AuthMethod'
export * from './apis/git'
export * from './apis/jira'

export function debugTimeLog(){
    console.log(process.uptime());
}