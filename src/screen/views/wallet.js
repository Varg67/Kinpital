/** KinWallet: the person's accounts, and the 24 banks to open one in. */
import { h, logo } from '../dom.js';
import { icon } from '../icons.js';
import { BANKS, REGIONS, bankById, banksInRegion } from '../../core/banks.js';
import { summarize } from '../../core/finance.js';
import { empty, money, possessive, sectionTitle, topBar } from '../common.js';

/** @param {import('../common.js').Ctx} ctx */
export function walletView(ctx) {
  const { state, data } = ctx;
  const s = summarize(data, state.person, state.now, state.currency);
  const has = new Set(s.accounts.map((a) => a.bank));

  const cash = s.cash.length
    ? h('section', { class: 'card list-card' },
      sectionTitle('Cash'),
      h('ul', { class: 'rows' }, s.cash.map((c) => h('li', { class: 'row' },
        h('span', { class: 'row-icon' }, icon('cash', 20)),
        h('span', { class: 'row-text' }, h('span', { class: 'row-main' }, `Cash · ${c.currency}`), h('span', { class: 'row-sub' }, 'In hand, not in a bank')),
        h('span', { class: 'amount' }, money(ctx, c.amount, c.currency))))),
      h('p', { class: 'muted small cash-help' }, 'Open an account at any bank below, then tap Deposit there. You can spread it across several banks.'))
    : null;

  const accounts = h('section', { class: 'card list-card' },
    sectionTitle(`${possessive(ctx)} accounts`),
    s.accounts.length
      ? h('ul', { class: 'rows' }, s.accounts.map((a) => {
        const b = bankById(a.bank);
        return h('li', null, h('button', { class: 'row row-btn', type: 'button', onclick: () => ctx.go({ name: 'bank', bank: a.bank }) },
          logo(a.bank, 36),
          h('span', { class: 'row-text' }, h('span', { class: 'row-main' }, b ? b.name : a.bank), h('span', { class: 'row-sub' }, `Checking · ${a.currency}`)),
          h('span', { class: 'amount' }, money(ctx, a.balance, a.currency)),
          icon('chevron', 18)));
      }))
      : empty('No accounts yet. Pick a bank below.'),
    s.accounts.length ? h('p', { class: 'total' }, h('span', { class: 'muted' }, 'Total in accounts'), h('strong', null, money(ctx, s.accountsTotal, state.currency))) : null);

  const banks = h('section', { class: 'card list-card' },
    sectionTitle(`Open an account · ${BANKS.length} banks`),
    REGIONS.map((r) => h('div', { class: 'region' },
      h('h3', { class: 'region-title' }, `${r.flag} ${r.name}`, h('span', { class: 'muted' }, ` · ${r.currencies.length > 1 ? 'Multi-currency' : r.currencies[0]}`)),
      h('ul', { class: 'bank-grid' }, banksInRegion(r.id).map((b) => h('li', null,
        h('button', { class: 'bank-pick', type: 'button', onclick: () => ctx.go({ name: 'bank', bank: b.id }) },
          logo(b.id, 40), h('span', { class: 'bank-pick-name' }, b.name),
          h('span', { class: 'bank-pick-sub' }, has.has(b.id) ? 'Account open' : b.type === 'digital' ? 'Digital' : 'Traditional'))))))));

  return [topBar(ctx, 'KinWallet'), cash, accounts, banks];
}
