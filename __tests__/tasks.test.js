import i18next from 'i18next';
import getApp from '../server/index.js';
import {
  getTestData,
  prepareData,
} from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  // let models;
  const testData = getTestData();
  let cookie;

  const signIn = async (params) => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: { data: params },
    });

    return response;
  };

  const getCookie = (response) => {
    const [sessionCookie] = response.cookies;
    expect(sessionCookie).toBeDefined();
    const { name, value } = sessionCookie;
    return { [name]: value };
  };

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    // models = app.objection.models;
  });

  beforeEach(async () => {
    // тесты не зависят друг от труга
    // выполняем миграции
    await knex.migrate.latest();
    await prepareData(app);

    const responseSignIn = await signIn(testData.users.existing);
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
});