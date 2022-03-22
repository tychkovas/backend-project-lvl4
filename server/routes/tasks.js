// import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const tasks = await app.objection.models.task.query();

        Object.entries(tasks).forEach(([key, value]) => {
          req.log.info(`tasks: ${key}:${value.name}`);
        });
        reply.render('tasks/index', { tasks });
        return reply;
      })

    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      reply.render('tasks/new', { task });
    });
};