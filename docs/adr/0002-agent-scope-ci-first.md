# Агентная поверхность этапа: CI-агенты и настройки, без API

Эталон — `tychkovas/ai-for-developers-project-387`. В проект переносим агентные элементы с этого репозитория: workflow'ы `opencode.yml` (отклик на `/oc`, `/opencode` в issues и PR), `opencode-review.yml`, `opencode-triage.yml` с моделью `opencode/glm-5.3-flash`; скрипты нормализации коммитов бота и проверки Conventional Commits; `pr-title.yml`. Порядок: агентная настройка идёт ПЕРВЫМ PR, чтобы CI-агент мог ревьюить последующие PRы апгрейда стека. Языковая политика: ответы агента и UI на русском, commit subject / PR title — английский Conventional Commits.

Явно НЕ делаем на этом этапе (отложено в issues): JSON API `/api/v1` + OpenAPI-спека + MCP-сервер, `skills-lock.json` (скиллы остаются вендоренными), `opencode-scheduled.yml`.

## Consequences

- Нужны секреты в GitHub: `OPENCODE_API_KEY` (и `RENDER_API_KEY` для уже настроенного Render MCP).
- `mise run lint-workflows` расширяется на все workflow'ы, кроме автогенерированного `hexlet-check.yml`.
