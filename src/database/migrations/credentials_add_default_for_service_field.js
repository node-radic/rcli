"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = function (knex) {
    return knex.schema
        .table('Credentials', function (table) {
        table.boolean('default_for_service').defaultTo(false);
    });
};
exports.down = function (knex) {
    return knex.schema
        .table('Credentials', function(table){
            table.dropColumn('default_for_service')
        })
};
