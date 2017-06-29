export * from './static'
export * from './sockets.udp'
export * from './AuthMethod'
export * from './apis/git'

export function debugTimeLog(){
    console.log(process.uptime());
}