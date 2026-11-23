import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BANKS, REGIONS, bankById, banksInRegion } from '../src/core/banks.js';
import { contrast } from '../src/core/color.js';

const LOGOS = new URL('../screen/assets/banks/', import.meta.url);

test('24 banks: 14 traditional and 10 digital, in 7 regions', () => {
  assert.equal(BANKS.length, 24);
  assert.equal(BANKS.filter((b) => b.type === 'traditional').length, 14);
  assert.equal(BANKS.filter((b) => b.type === 'digital').length, 10);
  assert.equal(REGIONS.length, 7);
  assert.deepEqual(REGIONS.map((r) => banksInRegion(r.id).length), [4, 4, 4, 3, 3, 3, 3]);
});

test('ids and names are unique, and every bank is found by id', () => {
  assert.equal(new Set(BANKS.map((b) => b.id)).size, BANKS.length);
  assert.equal(new Set(BANKS.map((b) => b.name)).size, BANKS.length);
  for (const b of BANKS) assert.equal(bankById(b.id), b);
  assert.equal(bankById('nope'), undefined);
});

test('button text reaches WCAG AA (4.5:1) on every bank', () => {
  for (const { name, colors } of BANKS) {
    const ratio = contrast(colors.accent, colors.onAccent);
    assert.ok(ratio >= 4.5, `${name}: ${ratio.toFixed(2)}:1`);
  }
});

test('every bank has its logo, a 64×64 SVG with an accessible name', () => {
  for (const b of BANKS) {
    const file = new URL(`${b.id}.svg`, LOGOS);
    assert.ok(existsSync(file), `missing ${b.id}.svg`);
    const svg = readFileSync(file, 'utf8');
    assert.match(svg, /viewBox="0 0 64 64"/);
    assert.ok(svg.includes(`aria-label="${b.name}"`), `${b.id}.svg names ${b.name}`);
  }
});
