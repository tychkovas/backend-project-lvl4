console.log('"tasks_clean_and_add": deleting everything and adding two entries');
module.exports.seed = async (knex) => {
  await knex('tasks').del();
  await knex('tasks')
    .insert([
      {
        name: 'задача 1',
        description: 'описание 1',
        statusId: 1,
        creatorId: 1,
        executorId: 1,
      },
      {
        name: 'задача 2',
        description: 'описание 2',
        statusId: 2,
        creatorId: 2,
        executorId: 2,
      },
    ]);
};
