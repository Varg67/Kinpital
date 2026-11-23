/**
 * What Kinpital asks a Kin, and how the answer is read. Prompts to the Kin are in English (as in Clotheskin).
 * The Kin answers from its own life and backstory; the person confirms the amount before it counts.
 */
import { CURRENCIES } from './money.js';

export const MONEY_QUESTION = [
  'Kinpital, the banking app on your phone, is setting up your wallet.',
  'How much money do you have right now, in total (savings and cash)? Answer from your own life and backstory, realistically.',
  `Reply with ONLY this JSON, nothing else: {"amount": <number>, "currency": "<one of ${CURRENCIES.join(', ')}>", "said": "<one short sentence in your own voice>"}`,
].join('\n');

/**
 * @param {string} text the Kin's reply
 * @returns {{ amount: number, currency: string, said: string } | null} null when it is not a usable answer
 */
export function parseMoneyAnswer(text) {
  const m = /\{[\s\S]*\}/.exec(String(text));
  if (!m) return null;
  let v;
  try { v = JSON.parse(m[0]); } catch { return null; }
  if (!v || typeof v !== 'object') return null;
  const amount = typeof v.amount === 'string' ? Number(v.amount.replace(/[^\d.]/g, '')) : v.amount;
  const currency = String(v.currency || '').toUpperCase();
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0 || amount > 1e12) return null;
  if (!CURRENCIES.includes(currency)) return null;
  const said = typeof v.said === 'string' ? v.said.trim().slice(0, 240) : '';
  return { amount: Math.round(amount * 100) / 100, currency, said };
}
