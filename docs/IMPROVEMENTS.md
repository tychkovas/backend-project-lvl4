# Аудит проекта и стратегии улучшения

Дата: 2026-10-25. Состояние: сборка и тесты зелёные (38/38), линт чистый.

## Критические ошибки (исправлены)

### 1. Проект не собирался на современном Node
- Симптом: `npm install` падал — `sqlite3@5.x` / `@vscode/sqlite3@5.x` не компилируются
  (node-gyp + Python 3.12 без `distutils`); `engines: node 16.x` — EOL.
- Решение: заменены оба пакета на `better-sqlite3@12` (есть пребилды);
  `knex` 1 → 3 (требование `objection@3.9`); `engines: >=20`.
- `knexfile.js`: `client: 'better-sqlite3'`, для test — `connection.filename: ':memory:'`
  и `pool: { min: 1, max: 1 }` (единое in-memory-соединение).

### 2. fastify-objectionjs не поддерживает better-sqlite3
- Плагин имел whitelist клиентов (pg/sqlite3/mysql...).
- Решение: собственный `server/plugins/objection.js` — та же инициализация
  (включая `knexSnakeCaseMappers`!), без whitelist. Пакет удалён из зависимостей.
- Ссылка на плагин в схеме snake_case ↔ camelCase критична для моделей.

### 3. FK-ограничения в тестах
- better-sqlite3 включает `PRAGMA foreign_keys = ON` → `removeData` падал.
- Решение: очистка таблиц в порядке зависимостей (tasks_labels → tasks → labels → statuses → users).

### 4. Баги флоу обновления (PATCH) — главный аудит-фокус
- **tasks**: `data.creatorId = session.userId` затирал автора задачи при каждом
  редактировании (в тестах не ловилось: в фикстурах редактирующий == создатель).
  Теперь `creatorId` берётся из БД и не перезаписывается.
- **users/labels/statuses**: `update(req.body.data)` записывал сырые данные,
  минуя валидацию. Теперь — валидация `fromJson()` → обновление валидированным
  объектом; для User — `patch()` (обязательное поле `password` уже превращено
  сеттером в `passwordDigest`, полная схема `update()` его требует).
- **tasks/users/labels/statuses**: `findById()` без проверки на undefined →
  TypeError при 404. Добавлены проверки существования.
- Паттерн update (эталон): `fromJson(подготовленные данные)` → `findById` + guard →
  `$query().update/patch(валидированный объект)`; связи — в транзакции.

### 5. Прочее (исправлено попутно)
- debug-мусор в `server/index.js` (`console.debug('-! ...')`, двойной `dotenv.config()`).
- `Object.entries(tasks)` для итерации по массиву в логах — заменено на корректную логику где попадалось.
- Незакрытый пул knex при `app.close()` — onClose-хук в новом плагине.

## Стратегии дальнейшего улучшения (не критично, по приоритету)

1. **Deprecations**: `skipUndefined()` устарел (objection 4 его удалит) — заменить
   на `where` с условными билдерами. Fastify 3 → 5, старые плагины (point-of-view,
   fastify-static и др.) поднять мажорно.
2. **N+1 в GET /tasks**: `withGraphJoined` уже даст join одним запросом —
   убрать цикл `$fetchGraph` и `where('labelId', label)` уточнить до `labels.id`.
3. **Унификация catch-блоков**: декомпозиция `{ data }` теряет стек; маршрутам
   не хватает единого хелпера ответов (404 vs flash vs re-render).
4. **Безопасность**: `SESSION_KEY` в .env — ок, но стоит включить `cookie.secure`
   и `httpOnly` явно; `rollbar.enabled: true` при отсутствии токена — сделать
   зависимым от наличия переменной.
5. **Node CI**: `setup-node@v1` + Node 17 → v4 + Node 20/22 matrix.
6. **Тесты**: update-флоу редактирования чужой задачи не покрыт тестом
   (фикстуры маскируют баг с автором — фикс подтверждён логикой фикстур).
7. **README**: рабочая ссылка Heroku неактуальна; актуализировать при деплое.
