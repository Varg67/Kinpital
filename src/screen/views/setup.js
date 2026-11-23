/**
 * The first time for each person: everyone starts at zero and declares the money they have, which becomes cash.
 * You type yours. For a Kin, Kinpital asks the Kin (the person confirms: Accept, Edit, Ask again) or the person types it.
 */
import { h } from '../dom.js';
import { icon } from '../icons.js';
import { CURRENCIES, formatMoney, parseAmount } from '../../core/money.js';
import { person } from '../common.js';

/** @param {import('../common.js').Ctx} ctx */
export function setupCard(ctx) {
  const p = person(ctx);
  if (!p || p.setup === 'done') return null;
  if (p.kind === 'user') {
    return h('section', { class: 'card setup' },
      h('h2', { class: 'setup-title' }, 'Welcome to Kinpital'),
      h('p', null, 'Everyone starts at zero. How much money do you have right now?'),
      moneyForm(ctx, p, 'Your money', null),
      h('p', { class: 'muted small' }, 'It becomes cash in your KinWallet, ready to deposit into the banks you choose.'));
  }
  const typing = ctx.state.typing === p.id;
  const head = h('h2', { class: 'setup-title' }, `How much money does ${p.name} have?`);
  if (typing) {
    return h('section', { class: 'card setup' }, head,
      moneyForm(ctx, p, `${p.name}’s money`, p.pending || null),
      h('button', { class: 'link-btn', type: 'button', onclick: () => ctx.set({ typing: null }) }, `Ask ${p.name} instead`));
  }
  if (p.setup === 'asking') {
    return h('section', { class: 'card setup' }, head,
      h('p', { class: 'asking', role: 'status' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), `Asking ${p.name}…`));
  }
  if (p.setup === 'answered' && p.pending) {
    const a = p.pending;
    return h('section', { class: 'card setup' }, head,
      a.said ? h('blockquote', { class: 'quote' }, h('p', null, `“${a.said}”`), h('footer', null, `— ${p.name}`)) : null,
      h('p', { class: 'setup-amount' }, formatMoney(a.amount, a.currency), h('span', { class: 'muted' }, ' in cash')),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => ctx.act((d) => declare(d, p.id, a.amount, a.currency, ctx), `${p.name}’s cash is set.`) }, 'Accept'),
        h('button', { class: 'btn', type: 'button', onclick: () => ctx.set({ typing: p.id }) }, 'Edit'),
        h('button', { class: 'btn', type: 'button', onclick: () => ctx.askKin(p.id) }, icon('chat', 18), 'Ask again')),
      h('p', { class: 'muted small' }, 'Nothing counts until you accept.'));
  }
  return h('section', { class: 'card setup' }, head,
    h('p', null, `${p.name} starts at zero. Kinpital can ask ${p.name}, who answers from their own life; you confirm the amount before it counts.`),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn primary', type: 'button', onclick: () => ctx.askKin(p.id) }, icon('chat', 18), `Ask ${p.name}`),
      h('button', { class: 'btn', type: 'button', onclick: () => ctx.set({ typing: p.id }) }, 'Type it myself')));
}

/** @param {any} data @param {string} id @param {number} amount @param {string} currency @param {import('../common.js').Ctx} ctx */
function declare(data, id, amount, currency, ctx) {
  ctx.declareMoney(data, id, amount, currency);
  ctx.state.typing = null;
}

/**
 * @param {import('../common.js').Ctx} ctx @param {any} p @param {string} label
 * @param {{ amount: number, currency: string } | null} prefill
 */
function moneyForm(ctx, p, label, prefill) {
  const amountId = `amount-${p.id}`;
  const form = h('form', { class: 'money-form', novalidate: true },
    h('label', { class: 'label', for: amountId }, label),
    h('div', { class: 'money-inputs' },
      h('select', { class: 'select currency', name: 'currency', 'aria-label': 'Currency' },
        CURRENCIES.map((c) => h('option', { value: c, selected: c === (prefill ? prefill.currency : ctx.state.currency) }, c))),
      h('input', { class: 'text-input', id: amountId, name: 'amount', inputmode: 'decimal', autocomplete: 'off', placeholder: '0.00', value: prefill ? String(prefill.amount) : null })),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn primary', type: 'submit' }, 'Save'),
      h('button', { class: 'link-btn', type: 'button', onclick: () => ctx.act((d) => declare(d, p.id, 0, 'BRL', ctx), 'Starting at zero.') }, 'Nothing yet')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = /** @type {HTMLFormElement} */ (form);
    const amount = parseAmount(/** @type {HTMLInputElement} */ (f.elements.namedItem('amount')).value);
    const currency = /** @type {HTMLSelectElement} */ (f.elements.namedItem('currency')).value;
    if (amount == null || amount < 0) { ctx.toast('Type an amount, like 3500 or 3,500.00.'); return; }
    ctx.act((d) => declare(d, p.id, amount, currency, ctx), amount > 0 ? `${formatMoney(amount, currency)} in cash.` : 'Starting at zero.');
  });
  return form;
}
