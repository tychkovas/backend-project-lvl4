# Агентная поверхность этапа: CI-агенты и настройки, без API

Эталон поведения — `tychkovas/ai-for-developers-project-387`. В проекте агентный CI на Cursor CLI: workflow'ы `cursor.yml` (отклик на `/oc`, `/opencode`, `/cursor`, `/cu` в issues и PR), `cursor-review.yml`, `cursor-triage.yml`, модель `composer-2.5`; скрипты проверки Conventional Commits; `pr-title.yml`. Порядок: агентная настройка идёт ПЕРВЫМ PR, чтобы CI-агент мог ревьюить последующие PRы апгрейда стека. Языковая политика: ответы агента и UI на русском, commit subject / PR title — английский Conventional Commits.

Явно НЕ делаем на этом этапе (отложено в issues): JSON API `/api/v1` + OpenAPI-спека + MCP-сервер, `skills-lock.json` (скиллы остаются вендоренными), scheduled-проход агента.

## Consequences

- Нужен секрет в GitHub: `CURSOR_API_KEY`.
- `mise run lint-workflows` расширяется на все workflow'ы, кроме автогенерированного `hexlet-check.yml`.
