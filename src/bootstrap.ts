#!/usr/bin/env node
import "../src/index";
import { Cli, CliConfig, container, log } from "@radic/console";
import { RConfig, paths } from "../src";
import * as winston from "winston";
import * as Raven from "raven";
import { PKG } from "./lib/core/static";
import { Client } from "raven";

export function bootstrapRaven(){

    const rconfig    = container.get<RConfig>('r.config')
    if ( rconfig.has('raven.dsn') ) {
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

export function bootstrapRcli(): Cli {
    const rconfig    = container.get<RConfig>('r.config')
    const cli        = container.get<Cli>('cli');
    const transports = [
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
                flags          : 'w+',
                defaultEncoding: 'utf8',
                fd             : null,
                mode           : 0o666,
                autoClose      : true
            },
            showLevel  : true
        }),
        log.transports[ 0 ]
    ];

    if ( rconfig.has('raven.dsn') ) {
        winston.transports[ 'Sentry' ] = require('winston-sentry');
        transports.push(new (winston.transports[ 'Sentry' ])({
            dsn        : rconfig('raven.dsn'),
            level      : 'info',
             patchGlobal: true
        }))
    }

    cli.log.configure({
        level    : cli.log.level,
        rewriters: cli.log.rewriters,
        transports
    })
    container.bind('r.log').toConstantValue(cli.log)


    cli.config(<CliConfig> {
        commands: {
            onMissingArgument: 'help'
        }
    })


    cli
        .helper('input')
        .helper('output')
        .helper('ssh.bash')
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

    return cli;

}