# Инструкции агенту (AGENTS.md)

Task Manager: Fastify 3 + Knex 3 + Objection.js 3 (ESM). Спецификация — `SPEC.md`,
аудит проблем и план улучшений — `docs/IMPROVEMENTS.md`.

## Окружение

- Node ≥ 20. БД: SQLite (`better-sqlite3`) в dev/test, PostgreSQL в prod.
- Без `.env` приложение и тесты не стартуют: `cp -n .env.example .env`.
  Обязательная переменная — `SESSION_KEY` (≥ 32 символа); `DATABASE_URL` и
  токен Rollbar нужны только в prod.
- Dev-БД — файл `database.sqlite` в корне (gitignored), создаётся миграциями.
- `.npmrc` задаёт `--experimental-vm-modules` — нужно Jest с ESM, не удалять.

## Команды

```sh
make setup          # install + .env + миграции
make start-backend  # nodemon (следит за server/, webpack.config.js, locales/)
make lint           # eslint
npm test            # все тесты (jest --runInBand)
npx jest __tests__/tasks.test.js --runInBand   # один файл
npx jest -t 'update'                            # один тест по имени
npx knex migrate:latest / migrate:rollback      # миграции
```

После любых изменений кода: `make lint` и `npm test` — оба зелёные.

## Архитектура и границы

- Модули сервера — ESM; модели `server/models/*.cjs` — CommonJS, не смешивать.
- Инициализация knex+objection — `server/plugins/objection.js`
  (включая `knexSnakeCaseMappers`: колонки snake_case ↔ поля моделей camelCase).
- Маршруты именованные (`app.reverse('tasks')`), файл на сущность в `server/routes/`,
  регистрация в `routes/index.js`.
- Формы генерирует `server/views/mixins/forms.pug` — имена полей вида `data[<prop>]`,
  поэтому на сервере данные приходят в `req.body.data`.
- Прогон БД в тестах: `:memory:`, пул из 1 соединения (`knexfile.js`).

## Правила кода

- Данные форм валидировать через `Model.fromJson()`; в БД писать валидированный
  объект, не сырой `req.body.data`.
- `task.creatorId` не перезаписывается при редактировании (автор неизменен).
- Схемы БД менять только новыми миграциями; SQL должен работать и на SQLite,
  и на PostgreSQL. Применённые миграции не редактировать.
- `.github/workflows/hexlet-check.yml` — сгенерирован автоматически, не трогать.
- Стиль airbnb-base + jest; в коде сервера логировать через `req.log`.

## Ловушки (проверено на ошибках)

- `better-sqlite3` включает `PRAGMA foreign_keys = ON`: truncate/delete в тестах —
  от дочерних таблиц к родительским (см. `__tests__/helpers/index.js`).
- `$query().update()` валидирует по полной jsonSchema; для частичного обновления —
  `$query().patch()`. После `fromJson()` у User нет поля `password` — сеттер уже
  записал `passwordDigest`.
- Логика jest в `__tests__/helpers/` исключена из обнаружения тестов
  (`modulePathIgnorePatterns`), фикстуры — в `__fixtures__/`.
- Тесты логина возвращают cookie через хелпер `getCookie(response)` — инъекции
  без cookie ловят редирект вместо 200.
