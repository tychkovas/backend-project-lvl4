export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();

      Object.entries(statuses).forEach(([key, value]) => {
        req.log.info(`statuses: ${key}:${value.name}`);
      });
      reply.render('statuses/index', { statuses });
      return reply;
    });
};
