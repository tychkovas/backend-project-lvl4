import getApp from '../server/index.js';
import {
  getTestData,
  prepareData,
} from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  const getIdExistingField = async (table, params) => {
    const existingInstance = await table.query().findOne(params);
    expect(existingInstance).toBeDefined();
    return existingInstance?.id;
  };

  const getIdInstance = async (table, params) => {
    const instance = await models[table].query().findOne(params);
    expect(instance).toBeDefined();
    return instance?.id;
  };

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

  describe('update', () => {
    it('should by successful', async () => {
      const paramsExistingStatus = testData.taskStatuses.existing;

      const id = await getIdExistingField(models.taskStatus, { name: paramsExistingStatus.name });

      const responseEditStatus = await app.inject({
        method: 'GET',
        url: `/statuses/${id}/edit`,
        // cookies: cookie,
      });

      expect(responseEditStatus.statusCode).toBe(200);

      const paramsUpdated = testData.taskStatuses.updated;
      const response = await app.inject({
        method: 'PATCH',
        url: `/statuses/${id}`,
        payload: {
          data: paramsUpdated,
        },
        // cookies: cookie,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(app.reverse('statuses'));

      const expected = paramsUpdated;

      const status = await models.taskStatus.query()
        .findOne({ name: paramsUpdated.name });
      expect(status).toMatchObject(expected);

      const nonExistingStatus = await models.taskStatus.query()
        .findOne({ name: paramsExistingStatus.name });
      expect(nonExistingStatus).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should by successful', async () => {
      const paramsExistingStatus = testData.taskStatuses.existing;
      const id = await getIdInstance('taskStatus', paramsExistingStatus);

      const response = await app.inject({
        method: 'DELETE',
        url: `/statuses/${id}`,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(app.reverse('statuses'));

      const nonExistentStatus = await models.taskStatus.query()
        .findOne(paramsExistingStatus);
      expect(nonExistentStatus).toBeUndefined();
    });
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => app.close());
});
