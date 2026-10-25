---
name: Project Base
description: Базовая информация о проекте Task Manager (стек, структура, окружение, команды) — загружай перед любой работой с кодом
---

# Базовый скилл: обзор проекта

Перед работой прочитай `SPEC.md` (спецификация) и `AGENTS.md` (правила и ловушки).

## Стек (кратко)

- Node ≥ 20, ESM, Fastify 3, Pug (SSR), Bootstrap 5, webpack 5.
- Knex 3 + Objection.js 3; БД: SQLite (`better-sqlite3`) в dev/test, PostgreSQL в prod.
- Auth: fastify-passport + fastify-secure-session, собственная FormStrategy.
- Тесты: Jest (интеграционные, `app.inject`), фикстуры в `__fixtures__/`.

## Карта кода

- `server/index.js` — сборка приложения; `server/plugins/objection.js` — knex+objection.
- `server/routes/<сущность>.js` — контроллеры; имена маршрутов через `app.reverse(name)`.
- `server/models/*.cjs` — User, Task, TaskStatus, Label (+ jsonSchema, objection-unique).
- `server/migrations/` — knex-миграции; `knexfile.js` — конфиги БД по окружениям.
- `server/views/mixins/forms.pug` — генерация форм (`data[<prop>]`).

## Окружение и команды

```sh
cp -n .env.example .env   # SESSION_KEY обязателен для старта
make setup                # install + .env + миграции
make start-backend        # dev-сервер (nodemon)
make lint                 # проверка стиля
npm test                  # тесты (должны быть зелёными)
```

## Проверка после любых изменений

1. `make lint` — без ошибок.
2. `npm test` — все тесты проходят.
3. Если менялась схема БД — миграция должна работать и на SQLite, и на PostgreSQL.
