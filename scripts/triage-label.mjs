// Разбор stdout триажа: ровно одна триажная метка или ничего.
// Запуск: node scripts/triage-label.mjs <файл>
// Без файла читает stdin. Печатает метку или пусто, код выхода всегда 0.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const TRIAGE_LABELS = [
  'needs-triage',
  'needs-info',
  'ready-for-agent',
  'ready-for-human',
  'wontfix',
];

const NO_COMMENT = 'NO_COMMENT';

export function parseTriageOutput(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length !== 1) return null;

  const [line] = lines;
  if (line === NO_COMMENT) return null;
  if (TRIAGE_LABELS.includes(line)) return line;
  return null;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  const file = process.argv[2];
  const text = file ? readFileSync(file, 'utf8') : readFileSync(0, 'utf8');
  const label = parseTriageOutput(text);
  if (label) process.stdout.write(`${label}\n`);
}
