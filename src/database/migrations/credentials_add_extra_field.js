"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = function (knex) {
    return knex.schema
        .table('Credentials', function (table) {
        table.json('extra').defaultTo('{}');
    });
};
exports.down = function (knex) {
    return knex.schema
        .table('Credentials', function(table){
            table.dropColumn('extra')
        })
};
