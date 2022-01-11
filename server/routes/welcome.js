// @ts-check

export default (app) => {
  app
    .get('/', { name: 'root' }, (req, reply) => {
      // trace, debug, info, warn, error, and fatal
      req.log.info('- Some info 1');
      req.log.debug('- Some debug 2');
      req.log.warn('- Some warn 3');

      req.log.trace('- Some trace 4');
      req.log.error('- Some error 5');
      req.log.fatal('- Some fatal 6');

      reply.render('welcome/index');
    })
    .get('/protected', { name: 'protected', preValidation: app.authenticate }, (req, reply) => {
      reply.render('welcome/index');
    });
};
