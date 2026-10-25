# Обновление стека до Fastify 5 в рамке «работает > идеально»

Проект был на Fastify 3 с устаревшим окружением (Node 20 близок к EOL, eslintrc, Jest 27). Решили обновляться поэтапно, слоями, каждый зелёный на `mise run check`, рамка этапа — минимальный рабочий вариант, а не идеал: обновляем то, что нужно для актуального работающего стека (Fastify 5 + scoped `@fastify/*`, Node 24 LTS, Jest 30, ESLint 9 + `eslint-config-airbnb-extended` flat-config), а рискованные мажоры без функционального выигрыша выносим в отложенные issues (objection 4, i18next 26, Node 26, rollbar/faker — по остаточному принципу).

## Considered Options

- Полный переезд всего сразу — отвергнуто: риск слоиться на риск, противоречит рамке этапа.
- Только критичное (Fastify 5) — отвергнуто: цель «актуальная версия технологий», ESLint 8 и Jest 27 при этом остаются на мёртвых мажорах.

## Consequences

- `@fastify/secure-session` тянет нативный `sodium-native` — все сборки через mise, при смене Node rebuild нативных модулей.
- Мёртвые плагины `fastify-method-override`, `fastify-reverse-routes`, `fastify-error-page` не имеют живых аналогов в npm (проверено) — первые два закрываем собственными мини-плагинами (`_method`-хук по конвенции Rails/Laravel, карта именованных маршрутов), третий заменяем штатным `setErrorHandler`.
- ESLint 10 не берём: живой носитель airbnb-стиля (`airbnb-extended`) поддерживает только 9.
