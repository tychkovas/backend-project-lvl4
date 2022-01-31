// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();

      Object.entries(users).forEach(([key1, value]) => {
        req.log.info(`user: ${key1}: ${value.email}: ${value.fullName()}, ${value.firstName}`);
      });
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);

        req.log.info(`/users post: ${user.email}, ${user.firstName}`);

        Object.entries(user).forEach(([key1, value]) => {
          req.log.info(` - user: ${key1}: ${value} `);
        });

        await app.objection.models.user.query().insert(user);
        req.log.info('/users post: success');
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: data });
        return reply;
      }
    })
    .get('/users/:id/edit', { name: 'openForEditUser' }, async (req, reply) => {
      const id = req.params?.id;
      try {
        req.log.info(`/users edit id = ${id}`);
        const user = await app.objection.models.user.query().findById(id);
        req.log.info(`/users edit user = ${JSON.stringify(user)}`);
        if (!user) throw new Error('User not defined');

        reply.render('users/edit', { user });
        return reply;
      } catch ({ data }) {
        req.log.error(` /users/:id/ error = ${data}`);

        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.redirect('/users');
        return reply;
      }
    })
    .patch('/users/:id', { name: 'updateUser' }, async (req, reply) => {
      const { id } = req.params;
      req.log.info(`/users patch:  id = ${id}`);
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);

        req.log.info(`/users patch data email: ${user.email}`);
        req.log.info(`/users patch data : ${JSON.stringify(user)}`);

        const userUpdated = await app.objection.models.user.query()
          .findById(id);

        await userUpdated.$query().update(req.body.data);
        req.log.info(`/users update OK : ${JSON.stringify(userUpdated)}`);
        req.log.info('/users patch: success');

        req.flash('success', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch ({ data }) {
        req.log.info(`/users patch: fail. data = ${data}`);

        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user: { ...req.body.data, curId: id }, errors: data });
        return reply;
      }
    })
    .delete('/users/:id', async (req, reply) => {
      const id = req.params?.id;
      try {
        const idDeleted = await app.objection.models.user.query()
          .deleteById(id);

        req.log.info(`/users delete: id = ${idDeleted}`);

        req.logOut();

        req.log.info('/users delete: logOut');

        req.flash('success', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        req.log.error(`/users delete: fail id = ${id}`);
        reply.redirect(app.reverse('users'));
        return reply;
      }
    });
};
