export default (app) => {
  app
    .get('/statuses', { name: 'statuses', preValidation: app.authenticate}, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();

      Object.entries(statuses).forEach(([key, value]) => {
        req.log.info(`statuses: ${key}:${value.name}`);
      });
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.authenticate }, (req, reply) => {
      const status = new app.objection.models.taskStatus();
      reply.render('statuses/new', { status });
    })
    .post('/statuses', { name: 'createStatus', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const status = await app.objection.models.taskStatus
          .fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(status);

        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        reply.render('statuses/new', { status: req.body.data, errors: data });
        return reply;
      }
    })
    .get('/statuses/:id/edit', { name: 'openForEditStatus', preValidation: app.authenticate }, async (req, reply) => {
      const id = Number(req.params?.id);
      try {
        const status = await app.objection.models.taskStatus.query()
          .findById(id);

        if (!status) throw new Error('Task Status not defined');

        reply.render('statuses/edit', { status });
        return reply;
      } catch ({ data }) {
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    })
    .patch('/statuses/:id', { name: 'updateStatus', preValidation: app.authenticate }, async (req, reply) => {
      const id = Number(req.params?.id);
      if (!id) {
        reply.redirect('/');
        return reply;
      }

      try {
        // const user = await app.objection.models.user.fromJson(req.body.data);
        const status = await app.objection.models.taskStatus.fromJson(req.body.data);
        req.log.info(`/users patch data : ${JSON.stringify(status)}`);
        const statusUpdated = await app.objection.models.taskStatus.query()
          .findById(id);

        await statusUpdated.$query().update(req.body.data);
        reply.redirect(app.reverse('statuses'));

        return reply;
      } catch ({ data }) {
        req.log.info(`/status patch: fail. data = ${data}`);
        reply.render('statuses/edit', { user: { ...req.body.data, curId: id }, error: data });
      }
    })
    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const id = Number(req.params?.id);
        const idDeleted = await app.objection.models.taskStatus.query()
          .deleteById(id);
        req.log.info(`/statuses delete: id = ${idDeleted}`);
      } catch ({ data }) {
        req.log.error(`/statuses delete: fail  ${data}`);
      }
      reply.redirect(app.reverse('statuses'));
      return reply;
    });
};
