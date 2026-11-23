/** One bank, in its own colours: the account, the card, the loan and what happened there. */
import { h, logo } from '../dom.js';
import { icon } from '../icons.js';
import { REGIONS, bankById } from '../../core/banks.js';
import { summarize } from '../../core/finance.js';
import { daysBetween, dueLabel, shortDate } from '../../core/dates.js';
import { activityRow, empty, money, person, sectionTitle } from '../common.js';

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
  const later = (/** @type {string} */ what) => () => ctx.toast(`${what} comes in a later version of the prototype.`);
  const who = person(ctx);

  const head = h('header', { class: 'bank-head' },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Back to KinWallet', onclick: () => ctx.go({ name: 'wallet' }) }, icon('back')),
    logo(bank.id, 44),
    h('div', { class: 'bank-head-text' },
      h('h1', { class: 'bank-name' }, bank.name),
      h('p', { class: 'muted small' }, `${bank.type === 'digital' ? 'Digital' : 'Traditional'} · ${region ? `${region.flag} ${region.name}` : ''}`)));

  if (!accounts.length) {
    return [head,
      h('section', { class: 'hero' },
        h('p', { class: 'hero-label' }, who.kind === 'user' ? 'You have no account here yet' : `${who.name} has no account here yet`),
        h('p', { class: 'hero-spec' }, bank.specialty)),
      h('button', { class: 'btn primary block', type: 'button', onclick: later('Opening an account') }, icon('plus'), 'Open account')];
  }

  const hero = accounts.map((a) => h('section', { class: 'hero', 'aria-label': 'Account balance' },
    h('p', { class: 'hero-label' }, `Checking account · ${a.currency}`),
    h('p', { class: 'hero-value' }, money(ctx, a.balance, a.currency)),
    h('p', { class: 'hero-owner' }, who.kind === 'user' ? 'You' : who.name)));

  const action = (/** @type {string} */ ic, /** @type {string} */ label) => h('button', { class: 'action', type: 'button', onclick: later(label) },
    h('span', { class: 'action-icon' }, icon(ic, 22)), h('span', null, label));
  const actions = h('nav', { class: 'actions', 'aria-label': 'Actions' },
    action('send', 'Transfer'), action('receipt', 'Pay'), action('card', 'Card'), action('exchange', 'Exchange'));

  const cardBlocks = cards.map((c) => {
    const days = daysBetween(state.now, c.due);
    const used = Math.min(100, Math.round((c.bill / c.limit) * 100));
    return h('section', { class: 'card list-card' },
      sectionTitle('Credit card'),
      h('p', { class: 'line' }, h('span', null, 'Current bill'), h('strong', null, money(ctx, c.bill, c.currency))),
      h('p', { class: 'line muted' }, h('span', null, `Due ${shortDate(c.due)}`), h('span', null, dueLabel(days))),
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
  return [head, hero, actions, cardBlocks, loanBlocks,
    h('section', { class: 'card list-card' }, sectionTitle('Activity'),
      activity.length ? h('ul', { class: 'rows' }, activity.map((t) => activityRow(ctx, t))) : empty('No activity at this bank yet.'))];
}
