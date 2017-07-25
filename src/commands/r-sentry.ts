import { container, command, CommandConfig, Container, Dispatcher, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../";
import { Client } from "raven";

@command('sentry', <CommandConfig> {
    enabled: (container: Container): boolean => {
        return container.isBound('sentry')
    }
})
export class SentryCmd {

    protected get sentry(): Client {
        if(!container.isBound('sentry')){
            return;
        }
        return container.get<Client>('sentry')
    }

    @lazyInject('cli.events')
    protected events: Dispatcher;

    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;

    @lazyInject('r.log')
    protected log: Log;

    @lazyInject('r.config')
    protected config: RConfig;

    @option('m', 'Send a message')
    message: string

    @option('l', 'Set the level', { default: 'info' })
    level: string

    handle(...args: any[]) {
        this.out.dump({
            message: this.message,
            level  : this.level,
            args
        })
        if ( this.message ) {
            return new Promise(resolve => {
                this.log.info('sending message')
                this.sentry.captureMessage(this.message, {
                    level: this.level
                }, () => {
                    this.log.info('done')
                    resolve();
                })
            })
        }
        return true;

    }
}
export default SentryCmd