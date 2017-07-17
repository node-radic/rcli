import { Socket } from "dgram";
import { command, CommandArguments, Config, Dispatcher, inject, InputHelper, option, OutputHelper } from "@radic/console";
import { UDPSocketFactory } from "../../services/sockets.udp";

@command(`socket
{type:string@either server or client}
[message:string[]@message to send]`, 'Socket communication')
export class SocketCmd {
    @inject('cli.events')
    events: Dispatcher

    @inject('r.config')
    config: Config

    @inject('cli.helpers.input')
    input: InputHelper

    @inject('service.sockets.udp')
    sockets: UDPSocketFactory

    @inject('cli.helpers.output')
    protected out: OutputHelper;


    @option('s', 'Send to a socket')
    send: boolean

    @option('p', 'Port for sending')
    port: number


    async handle(args: CommandArguments) {
        let socket: Socket;
        if ( args.type === 'server' ) {
            return new Promise((res, rej) => this.sockets.createServer().on('close', () => {
                res();
            }))
        }
        if ( args.type === 'client' ) {
            // return new Promise((res, rej) => this.sockets.createServer().on('close', () => {
            //     res();
            // }))
            const client = socket = this.sockets.createClient()
        }
        if ( this.send ) {
            return this.communicateWith(socket, parseInt(this.port.toString()))
        }
        return socket;
    }


    async communicateWith(socket: Socket, port: number, host: string = '0.0.0.0') {
        let message = await this.input.ask('What do you want to send')
        socket.send(Buffer.from(message), port, host)
        let again = await this.input.confirm('Do you want to send something again?')
        if ( again ) {
            return await this.communicateWith(socket, port, host);
        }
    }
}
export default SocketCmd