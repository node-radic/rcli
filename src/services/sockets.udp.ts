import { createSocket, RemoteInfo, Socket } from "dgram";
import { getRandomId } from "@radic/util";
import { inject, Log, singleton } from "@radic/console";
import { RConfig } from "../core/config";

export interface SocketFactorySocket{
    id:string
    socket:Socket
}

@singleton('service.sockets.udp')
export class UDPSocketFactory {
    protected sockets: SocketFactorySocket[] = []

    protected server: Socket;
    protected client: Socket;

    @inject('r.config')
    config: RConfig

    @inject('cli.log')
    log: Log

    constructor() {
    }

    create(id?: string, port?: number) :Socket{
        const socket = createSocket('udp4')
        if ( port ) {
            socket.bind(parseInt(port.toString()))
        }
        if ( ! id ) {
            id = getRandomId(15)
        }
        this.log.data(`Created socket id : ${id}`)
        this.sockets.push({ id, socket })
        return socket;
    }

    createServer() :Socket{
        if ( this.server ) {
            return this.server;
        }
        const server = this.create('r.dgram.server');
        server.unref();
        server.on('error', (err:Error) => {
            console.log(`server error:\n${err.stack}`);
            server.close();
        });

        server.on('message', (msg, rinfo:RemoteInfo) => {
            rinfo.address
            rinfo.port
            rinfo.family
            this.log.notice(`From ${rinfo.address}:${rinfo.port} @ ${rinfo.family} says: \n ${msg}`)
        });

        server.on('listening', () => {
            console.log(`server listening`);
            console.log(server.address())
        });

        server.bind(
            this.config('dgram.server.port'),
            this.config('dgram.server.host'), ()=>{
                // server.addMembership('127.0.0.1')
                server.setBroadcast(true)
                server.setMulticastLoopback(true)
            })
        server.on('close', () => this.createServer());

        return this.server = server;
    }

    createClient():Socket {
        if ( this.client ) {
            return this.client;
        }
        const client = this.create('r.dgram.client');

        client.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            client.close();
        });

        client.on('message', (msg, rinfo) => {
            console.log(`client got: ${msg} from `);
        });
        client.on('listening', () => {
            console.log(`client listening`);
        });

        // this.ensureBinds(client, this.config('dgram.client.port'))
        client.bind( 0 , this.config('dgram.client.host'), () => {
            client.setBroadcast(true)
            client.setMulticastLoopback(true)
        })

        return this.client = client;
    }

    protected ensureBinds(client:Socket, port:number){
        try {
            client.bind(port)
        } catch(e){
            this.ensureBinds(client, port++)
        }
    }
}