import { paths } from "./paths";
import { CliExecuteCommandHandledEvent, container, Dispatcher, Log } from "@radic/console";
import * as loki from "lokijs";
// import * as lokiCryptedFileAdapter from "lokijs/src/loki-crypted-file-adapter.js";
import { bootstrapRcli } from "../../bootstrap";
import { readFileSync, unlink, writeFile } from "fs";
import { Keys } from "./keys";


interface LokiPersistenceInterface {
    loadDatabase(dbname: string, callback: (dataOrErr: string | Error) => void): void;
    saveDatabase(dbname: string, dbstring: string, callback: (resOrErr: void | Error) => void): void;
    deleteDatabase(dbname: string, callback?: (resOrErr: void | Error) => void): void;
    // optional
    mode?: string; // 'reference'
    // filename may seem redundant but loadDatabase will need to expect this same filename
    exportDatabase?(filename: string, param: any, callback?: (err: any) => void): void;
}

class LokiFS implements LokiPersistenceInterface {
    public loadDatabase(dbname: string, callback: (dataOrErr: (string | Error)) => void): void {
        callback(readFileSync(paths.userDatabase, 'utf-8'))
    }

    public saveDatabase(dbname: string, dbstring: string, callback: (resOrErr: (void | Error)) => void): void {
        writeFile(paths.userDatabase, dbstring, callback);
    }

    public deleteDatabase(dbname: string, callback?: (resOrErr: (void | Error)) => void): void {
        unlink(paths.userDatabase, callback);
    }

}

export interface DB extends Loki {}

export function init(requiredPath) {
    let db: DB
    //
    // // workaround for bug?
    // if ( existsSync(paths.userDatabase) && statSync(paths.userDatabase).size === 0 ) {
    //     unlinkSync(paths.userDatabase);
    // }

    function ready() {

            if ( db.getCollection('users') === null ) {
                db.addCollection('users', {
                    unique    : [ 'name' ],
                    autoupdate: true
                })
            }
            if ( db.getCollection('credentials') === null ) {
                db.addCollection('credentials', {
                    autoupdate: true
                })
            }

    }

    const keys: Keys = container.get<Keys>('r.keys');
    db               = new loki(paths.userDatabase, <LokiConfigureOptions> {
        autoload        : true,
        autoloadCallback: ready,
        autosave        : true,
        autosaveInterval: 10,

    })
    container.bind<DB>('r.db').toConstantValue(db);
    const log: Log = container.get<Log>('cli.log');



    db.on('loaded', ((...args) => {
        bootstrapRcli().start(requiredPath)
    }));
    db.on('init', ((...args) => log.debug('db init', args)))
    db.on('loaded', ((...args) => log.debug('db loaded', args)))
    db.on('flushChanges', ((...args) => log.debug('db flush', args)))
    db.on('close', ((...args) => log.debug('db close', args)))
    db.on('changes', ((...args) => log.debug('db changes', args)))
    db.on('warning', ((...args) => log.debug('db warning', args)))
}

container.get<Dispatcher>('cli.events').on('cli:execute:handled', (event: CliExecuteCommandHandledEvent) => {
    let db = container.get<DB>('r.db');

    setTimeout(() => {
        db.save(() => process.exit());
    }, 1000)

});