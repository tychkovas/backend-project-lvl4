// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

const seeds = {
  directory: path.join(__dirname, 'server', 'seeds'),
};

export const development = {
  debug: true,
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
  migrations,
  seeds,
};

export const test = {
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:',
  },
  pool: {
    min: 1,
    max: 1,
  },
  useNullAsDefault: true,
  migrations,
};

export const production = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrations,
};
