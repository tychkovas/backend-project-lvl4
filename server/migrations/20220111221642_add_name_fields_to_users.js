
exports.up = function(knex) {
    return knex.schema.table('users', function (table) {
      table.string('first_name');
      table.string('last_name');
     })  
};

exports.down = (knex) => (
   knex.schema.table('users', (table) => {
       table.dropColumn('first_name');
       table.dropColumn('last_name');
     }) 
);