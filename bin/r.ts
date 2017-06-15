#!/usr/bin/env node
import "../src/index";
import { cli, CliConfig, container, LogFactory } from "@radic/console";
import { RConfig } from "../src";
import * as winston from "winston";
import * as Raven from 'raven'

const rconfig = container.get<RConfig>('r.config')
if ( rconfig.has('raven.dsn') ) {
    Raven.config(rconfig('raven.dsn')).install()
    winston.transports['Sentry'] = require('winston-sentry');
    winston.add(winston.transports['Sentry'], {
        dsn: rconfig('raven.dsn')
    })
}

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
    .helper('ssh.bash')
    .helper('verbose', {
        option: { key: 'v', name: 'verbose' }
    })

// cli.log.add()

cli.start(__dirname + '/../src/commands/r')


