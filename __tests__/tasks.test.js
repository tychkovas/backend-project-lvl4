import i18next from 'i18next';
import getApp from '../server/index.js';
import {
  getTestData,
  prepareData,
  getCookie,
  signIn,
  getIdInstanceFromModel,
  getFlashMessage,
  typesFashMessage as flash,
} from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();
  let cookie;

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

    const responseSignIn = await signIn(app, testData.users.existing);
    cookie = getCookie(responseSignIn);
  });

  it('index authorized', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks',
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
    // 'Вы залогинены'
    expect(response.body).toContain('<div class="alert alert-success">Вы залогинены</div>');
    expect(response.body).toContain(i18next.t('flash.session.create.success'));
  });

  it('index not authorized', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(app.reverse('root'));

    // провека наличия флэш-сообщения
    const responseRedirect = await app.inject({
      method: 'GET',
      url: response.headers.location,
      cookies: getCookie(response),
    });

    // Доступ запрещён!
    expect(responseRedirect.body).toContain(i18next.t('flash.authError'));
    expect(responseRedirect.body)
      .toContain('<div class="alert alert-danger">Доступ запрещён! Пожалуйста, авторизируйтесь.</div>');
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('show', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('showTask', { id: 1 }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  describe('create', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it('should by successful', async () => {
      const params = testData.tasks.new.data;
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        payload: { data: params },
        cookies: cookie,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(app.reverse('tasks'));

      const expected = {
        ...params,
        statusId: Number(params.statusId),
        executorId: Number(params.executorId),
      };
      const task = await models.task.query()
        .findOne({ name: params.name });

      expect(task).toMatchObject(expected);

      // провека наличия флэш-сообщения
      const responseRedirect = await app.inject({
        method: 'GET',
        url: app.reverse('statuses'),
        cookies: getCookie(response),
      });
      expect(responseRedirect.statusCode).toBe(200);
      // ' успешно создан'
      expect(responseRedirect.body).toContain(i18next.t('flash.tasks.create.success'));
      expect(responseRedirect.body).toContain('<div class="alert alert-info">Задача успешно создана</div>');
    });
  });

  describe('update', () => {
    it('should by successful', async () => {
      const paramsExixttingTask = testData.tasks.existing.data;
      const id = await getIdInstanceFromModel(models.task, paramsExixttingTask);

      const responseEditTask = await app.inject({
        method: 'GET',
        url: app.reverse('createTask', { id }),
        cookies: cookie,
      });

      expect(responseEditTask.statusCode).toBe(200);

      const paramsUpdated = testData.tasks.updated.data;

      const response = await app.inject({
        method: 'PATCH',
        url: app.reverse('updateTask', { id }),
        payload: {
          data: paramsUpdated,
        },
        cookies: cookie,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(app.reverse('tasks'));

      const expected = paramsUpdated;

      const task = await models.task.query()
        .findOne({ name: paramsUpdated.name });
      expect(task).toMatchObject(expected);

      const nonExistingTask = await models.task.query()
        .findOne({ name: paramsExixttingTask.name });
      expect(nonExistingTask).toBeUndefined();

      cookie = getCookie(response);

      const responseRedirect = await app.inject({
        method: 'GET',
        url: app.reverse('tasks'),
        cookies: cookie,
      });
      expect(responseRedirect.statusCode).toBe(200);

      expect(responseRedirect.body).toContain(i18next.t('flash.tasks.edit.success'));
      expect(responseRedirect.body).toContain(getFlashMessage(flash.info, 'flash.tasks.edit.success'));
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => app.close());
});
