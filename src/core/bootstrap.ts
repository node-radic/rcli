#!/usr/bin/env node
import { Cli, CliConfig, container, log, Event } from "@radic/console";
import * as winston from "winston";
import * as Raven from "raven";
import { Client } from "raven";
import { RConfig, paths } from "./";
import { PKG } from "./static";
import { Inquirer } from "inquirer";
import { Database } from "../database/Database";

export function bootstrapRaven() {

    const rconfig = container.get<RConfig>('r.config')
    if ( rconfig.has('raven.dsn') && false === container.isBound('sentry') ) {
        const sentry: Client = Raven.config(rconfig('raven.dsn')).install({
            name   : 'rcli',
            release: PKG.version,

            environment               : process.env.NODE_ENV === 'production' ? 'production' : 'development',
            autoBreadcrumbs           : true,
            captureUnhandledRejections: true
        })
        sentry.setContext({
            tags: {
                component: 'console',
                level    : 'debug'
            }
        })
        container.bind<Client>('sentry').toConstantValue(sentry);
    }
}

export function bootstrapRcli(): Promise<Cli> {
    bootstrapRaven();
    const rconfig = container.get<RConfig>('r.config')
    const cli     = container.get<Cli>('cli');
    log.transports.push(<any>
        new (winston.transports.File)({
            filename   : paths.logFile,
            level      : 'error',
            colorize   : false,
            prettyPrint: true,
            tailable   : true,
            timestamp  : true,
            maxsize    : 300000,
            maxFiles   : 4,
            options    : {
                flags          : 'a',
                defaultEncoding: 'utf8',
                fd             : null,
                mode           : 0o666,
                autoClose      : true
            },
            showLevel  : true
        })
    )

    if ( rconfig.has('raven.dsn') ) {
        winston.transports[ 'Sentry' ] = require('winston-sentry');
        log.transports.push(new (winston.transports[ 'Sentry' ])({
            dsn        : rconfig('raven.dsn'),
            level      : 'info',
            patchGlobal: true
        }))
    }

    cli.log.configure({
        level           : cli.log.level,
        rewriters       : cli.log.rewriters,
        levels          : log.levels,
        transports      : log.transports,
        handleExceptions: true
    })
    container.unbind('cli.log')
    container.bind('cli.log').toConstantValue(cli.log)
    container.bind('r.log').toConstantValue(cli.log)

    // const eventHandler = (event:string) => event && cli.log.info(event['event'] || event);
    // if(process.argv.includes('-vvvv')) {
    //     cli.events.on('**', (event: string) => event && cli.log.info(process.uptime() + ': ' + (event[ 'event' ] || event)))
    // }

    cli.config(<CliConfig> {
        commands: {
            onMissingArgument: 'help'
        }
    })


    cli
    // console helpers
        .helper('input', {
            registerPrompts: (inquirer: Inquirer) => {
                let promptNames = Object.keys(inquirer.prompts);
                if ( ! promptNames.includes('autocomplete') ) inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
                if ( ! promptNames.includes('datetime') ) inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'))
            }
        })
        .helper('output', {
            options: {
                quiet : { enabled: true },
                colors: { enabled: true, }
            }
        })
        .helper('help', {
            addShowHelpFunction: true,
            showOnError        : true,
            app                : {
                title: 'Radic CLI'
            },
            option             : { enabled: true, } //key: 'h', name: 'help' }
        })
        .helper('verbose', {
            option: { key: 'v', name: 'verbose' }
        })

        // rcli helpers
        // .helper('completion')
        .helper('ssh.bash')
        .helper('connect')

    // cli.events.on('**', (event: Event) => event && event.event && console.log('event', event.event, process.uptime()))
    return new Promise((resolve, reject) => {
        const db = new Database();
        container.bind('r.db').toConstantValue(db);
        db.migrateLatest().then(() => {
            resolve(cli)
        })
    })

}