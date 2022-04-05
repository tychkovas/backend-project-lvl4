import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const tasks = await app.objection.models.task.query()
          .withGraphFetched('[status, creator, executor]');
        //  await Promise.all(tasks.map((task) => task.$fetchGraph('[status, creator, executor]')));

        // req.log.info(`tasks: ${JSON.stringify(tasks)}`);

        Object.entries(tasks).forEach(([key, value]) => {
          req.log.trace(`tasks: ${key}:${value.name}:${value.creator.name}`);
        });
        reply.render('tasks/index', { tasks });
        return reply;
      })

    .get('/tasks/:id', { name: 'showTask', preValidation: app.authenticate }, async (req, reply) => {
      const id = Number(req.params?.id);
      try {
        const task = await app.objection.models.task.query().findById(id);
        req.log.trace(`showTask:task: ${JSON.stringify(task)}`);

        if (!task) throw new Error('Task not defined');

        await task.$fetchGraph('[status, creator, executor, labels]');

        req.log.trace(`showTask:formTask: ${JSON.stringify(task)}`);

        reply.render('tasks/show', { task });
        return reply;
      } catch (err) {
        req.log.error(`task:${JSON.stringify(err)}`);
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/new', {
        task, statuses, users, labels,
      });
      return reply;
    })

    .post('/tasks', { name: 'createTask', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      try {
        const { data } = req.body;
        req.log.trace(`createTask:req.body: ${JSON.stringify(data)}`);

        data.creatorId = req.session.get('userId');
        data.statusId = Number(data.statusId);
        data.executorId = (data.executorId === '') ? null : Number(data.executorId);

        req.log.info(`createTask:data: ${JSON.stringify(data)}`);
        const task = await app.objection.models.task.fromJson(data);

        await app.objection.models.task.query().insert(task);

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (error) {
        // const { data } = error;
        req.log.error(`createTask: ${JSON.stringify(error)}`);
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task: req.body.data, statuses, users, labels, errors: error.data,
        });
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const id = Number(req.params?.id);
      try {
        const task = await app.objection.models.task.query().findById(id);

        req.log.trace(`editTask:task: ${JSON.stringify(task)}`);

        if (!task) throw new Error('Task not defined');

        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();

        reply.render('tasks/edit', { task, statuses, users });
        return reply;
      } catch (err) {
        req.log.error(`editTask:${JSON.stringify(err)}`);
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    })

    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      const id = Number(req.params?.id);

      try {
        const { data } = req.body;
        req.log.debug(`updateTask:req.body: ${JSON.stringify(data)}`);

        data.creatorId = req.session.get('userId');
        data.statusId = Number(data.statusId);
        data.executorId = (data.executorId === '') ? null : Number(data.executorId);

        req.log.info(`updateTask:data: ${JSON.stringify(data)}`);
        const task = await app.objection.models.task.fromJson(data);

        const taskUpdated = await app.objection.models.task.query()
          .findById(id);

        await taskUpdated.$query().update(task);

        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        req.log.error(`updateTask: ${JSON.stringify(err)}`);
        const statuses = await app.objection.models.taskStatus.query();
        const users = await app.objection.models.user.query();
        const labels = await app.objection.models.label.query();
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        reply.render('tasks/edit', {
          task: { ...req.body.data, id }, statuses, users, labels, error: err.data,
        });
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const id = Number(req.params?.id);
        const task = await app.objection.models.task.query().findById(id);
        if (task.creatorId === req.session.get('userId')) {
          req.log.info(`deleteTask: task = ${task}`);
          const idDeleted = await task.$query().delete();
          req.log.info(`deleteTask: id = ${idDeleted}`);
          req.flash('info', i18next.t('flash.tasks.delete.success'));
        } else {
          req.log.error(`deleteTask: task created by userId ${task.creatorId} `);
          req.flash('error', i18next.t('flash.tasks.delete.accessError'));
        }
      } catch (err) {
        req.log.error(`deleteTask: ${JSON.stringify(err)}`);
        req.flash('error', i18next.t('flash.tasks.delete.error'));
      }

      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
