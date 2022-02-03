// @ts-check

import _ from 'lodash';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  const signIn = async (params) => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: { data: params },
    });

    expect(response.statusCode).toBe(302);

    return response;
  };

  const getCookie = (response) => {
    const [sessionCookie] = response.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    return cookie;
  };

  const getIdExistingUser = async (params) => {
    const existingUser = await models.user.query().findOne({ email: params.email });
    expect(existingUser).toBeDefined();
    return existingUser?.id;
  };

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  describe('update', () => {
    it('U success', async () => {
      const paramsExistingUserToUpdate = testData.users.existing;
      const cookie = getCookie(await signIn(paramsExistingUserToUpdate));
      const id = await getIdExistingUser(paramsExistingUserToUpdate);

      const paramsUpdated = testData.users.updated;
      const response = await app.inject({
        method: 'PATCH',
        // url: app.reverse('updateUser'),
        url: `/users/${id}`,
        payload: {
          data: paramsUpdated,
        },
        cookies: cookie,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(app.reverse('users'));

      const expected = {
        ..._.omit(paramsUpdated, 'password'),
        passwordDigest: encrypt(paramsUpdated.password),
      };
      const user = await models.user.query()
        .findOne({ email: paramsUpdated.email });
      expect(user).toMatchObject(expected);

      const nonEistentUser = await models.user.query()
        .findOne({ email: paramsExistingUserToUpdate.email });
      expect(nonEistentUser).toBeUndefined();

      const responseRedirect = await app.inject({
        method: 'GET',
        url: app.reverse('users'),
        cookies: getCookie(response),
      });
      expect(responseRedirect.statusCode).toBe(200);
    });

    it('U fail', async () => {
      const responseOpen = await app.inject({
        method: 'GET',
        url: app.reverse('users'),
      });

      expect(responseOpen.statusCode).toBe(200);
      const cookie = getCookie(responseOpen);

      const paramsExistingUserToUpdate = testData.users.existing;
      const id = await getIdExistingUser(paramsExistingUserToUpdate);

      const paramsUpdated = testData.users.updated;
      const response = await app.inject({
        method: 'PATCH',
        // url: app.reverse('updateUser'),
        url: `/users/${id}`,
        payload: {
          data: paramsUpdated,
        },
        cookies: cookie,
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe(app.reverse('users'));

      const expected = {
        ..._.omit(paramsExistingUserToUpdate, 'password'),
        passwordDigest: encrypt(paramsExistingUserToUpdate.password),
      };
      const user = await models.user.query()
        .findOne({ email: paramsExistingUserToUpdate.email });
      expect(user).toMatchObject(expected);

      const nonEistentUser = await models.user.query()
        .findOne({ email: paramsUpdated.email });
      expect(nonEistentUser).toBeUndefined();
    });
  });

  it('delete', async () => {
    const paramsExistingUserToUpdate = testData.users.existing;
    const cookie = getCookie(await signIn(paramsExistingUserToUpdate));
    const id = await getIdExistingUser(paramsExistingUserToUpdate);

    const response = await app.inject({
      method: 'DELETE',
      // url: app.reverse('updateUser'),
      url: `/users/${id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(app.reverse('users'));

    const nonEistentUser = await models.user.query()
      .findOne({ email: paramsExistingUserToUpdate.email });
    expect(nonEistentUser).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
