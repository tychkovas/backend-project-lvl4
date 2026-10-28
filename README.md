### Hexlet tests and linter status:

[![Actions Status](https://github.com/tychkovas/backend-project-lvl4/workflows/hexlet-check/badge.svg)](https://github.com/tychkovas/backend-project-lvl4/actions)
[![Node CI](https://github.com/tychkovas/backend-project-lvl4/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/tychkovas/backend-project-lvl4/actions/workflows/nodejs.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/4cbed9260a19e6d6df0a/maintainability)](https://codeclimate.com/github/tychkovas/backend-project-lvl4/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4cbed9260a19e6d6df0a/test_coverage)](https://codeclimate.com/github/tychkovas/backend-project-lvl4/test_coverage)


## Task Manager "JUST DO IT"

Веб-приложение для задач: страницы, вход и формы.

**Сайт:** http://just-do-task.duckdns.org

### Локальный запуск

Сервер слушает порт 41783, его не занимают AirPlay и панель BeAdmin. `make start` больше не используется: эта цель звала Heroku CLI.

```sh
mise run setup
npm run build
mise run start
```

Открыть http://127.0.0.1:41783

### Публикация

Сервер — бесплатный web service на Render: деплой из GitHub, Node 24, без карты. Без запросов сервис засыпает через 15 минут и просыпается примерно за минуту. База — бесплатный PostgreSQL на Neon. Файл SQLite на такой машине не переживает перезапуск, а бесплатный Postgres на Render удаляется через 30 дней.

1. На [neon.tech](https://neon.tech) создать проект и скопировать connection string.
2. На [render.com](https://render.com) подключить этот GitHub-репозиторий. Сборку и старт задаёт `render.yaml`.
3. В окружении сервиса задать `DATABASE_URL` (строка из Neon) и `SESSION_KEY` (не короче 32 символов).
4. Дождаться деплоя. Публичный адрес будет на `onrender.com`.
