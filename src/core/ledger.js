/**
 * The rules that change money. Each function checks, then changes `state` in place, and throws an Error with a sentence
 * for the person when the action is not allowed. The screen shows that sentence; nothing is half done.
 *
 * Everyone starts at zero. The first time, each person declares the money they have: it becomes cash, to be deposited
 * into the banks they choose.
 */
import { REGIONS, bankById } from './banks.js';
import { CURRENCIES, convert, formatMoney, roundNice } from './money.js';

/** Card bills close this many days before they are due. */
export const CLOSING_DAYS = 7;
/** A card's due day is drawn from 1 to this (every month has it). */
export const MAX_DUE_DAY = 28;

/** @param {any} state @param {string} prefix */
function newId(state, prefix) {
  state.nextId = (state.nextId || 1) + 1;
  return `${prefix}-${state.nextId}`;
}

/** @param {any} state @param {string} personId */
function personOf(state, personId) {
  const p = state.people.find((/** @type {any} */ x) => x.id === personId);
  if (!p) throw new Error('This person is not in Kinpital.');
  return p;
}

/** @param {number} amount */
function checkAmount(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount above zero.');
  if (amount > 1e12) throw new Error('That amount is too large.');
}

/** @param {any} state @param {string} owner @param {string} currency */
function cashOf(state, owner, currency) {
  let c = state.cash.find((/** @type {any} */ x) => x.owner === owner && x.currency === currency);
  if (!c) { c = { owner, currency, amount: 0 }; state.cash.push(c); }
  return c;
}

/** Currencies a bank offers: its region's, or all of them for international banks. @param {string} bankId */
export function bankCurrencies(bankId) {
  const bank = bankById(bankId);
  const region = bank && REGIONS.find((r) => r.id === bank.region);
  return region ? region.currencies.filter((c) => CURRENCIES.includes(c)) : [];
}

/** The first time: the money a person has becomes cash. Zero is allowed (nothing yet). */
export function declareMoney(state, personId, amount, currency, now) {
  const p = personOf(state, personId);
  if (p.setup === 'done') throw new Error(`${p.kind === 'user' ? 'Your' : `${p.name}'s`} starting money is already set.`);
  if (!CURRENCIES.includes(currency)) throw new Error('Choose a currency.');
  if (amount !== 0) checkAmount(amount);
  if (amount > 0) {
    cashOf(state, personId, currency).amount += amount;
    state.activity.push({ owner: personId, bank: null, text: 'Starting money (cash)', amount, currency, date: now, kind: 'initial' });
  }
  p.setup = 'done';
  delete p.pending;
}

/** Opens a checking account at a bank, in one of the bank's currencies, with a zero balance. */
export function openAccount(state, personId, bankId, currency, now) {
  personOf(state, personId);
  const bank = bankById(bankId);
  if (!bank) throw new Error('This bank does not exist.');
  if (!bankCurrencies(bankId).includes(currency)) throw new Error(`${bank.name} does not offer accounts in ${currency}.`);
  if (state.accounts.some((/** @type {any} */ a) => a.owner === personId && a.bank === bankId && a.currency === currency)) {
    throw new Error(`There is already an account in ${currency} at ${bank.name}.`);
  }
  const account = { id: newId(state, 'acc'), owner: personId, bank: bankId, currency, balance: 0, openedAt: now };
  state.accounts.push(account);
  return account;
}

/** @param {any} state @param {string} personId @param {string} accountId */
function accountOf(state, personId, accountId) {
  const a = state.accounts.find((/** @type {any} */ x) => x.id === accountId && x.owner === personId);
  if (!a) throw new Error('This account does not exist.');
  return a;
}

/** Cash into an account, in the account's currency. */
export function deposit(state, personId, accountId, amount, now) {
  const a = accountOf(state, personId, accountId);
  checkAmount(amount);
  const c = cashOf(state, personId, a.currency);
  if (c.amount + 1e-9 < amount) throw new Error(`Not enough cash: ${formatMoney(c.amount, a.currency)} available.`);
  c.amount = Math.round((c.amount - amount) * 100) / 100;
  a.balance = Math.round((a.balance + amount) * 100) / 100;
  state.activity.push({ owner: personId, bank: a.bank, text: 'Cash deposit', amount, currency: a.currency, date: now, kind: 'internal' });
}

/** Money out of an account, as cash. */
export function withdraw(state, personId, accountId, amount, now) {
  const a = accountOf(state, personId, accountId);
  checkAmount(amount);
  if (a.balance + 1e-9 < amount) throw new Error(`Not enough money in the account: ${formatMoney(a.balance, a.currency)} available.`);
  a.balance = Math.round((a.balance - amount) * 100) / 100;
  const c = cashOf(state, personId, a.currency);
  c.amount = Math.round((c.amount + amount) * 100) / 100;
  state.activity.push({ owner: personId, bank: a.bank, text: 'Cash withdrawal', amount: -amount, currency: a.currency, date: now, kind: 'internal' });
}

/**
 * Issues a credit card at a bank where the person has an account. The due day is drawn (1 to 28) and kept;
 * the bill closes CLOSING_DAYS before. Provisional limit: the value of R$2,000 (traditional) or R$1,000 (digital)
 * in the account's currency, until income and score exist.
 * @param {() => number} [random] for tests
 */
export function issueCard(state, personId, bankId, now, random = Math.random) {
  const bank = bankById(bankId);
  if (!bank) throw new Error('This bank does not exist.');
  const account = state.accounts.find((/** @type {any} */ a) => a.owner === personId && a.bank === bankId);
  if (!account) throw new Error(`Open an account at ${bank.name} first.`);
  if (state.cards.some((/** @type {any} */ c) => c.owner === personId && c.bank === bankId)) throw new Error(`There is already a ${bank.name} card.`);
  const dueDay = 1 + Math.min(MAX_DUE_DAY - 1, Math.floor(random() * MAX_DUE_DAY));
  const limit = roundNice(convert(bank.type === 'traditional' ? 2000 : 1000, 'BRL', account.currency, state.rates));
  const card = { id: newId(state, 'card'), owner: personId, bank: bankId, currency: account.currency, limit, bill: 0, dueDay, issuedAt: now };
  state.cards.push(card);
  return card;
}

/** A fresh Kinpital: these people, everyone at zero and not set up yet. @param {Array<{id: string, name: string, kind: string}>} people @param {any} rates */
export function emptyState(people, rates) {
  return {
    version: 1, nextId: 1, rates,
    people: people.map((p) => ({ ...p, setup: 'new' })),
    cash: [], accounts: [], cards: [], loans: [], income: [], assets: [], activity: [],
  };
}
