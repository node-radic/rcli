import { paths } from "../core/paths";
import * as Knex from "knex";
import { Config } from "knex";
import { Model } from "objection";
import { join } from "path";
import * as Promise from "bluebird";
import * as _ from "lodash";


export class Database {
    protected options: Config = {}
    protected _knex: Knex;
    public get knex(): Knex {return this._knex; }

    constructor(options: Config = {}) {
        this.options = _.merge({
            client          : 'sqlite3',
            useNullAsDefault: true,
            connection      : {
                filename: paths.userDatabase
            }
        }, options)
        const knex   = Knex(this.options)
        Model.knex(knex);
        this._knex = knex;
    }

    public migrate(): Promise<any> {
        return this._knex.migrate.latest({
            directory: join(__dirname, 'migrations'),
            extension: 'js'
        })
    }
}