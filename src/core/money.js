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
