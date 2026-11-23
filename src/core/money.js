/** Money: formatting and currency conversion. */

/** @typedef {{ base: string, perUnit: Record<string, number> }} Rates  value of 1 unit of each currency, in `base` */

/**
 * @param {number} amount
 * @param {string} currency ISO 4217
 * @param {{ sign?: boolean }} [opts] sign: show + on positive amounts
 */
export function formatMoney(amount, currency, opts = {}) {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency, signDisplay: opts.sign ? 'exceptZero' : 'auto' });
  return fmt.format(Math.abs(amount) < 0.005 ? 0 : amount);
}

/** @param {number} amount @param {string} from @param {string} to @param {Rates} rates */
export function convert(amount, from, to, rates) {
  if (from === to) return amount;
  const a = rates.perUnit[from];
  const b = rates.perUnit[to];
  if (!a || !b) throw new Error(`No rate for ${from} or ${to}`);
  return (amount * a) / b;
}

/** @param {number[]} values */
export function sum(values) {
  return values.reduce((t, v) => t + v, 0);
}

export const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'INR'];

/**
 * Reads an amount typed by a person: "3500", "3,500.50", "3.500,50", "R$ 1.200", "1200,5".
 * The last "," or "." followed by 1 or 2 digits is the decimal mark; other separators group thousands.
 * @param {string} text @returns {number | null} null when it is not an amount
 */
export function parseAmount(text) {
  const s = String(text).replace(/[^\d.,-]/g, '');
  if (!/\d/.test(s) || s.lastIndexOf('-') > 0) return null;
  const m = /[.,](\d{1,2})$/.exec(s);
  const whole = (m ? s.slice(0, m.index) : s).replace(/[.,]/g, '');
  const n = Number(`${whole}${m ? `.${m[1]}` : ''}`);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

/** Rounds to two significant digits: 28169 → 28000, 1532 → 1500. @param {number} n */
export function roundNice(n) {
  if (n <= 0) return 0;
  const p = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}
