export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();

      Object.entries(statuses).forEach(([key, value]) => {
        req.log.info(`statuses: ${key}:${value.name}`);
      });
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      const status = new app.objection.models.taskStatus();
      reply.render('statuses/new', { status });
    })
    .post('/statuses', async (req, reply) => {
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
    .get('/statuses/:id/edit', { name: 'openForEditStatus' }, async (req, reply) => {
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
    });
};
