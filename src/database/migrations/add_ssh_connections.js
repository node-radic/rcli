"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.up = function (knex) {
    return knex.schema
        .createTable('SSHConnections', function (table) {
            table.increments('id').primary();
            table.string('name').unique();
            table.string('user')
            table.string('host')
            table.integer('port').defaultTo(22);
            table.enum('method', ['key','password'])
            table.string('password').nullable()
            table.string('localPath').nullable()
            table.string('hostPath').nullable()
        });
};
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('SSHConnections')
};
