import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from '../scripts/build-screen.mjs';

test('screen/app.js is up to date with the sources (run npm run build)', () => {
  assert.equal(readFileSync(new URL('../screen/app.js', import.meta.url), 'utf8'), build());
});
