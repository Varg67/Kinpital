/** A tiny element builder. Text always goes in as text (names come from Kindroid), never as HTML. */

/**
 * @param {string} tag
 * @param {Record<string, any> | null} [props] class, style, on<event>, or any attribute (true = present, false/null = absent)
 * @param {...any} children nodes, strings, numbers, arrays; null and false are skipped
 * @returns {HTMLElement}
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const key of Object.keys(props)) {
      const v = props[key];
      if (v == null || v === false) continue;
      if (key === 'class') el.className = v;
      else if (key === 'style') el.style.cssText = v;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2), v);
      else el.setAttribute(key, v === true ? '' : String(v));
    }
  }
  append(el, children);
  return el;
}

/** @param {Node} el @param {any[]} children */
function append(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** @param {string} bankId @param {number} size */
export function logo(bankId, size) {
  return h('img', { class: 'logo', src: `assets/banks/${bankId}.svg`, alt: '', width: size, height: size });
}
