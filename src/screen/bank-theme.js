/** Inside a bank the whole screen takes that bank's colours: only theme variables change, never component styles. */
import { contrast, firstReadable } from '../core/color.js';

const VARS = ['--accent', '--accent-hover', '--accent-deep', '--accent-tint', '--on-accent', '--bg', '--bg-glow-1', '--bg-glow-2', '--shadow-accent', '--focus'];

/** @param {string} hex @param {number} alpha */
export function rgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * @param {HTMLElement} root
 * @param {{ colors: { primary: string, secondary: string, surface: string, accent: string, onAccent: string } } | null | undefined} bank
 *   null: back to the Kinpital theme
 */
export function applyBankTheme(root, bank) {
  for (const v of VARS) root.style.removeProperty(v);
  if (!bank) return;
  const c = bank.colors;
  const deep = firstReadable([c.primary, c.accent, c.secondary, c.onAccent], c.surface);
  /** @type {Record<string, string>} */
  const set = {
    '--accent': c.accent,
    '--accent-hover': c.accent,
    '--accent-deep': deep,
    '--accent-tint': rgba(c.primary, contrast(c.primary, '#FFFFFF') < 2 ? 0.28 : 0.12),
    '--on-accent': c.onAccent,
    '--bg': c.surface,
    '--bg-glow-1': rgba(c.secondary, 0.35),
    '--bg-glow-2': rgba(c.primary, 0.14),
    '--shadow-accent': `0 8px 20px ${rgba(c.primary, 0.3)}`,
    '--focus': deep,
  };
  for (const k of Object.keys(set)) root.style.setProperty(k, set[k]);
}
