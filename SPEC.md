# Спецификация: Task Manager «JUST DO IT»

Учебный проект Hexlet (backend-project-lvl4) — менеджер задач с полной авторизацией,
CRUD по сущностям и фильтрацией.

## Стек

| Слой      | Технологии |
|-----------|------------|
| Сервер    | Node.js ≥ 24, Fastify 5, ESM |
| БД / ORM  | Knex 3 + Objection.js 3; SQLite (dev/test, better-sqlite3), PostgreSQL (prod) |
| Auth      | @fastify/passport 4.x + @fastify/secure-session (собственная FormStrategy) |
| UI        | Pug (SSR), Bootstrap 5, webpack 5 |
| Качество  | Jest, ESLint 9 (airbnb-extended, flat config), GitHub Actions, Code Climate, Rollbar |

## Структура

```
server/
  index.js            — сборка приложения (плагины, сессии, views, статика)
  bin/server.js       — точка входа
  plugins/objection.js — инициализация knex + objection (замена fastify-objectionjs)
  routes/             — users, tasks, labels, taskStatuses, session, welcome
  models/             — User, Task, TaskStatus, Label (BaseModel, .cjs)
  migrations/         — knex-миграции (SQLite-совместимые)
  views/              — Pug-шаблоны (+ mixins/forms.pug)
  helpers/            — view-helpers (t(), route(), formatDate, getAlertClass)
src/                  — фронтенд-ассеты (webpack, cover.css)
__tests__/            — интеграционные тесты на app.inject (jest)
__fixtures__/         — тестовые данные
```

## Сущности и связи

- **User** (email, firstName, lastName, passwordDigest) — creator/executor задач.
- **TaskStatus** (name, unique) — статус задачи; HasMany Task.
- **Label** (name, unique) — ManyToMany Task через `tasks_labels`.
- **Task** (name, description, statusId, creatorId, executorId) —
  BelongsTo status/creator/executor; ManyToMany labels.

Правила домена:
- `creatorId` назначается при создании и **не меняется** при редактировании.
- Удалять можно только свои задачи; удалять пользователя со связанными задачами нельзя.
- Status/Label с привязанными задачами удалить нельзя.
- Редактировать профиль может только его владелец.

## Ключевые маршруты

`/` welcome · `/users` CRUD · `/session` вход/выход · `/statuses` CRUD ·
`/labels` CRUD · `/tasks` CRUD + фильтры (status/executor/creator/label + «мои задачи»).

## Конфигурация

`.env`: `SESSION_KEY` (обязателен, ≥32 символа), `DATABASE_URL` (prod),
`POST_SERVER_ITEM_ACCESS_TOKEN` (Rollbar), `NODE_ENV`, `FASTIFY_DEBUG`.
Копия: `.env.example`. Конфиги БД — `knexfile.js` (development / test / production).

## Команды

```sh
mise install           # инструменты (node 24, jactionlint) + npm-зависимости
mise run setup         # .env + миграции
mise run check         # lint + test (mise run lint / mise run test по отдельности)
mise run start         # dev-сервер
mise run migrate       # npx knex migrate:latest
# Makefile продублирован: make setup / make start / make lint / make test
```

## Поведение при ошибках

Формы валидируются через `Model.fromJson()` (jsonSchema + objection-unique);
ошибки отображаются в форме (`errors.data`), критические — flash-сообщение + редирект.
В prod ошибки уходят в Rollbar, в dev — fastify-error-page.
