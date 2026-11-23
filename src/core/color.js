/** Colour helpers: WCAG relative luminance and contrast ratio. */

/** @param {string} hex `#RRGGBB` @returns {number} */
export function luminance(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Not a #RRGGBB colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** @param {string} a @param {string} b @returns {number} contrast ratio, 1 to 21 */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The first colour that reads as text on `background` (WCAG AA, 4.5:1), or the theme's dark text.
 * @param {string[]} candidates @param {string} background
 */
export function firstReadable(candidates, background) {
  return candidates.find((c) => contrast(c, background) >= 4.5) || '#2B2B2B';
}
