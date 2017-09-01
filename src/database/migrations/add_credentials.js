"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = function (knex) {
    return knex.schema
        .createTable('Credentials', function (table) {
        table.increments('id').primary();
        table.string('name');
        table.string('service');
        table.string('method');
        table.string('key');
        table.string('secret');
    });
};
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('Credentials')
};
