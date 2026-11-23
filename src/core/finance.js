/** One person's money at a glance: what they have, what they owe, what comes next. */
import { convert, sum } from './money.js';
import { daysBetween, nextMonthDay } from './dates.js';

/**
 * @param {any} data the finance state (see ledger.emptyState and src/screen/sample.js)
 * @param {string} personId
 * @param {Date} now
 * @param {string} currency the currency totals are shown in
 */
export function summarize(data, personId, now, currency) {
  /** @param {any[]} list */
  const mine = (list) => list.filter((x) => x.owner === personId);
  /** @param {number} amount @param {string} from */
  const to = (amount, from) => convert(amount, from, currency, data.rates);

  const cash = mine(data.cash).filter((c) => c.amount > 0);
  const accounts = mine(data.accounts);
  const cards = mine(data.cards).map((c) => ({ ...c, due: nextMonthDay(now, c.dueDay) }));
  const loans = mine(data.loans);
  const assets = mine(data.assets);
  const income = mine(data.income);

  const cashTotal = sum(cash.map((c) => to(c.amount, c.currency)));
  const accountsTotal = sum(accounts.map((a) => to(a.balance, a.currency)));
  const owned = sum(assets.map((a) => to(a.value, a.currency)));
  const debt = sum(cards.map((c) => to(c.bill, c.currency))) + sum(loans.map((l) => to(l.remaining, l.currency)));

  const upcoming = [
    ...cards.filter((c) => c.bill > 0).map((c) => ({ kind: 'card', bank: c.bank, label: 'Card bill', amount: -c.bill, currency: c.currency, date: c.due })),
    ...loans.map((l) => ({ kind: 'loan', bank: l.bank, label: 'Loan installment', amount: -l.installment, currency: l.currency, date: l.due })),
    ...income.map((i) => ({ kind: 'income', bank: i.bank, label: 'Payday', amount: i.amount, currency: i.currency, date: nextMonthDay(now, i.payday) })),
  ]
    .map((u) => ({ ...u, days: daysBetween(now, u.date) }))
    .sort((a, b) => a.days - b.days);

  const activity = mine(data.activity).sort((a, b) => b.date.getTime() - a.date.getTime());
  // money that came in or went out this month; moving cash in or out of a bank, and the starting money, do not count
  const thisMonth = activity.filter((t) => t.kind !== 'internal' && t.kind !== 'initial'
    && t.date.getFullYear() === now.getFullYear() && t.date.getMonth() === now.getMonth());

  return {
    cash, accounts, cards, loans, assets, income, upcoming, activity,
    cashTotal, accountsTotal, owned, debt,
    netWorth: cashTotal + accountsTotal + owned - debt,
    monthChange: sum(thisMonth.map((t) => to(t.amount, t.currency))),
  };
}
