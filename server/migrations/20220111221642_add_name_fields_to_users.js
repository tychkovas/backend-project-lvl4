
exports.up = function(knex) {
    return knex.schema.table('users', function (table) {
       table.string('firstName');
       table.string('lastName');
     })  
};

exports.down = (knex) => (
   knex.schema.table('users', (table) => {
       table.dropColumn('firstName');
       table.dropColumn('lastName');
     }) 
);