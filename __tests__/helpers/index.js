// @ts-check

import fs from 'fs';
import path from 'path';
import faker from '@faker-js/faker';
import i18next from 'i18next';

const getFixturePath = (filename) => path.join(__dirname, '..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;

  // получаем данные из фикстур и заполняем БД
  await knex('users').insert(getFixtureData('users.json'));
  await knex('task_statuses').insert(getFixtureData('task_statuses.json'));
  await knex('tasks').insert(getFixtureData('tasks.json'));
};

export const getNewFakerUser = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
});

export const getCookie = (response) => {
  const [sessionCookie] = response.cookies;
  expect(sessionCookie).toBeDefined();
  const { name, value } = sessionCookie;
  return { [name]: value };
};

export const signIn = async (app, params) => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('session'),
    payload: { data: params },
  });

  return response;
};

// const id = await getIdInstanceFromModel(models.table, { params, ... });
export const getIdInstanceFromModel = async (modelTable, paramsInstance) => {
  const instance = await modelTable.query().findOne(paramsInstance);
  expect(instance).toBeDefined();
  return instance?.id;
};

export const typesFashMessage = {
  info: 'info',
  danger: 'danger',
  success: 'success',
};

export const getFlashMessage = (type = typesFashMessage.info, message) => `<div class="alert alert-${type}">${i18next.t(message)}</div>`;
