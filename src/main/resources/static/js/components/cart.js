import { api } from '../core/api.js';
import { html, mount, num, plural, price, prefersReducedMotion, debounce } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store, MAX_QTY } from '../core/store.js';
import { navigate } from '../core/router.js';
import { openModal } from './modal.js';
import { emptyState } from './states.js';

const ITEM_FORMS = ['товар', 'товари', 'товарів'];
const svg = (name, size) => html([icon(name, size)]);

function line(item) {
  const p = item.product;
  const url = `/product/${p.id}`;
  return html`<li class="cart-line ${item.available ? '' : 'is-unavailable'}" data-id="${p.id}">
    <a class="cart-line__img" href="${url}"><img src="${p.image}" alt="" width="96" height="96" loading="lazy"></a>
    <div class="cart-line__info">
      <a class="cart-line__name" href="${url}">${p.name}</a>
      ${item.available
        ? html`<span class="cart-line__stock ${p.stock === 'low' ? 'is-low' : 'is-in'}">${p.stockLabel}</span>`
        : html`<span class="cart-line__stock is-out">Немає в наявності — не увійде в замовлення</span>`}
    </div>
    <div class="cart-line__qty">
      ${item.available ? html`<div class="qty" role="group" aria-label="Кількість">
        <button class="qty__btn" type="button" data-qty="-1" aria-label="Зменшити кількість" ${item.qty <= 1 ? 'disabled' : ''}>${svg('minus', 18)}</button>
        <input class="qty__input" type="number" inputmode="numeric" min="1" max="${MAX_QTY}" value="${item.qty}" aria-label="Кількість, шт.">
        <button class="qty__btn" type="button" data-qty="1" aria-label="Збільшити кількість" ${item.qty >= MAX_QTY ? 'disabled' : ''}>${svg('plus', 18)}</button>
      </div>` : ''}
    </div>
    <div class="cart-line__sum">
      ${p.oldPrice && item.available ? html`<s class="cart-line__old">${price(p.oldPrice * item.qty)}</s>` : ''}
      <span class="cart-line__price ${p.oldPrice ? 'is-sale' : ''}">${price(item.lineTotal)}</span>
      ${item.qty > 1 ? html`<span class="cart-line__each">${price(p.price)} / шт.</span>` : ''}
    </div>
    <button class="icon-btn cart-line__remove" type="button" data-remove aria-label="Видалити ${p.name} з кошика">${svg('trash', 20)}</button>
  </li>`;
}

function freeDeliveryHint(q) {
  if (!q.subtotal) return '';
  const left = q.freeDeliveryFrom - q.subtotal;
  const pct = Math.min(100, (q.subtotal / q.freeDeliveryFrom) * 100);
  return html`<div class="free-ship ${left <= 0 ? 'is-done' : ''}">
    <span class="free-ship__text">${svg('truck', 20)} ${left > 0
      ? html`До безкоштовної доставки залишилось <b>${price(left)}</b>`
      : 'Безкоштовна доставка у відділення та кур’єром'}</span>
    <span class="free-ship__bar"><span style="width:${pct}%"></span></span>
  </div>`;
}

/**
 * Renders the cart into `container`. Used by both the cart modal and the /cart page.
 * Returns an unsubscribe function.
 */
export function renderCart(container, { mode = 'modal', onCheckout } = {}) {
  let seq = 0;

  const draw = async () => {
    const id = ++seq;
    if (!store.state.cart.length) {
      mount(container, emptyState({
        iconName: 'cart',
        title: 'Кошик порожній',
        text: 'Але це ніколи не пізно виправити :)',
        action: html`<a class="btn btn--primary" href="/catalog" data-continue>Перейти до каталогу</a>`,
      }));
      return;
    }
    if (!container.querySelector('.cart')) {
      mount(container, html`<div class="cart cart--${mode} is-loading"><ul class="cart__lines">
        ${store.state.cart.map(() => html`<li class="cart-line cart-line--sk"><div class="sk sk--thumb"></div><div class="sk sk--line"></div></li>`)}
      </ul></div>`);
    } else {
      container.querySelector('.cart').classList.add('is-busy');
    }
    let q;
    try {
      q = await api.quote(store.state.cart.map(({ id: pid, qty }) => ({ id: pid, qty })), 'branch');
    } catch (err) {
      if (id !== seq) return;
      mount(container, emptyState({ iconName: 'info', title: 'Не вдалося завантажити кошик', text: err.message,
        action: html`<button class="btn btn--primary" type="button" data-retry>Спробувати ще раз</button>` }));
      container.querySelector('[data-retry]').addEventListener('click', draw);
      return;
    }
    if (id !== seq) return;
    const known = new Set(q.items.map((i) => i.product.id));
    // Drop products that no longer exist in the catalog.
    store.state.cart.filter((l) => !known.has(l.id)).forEach((l) => store.removeFromCart(l.id));

    mount(container, html`<div class="cart cart--${mode}">
      ${freeDeliveryHint(q)}
      <ul class="cart__lines">${q.items.map(line)}</ul>
      <div class="cart__footer">
        ${mode === 'modal' ? html`<button class="btn btn--ghost" type="button" data-close>Продовжити покупки</button>` : html`<a class="btn btn--ghost" href="/catalog">Продовжити покупки</a>`}
        <div class="cart__total">
          <div class="cart__sum">
            <span class="cart__sum-label">${q.count} ${plural(q.count, ITEM_FORMS)} на суму</span>
            <span class="cart__sum-value">${price(q.subtotal)}</span>
            ${q.savings ? html`<span class="cart__savings">Ваша економія ${price(q.savings)}</span>` : ''}
          </div>
          <button class="btn btn--primary btn--lg" type="button" data-checkout ${q.count ? '' : 'disabled'}>Оформити замовлення</button>
        </div>
      </div>
    </div>`);
  };

  const setQtyLater = debounce((id, v) => store.setQty(id, v), 350);

  container.addEventListener('click', (e) => {
    const li = e.target.closest('.cart-line');
    const id = li ? Number(li.dataset.id) : null;
    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn && id) {
      const current = store.state.cart.find((l) => l.id === id)?.qty || 1;
      store.setQty(id, current + Number(qtyBtn.dataset.qty));
    } else if (e.target.closest('[data-remove]') && id) {
      li.classList.add('is-removing');
      setTimeout(() => store.removeFromCart(id), 180);
    } else if (e.target.closest('[data-checkout]')) {
      onCheckout?.();
      navigate('/checkout');
    }
  });
  container.addEventListener('input', (e) => {
    if (!e.target.matches('.qty__input')) return;
    const id = Number(e.target.closest('.cart-line').dataset.id);
    const v = Number(e.target.value);
    if (v >= 1) setQtyLater(id, Math.min(MAX_QTY, v));
  });
  container.addEventListener('change', (e) => {
    if (!e.target.matches('.qty__input')) return;
    const id = Number(e.target.closest('.cart-line').dataset.id);
    store.setQty(id, Number(e.target.value) || 1);
  });

  draw();
  return store.subscribe((type) => {
    if (type === 'cart' || type === 'sync') draw();
  });
}

let cartModal = null;

export function openCart() {
  if (cartModal) return;
  const m = openModal({
    title: 'Кошик',
    size: 'lg',
    className: 'cart-modal',
    onClose: () => {
      unsubscribe();
      cartModal = null;
    },
  });
  cartModal = m;
  const unsubscribe = renderCart(m.body, { mode: 'modal', onCheckout: () => m.close() });
}

/** Animates a product image flying into the cart icon. */
export function flyToCart(sourceImg) {
  const target = [...document.querySelectorAll('[data-cart-target]')].find((el) => el.offsetParent !== null);
  if (target) {
    target.classList.remove('is-bump');
    void target.offsetWidth;
    target.classList.add('is-bump');
  }
  if (!sourceImg || !target || prefersReducedMotion()) return;
  const from = sourceImg.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width) return;
  const ghost = sourceImg.cloneNode();
  ghost.className = 'fly-ghost';
  Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
  document.body.append(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  ghost.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 0.95, borderRadius: '12px' },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(0.5)`, opacity: 0.9, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2, borderRadius: '50%' },
  ], { duration: 650, easing: 'cubic-bezier(.5,0,.3,1)' }).finished.then(() => ghost.remove(), () => ghost.remove());
}

export const cartCountLabel = (n) => `${num(n)}`;
