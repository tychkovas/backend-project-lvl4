// Именованные маршруты: app.reverse(name, params) — конвенция проекта.
import fp from 'fastify-plugin';

const compile = (url) => (params = {}) => url.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
  if (params[key] === undefined || params[key] === null) {
    throw new Error(`Missing param "${key}" for route ${url}`);
  }
  return encodeURIComponent(String(params[key]));
});

const reverseRoutes = fp((app, _opts, done) => {
  const routes = new Map();

  app.decorate('reverse', (name, params) => {
    const toPath = routes.get(name);
    if (!toPath) {
      throw new Error(`Route with name ${name} is not registered`);
    }
    return toPath(params);
  });

  app.addHook('onRoute', (routeOptions) => {
    if (!routeOptions.name) return;
    // Fastify дублирует GET как HEAD с тем же name — оставляем первую запись.
    if (routes.has(routeOptions.name)) return;
    routes.set(routeOptions.name, compile(routeOptions.url));
  });

  done();
}, { name: 'reverse-routes' });

export default reverseRoutes;
