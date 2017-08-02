import { alwaysRun, command, CommandConfig, Dispatcher, lazyInject, Log } from "radical-console";
import { RConfig } from "../";

@command('r {command:string@any of the listed commands}', <CommandConfig> {
    // subCommands: [  'dev', 'connect', 'ssh', 'git',  'google','info', 'tree'], //'completion', 'jira',
    isGroup  : true,
    // helpers: {
    //     help: {
    //         display: {
    //             arguments: false
    //         }
    //     }
    // }
})
export class RcliCmd {

    @lazyInject('cli.events')
    protected events: Dispatcher;

    @lazyInject('r.log')
    protected log: Log;

    @lazyInject('r.config')
    protected config: RConfig;

    @alwaysRun()
    always() {
        if ( this.config.get('debug', false) === true ) {
            this.log.level = 'debug';
        }
        if ( this.log.level === 'silly' ) {
            this.events.on('**', (event: string) => event && this.log.info(process.uptime() + ': ' + (event[ 'event' ] || event)))
        }

    }


    handle(...args: any[]) {
        return true;
    }
}
export default RcliCmd