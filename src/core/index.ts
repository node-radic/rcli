import { InputHelper, OutputHelper ,lazyInject, Log,injectable } from "@radic/console";
import { RConfig } from "./config";
export * from './paths'
export * from './config'
export * from './cache'
export * from './bootstrap'

@injectable()
export class BaseCommand {
    @lazyInject('r.log')
    log: Log

    @lazyInject('r.config')
    config: RConfig

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

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
}