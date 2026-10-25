// @ts-check

import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';

/**
 * Замена fastify-objectionjs: та же инициализация knex + objection,
 * но без whitelist клиентов (работает с better-sqlite3).
 *
 * @param {import('fastify').FastifyInstance} app
 * @param {object} config конфигурация knex (knexfile.js)
 * @param {Function[]} models массив классов objection.js
 */
export default (app, config, models) => {
  const knexConnection = knex({
    ...config,
    ...knexSnakeCaseMappers(),
  });

  Model.knex(knexConnection);

  const objection = {
    knex: knexConnection,
    models: Object.fromEntries(
      models.map((model) => [model.name.replace(/^\w/, (c) => c.toLowerCase()), model]),
    ),
  };

  app.decorate('objection', objection);
  app.addHook('onClose', async () => {
    await knexConnection.destroy();
  });
};
