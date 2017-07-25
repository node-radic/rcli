import * as Knex from "knex";
import { Config } from "knex";
import { Model } from "objection";
import { join } from "path";
import * as Promise from "bluebird";
import * as _ from "lodash";
import { paths } from "../core/paths";


export class Database {
    protected options: Config = {}
    protected _knex: Knex;
    public get knex(): Knex {return this._knex; }
    public get migrate():Knex.Migrator { return this.knex.migrate };

    constructor(options: Config = {}) {

        this.options = _.merge(<Config>{
            client          : 'sqlite3',
            useNullAsDefault: true,
            connection      : {
                filename: paths.userDatabase
            },
            migrations: {
                directory: join(__dirname, 'migrations'),
                extension: 'js'
            }
        }, options)
        const knex   = Knex(this.options)
        Model.knex(knex);
        this._knex = knex;

    }

    public migrateLatest(): Promise<any> {
        return this._knex.migrate.latest({
            directory: join(__dirname, 'migrations'),
            extension: 'js'
        })
    }

}