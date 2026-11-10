// Tiny templating and formatting helpers. `html` escapes every interpolated value
// unless it is itself the result of `html` / `raw`, which keeps rendering XSS-safe.

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const raw = (s) => new Raw(String(s));

function part(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(part).join('');
  return esc(v);
}

export function html(strings, ...values) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < values.length) out += part(values[i]);
  });
  return new Raw(out);
}

export function mount(el, tpl) {
  el.innerHTML = String(tpl);
  return el;
}

export function fromHTML(tpl) {
  const t = document.createElement('template');
  t.innerHTML = String(tpl).trim();
  return t.content.firstElementChild;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------------------------------------------------------------- formatting

const nf = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
/** 57999 -> "57 999" (narrow no-break space as thousands separator). */
export const num = (n) => nf.format(n).replace(/\s/g, ' ');
export const price = (n) => `${num(n)} ₴`;

/** Ukrainian plural form: plural(5, ['відгук', 'відгуки', 'відгуків']) -> 'відгуків'. */
export function plural(n, [one, few, many]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const df = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
export const date = (iso) => df.format(new Date(iso)).replace(/\s?р\.$/, '');

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
