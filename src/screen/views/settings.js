/** Settings: colours, the currency totals are shown in, and the attached Kins. */
import { h } from '../dom.js';
import { sectionTitle, topBar } from '../common.js';

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'INR'];

/** @param {import('../common.js').Ctx} ctx */
export function settingsView(ctx) {
  const { state, data } = ctx;
  const radio = (/** @type {string} */ value, /** @type {string} */ label) => h('label', { class: 'check' },
    h('input', { type: 'radio', name: 'palette', value, checked: state.palette === value, onchange: () => ctx.set({ palette: value }) }), label);
  return [topBar(ctx, 'Settings'),
    h('section', { class: 'card list-card' }, sectionTitle('Colours'),
      h('div', { class: 'stack' }, radio('coral', 'Coral (Kindroid default)'), radio('sage', 'Sage'))),
    h('section', { class: 'card list-card' }, sectionTitle('Show totals in'),
      h('select', { class: 'select', 'aria-label': 'Currency for totals', onchange: (/** @type {Event} */ e) => ctx.set({ currency: /** @type {HTMLSelectElement} */ (e.target).value }) },
        CURRENCIES.map((c) => h('option', { value: c, selected: c === state.currency }, c)))),
    h('section', { class: 'card list-card' }, sectionTitle('Attached Kins'),
      h('ul', { class: 'plain' }, data.people.filter((/** @type {any} */ p) => p.kind === 'kin').map((/** @type {any} */ p) => h('li', null, p.name))),
      h('p', { class: 'muted small' }, 'Kins with Kinpital attached in Kindroid’s Workshop. Sample names in the prototype.'))];
}
