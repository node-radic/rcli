import { createSocket, Socket } from "dgram";
import { OutputHelper, command, option, Config, inject, lazyInject, Dispatcher, CommandArguments, InputHelper } from "@radic/console";
import { UDPSocketFactory } from "../services/sockets.udp";

@command(`socket
{type:string@either server or client}
[message:string[]@message to send]`, 'Socket communication')
export class SocketCmd {
    @inject('cli.events')
    events:Dispatcher

    @inject('r.config')
    config: Config

    @inject('cli.helpers.input')
    input: InputHelper

    @inject('service.sockets.udp')
    sockets:UDPSocketFactory

    @inject('cli.helpers.output')
    protected out: OutputHelper;


    @option('s', 'Send to a socket')
    send:boolean

    @option('p', 'Port for sending')
    port:number


    async handle(args:CommandArguments) {
        let socket:Socket;
        if(args.type === 'server') {
            const server = socket = this.sockets.createServer();
        }
        if(args.type === 'client'){
            const client = socket = this.sockets.createClient()
        }
        if(this.send){
            return this.communicateWith(socket, parseInt(this.port.toString()))
        }
        return true;
    }


    async communicateWith(socket:Socket, port:number, host:string='0.0.0.0'){
        let message = await this.input.ask('What do you want to send')
        socket.send(Buffer.from(message), port, host)
        let again = await this.input.confirm('Do you want to send something again?')
        if(again){
            return await this.communicateWith(socket, port, host);
        }
    }
}
export default SocketCmd