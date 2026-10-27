// Подмена HTTP-метода по полю _method (конвенция Rails/Laravel в HTML-формах).
import fp from 'fastify-plugin';

const ALLOWED = new Set(['head', 'put', 'delete', 'options', 'patch']);

const matchUrl = (pattern, url) => {
  const pathOnly = url.split('?')[0];
  const keys = [];
  const source = `^${pattern.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  })}$`;
  const matched = pathOnly.match(new RegExp(source));
  if (!matched) return null;
  return Object.fromEntries(keys.map((key, index) => [key, matched[index + 1]]));
};

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const runHooks = async (hooks, req, reply) => {
  await hooks.reduce(async (prev, hook) => {
    await prev;
    if (reply.sent) return undefined;
    await new Promise((resolve, reject) => {
      const maybePromise = hook(req, reply, (err) => {
        if (err) reject(err);
        else resolve();
      });
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(resolve).catch(reject);
      }
    });
    return undefined;
  }, Promise.resolve());
};

const methodOverride = fp(async (app) => {
  const routeMatchers = {};

  const handleRedirect = async (req, reply) => {
    const { url } = req.raw;
    const originalMethod = String(req.raw.method || '').toLowerCase();
    // eslint-disable-next-line no-underscore-dangle -- HTML form override field
    const method = String(req.body?._method || '').toLowerCase();
    if (originalMethod !== 'post' || !ALLOWED.has(method)) return;

    const candidates = routeMatchers[method] || [];
    const route = candidates.find(({ check }) => check(url));
    if (!route) {
      const err = new Error(`Route ${method.toUpperCase()}:${url} not found`);
      err.statusCode = 404;
      throw err;
    }

    req.params = route.check(url);
    req.raw.method = method.toUpperCase();

    await runHooks(route.hooks, req, reply);
    if (reply.sent) return;

    await route.handler(req, reply);
  };

  app.addHook('onRoute', (routeOptions) => {
    const method = String(routeOptions.method || '').toLowerCase();
    if (ALLOWED.has(method)) {
      const hooks = [
        ...asArray(routeOptions.preValidation),
        ...asArray(routeOptions.preHandler),
      ];
      routeMatchers[method] = routeMatchers[method] || [];
      routeMatchers[method].push({
        check: (requestUrl) => matchUrl(routeOptions.url, requestUrl),
        handler: routeOptions.handler,
        hooks,
      });
    }

    if (method === 'post') {
      const preHandlers = asArray(routeOptions.preHandler);
      // eslint-disable-next-line no-param-reassign
      routeOptions.preHandler = [handleRedirect, ...preHandlers];
    }
  });

  app.setNotFoundHandler({
    preHandler: async (req, reply) => {
      await handleRedirect(req, reply);
    },
  }, (req, reply) => {
    reply.code(404).send({ message: `Route ${req.method}:${req.url} not found` });
  });
}, { name: 'method-override' });

export default methodOverride;
