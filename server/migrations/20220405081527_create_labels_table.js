

exports.up = (knex) => (
  knex.schema.createTable('labels', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
  .createTable('tasks_labels', (table) => {
    table.increments('id').primary();

    table
      .integer('taskId')
      .unsigned()
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index()
   
    table
     .integer('labelId')
     .unsigned()
     .references('id')
     .inTable('labels')
     .onDelete('CASCADE')
     .index()

  })
);

exports.down = (knex) => knex.schema.dropTable('labels')
  .dropTable('tasks_labels');