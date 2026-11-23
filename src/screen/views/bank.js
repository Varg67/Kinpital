/** One bank, in its own colours: open an account, move cash in and out, get a card. */
import { h, logo } from '../dom.js';
import { icon } from '../icons.js';
import { REGIONS, bankById } from '../../core/banks.js';
import { summarize } from '../../core/finance.js';
import { daysBetween, dueLabel, shortDate } from '../../core/dates.js';
import { formatMoney, parseAmount } from '../../core/money.js';
import { CLOSING_DAYS, bankCurrencies, deposit, issueCard, openAccount, withdraw } from '../../core/ledger.js';
import { activityRow, empty, money, person, sectionTitle } from '../common.js';

/** @param {number} n 1 → "1st", 17 → "17th" */
export function ordinal(n) {
  const t = n % 100;
  const s = t >= 11 && t <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
  return `${n}${s}`;
}

/** @param {import('../common.js').Ctx} ctx */
export function bankView(ctx) {
  const { state, data } = ctx;
  const bank = bankById(state.view.bank || '');
  if (!bank) return [empty('This bank does not exist.')];
  const region = REGIONS.find((r) => r.id === bank.region);
  const s = summarize(data, state.person, state.now, state.currency);
  const here = (/** @type {any[]} */ list) => list.filter((x) => x.bank === bank.id);
  const accounts = here(s.accounts);
  const cards = here(s.cards);
  const loans = here(s.loans);
  const who = person(ctx);
  const offered = bankCurrencies(bank.id);
  const missing = offered.filter((c) => !accounts.some((a) => a.currency === c));

  const head = h('header', { class: 'bank-head' },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Back to KinWallet', onclick: () => ctx.go({ name: 'wallet' }) }, icon('back')),
    logo(bank.id, 44),
    h('div', { class: 'bank-head-text' },
      h('h1', { class: 'bank-name' }, bank.name),
      h('p', { class: 'muted small' }, `${bank.type === 'digital' ? 'Digital' : 'Traditional'} · ${region ? `${region.flag} ${region.name}` : ''}`)));

  if (who.setup !== 'done') {
    return [head, h('section', { class: 'hero' }, h('p', { class: 'hero-spec' }, bank.specialty)),
      h('p', { class: 'banner' }, icon('info', 20), h('span', null, `First set ${who.kind === 'user' ? 'your' : `${who.name}’s`} starting money on the home screen.`))];
  }

  /** Open an account; international banks ask for the currency. @param {boolean} another */
  const opener = (another) => {
    const select = missing.length > 1
      ? h('select', { class: 'select', 'aria-label': 'Account currency' }, missing.map((c) => h('option', { value: c, selected: c === state.currency }, c)))
      : null;
    const open = () => {
      const currency = select ? /** @type {HTMLSelectElement} */ (select).value : missing[0];
      ctx.act((d) => { openAccount(d, who.id, bank.id, currency, state.now); }, `Account opened at ${bank.name}, in ${currency}.`);
    };
    return h('div', { class: 'opener' }, select,
      h('button', { class: `btn ${another ? '' : 'primary'} block`, type: 'button', onclick: open }, icon('plus'),
        another ? 'Open an account in another currency' : `Open account${missing.length === 1 ? ` in ${missing[0]}` : ''}`));
  };

  if (!accounts.length) {
    return [head,
      h('section', { class: 'hero' },
        h('p', { class: 'hero-label' }, who.kind === 'user' ? 'You have no account here yet' : `${who.name} has no account here yet`),
        h('p', { class: 'hero-spec' }, bank.specialty)),
      opener(false)];
  }

  const hero = accounts.map((a) => h('section', { class: 'hero', 'aria-label': 'Account balance' },
    h('p', { class: 'hero-label' }, `Checking account · ${a.currency}`),
    h('p', { class: 'hero-value' }, money(ctx, a.balance, a.currency)),
    h('p', { class: 'hero-owner' }, who.kind === 'user' ? 'You' : who.name)));

  const formType = state.form && state.form.type;
  const toggle = (/** @type {string} */ type) => () => ctx.set({ form: formType === type ? null : { type } });
  const action = (/** @type {string} */ ic, /** @type {string} */ label, /** @type {() => void} */ onclick, /** @type {boolean} */ pressed) =>
    h('button', { class: 'action', type: 'button', onclick, 'aria-pressed': pressed == null ? null : String(pressed) },
      h('span', { class: 'action-icon' }, icon(ic, 22)), h('span', null, label));
  const actions = h('nav', { class: 'actions', 'aria-label': 'Actions' },
    action('income', 'Deposit', toggle('deposit'), formType === 'deposit'),
    action('cash', 'Withdraw', toggle('withdraw'), formType === 'withdraw'),
    action('card', 'Card', () => {
      if (cards.length) { ctx.toast(`Bill due on the ${ordinal(cards[0].dueDay)} of each month.`); return; }
      ctx.act((d) => { issueCard(d, who.id, bank.id, state.now); }, () => {
        const c = data.cards.find((/** @type {any} */ x) => x.owner === who.id && x.bank === bank.id);
        return `Card issued. The bill is due on the ${ordinal(c.dueDay)} of each month and closes ${CLOSING_DAYS} days before.`;
      });
    }, null),
    action('send', 'Transfer', () => ctx.toast('Transfers come in the next version.'), null));

  const form = formType === 'deposit' || formType === 'withdraw' ? moveForm(ctx, formType, accounts, s.cash, who.id) : null;

  const cardBlocks = cards.map((c) => {
    const used = c.limit > 0 ? Math.min(100, Math.round((c.bill / c.limit) * 100)) : 0;
    const closes = new Date(c.due.getFullYear(), c.due.getMonth(), c.due.getDate() - CLOSING_DAYS);
    return h('section', { class: 'card list-card' },
      sectionTitle('Credit card'),
      h('p', { class: 'line' }, h('span', null, 'Current bill'), h('strong', null, money(ctx, c.bill, c.currency))),
      h('p', { class: 'line muted' }, h('span', null, `Due ${shortDate(c.due)}`), h('span', null, dueLabel(daysBetween(state.now, c.due)))),
      h('p', { class: 'line muted small' }, h('span', null, `Closes ${shortDate(closes)}`), h('span', null, `Due on the ${ordinal(c.dueDay)} each month`)),
      h('div', { class: 'meter', role: 'img', 'aria-label': `${used}% of the limit used` }, h('span', { style: `width:${used}%` })),
      h('p', { class: 'line muted small' }, h('span', null, `${used}% of the limit`), h('span', null, `Limit ${money(ctx, c.limit, c.currency)}`)));
  });

  const loanBlocks = loans.map((l) => {
    const days = daysBetween(state.now, l.due);
    return h('section', { class: `card list-card ${days < 0 ? 'late-card' : ''}` },
      sectionTitle('Loan'),
      h('p', { class: 'line' }, h('span', null, 'Still to pay'), h('strong', null, money(ctx, l.remaining, l.currency))),
      h('p', { class: `line ${days < 0 ? 'late-text' : 'muted'}` },
        h('span', null, `Installment ${money(ctx, l.installment, l.currency)}`),
        h('span', null, days < 0 ? `Late: ${dueLabel(days)}` : `${shortDate(l.due)} · ${dueLabel(days)}`)));
  });

  const activity = here(s.activity);
  return [head, hero, actions, form, cardBlocks, loanBlocks,
    missing.length ? opener(true) : null,
    h('section', { class: 'card list-card' }, sectionTitle('Activity'),
      activity.length ? h('ul', { class: 'rows' }, activity.map((t) => activityRow(ctx, t))) : empty('No activity at this bank yet.'))];
}

/**
 * Deposit (cash → account) or withdraw (account → cash), in the account's currency.
 * @param {import('../common.js').Ctx} ctx @param {string} type @param {any[]} accounts @param {any[]} cash @param {string} owner
 */
function moveForm(ctx, type, accounts, cash, owner) {
  const deposit_ = type === 'deposit';
  const pick = accounts.length > 1
    ? h('select', { class: 'select', name: 'account', 'aria-label': 'Account' }, accounts.map((a) => h('option', { value: a.id }, `${a.currency} account`)))
    : null;
  const current = () => accounts.find((a) => a.id === (pick ? /** @type {HTMLSelectElement} */ (pick).value : accounts[0].id)) || accounts[0];
  const available = () => {
    const a = current();
    if (!deposit_) return a.balance;
    const c = cash.find((x) => x.currency === a.currency);
    return c ? c.amount : 0;
  };
  const hint = h('p', { class: 'muted small' });
  const showHint = () => {
    const a = current();
    hint.textContent = deposit_
      ? `Cash in ${a.currency}: ${formatMoney(available(), a.currency)}${available() === 0 ? '. Exchanging other currencies comes later.' : ''}`
      : `In the account: ${formatMoney(available(), a.currency)}`;
  };
  if (pick) pick.addEventListener('change', showHint);
  showHint();
  const input = /** @type {HTMLInputElement} */ (h('input', { class: 'text-input', name: 'amount', inputmode: 'decimal', autocomplete: 'off', placeholder: '0.00', 'aria-label': 'Amount' }));
  const form = h('form', { class: 'card list-card move-form', novalidate: true },
    sectionTitle(deposit_ ? 'Deposit cash' : 'Withdraw as cash'),
    pick, h('div', { class: 'money-inputs' }, input,
      h('button', { class: 'btn', type: 'button', onclick: () => { input.value = String(available()); input.focus(); } }, 'All')),
    hint,
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn primary', type: 'submit' }, deposit_ ? 'Deposit' : 'Withdraw'),
      h('button', { class: 'link-btn', type: 'button', onclick: () => ctx.set({ form: null }) }, 'Cancel')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseAmount(input.value);
    if (amount == null || amount <= 0) { ctx.toast('Type an amount above zero.'); return; }
    const a = current();
    const ok = ctx.act((d) => (deposit_ ? deposit : withdraw)(d, owner, a.id, amount, ctx.state.now),
      `${deposit_ ? 'Deposited' : 'Withdrew'} ${formatMoney(amount, a.currency)}.`);
    if (ok) ctx.set({ form: null });
  });
  return form;
}
