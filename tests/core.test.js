import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, formatMoney } from '../src/core/money.js';
import { addDays, daysBetween, dueLabel, nextMonthDay } from '../src/core/dates.js';
import { summarize } from '../src/core/finance.js';
import { sampleData } from '../src/screen/sample.js';

const rates = { base: 'BRL', perUnit: { BRL: 1, USD: 5, EUR: 6 } };

test('money: formats in en-US and converts through the base currency', () => {
  assert.equal(formatMoney(4820.35, 'BRL'), 'R$4,820.35');
  assert.equal(formatMoney(-50, 'BRL', { sign: true }), '-R$50.00');
  assert.equal(formatMoney(3200, 'BRL', { sign: true }), '+R$3,200.00');
  assert.equal(formatMoney(1200, 'JPY'), '¥1,200');
  assert.equal(convert(10, 'USD', 'BRL', rates), 50);
  assert.equal(convert(60, 'BRL', 'EUR', rates), 10);
  assert.equal(convert(6, 'EUR', 'USD', rates), 7.2);
  assert.throws(() => convert(1, 'XYZ', 'BRL', rates));
});

test('dates: whole days, due labels and the next payday', () => {
  const now = new Date(2026, 10, 23, 18, 40);
  assert.equal(daysBetween(now, addDays(now, 17)), 17);
  assert.equal(daysBetween(now, addDays(now, -2)), -2);
  assert.equal(dueLabel(-2), '2 days late');
  assert.equal(dueLabel(-1), '1 day late');
  assert.equal(dueLabel(0), 'today');
  assert.equal(dueLabel(1), 'tomorrow');
  assert.equal(dueLabel(9), 'in 9 days');
  assert.deepEqual(nextMonthDay(now, 5), new Date(2026, 11, 5));
  assert.deepEqual(nextMonthDay(now, 23), new Date(2026, 10, 23), 'today counts');
  assert.deepEqual(nextMonthDay(new Date(2027, 0, 31), 31), new Date(2027, 0, 31));
  assert.deepEqual(nextMonthDay(new Date(2027, 1, 1), 31), new Date(2027, 1, 28), 'short month: its last day');
});

test('summary: net worth = accounts + assets − card bills − loans; late items come first', () => {
  const now = new Date(2026, 10, 23, 12);
  const data = sampleData(now);
  const you = summarize(data, 'you', now, 'BRL');
  // accounts 4820.35 + 2310 + 450 EUR; car 48000; bills 830 + 64.90 EUR; loan 9600
  const expected = 4820.35 + 2310 + 450 * 6.14 + 48000 - 830 - 64.9 * 6.14 - 9600;
  assert.ok(Math.abs(you.netWorth - expected) < 1e-6);
  assert.equal(you.accounts.length, 3);
  assert.deepEqual(you.upcoming.map((u) => u.days), [...you.upcoming.map((u) => u.days)].sort((a, b) => a - b));
  const lucas = summarize(data, 'lucas', now, 'BRL');
  assert.equal(lucas.upcoming[0].kind, 'loan');
  assert.ok(lucas.upcoming[0].days < 0, 'the late installment is first');
  assert.ok(you.activity[0].date >= you.activity[1].date, 'newest activity first');
});
