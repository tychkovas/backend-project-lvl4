import getApp from '../server/index.js';
import models from '../server/models/index.js';
import {
  getTestData,
  prepareData,
} from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  // eslint-disable-next-line no-unused-vars
  const testData = getTestData();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    // тесты не зависят друг от труга
    // выполняем миграции
    await knex.migrate.latest();
    await prepareData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses',
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
    });

    expect(response.statusCode).toBe(200);
  });

  describe('create', () => {
    it('should by successful', async () => {
      const params = { name: 'new status' }; // todo
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('statuses'),
        payload: { data: params },
      });

      expect(response.statusCode).toBe(302);

      const expected = params;
      const status = await models.taskStatus.query()
        .findOne({ name: params.name });

      expect(status).toMatchObject(expected);
    });
  });
});
