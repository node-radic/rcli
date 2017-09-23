import * as Knex from 'knex';
import { Config, Migrator } from 'knex';
import { join } from 'path';
import * as _ from 'lodash';
import { paths } from '../core/paths';


export class Database {
    protected options: Config = {}
    protected _knex: Knex;
    public get knex(): Knex {
        if ( ! this._knex ) {
            this._knex = require('knex')(this.options)
            require('objection').Model.knex(this._knex);
        }
        return this._knex
    }

    public get migrate(): Migrator { return this.knex.migrate };

    constructor(options: Config = {}) {

        this.options = _.merge(<Config>{
            client          : 'sqlite3',
            useNullAsDefault: true,
            connection      : {
                filename: paths.userDatabase
            },
            migrations      : {
                directory: join(__dirname, 'migrations'),
                extension: 'js'
            }
        }, options)

    }

    public migrateLatest(): Promise<any> {
        return new Promise((res, rej) => this.knex.migrate.latest({
            directory: join(__dirname, 'migrations'),
            extension: 'js'
        }).then(res).catch(rej))
    }

}