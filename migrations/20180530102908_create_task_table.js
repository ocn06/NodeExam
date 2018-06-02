
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('tasks', function(table) {
        table.increments('task_id').primary();
        table.string('tasks');
        table.string('user_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('tasks');
  
};
