// @ts-check

import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastifyFormbody from '@fastify/formbody';
import fastifySecureSession from '@fastify/secure-session';
import fastifyPassport from '@fastify/passport';
import fastifySensible from '@fastify/sensible';
import qs from 'qs';
import Pug from 'pug';
import i18next from 'i18next';
import Rollbar from 'rollbar';
import setupObjection from './plugins/objection.js';
import reverseRoutes from './plugins/reverse-routes.js';
import methodOverride from './plugins/method-override.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

import addRoutes from './routes/index.js';
import getHelpers from './helpers/index.js';
import * as knexConfig from '../knexfile.js';
import models from './models/index.js';
import FormStrategy from './lib/passportStrategies/FormStrategy.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

dotenv.config();
const mode = process.env.NODE_ENV || 'development';
const logLevel = process.env.FASTIFY_DEBUG || 'info';
const isProduction = mode === 'production';
const isDevelopment = mode === 'development';

const setUpViews = (app) => {
  const helpers = getHelpers(app);
  app.register(fastifyView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `/assets/${filename}`,
    },
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = path.join(__dirname, '..', 'dist');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const setupLocalization = async () => {
  await i18next
    .init({
      lng: 'ru',
      fallbackLng: 'en',
      debug: isDevelopment,
      resources: {
        en,
        ru,
      },
    });
};

const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};

// include and initialize the rollbar library with your access token
const rollbar = new Rollbar({
  accessToken: process.env.POST_SERVER_ITEM_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: true,
});

const setErrorHandler = (app) => {
  if (!isProduction) console.info('ErrorHandler: Error-tracking start!');
  if (isProduction) rollbar.log('Error-tracking start!');
  app.setErrorHandler(async (error, request, reply) => {
    if (!isProduction) console.info(`ErrorHandler:${error}`);
    if (isProduction) rollbar.error(`Error:${error}`, request);

    const statusCode = error.statusCode || 500;
    reply.status(statusCode);

    if (!isProduction && reply.getHeader('content-type') !== 'application/json') {
      try {
        return await reply.view('error', {
          statusCode,
          message: error.message,
          stack: error.stack,
        });
      } catch {
        // шаблон ещё не готов на раннем старте — падаем в JSON ниже
      }
    }

    return reply.send({ ok: false, message: error.message });
  });
};

const registerPlugins = (app) => {
  app.register(fastifySensible);
  app.register(reverseRoutes);
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifySecureSession, {
    secret: process.env.SESSION_KEY,
    cookie: {
      path: '/',
    },
  });
  // @fastify/flash подключает @fastify/passport.initialize()

  fastifyPassport.registerUserDeserializer(
    (user) => app.objection.models.user.query().findById(user.id),
  );
  fastifyPassport.registerUserSerializer((user) => Promise.resolve(user));
  fastifyPassport.use(new FormStrategy('form', app));
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());
  app.decorate('fp', fastifyPassport);
  app.decorate('authenticate', (...args) => fastifyPassport.authenticate(
    'form',
    {
      failureRedirect: app.reverse('root'),
      failureFlash: i18next.t('flash.authError'),
    },
  // @ts-ignore
  )(...args));

  app.register(methodOverride);
  setupObjection(app, knexConfig[mode], models);
};

export default () => {
  const app = fastify({
    logger: {
      level: logLevel,
      ...(isDevelopment
        ? { transport: { target: 'pino-pretty' } }
        : {}),
    },
  });

  setErrorHandler(app);
  registerPlugins(app);

  setupLocalization();
  setUpViews(app);
  setUpStaticAssets(app);

  // Маршруты после плагинов: onRoute у reverse/method-override успевает подписаться.
  app.after(() => {
    addRoutes(app);
    addHooks(app);
  });

  return app;
};
