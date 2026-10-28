#! /usr/bin/env node

import getApp from '../index.js';

const port = Number(process.env.PORT) || 41783;
const host = '0.0.0.0';

const app = getApp();
await app.listen({ port, host });
console.log(`Server is running on port: ${port}`);
