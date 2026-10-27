// Разбор ответа триажа: одна метка, NO_COMMENT или отказ.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseTriageOutput, TRIAGE_LABELS } from './triage-label.mjs';

test('принимает каждую триажную метку', () => {
  TRIAGE_LABELS.forEach((label) => {
    assert.equal(parseTriageOutput(label), label);
    assert.equal(parseTriageOutput(`\n  ${label}  \n`), label);
  });
});

test('NO_COMMENT не ставит метку', () => {
  assert.equal(parseTriageOutput('NO_COMMENT'), null);
  assert.equal(parseTriageOutput('\nNO_COMMENT\n'), null);
});

test('мусор и лишние строки не ставят метку', () => {
  assert.equal(parseTriageOutput(''), null);
  assert.equal(parseTriageOutput('нужен фикс в docs'), null);
  assert.equal(parseTriageOutput('needs-triage\nи ещё комментарий'), null);
  assert.equal(parseTriageOutput('ready-for-agent NO_COMMENT'), null);
  assert.equal(parseTriageOutput('NEEDS-TRIAGE'), null);
});
