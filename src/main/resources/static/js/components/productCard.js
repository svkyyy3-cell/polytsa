import { html, num, plural, price } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';

export const REVIEW_FORMS = ['відгук', 'відгуки', 'відгуків'];

/** Five-star rating; `value` from 0 to 5, rendered with partial fill on the last star. */
export function stars(value, size = 16) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = icon('star', size).repeat(5);
  return html`<span class="stars" role="img" aria-label="Рейтинг ${value} з 5" style="--size:${size}px">
    <span class="stars__base">${rawSvg(row)}</span>
    <span class="stars__fill" style="width:${pct}%">${rawSvg(row)}</span>
  </span>`;
}

function rawSvg(s) {
  return html([s]);
}

export function stockClass(stock) {
  return { in_stock: 'is-in', low: 'is-low', out: 'is-out' }[stock] || '';
}

export function cartButton(p, cls = '') {
  if (p.stock === 'out') {
    return html`<button class="icon-btn card__buy ${cls}" type="button" disabled aria-label="Немає в наявності">${rawSvg(icon('cart'))}</button>`;
  }
  const inCart = store.inCart(p.id);
  return html`<button class="icon-btn card__buy ${cls} ${inCart ? 'is-active' : ''}" type="button"
      data-action="${inCart ? 'open-cart' : 'cart-add'}" data-id="${p.id}"
      aria-label="${inCart ? 'Товар у кошику — відкрити кошик' : 'Додати до кошика'}"
      title="${inCart ? 'У кошику' : 'Купити'}">${rawSvg(icon(inCart ? 'cartCheck' : 'cart'))}</button>`;
}

export function wishButton(p, cls = '') {
  const on = store.inWishlist(p.id);
  return html`<button class="icon-btn wish-btn ${cls} ${on ? 'is-active' : ''}" type="button" data-action="wish-toggle"
      data-id="${p.id}" aria-pressed="${on}" aria-label="${on ? 'Прибрати зі списку бажань' : 'Додати до списку бажань'}">
      ${rawSvg(icon(on ? 'heartFilled' : 'heart', 22))}</button>`;
}

export function productCard(p) {
  const url = `/product/${p.id}`;
  return html`<article class="card ${p.stock === 'out' ? 'card--out' : ''}" data-product="${p.id}">
    <div class="card__media">
      <a href="${url}" class="card__img" tabindex="-1" aria-hidden="true">
        <img src="${p.image}" alt="" loading="lazy" decoding="async" width="300" height="300">
        ${p.hoverImage ? html`<img class="card__img-alt" src="${p.hoverImage}" alt="" loading="lazy" decoding="async" width="300" height="300">` : ''}
      </a>
      <div class="card__badges">
        ${p.discount ? html`<span class="badge badge--sale">−${p.discount}%</span>` : ''}
        ${p.badge === 'top' ? html`<span class="badge badge--top">Топ продажів</span>` : ''}
        ${p.badge === 'new' ? html`<span class="badge badge--new">Новинка</span>` : ''}
      </div>
      ${wishButton(p, 'card__wish')}
    </div>
    <a href="${url}" class="card__title">${p.name}</a>
    <a href="${url}#reviews" class="card__rating" aria-label="Рейтинг ${p.rating}, ${p.reviews} ${plural(p.reviews, REVIEW_FORMS)}">
      ${stars(p.rating, 14)}<span class="card__reviews">${num(p.reviews)}</span>
    </a>
    <div class="card__bottom">
      <div class="card__prices">
        ${p.oldPrice ? html`<s class="card__old">${price(p.oldPrice)}</s>` : html`<span class="card__old" aria-hidden="true"></span>`}
        <span class="card__price ${p.oldPrice ? 'is-sale' : ''}">${num(p.price)}<span class="cur">₴</span></span>
      </div>
      ${cartButton(p)}
    </div>
    <div class="card__stock ${stockClass(p.stock)}">${p.stockLabel}</div>
  </article>`;
}

export function cardSkeleton() {
  return html`<div class="card card--skeleton" aria-hidden="true">
    <div class="sk sk--img"></div><div class="sk sk--line"></div><div class="sk sk--line sk--short"></div>
    <div class="sk sk--line sk--tiny"></div><div class="sk sk--price"></div></div>`;
}

export const productGrid = (items, cls = '') => html`<div class="grid ${cls}">${items.map(productCard)}</div>`;
export const gridSkeleton = (n = 10, cls = '') => html`<div class="grid ${cls}">${Array.from({ length: n }, cardSkeleton)}</div>`;

/** Horizontal scroll row with prev/next buttons (behaviour wired by initRails). */
export function rail(items, { skeleton = false } = {}) {
  return html`<div class="rail" data-rail>
    <button class="rail__nav rail__nav--prev" type="button" data-rail-prev aria-label="Попередні товари" hidden>${rawSvg(icon('chevronLeft'))}</button>
    <div class="rail__track" data-rail-track>
      ${skeleton ? Array.from({ length: 6 }, cardSkeleton) : items.map(productCard)}
    </div>
    <button class="rail__nav rail__nav--next" type="button" data-rail-next aria-label="Наступні товари">${rawSvg(icon('chevronRight'))}</button>
  </div>`;
}

export function initRails(root = document) {
  root.querySelectorAll('[data-rail]:not([data-rail-ready])').forEach((el) => {
    el.dataset.railReady = '';
    const track = el.querySelector('[data-rail-track]');
    const prev = el.querySelector('[data-rail-prev]');
    const next = el.querySelector('[data-rail-next]');
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.hidden = track.scrollLeft <= 2;
      next.hidden = track.scrollLeft >= max;
    };
    const step = () => Math.max(track.clientWidth * 0.8, 200);
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  });
}

/** Re-render cart / wishlist buttons in place after the store changes. */
export function refreshCardButtons(root = document) {
  root.querySelectorAll('.card__buy[data-id]').forEach((btn) => {
    const id = Number(btn.dataset.id);
    const inCart = store.inCart(id);
    btn.classList.toggle('is-active', inCart);
    btn.dataset.action = inCart ? 'open-cart' : 'cart-add';
    btn.setAttribute('aria-label', inCart ? 'Товар у кошику — відкрити кошик' : 'Додати до кошика');
    btn.title = inCart ? 'У кошику' : 'Купити';
    btn.innerHTML = icon(inCart ? 'cartCheck' : 'cart');
  });
  root.querySelectorAll('.wish-btn[data-id]').forEach((btn) => {
    const on = store.inWishlist(Number(btn.dataset.id));
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', on);
    btn.setAttribute('aria-label', on ? 'Прибрати зі списку бажань' : 'Додати до списку бажань');
    btn.innerHTML = icon(on ? 'heartFilled' : 'heart', 22);
  });
}
