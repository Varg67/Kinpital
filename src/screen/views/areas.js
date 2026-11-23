/** Assets and Work & Income: first versions, read only. */
import { h } from '../dom.js';
import { icon } from '../icons.js';
import { bankById } from '../../core/banks.js';
import { summarize } from '../../core/finance.js';
import { shortDate, dueLabel } from '../../core/dates.js';
import { empty, money, possessive, sectionTitle, topBar } from '../common.js';

/** @param {import('../common.js').Ctx} ctx */
export function assetsView(ctx) {
  const s = summarize(ctx.data, ctx.state.person, ctx.state.now, ctx.state.currency);
  return [topBar(ctx, 'Assets'),
    h('section', { class: 'card list-card' }, sectionTitle(`${possessive(ctx)} assets`),
      s.assets.length
        ? h('ul', { class: 'rows' }, s.assets.map((a) => h('li', { class: 'row' },
          h('span', { class: 'row-icon' }, icon(a.kind === 'car' ? 'car' : 'home', 20)),
          h('span', { class: 'row-text' }, h('span', { class: 'row-main' }, a.name), h('span', { class: 'row-sub' }, a.kind === 'car' ? 'Vehicle' : 'Property')),
          h('span', { class: 'amount' }, money(ctx, a.value, a.currency)))))
        : empty('Nothing yet. Homes and cars, paid in full or financed by a bank, show up here.'),
      s.assets.length ? h('p', { class: 'total' }, h('span', { class: 'muted' }, 'Total value'), h('strong', null, money(ctx, s.owned, ctx.state.currency))) : null),
    h('button', { class: 'btn block', type: 'button', onclick: () => ctx.toast('Buying and financing come in a later version.') }, icon('plus'), 'Buy something')];
}

/** @param {import('../common.js').Ctx} ctx */
export function workView(ctx) {
  const s = summarize(ctx.data, ctx.state.person, ctx.state.now, ctx.state.currency);
  const paydays = s.upcoming.filter((u) => u.kind === 'income');
  return [topBar(ctx, 'Work & Income'),
    h('section', { class: 'card list-card' }, sectionTitle(`${possessive(ctx)} income`),
      s.income.length
        ? h('ul', { class: 'rows' }, s.income.map((i, k) => {
          const bank = bankById(i.bank);
          const next = paydays[k];
          return h('li', { class: 'row' },
            h('span', { class: 'row-icon' }, icon('briefcase', 20)),
            h('span', { class: 'row-text' }, h('span', { class: 'row-main' }, i.job),
              h('span', { class: 'row-sub' }, `Monthly, on day ${i.payday} · into ${bank ? bank.name : ''}`),
              next ? h('span', { class: 'row-sub' }, `Next: ${shortDate(next.date)} · ${dueLabel(next.days)}`) : null),
            h('span', { class: 'amount in' }, money(ctx, i.amount, i.currency, { sign: true })));
        }))
        : empty('No income yet.'))];
}
