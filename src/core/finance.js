/** One person's money at a glance: what they have, what they owe, what comes next. */
import { convert, sum } from './money.js';
import { daysBetween, nextMonthDay } from './dates.js';

/**
 * @param {any} data the finance state (see src/screen/sample.js for its shape)
 * @param {string} personId
 * @param {Date} now
 * @param {string} currency the currency totals are shown in
 */
export function summarize(data, personId, now, currency) {
  /** @param {any[]} list */
  const mine = (list) => list.filter((x) => x.owner === personId);
  /** @param {number} amount @param {string} from */
  const to = (amount, from) => convert(amount, from, currency, data.rates);

  const accounts = mine(data.accounts);
  const cards = mine(data.cards);
  const loans = mine(data.loans);
  const assets = mine(data.assets);
  const income = mine(data.income);

  const cash = sum(accounts.map((a) => to(a.balance, a.currency)));
  const owned = sum(assets.map((a) => to(a.value, a.currency)));
  const debt = sum(cards.map((c) => to(c.bill, c.currency))) + sum(loans.map((l) => to(l.remaining, l.currency)));

  const upcoming = [
    ...cards.map((c) => ({ kind: 'card', bank: c.bank, label: 'Card bill', amount: -c.bill, currency: c.currency, date: c.due })),
    ...loans.map((l) => ({ kind: 'loan', bank: l.bank, label: 'Loan installment', amount: -l.installment, currency: l.currency, date: l.due })),
    ...income.map((i) => ({ kind: 'income', bank: i.bank, label: 'Payday', amount: i.amount, currency: i.currency, date: nextMonthDay(now, i.payday) })),
  ]
    .map((u) => ({ ...u, days: daysBetween(now, u.date) }))
    .sort((a, b) => a.days - b.days);

  const activity = mine(data.activity).sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    accounts, cards, loans, assets, income, upcoming, activity,
    cash, owned, debt,
    netWorth: cash + owned - debt,
    monthChange: to(data.monthChange[personId] || 0, data.rates.base),
  };
}
