import i18next from 'i18next';

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
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      reply.render('tasks/new', { task, statuses, users });
      return reply;
    })
    .post('/tasks', { name: 'createTasks', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      try {
        const { data } = req.body;
        req.log.trace(`createTasks:req.body: ${JSON.stringify(data)}`);

        data.creatorId = req.session.get('userId');
        data.statusId = Number(data.statusId);
        data.executorId = (data.executorId === '') ? null : Number(data.executorId);

        req.log.info(`createTasks:data: ${JSON.stringify(data)}`);
        const task = await app.objection.models.taskStatus.fromJson(data);

        await app.objection.models.task.query().insert(task);

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (error) {
        // const { data } = error;
        req.log.error(`createTasks: ${JSON.stringify(error)}`);
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task: req.body.data, statuses, users, errors: error.data,
        });
        return reply;
      }
    });
};
