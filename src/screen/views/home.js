/** The Kinpital home: whose money, how much, what comes next, and the way into each area. */
import { h } from '../dom.js';
import { icon } from '../icons.js';
import { summarize } from '../../core/finance.js';
import { formatMoney } from '../../core/money.js';
import { clockLine } from '../../core/dates.js';
import { activityRow, empty, money, person, possessive, sectionTitle, upcomingRow } from '../common.js';

/** @param {import('../common.js').Ctx} ctx */
export function homeView(ctx) {
  const { state, data } = ctx;
  const cur = state.currency;
  const s = summarize(data, state.person, state.now, cur);
  const who = person(ctx);
  const plural = (/** @type {number} */ n, /** @type {string} */ w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Whose money' },
    data.people.map((/** @type {any} */ p) => h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(p.id === state.person),
      onclick: () => ctx.set({ person: p.id }),
    }, h('span', { class: 'chip-dot', 'aria-hidden': 'true' }, p.name.charAt(0)), p.name)),
    h('button', { class: 'chip chip-add', type: 'button', 'aria-label': 'Add a Kin', 'aria-expanded': String(state.info), onclick: () => ctx.set({ info: !state.info }) }, icon('plus', 18)));

  const info = state.info
    ? h('p', { class: 'banner' }, icon('info', 20), h('span', null, 'Any Kin with Kinpital attached in Kindroid’s Workshop can open accounts. Attach it there, and the Kin appears here.'))
    : null;

  const change = s.monthChange;
  const worth = h('section', { class: 'card worth', 'aria-label': 'Net worth' },
    h('div', { class: 'worth-head' },
      h('span', { class: 'label' }, who.kind === 'user' ? 'Your net worth' : `${who.name}’s net worth`),
      h('button', { class: 'icon-btn small', type: 'button', 'aria-label': state.hidden ? 'Show amounts' : 'Hide amounts', 'aria-pressed': String(state.hidden), onclick: () => ctx.set({ hidden: !state.hidden }) },
        icon(state.hidden ? 'eye-off' : 'eye', 20))),
    h('p', { class: 'worth-value' }, money(ctx, s.netWorth, cur)),
    h('p', { class: `worth-change ${state.hidden ? 'off' : change >= 0 ? 'up' : 'down'}` },
      state.hidden ? 'This month: hidden' : `${change >= 0 ? '▲' : '▼'} ${formatMoney(Math.abs(change), cur)} this month`),
    h('p', { class: 'worth-meta muted' }, [plural(s.accounts.length, 'account'), plural(s.cards.length, 'card'), s.loans.length ? plural(s.loans.length, 'loan') : null].filter(Boolean).join(' · ')));

  const coming = h('section', { class: 'card list-card' },
    sectionTitle('Coming up'),
    s.upcoming.length ? h('ul', { class: 'rows' }, s.upcoming.slice(0, 4).map((u) => upcomingRow(ctx, u))) : empty('Nothing due. Bills, installments and paydays show up here.'));

  const nextPay = s.upcoming.find((u) => u.kind === 'income');
  const tile = (/** @type {string} */ ic, /** @type {string} */ title, /** @type {string} */ sub, /** @type {any} */ view) => h('button', {
    class: `tile ${view ? '' : 'soon'}`, type: 'button', 'aria-disabled': view ? null : 'true',
    onclick: view ? () => ctx.go(view) : () => ctx.toast('The market comes in a later version.'),
  }, h('span', { class: 'tile-icon' }, icon(ic, 24)), h('span', { class: 'tile-title' }, title), h('span', { class: 'tile-sub' }, sub));

  const tiles = h('nav', { class: 'tiles', 'aria-label': 'Areas' },
    tile('wallet', 'KinWallet', s.accounts.length ? plural(s.accounts.length, 'account') : 'Open an account', { name: 'wallet' }),
    tile('home', 'Assets', s.assets.length ? plural(s.assets.length, 'item') : 'Nothing yet', { name: 'assets' }),
    tile('briefcase', 'Work & Income', nextPay ? `Payday ${nextPay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No income yet', { name: 'work' }),
    tile('chart', 'Market', 'Coming soon', null));

  const recent = h('section', { class: 'card list-card' },
    sectionTitle('Recent activity'),
    s.activity.length ? h('ul', { class: 'rows' }, s.activity.slice(0, 5).map((t) => activityRow(ctx, t))) : empty('No activity yet.'));

  const others = Object.keys(data.rates.perUnit).filter((c) => c !== cur && c !== 'JPY' && c !== 'INR');
  const ticker = h('p', { class: 'ticker' },
    others.map((c) => h('span', null, `${c} ${formatMoney(data.rates.perUnit[c] / data.rates.perUnit[cur], cur)}`)));

  return [
    h('header', { class: 'home-head' },
      h('div', null, h('h1', { class: 'brand' }, 'Kinpital'), h('p', { class: 'clock muted' }, clockLine(state.now))),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Settings', onclick: () => ctx.go({ name: 'settings' }) }, icon('gear'))),
    chips, info, worth, coming, tiles, recent, ticker,
    h('p', { class: 'foot muted' }, `Prototype with sample data. ${possessive(ctx)} figures are made up; exchange rates are sample values.`),
  ];
}
