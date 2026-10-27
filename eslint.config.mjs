import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs } from 'eslint-config-airbnb-extended/legacy';
import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore');

const jsConfig = defineConfig([
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  ...configs.base.recommended,
]);

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  {
    name: 'project/ignores',
    ignores: ['node_modules/**', 'dist/**', 'db/**', 'coverage/**'],
  },
  ...jsConfig,
  {
    name: 'project/env',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  jestPlugin.configs['flat/recommended'],
  {
    name: 'project/rules',
    rules: {
      'no-console': 'off',
      'import/extensions': 'off',
      'new-cap': ['error', { properties: false }],
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['req', 'reply'],
        },
      ],
      'no-underscore-dangle': ['error', { allow: ['__filename', '__dirname'] }],
    },
  },
  {
    name: 'project/eslint-config',
    files: ['eslint.config.mjs'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]);
