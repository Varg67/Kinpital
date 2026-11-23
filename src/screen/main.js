/** The Kinpital screen: one state, one render. */
import { h } from './dom.js';
import { sampleData } from './sample.js';
import { applyBankTheme } from './bank-theme.js';
import { bankById } from '../core/banks.js';
import { clockLine } from '../core/dates.js';
import { homeView } from './views/home.js';
import { walletView } from './views/wallet.js';
import { bankView } from './views/bank.js';
import { assetsView, workView } from './views/areas.js';
import { settingsView } from './views/settings.js';

/** @type {Record<string, (ctx: any) => any[]>} */
const VIEWS = { home: homeView, wallet: walletView, bank: bankView, assets: assetsView, work: workView, settings: settingsView };

const now = new Date();
const state = { person: 'you', view: { name: 'home' }, hidden: false, currency: 'BRL', palette: 'coral', now, info: false };
const data = sampleData(now);
const app = /** @type {HTMLElement} */ (document.getElementById('app'));
const live = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
document.body.appendChild(live);
/** @type {any} */
let toastTimer = 0;

const ctx = {
  state,
  data,
  /** @param {{ name: string, bank?: string }} view */
  go(view) {
    state.view = view;
    state.info = false;
    render();
    window.scrollTo(0, 0);
    const title = app.querySelector('h1');
    if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
  },
  /** @param {object} patch */
  set(patch) {
    const focusedId = document.activeElement && document.activeElement.getAttribute('data-key');
    Object.assign(state, patch);
    render();
    if (focusedId) {
      const again = app.querySelector(`[data-key="${focusedId}"]`);
      if (again instanceof HTMLElement) again.focus();
    }
  },
  /** @param {string} message */
  toast(message) {
    live.textContent = message;
    live.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => live.classList.remove('show'), 3200);
  },
};

function render() {
  const root = document.documentElement;
  root.setAttribute('data-palette', state.palette);
  applyBankTheme(root, state.view.name === 'bank' ? bankById(state.view.bank || '') : null);
  const view = VIEWS[state.view.name] || homeView;
  app.replaceChildren(...view(ctx).flat().filter(Boolean));
  // keys so focus survives a re-render (buttons are rebuilt each time)
  app.querySelectorAll('button, input, select').forEach((el, i) => el.setAttribute('data-key', `${state.view.name}-${i}`));
}

render();
setInterval(() => {
  state.now = new Date();
  const clock = app.querySelector('.clock');
  if (clock) clock.textContent = clockLine(state.now);
}, 30000);
