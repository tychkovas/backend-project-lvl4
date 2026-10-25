# План: обновление стека + агентная настройка

Согласован 2026-10-26 (сессия grill-with-docs). Рамка этапа: **работает > идеально** — минимальный рабочий вариант, не вылизываем. Критерий готовности каждого слоя: `mise run check` зелёный. Решения зафиксированы в `docs/adr/0001`, `docs/adr/0002`, термины — в `GLOSSARY.md`.

## PR-1 — агентная настройка (идёт ПЕРВЫМ, до апгрейда стека)

Чтобы CI-агент мог ревьюить последующие PRы апгрейда. Эталон переноса — `tychkovas/ai-for-developers-project-387` (агентные элементы и настройки, не реализация).

- `.github/workflows/`:
  - `opencode.yml` — отклик на `/oc`, `/opencode` в issues и PR-комментариях; модель `opencode/glm-5.3-flash`; ответы агента на русском; шаг нормализации коммитов.
  - `opencode-review.yml` — авто-ревью PR.
  - `opencode-triage.yml` — авто-триаж issues (по `docs/agents/triage-labels.md`).
  - `pr-title.yml` — заголовок PR: английский Conventional Commits без кириллицы.
- `scripts/`: `normalize-opencode-commit.mjs` (авто-коммиты бота → `chore: apply opencode agent changes (#N)`), `check-commit-subjects.mjs` (+ тест конвенций коммитов) — адаптация из эталона.
- `AGENTS.md`: новое правило «Используй готовые решения: прежде чем писать свои плагины, хуки или утилиты, сначала ищи готовое поддерживаемое решение в npm и предпочитай его»; правило английских commit subject; секция про агентный CI.
- `mise.toml`: задача `lint-workflows` расширяется на `.github/workflows/*.yml`.
- Ручной шаг пользователя: секрет `OPENCODE_API_KEY` в репозитории (`RENDER_API_KEY` — для уже настроенного Render MCP в `opencode.json`).

Явно НЕ делаем на этом этапе: JSON API `/api/v1` + OpenAPI + MCP-сервер; `skills-lock.json` (скиллы остаются вендоренными); `opencode-scheduled.yml`. Всё это — отложенные issues.

## Отложенные issues (завести после подтверждения старта)

1. objection 3 → 4 (4.4.0, требует knex ^3.3) — риск без функционального выигрыша сейчас.
2. i18next 21 → 26 — пять мажоров, не блокирует ничего.
3. JSON API `/api/v1` + `@fastify/swagger` — агентная машинная поверхность; фундамент для MCP.
4. MCP-сервер поверх задач — внешний агентский доступ.
5. `skills-lock.json` — пинн скиллов с GitHub по хэшам вместо копий.
6. `opencode-scheduled.yml` — ночной проход агента.
7. Node 26 → LTS (с 2026-10-28) — вернуться, когда нативные модули (sodium-native, better-sqlite3) дозреют.
8. rollbar 2 → 4, @faker-js/faker 6 → 10 — по остаточному принципу.

## Слои апгрейда стека (PR по слоям, следующий только после зелёного текущего)

1. **Node 24 LTS**: пинн в `mise.toml` (22.23.4 → 24.x), `engines`, `mise exec -- npm rebuild better-sqlite3`.
2. **ESLint 9 + flat config**: `eslint-config-airbnb-base` (мёртв для ≥9) → `eslint-config-airbnb-extended`; `.eslintrc.yml` → `eslint.config.js`. ESLint 10 не берём — extended поддерживает только 9.
3. **Jest 30**: `jest`, `jest-cli`, `@jest/globals`, `@types/jest` 27 → 30.
4. **Fastify 5** (самый большой слой):
   - scoped-преемники: `fastify-formbody`→`@fastify/formbody`, `fastify-static`→`@fastify/static`, `fastify-sensible`→`@fastify/sensible`, `fastify-secure-session`→`@fastify/secure-session` (тянет нативный `sodium-native` + `@fastify/cookie`), `fastify-flash`→`@fastify/flash`, `point-of-view`→`@fastify/view`, `fastify-passport`→`@fastify/passport` (4.x, бета, живая; API переименован vs 0.5).
   - мёртвые без аналогов (проверено в npm) — свои мини-решения: `_method`-хук (конвенция Rails/Laravel; сохраняет 10 Pug-шаблонов), микро-плагин `app.reverse` (сохраняет ~100 вызовов — конвенция проекта), `setErrorHandler` + Pug-шаблон ошибки вместо `fastify-error-page`.
5. **Инструменты фронтенд-сборки и dev-мелочь**: `webpack-cli` 4 → 7, `webpack-dev-server` 3 → 6, `nodemon` 2 → 3, `pino-pretty` 7 → 13, миноры `pg`/`qs`/`pug`/`webpack`, `better-sqlite3` 12 → 13 (требует node ≥22).

## Не трогаем

- `.github/workflows/hexlet-check.yml` — автогенерированный (существо правок — не менять).
- Применённые миграции; схема БД — только новые миграции.
