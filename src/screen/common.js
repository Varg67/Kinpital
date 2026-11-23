/** Pieces shared by the views. */
import { h, logo } from './dom.js';
import { icon } from './icons.js';
import { formatMoney } from '../core/money.js';
import { bankById } from '../core/banks.js';
import { dueLabel, shortDate } from '../core/dates.js';

/**
 * @typedef {object} Ctx
 * @property {{ person: string, view: { name: string, bank?: string }, hidden: boolean, currency: string, palette: string, now: Date, info: boolean }} state
 * @property {any} data
 * @property {(view: { name: string, bank?: string }) => void} go
 * @property {(patch: object) => void} set
 * @property {(message: string) => void} toast
 */

export const HIDDEN = '••••••';

/** @param {Ctx} ctx @param {number} amount @param {string} currency @param {{ sign?: boolean }} [opts] */
export function money(ctx, amount, currency, opts) {
  return ctx.state.hidden ? HIDDEN : formatMoney(amount, currency, opts);
}

/** @param {Ctx} ctx */
export function person(ctx) {
  return ctx.data.people.find((/** @type {any} */ p) => p.id === ctx.state.person);
}

/** "Your" or "Bia's" @param {Ctx} ctx */
export function possessive(ctx) {
  const p = person(ctx);
  return p.kind === 'user' ? 'Your' : `${p.name}'s`;
}

/** @param {Ctx} ctx @param {string} title @param {any} [right] */
export function topBar(ctx, title, right) {
  return h('header', { class: 'topbar' },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Back', onclick: () => ctx.go({ name: 'home' }) }, icon('back')),
    h('h1', { class: 'topbar-title' }, title),
    right || h('span', { class: 'topbar-space' }));
}

/** @param {string} text */
export function sectionTitle(text) {
  return h('h2', { class: 'section-title' }, text);
}

/** One line of activity. @param {Ctx} ctx @param {any} t */
export function activityRow(ctx, t) {
  const bank = bankById(t.bank);
  return h('li', { class: 'row' },
    logo(t.bank, 32),
    h('span', { class: 'row-text' },
      h('span', { class: 'row-main' }, t.text),
      h('span', { class: 'row-sub' }, `${bank ? bank.name : ''} · ${shortDate(t.date)}`)),
    h('span', { class: `amount ${t.amount > 0 ? 'in' : ''}` }, money(ctx, t.amount, t.currency, { sign: true })));
}

/** One bill, installment or payday. @param {Ctx} ctx @param {any} u */
export function upcomingRow(ctx, u) {
  const bank = bankById(u.bank);
  const late = u.days < 0;
  return h('li', null,
    h('button', { class: `row row-btn ${late ? 'late' : ''}`, type: 'button', onclick: () => ctx.go({ name: 'bank', bank: u.bank }) },
      logo(u.bank, 32),
      h('span', { class: 'row-text' },
        h('span', { class: 'row-main' }, `${bank ? bank.name : ''} · ${u.label}`),
        h('span', { class: 'row-sub' },
          late ? h('span', { class: 'late-tag' }, 'Late') : null,
          late ? ` ${dueLabel(u.days)}` : `${shortDate(u.date)} · ${dueLabel(u.days)}`)),
      h('span', { class: `amount ${u.amount > 0 ? 'in' : ''}` }, money(ctx, u.amount, u.currency, { sign: u.amount > 0 }))));
}

/** @param {string} text */
export function empty(text) {
  return h('p', { class: 'empty muted' }, text);
}
