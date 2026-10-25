# AGENTS.md

Task Manager: Fastify 3 + Objection.js 3 + Knex 3 (ESM). SQLite (dev/test), PostgreSQL (prod).
Спецификация — `SPEC.md`, разбор проблем — `docs/IMPROVEMENTS.md`.

## Команды

mise — единый вход в инструменты, окружение и задачи (`mise.toml`, `mise tasks` — актуальный список):

```sh
mise install                 # node 22 + jactionlint, хук сам поставит npm-зависимости
mise run setup               # .env, миграции
mise run check               # lint + test — обязательная точка после изменений кода
mise run lint-workflows      # jactionlint по CI workflow'ам
mise run start               # dev-сервер
npx jest __tests__/tasks.test.js -t 'update'   # один тест
```

Инструменты проверок выбраны из каталога dev-guardrails
(<https://github.com/mokevnin/dev-quality-gates>) — почему эти, а не другие:
ESLint airbnb-base + Jest уже в проекте, jactionlint закрывает workflow'ы.

## Устройство (неочевидное из имён файлов)

- Сервер — ESM; модели `server/models/*.cjs` — CommonJS, не смешивать.
- `server/plugins/objection.js` включает `knexSnakeCaseMappers`: колонки БД snake_case,
  поля моделей camelCase — писать запросы, помня о маппинге.
- Данные HTML-форм приходят в `req.body.data` (схему полей задаёт
  `server/views/mixins/forms.pug`); маршруты именованные — `app.reverse('tasks')`.

## Правила (не выводимые из кода)

- Коммиты — Conventional Commits (<https://www.conventionalcommits.org/>):
  `<type>(<scope>): <subject>`, type из `feat|fix|refactor|chore|docs|test|ci`.
- Данные форм валидировать `Model.fromJson()` и писать в БД валидированный объект.
- `task.creatorId` неизменен после создания — редактирование автора не переводит.
- Схему БД менять только новыми миграциями; SQL совместим с SQLite и PostgreSQL.
  Применённые миграции не редактировать.
- `.github/workflows/hexlet-check.yml` — автогенерированный, существо правок: не менять.
- Лог сервера — через `req.log`.

## Ловушки (проверено на ошибках)

- Все запуски — через mise. Смесь системного Node и mise-Node обрывает ABI
  нативных модулей (`better-sqlite3`); при смене версии —
  `mise exec -- npm rebuild better-sqlite3`.
- Тесты/сервер стартуют только с `.env` и `SESSION_KEY` ≥ 32 символов
  (`mise run setup` создаёт из `.env.example`).
- `better-sqlite3` включает `PRAGMA foreign_keys = ON` — очистку таблиц в тестах
  (`__tests__/helpers/index.js`) делать от дочерних к родительским; in-memory БД
  требует пул из одного соединения (`knexfile.js`).
- `$query().update()` валидирует по полной jsonSchema; частичное обновление —
  `$query().patch()`. У User после `fromJson()` нет поля `password` (сеттер записал
  `passwordDigest`) — его обновление идёт через `patch()`.

## Agent skills

### Issue tracker

GitHub Issues этого репозитория (`tychkovas/backend-project-lvl4`), операции через `gh` CLI.
See `docs/agents/issue-tracker.md`.

### Triage labels

Пять стандартных лейблов (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: корневой `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.
