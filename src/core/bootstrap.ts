import { Cli, CliConfig, container, Log, logLevel, logTransports } from 'radical-console';
import { LoggerInstance, transports as wtransports } from 'winston';
import { Client } from 'raven';
import { paths } from './paths';
import { PKG } from './static';
import { Inquirer } from 'inquirer';
import { Database } from '../database/Database';
import { RConfig } from './config';

export function bootstrapRaven() {

    const rconfig = container.get<RConfig>('r.config')
    if ( rconfig.has('raven.dsn') && false === container.isBound('sentry') ) {
        const sentry: Client = require('raven').config(rconfig('raven.dsn')).install({
            name   : 'rcli',
            release: PKG().version,

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
    logTransports.push(<any>
        new (wtransports.File)({
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
        wtransports[ 'Sentry' ] = require('winston-sentry');
        logTransports.push(new (wtransports[ 'Sentry' ])({
            dsn        : rconfig('raven.dsn'),
            level      : 'info',
            patchGlobal: true
        }))
    }

    cli.log.configure({
        level           : 'info',
        rewriters       : cli.log.rewriters,
        levels          : logLevel,
        transports      : logTransports,
        handleExceptions: true
    })
    container.unbind('cli.log')
    container.bind<LoggerInstance>('cli.log').toConstantValue(cli.log)
    container.bind<Log>('r.log').toConstantValue(cli.log)

    // const eventHandler = (event:string) => event && cli.log.info(event['event'] || event);
    // if(process.argv.includes('-vvvv')) {
    //     cli.events.on('**', (event: string) => event && cli.log.info(process.uptime() + ': ' + (event[ 'event' ] || event)))
    // }

    cli.config.merge(<CliConfig> {
        parser  : {
            yargs: {
                'boolean-negation': false
            }
        },
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
                colors: { enabled: true }
            }
        })
        .helper('help', {
            addShowHelpFunction: true,
            showOnError        : true,
            app                : {
                title: 'Radic CLI'
            },
            option             : { enabled: true } //key: 'h', name: 'help' }
        })
        .helper('verbose', {
            option: { key: 'v', name: 'verbose' }
        })
        .helper('completion', {
            name: 'r'
        })

        // rcli helpers
        // .helper('completion')
        .helper('ssh.bash')
        .helper('connect')

    // cli.events.on('**', (event: Event) => event && event.event && console.log('event', event.event, process.uptime()))
    return new Promise((resolve, reject) => {
        let  db;
        container.bind('r.db').toDynamicValue(() => {
            if(db) return db;
            db = new Database();

            db.migrateLatest().then(() => {
                resolve(cli)
            })
            return db;
        });
    })

}