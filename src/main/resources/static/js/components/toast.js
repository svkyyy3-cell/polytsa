import { html, fromHTML } from '../core/dom.js';
import { icon } from '../core/icons.js';

let region;

/** Short, non-blocking notification. `link` is an optional { href, label }. */
export function toast(message, { type = 'success', link, timeout = 3200 } = {}) {
  if (!region) {
    region = fromHTML('<div class="toasts" role="status" aria-live="polite"></div>');
    document.body.append(region);
  }
  const el = fromHTML(html`<div class="toast toast--${type}">
    <span class="toast__icon">${html([icon(type === 'error' ? 'info' : 'check', 20)])}</span>
    <span class="toast__msg">${message}</span>
    ${link ? html`<a class="toast__link" href="${link.href}">${link.label}</a>` : ''}
    <button class="toast__close" type="button" aria-label="Закрити">${html([icon('close', 18)])}</button>
  </div>`);
  const close = () => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 200);
  };
  el.querySelector('.toast__close').addEventListener('click', close);
  el.querySelector('.toast__link')?.addEventListener('click', close);
  // Repeating the same message replaces the previous one instead of stacking duplicates.
  [...region.children].filter((t) => t.dataset.msg === message).forEach((t) => t.remove());
  el.dataset.msg = message;
  region.append(el);
  while (region.children.length > 3) region.firstElementChild.remove();
  setTimeout(close, timeout);
}
