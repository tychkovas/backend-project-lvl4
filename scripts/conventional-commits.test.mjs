// Тесты общих правил Conventional Commits для тем коммитов и заголовков PR.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isValidCommitSubject, safeCommitSubject } from './conventional-commits.mjs';

const validSubjects = [
  'feat: add booking form',
  'fix(api): handle slot conflict',
  'chore: apply opencode agent changes (#16)',
  'feat!: drop legacy api',
];

const invalidSubjects = [
  'Бейдж Beta добавлен в шапку',
  'feat: добавить бейдж',
  'random message',
  'feat:',
  'FEAT: uppercase type',
];

test('принимает корректный subject', () => {
  validSubjects.forEach((subject) => {
    assert.equal(isValidCommitSubject(subject), true, subject);
  });
});

test('отклоняет некорректный subject', () => {
  invalidSubjects.forEach((subject) => {
    assert.equal(isValidCommitSubject(subject), false, subject);
  });
});

test('safe subject содержит номер issue', () => {
  assert.equal(safeCommitSubject('16'), 'chore: apply opencode agent changes (#16)');
  assert.equal(safeCommitSubject(), 'chore: apply opencode agent changes');
});
