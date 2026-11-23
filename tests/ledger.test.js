import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLOSING_DAYS, MAX_DUE_DAY, bankCurrencies, declareMoney, deposit, emptyState, issueCard, openAccount, withdraw } from '../src/core/ledger.js';
import { summarize } from '../src/core/finance.js';
import { MONEY_QUESTION, parseMoneyAnswer } from '../src/core/prompt.js';

const RATES = { base: 'BRL', perUnit: { BRL: 1, USD: 5, EUR: 6, GBP: 7, JPY: 0.04, INR: 0.06 } };
const NOW = new Date(2026, 10, 23, 12);
const fresh = () => emptyState([{ id: 'you', name: 'You', kind: 'user' }, { id: 'bia', name: 'Bia', kind: 'kin' }], RATES);

test('everyone starts at zero, not set up', () => {
  const s = fresh();
  assert.ok(s.people.every((p) => p.setup === 'new'));
  assert.equal(summarize(s, 'you', NOW, 'BRL').netWorth, 0);
});

test('declared money becomes cash, once', () => {
  const s = fresh();
  declareMoney(s, 'you', 3500, 'BRL', NOW);
  assert.deepEqual(s.cash, [{ owner: 'you', currency: 'BRL', amount: 3500 }]);
  assert.equal(s.people[0].setup, 'done');
  const sum = summarize(s, 'you', NOW, 'BRL');
  assert.equal(sum.netWorth, 3500);
  assert.equal(sum.monthChange, 0, 'starting money is not income');
  assert.throws(() => declareMoney(s, 'you', 10, 'BRL', NOW), /already set/);
  declareMoney(s, 'bia', 0, 'BRL', NOW);
  assert.equal(s.people[1].setup, 'done', 'zero is allowed');
  assert.throws(() => declareMoney(fresh(), 'you', -5, 'BRL', NOW), /above zero/);
  assert.throws(() => declareMoney(fresh(), 'you', 5, 'XYZ', NOW), /currency/);
});

test('accounts open in the bank’s currencies only, one per currency', () => {
  const s = fresh();
  assert.deepEqual(bankCurrencies('violeta'), ['BRL']);
  assert.equal(bankCurrencies('nomadex').length, 6);
  const a = openAccount(s, 'you', 'violeta', 'BRL', NOW);
  assert.equal(a.balance, 0);
  assert.throws(() => openAccount(s, 'you', 'violeta', 'BRL', NOW), /already an account/);
  assert.throws(() => openAccount(s, 'you', 'violeta', 'USD', NOW), /does not offer/);
  openAccount(s, 'you', 'nomadex', 'USD', NOW);
  openAccount(s, 'you', 'nomadex', 'EUR', NOW);
  assert.equal(s.accounts.length, 3);
});

test('cash can be spread across banks and taken back out', () => {
  const s = fresh();
  declareMoney(s, 'you', 3500, 'BRL', NOW);
  const v = openAccount(s, 'you', 'violeta', 'BRL', NOW);
  const i = openAccount(s, 'you', 'banco-imperial', 'BRL', NOW);
  deposit(s, 'you', v.id, 2000, NOW);
  deposit(s, 'you', i.id, 1500, NOW);
  assert.equal(s.cash[0].amount, 0);
  assert.throws(() => deposit(s, 'you', v.id, 0.01, NOW), /Not enough cash/);
  withdraw(s, 'you', v.id, 250.5, NOW);
  assert.equal(v.balance, 1749.5);
  assert.equal(s.cash[0].amount, 250.5);
  assert.throws(() => withdraw(s, 'you', i.id, 1500.01, NOW), /Not enough money/);
  const sum = summarize(s, 'you', NOW, 'BRL');
  assert.equal(sum.netWorth, 3500, 'moving money between cash and banks changes nothing');
  assert.equal(sum.monthChange, 0);
  const usd = openAccount(s, 'you', 'liberty-federal', 'USD', NOW);
  assert.throws(() => deposit(s, 'you', usd.id, 1, NOW), /Not enough cash/, 'BRL cash does not go into a USD account');
  assert.throws(() => deposit(s, 'bia', v.id, 1, NOW), /does not exist/, 'not someone else’s account');
});

test('cards: need an account, one per bank, due day drawn from 1 to 28 and kept', () => {
  const s = fresh();
  assert.throws(() => issueCard(s, 'you', 'violeta', NOW), /Open an account/);
  openAccount(s, 'you', 'violeta', 'BRL', NOW);
  openAccount(s, 'you', 'banco-imperial', 'BRL', NOW);
  const low = issueCard(s, 'you', 'violeta', NOW, () => 0);
  const high = issueCard(s, 'you', 'banco-imperial', NOW, () => 0.99999);
  assert.equal(low.dueDay, 1);
  assert.equal(high.dueDay, MAX_DUE_DAY);
  assert.equal(low.limit, 1000, 'digital');
  assert.equal(high.limit, 2000, 'traditional');
  assert.throws(() => issueCard(s, 'you', 'violeta', NOW), /already/);
  const seen = new Set();
  for (let k = 0; k < 28; k++) {
    const t = fresh();
    openAccount(t, 'you', 'violeta', 'BRL', NOW);
    seen.add(issueCard(t, 'you', 'violeta', NOW, () => (k + 0.5) / 28).dueDay);
  }
  assert.equal(seen.size, 28, 'every day from 1 to 28 can come up');
  assert.equal(CLOSING_DAYS, 7);
});

test('card limits in other currencies are round numbers', () => {
  const s = fresh();
  openAccount(s, 'you', 'mitsuhara', 'JPY', NOW);
  assert.equal(issueCard(s, 'you', 'mitsuhara', NOW, () => 0).limit, 50000);
});

test('the Kin’s answer about its money', () => {
  assert.match(MONEY_QUESTION, /ONLY this JSON/);
  assert.deepEqual(parseMoneyAnswer('{"amount": 8000, "currency": "BRL", "said": "Savings from the café."}'),
    { amount: 8000, currency: 'BRL', said: 'Savings from the café.' });
  assert.deepEqual(parseMoneyAnswer('Sure! {"amount": "1,900", "currency": "usd"}'), { amount: 1900, currency: 'USD', said: '' });
  assert.equal(parseMoneyAnswer('I have about two grand.'), null);
  assert.equal(parseMoneyAnswer('{"amount": -5, "currency": "BRL"}'), null);
  assert.equal(parseMoneyAnswer('{"amount": 5, "currency": "DOGE"}'), null);
  assert.equal(parseMoneyAnswer('{"amount": 5, "currency": "BRL"'), null);
});
