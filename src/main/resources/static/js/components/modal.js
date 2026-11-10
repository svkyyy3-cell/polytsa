import { html, fromHTML } from '../core/dom.js';
import { icon } from '../core/icons.js';

const open = [];

function lockScroll(lock) {
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--sbw', `${lock ? sbw : 0}px`);
  document.body.classList.toggle('no-scroll', lock);
}

/**
 * Opens a dialog. `variant`: 'center' (default), 'right' / 'left' (side drawers), 'sheet' (bottom on mobile).
 * Returns { el, body, close }.
 */
export function openModal({ title, content = '', variant = 'center', size = 'md', label, onClose, className = '' }) {
  const prevFocus = document.activeElement;
  const el = fromHTML(html`<div class="modal modal--${variant} modal--${size} ${className}" role="dialog" aria-modal="true"
      aria-label="${label || title || 'Діалог'}">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel">
      ${title != null ? html`<header class="modal__head"><h2 class="modal__title">${title}</h2>
        <button class="icon-btn modal__x" type="button" data-close aria-label="Закрити">${html([icon('close')])}</button></header>` : ''}
      <div class="modal__body">${content}</div>
    </div>
  </div>`);
  document.body.append(el);
  open.push(el);
  if (open.length === 1) lockScroll(true);
  requestAnimationFrame(() => el.classList.add('is-open'));

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    el.classList.remove('is-open');
    el.classList.add('is-closing');
    open.splice(open.indexOf(el), 1);
    if (!open.length) lockScroll(false);
    document.removeEventListener('keydown', onKey);
    setTimeout(() => el.remove(), 220);
    onClose?.();
    if (prevFocus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true });
  };

  const onKey = (e) => {
    if (open[open.length - 1] !== el) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      const f = [...el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', onKey);
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) close();
    // Following a link inside a dialog navigates away, so the dialog should go too.
    else if (e.target.closest('a[href]') && !e.target.closest('[data-keep-open]')) close();
  });
  setTimeout(() => {
    const target = el.querySelector('[autofocus]') || el.querySelector('.modal__panel button, .modal__panel a, .modal__panel input');
    target?.focus({ preventScroll: true });
  }, 60);

  return { el, body: el.querySelector('.modal__body'), close };
}

export function closeAllModals() {
  [...open].forEach((el) => el.querySelector('[data-close]')?.click());
}
