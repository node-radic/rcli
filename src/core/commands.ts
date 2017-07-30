import { Dispatcher, injectable, InputHelper, lazyInject, Log, OutputHelper } from "@radic/console";
import { RConfig } from "./config";
import { Services } from "../services/Services";
import { ConnectHelper } from "../helpers/helper.connect";

@injectable()
export class BaseCommand {

    @lazyInject('cli.events')
    protected events: Dispatcher;

    @lazyInject('r.log')
    protected log: Log

    @lazyInject('r.config')
    protected config: RConfig

    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;

    @lazyInject('cli.helpers.input')
    protected ask: InputHelper;

    protected returnError(msg: string, ...meta: any[]): boolean {
        this.log.error(msg, meta)
        return false;
    }

    protected returnInfo(msg: string, ...meta: any[]): boolean {
        this.log.info(msg, meta);
        return true;
    }

    protected returnLog(level: string, msg: string, ...meta: any[]): boolean {
        this.log.log(level, msg, meta);
        return true;
    }

    protected returnErrorLog(level: string, msg: string, ...meta: any[]): boolean {
        this.log.log(level, msg, meta);
        return false;
    }

    protected returnOk(msg?: string, level: string = 'info', ...meta: any[]) {
        if ( msg ) {
            this.log.log(level, msg, meta)
        }
        return true;
    }

    protected promiseOk(msg?: string, level: string = 'info', ...meta: any[]): Promise<boolean> {
        return Promise.resolve(this.returnOk(msg, level, meta));
    }

    protected promiseError(msg?: string, ...meta: any[]) {
        if ( msg ) {
            this.log.error(msg, meta);
        }
        return Promise.reject(msg)
    }

}

@injectable()
export class BaseServiceCommand extends BaseCommand {
    @lazyInject('r.services')
    protected services: Services;

    @lazyInject('cli.helpers.connect')
    protected connect: ConnectHelper;

}