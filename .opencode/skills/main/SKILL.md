---
name: Project Main
description: Основной рабочий процесс изменений в Task Manager — исправление багов, фичи, миграции, паттерн update, проверка и коммит
---

# Основной скилл: процесс изменений

## Порядок работы

1. Прочитай `SPEC.md`, `AGENTS.md` и релевантный маршрут в `server/routes/`.
2. Воспроизведи проблему (тест/скрипт/лог) перед правкой, если применимо.
3. Внеси минимальное изменение.
4. `mise run check` — зелёные lint и тесты.
5. Осмысленный коммит: `fix(routes): ...`, `feat(models): ...`, `refactor(...)`.

## Эталонный паттерн update (PATCH)

Единый подход для всех сущностей (см. `server/routes/tasks.js`):

```js
const existing = await models.<entity>.query().findById(id);
if (!existing) throw new Error('<Entity> not defined'); // guard от undefined

const payload = <подготовленные данные>;                 // преобразования типов
const validated = await models.<entity>.fromJson(payload); // валидация jsonSchema

await validated/existing.$query()
  .update(validated)          // полная схема подходит
  .patch(validated)           // частичное обновление (User: нет password после fromJson)
```

Правила:

- Никогда не писать сырой `req.body.data` в `update()` — только валидированный объект.
- `task.creatorId` не перезаписывается при редактировании (автор неизменен).
- Связи (labels у задачи) менять в транзакции: `unrelate()` → `relate()`.
- Catch: flash-сообщение + re-render формы с `errors: err.data`.

## Миграции

- Только через `server/migrations/` (`npx knex migrate:latest`).
- SQL должен быть совместим с SQLite и PostgreSQL (без `ALTER ... ADD COLUMN IF NOT EXISTS` и т.п.).
- Не редактировать уже применённые миграции — только новая миграция.

## Деплой/окружения

- `development` / `test` — better-sqlite3 (`:memory:` для тестов, пул из 1 соединения).
- `production` — pg по `DATABASE_URL`.
- Порядок очистки таблиц в тестах: дочерние раньше родительских (FK включены).

## Типичные задачи

| Задача | Где |
|--------|-----|
| Новый маршрут | `server/routes/<entity>.js` + регистрация в `routes/index.js` + имя маршрута |
| Новое поле модели | миграция + jsonSchema в `server/models/<Entity>.cjs` + форма во views |
| Флэш-сообщения | `server/locales/ru.js`, `en.js` |
| Фильтр списка | query-параметры + `skipUndefined`-паттерн в GET-роуте |
