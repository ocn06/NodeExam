//migration applied
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('tasks', function(table) {
        table.increments('task_id').primary();
        table.string('name');
        table.string('user_id');
        table.integer('done');
    });
};

//migration rollback
exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('tasks');
  
};
