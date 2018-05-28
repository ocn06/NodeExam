
exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('users', function(table) {
            table.increments('user_id').primary();
            table.string('password');
            table.string('username');
            table.string('email');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('users');
};
