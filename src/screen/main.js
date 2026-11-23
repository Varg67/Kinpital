/** The Kinpital screen: one state, one render. */
import { h } from './dom.js';
import { SIMULATED_ANSWERS, freshStart } from './sample.js';
import { applyBankTheme } from './bank-theme.js';
import { bankById } from '../core/banks.js';
import { clockLine } from '../core/dates.js';
import { declareMoney } from '../core/ledger.js';
import { parseMoneyAnswer } from '../core/prompt.js';
import { homeView } from './views/home.js';
import { walletView } from './views/wallet.js';
import { bankView } from './views/bank.js';
import { assetsView, workView } from './views/areas.js';
import { settingsView } from './views/settings.js';

/** @type {Record<string, (ctx: any) => any[]>} */
const VIEWS = { home: homeView, wallet: walletView, bank: bankView, assets: assetsView, work: workView, settings: settingsView };

const state = {
  person: 'you', view: { name: 'home' }, hidden: false, currency: 'BRL', palette: 'coral', now: new Date(), info: false,
  /** @type {string | null} */ typing: null,
  /** @type {{ type: string } | null} */ form: null,
};
let data = freshStart();
/** @type {Record<string, number>} */
const asked = {};
const app = /** @type {HTMLElement} */ (document.getElementById('app'));
const live = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
document.body.appendChild(live);
/** @type {any} */
let toastTimer = 0;

const ctx = {
  state,
  get data() { return data; },
  /** @param {{ name: string, bank?: string }} view */
  go(view) {
    state.view = view;
    state.info = false;
    state.form = null;
    render();
    window.scrollTo(0, 0);
    const title = app.querySelector('h1');
    if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
  },
  /** @param {object} patch */
  set(patch) {
    const focused = document.activeElement && document.activeElement.getAttribute('data-key');
    Object.assign(state, patch);
    if ('person' in patch) { state.typing = null; state.form = null; }
    render();
    if (focused) {
      const again = app.querySelector(`[data-key="${focused}"]`);
      if (again instanceof HTMLElement) again.focus();
    }
  },
  /** @param {string} message */
  toast(message) {
    live.textContent = message;
    live.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => live.classList.remove('show'), 3600);
  },
  /** @param {(data: any) => void} change @param {string | (() => string)} [done] */
  act(change, done) {
    state.now = new Date();
    try {
      change(data);
    } catch (e) {
      ctx.toast(e instanceof Error ? e.message : String(e));
      return false;
    }
    render();
    if (done) ctx.toast(typeof done === 'function' ? done() : done);
    return true;
  },
  /** @param {any} d @param {string} id @param {number} amount @param {string} currency */
  declareMoney(d, id, amount, currency) {
    declareMoney(d, id, amount, currency, state.now);
  },
  /** In Kindroid this is `kin ask` with MONEY_QUESTION; the prototype answers with a simulated reply. @param {string} id */
  askKin(id) {
    const p = data.people.find((/** @type {any} */ x) => x.id === id);
    if (!p) return;
    p.setup = 'asking';
    state.typing = null;
    render();
    const replies = SIMULATED_ANSWERS[id] || ['{"amount": 1000, "currency": "BRL", "said": "About a thousand."}'];
    asked[id] = (asked[id] || 0) + 1;
    setTimeout(() => {
      const answer = parseMoneyAnswer(replies[(asked[id] - 1) % replies.length]);
      if (p.setup !== 'asking') return;
      if (!answer) { p.setup = 'new'; ctx.toast(`${p.name}’s answer could not be read. Ask again or type it.`); render(); return; }
      p.pending = answer;
      p.setup = 'answered';
      render();
    }, 1200);
  },
  /** @param {any} d */
  replaceData(d) {
    data = d;
    state.form = null;
    state.typing = null;
    render();
  },
};

function render() {
  const root = document.documentElement;
  root.setAttribute('data-palette', state.palette);
  applyBankTheme(root, state.view.name === 'bank' ? bankById(state.view.bank || '') : null);
  const view = VIEWS[state.view.name] || homeView;
  app.replaceChildren(...view(ctx).flat().filter(Boolean));
  // keys so focus survives a re-render (controls are rebuilt each time)
  app.querySelectorAll('button, input, select').forEach((el, i) => el.setAttribute('data-key', `${state.view.name}-${i}`));
}

render();
setInterval(() => {
  state.now = new Date();
  const clock = app.querySelector('.clock');
  if (clock) clock.textContent = clockLine(state.now);
}, 30000);
