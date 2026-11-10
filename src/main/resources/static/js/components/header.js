import { api } from '../core/api.js';
import { html, mount, num, price, debounce, esc } from '../core/dom.js';
import { icon, categoryIcon } from '../core/icons.js';
import { store } from '../core/store.js';
import { navigate, onNavigate } from '../core/router.js';

const svg = (name, size) => html([icon(name, size)]);

export const LOGO = html`<svg class="logo__mark" viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
  <rect width="32" height="32" rx="9" fill="var(--green)"/>
  <rect x="8" y="6.5" width="5.5" height="5.5" rx="1.3" fill="#fff"/>
  <rect x="15" y="8" width="4.5" height="4" rx="1" fill="#fff"/>
  <circle cx="11.5" cy="18.3" r="2.7" fill="#fff"/>
  <rect x="17.5" y="15.2" width="6" height="5.8" rx="1.4" fill="#fff"/>
  <path d="M6.5 13.2h19M6.5 22.4h19" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

export const PROMO_LINKS = [
  { href: '/catalog?onSale=1&sort=discount', label: 'Акції', icon: 'percent', accent: true },
  { href: '/catalog?sort=popular', label: 'Хіти продажів', icon: 'trophy' },
  { href: '/catalog?sort=new', label: 'Новинки', icon: 'sparkle' },
  { href: '/catalog/smartphones', label: 'Смартфони' },
  { href: '/catalog/laptops', label: 'Ноутбуки' },
  { href: '/catalog/tv', label: 'Телевізори' },
  { href: '/catalog/audio', label: 'Навушники' },
  { href: '/catalog/consoles', label: 'Ігрові консолі' },
  { href: '/catalog/appliances', label: 'Побутова техніка' },
];

const POPULAR_QUERIES = ['iPhone 15', 'PlayStation 5', 'MacBook Air', 'Навушники Sony', 'Робот-пилосос', 'Nike Air Force'];

export function renderHeader(el) {
  mount(el, html`<div class="header__main">
      <div class="container header__row">
        <button class="icon-btn header__burger" type="button" data-action="open-menu" aria-label="Відкрити меню">${svg('menu', 26)}</button>
        <a class="logo" href="/" aria-label="Полиця — на головну">${LOGO}<span class="logo__text">полиця</span></a>
        <button class="catalog-btn" type="button" data-action="toggle-catalog" aria-expanded="false" aria-controls="catalog-menu">
          ${svg('grid', 22)}<span>Каталог</span>
        </button>
        <form class="search" role="search" action="/search" autocomplete="off">
          <div class="search__field">
            <span class="search__icon">${svg('search', 22)}</span>
            <input class="search__input" type="search" name="q" placeholder="Я шукаю..." aria-label="Пошук товарів"
              role="combobox" aria-expanded="false" aria-controls="search-suggest" aria-autocomplete="list" maxlength="100">
            <button class="search__clear" type="button" aria-label="Очистити пошук" hidden>${svg('close', 18)}</button>
          </div>
          <button class="search__submit" type="submit">Знайти</button>
          <div class="search__dropdown" id="search-suggest" role="listbox" aria-label="Підказки пошуку" hidden></div>
        </form>
        <nav class="header__actions" aria-label="Обліковий запис і покупки">
          <button class="h-action h-action--account" type="button" data-action="account">
            ${svg('user', 26)}<span class="h-action__label" data-user-label>Увійти</span>
          </button>
          <a class="h-action h-action--wish" href="/wishlist" aria-label="Список бажань">
            ${svg('heart', 26)}<span class="h-action__label">Обране</span><span class="count-badge" data-wish-count hidden></span>
          </a>
          <button class="h-action h-action--cart" type="button" data-action="open-cart" data-cart-target aria-label="Кошик">
            ${svg('cart', 28)}<span class="h-action__label">Кошик</span><span class="count-badge count-badge--green" data-cart-count hidden></span>
          </button>
        </nav>
      </div>
      <div class="catalog-menu" id="catalog-menu" hidden>
        <div class="container catalog-menu__inner"></div>
      </div>
    </div>
    <nav class="promo-nav" aria-label="Акції та популярні розділи">
      <div class="container promo-nav__inner">
        <ul class="promo-nav__list">
          ${PROMO_LINKS.map((l) => html`<li><a class="promo-nav__link ${l.accent ? 'is-accent' : ''}" href="${l.href}">
            ${l.icon ? svg(l.icon, 18) : ''}${l.label}</a></li>`)}
        </ul>
        <ul class="promo-nav__aside">
          <li><a href="/info/delivery">${svg('truck', 18)}Доставка і оплата</a></li>
          <li><a href="/info/credit">${svg('card', 18)}Розстрочка 0%</a></li>
        </ul>
      </div>
    </nav>
    <div class="overlay" data-overlay hidden></div>`);

  initSearch(el);
  initCatalogMenu(el);
  updateBadges(el);
  store.subscribe(() => updateBadges(el));
  onNavigate((ctx) => {
    closeCatalog(el);
    const input = el.querySelector('.search__input');
    if (ctx.url.pathname === '/search') input.value = ctx.query.get('q') || '';
    else if (document.activeElement !== input) input.value = '';
    el.querySelector('.search__clear').hidden = !input.value;
    el.querySelectorAll('.promo-nav__link').forEach((a) => {
      const u = new URL(a.href);
      a.classList.toggle('is-current', u.pathname === ctx.url.pathname && u.search === ctx.url.search);
    });
  });

  // Elevated shadow once the page scrolls under the sticky header.
  const sentinel = document.createElement('div');
  sentinel.className = 'header-sentinel';
  el.before(sentinel);
  new IntersectionObserver(([e]) => el.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
}

function updateBadges(el) {
  const c = store.cartCount();
  const w = store.state.wishlist.length;
  document.querySelectorAll('[data-cart-count]').forEach((b) => {
    b.textContent = c > 99 ? '99+' : c;
    b.hidden = !c;
  });
  document.querySelectorAll('[data-wish-count]').forEach((b) => {
    b.textContent = w > 99 ? '99+' : w;
    b.hidden = !w;
  });
  const user = store.state.user;
  const label = el.querySelector('[data-user-label]');
  label.textContent = user ? user.name.split(' ')[0] : 'Увійти';
  el.querySelector('.h-action--account').setAttribute('aria-label', user ? `Особистий кабінет: ${user.name}` : 'Увійти в особистий кабінет');
  el.querySelector('.h-action--cart').setAttribute('aria-label', c ? `Кошик, товарів: ${c}` : 'Кошик');
}

// ------------------------------------------------------------------ overlay

function setOverlay(el, on, owner) {
  const ov = el.querySelector('[data-overlay]');
  if (on) {
    ov.dataset.owner = owner;
    ov.hidden = false;
    requestAnimationFrame(() => ov.classList.add('is-visible'));
  } else if (ov.dataset.owner === owner) {
    ov.classList.remove('is-visible');
    ov.dataset.owner = '';
    setTimeout(() => {
      if (!ov.dataset.owner) ov.hidden = true;
    }, 200);
  }
}

// ------------------------------------------------------------------ catalog menu

let catalogLoaded = false;

async function fillCatalog(el) {
  if (catalogLoaded) return;
  const inner = el.querySelector('.catalog-menu__inner');
  mount(inner, html`<div class="catalog-menu__loading">${Array.from({ length: 9 }, () => html`<div class="sk sk--line"></div>`)}</div>`);
  try {
    const tree = await api.categories();
    catalogLoaded = true;
    mount(inner, html`<ul class="catalog-menu__groups" role="menu">
        ${tree.map((g, i) => html`<li role="none"><a role="menuitem" class="catalog-menu__group ${i === 0 ? 'is-active' : ''}" href="/catalog/${g.slug}" data-group="${g.slug}">
          <span class="catalog-menu__gicon">${svg(categoryIcon[g.icon] || 'box', 22)}</span><span>${g.name}</span>${svg('chevronRight', 18)}</a></li>`)}
      </ul>
      <div class="catalog-menu__panels">
        ${tree.map((g, i) => html`<section class="catalog-menu__panel" data-panel="${g.slug}" ${i === 0 ? '' : 'hidden'}>
          <a class="catalog-menu__title" href="/catalog/${g.slug}">${g.name} <span>${g.count} товарів</span></a>
          <div class="catalog-menu__tiles">
            ${g.children.map((c) => html`<a class="cat-tile cat-tile--menu" href="/catalog/${c.slug}">
              <span class="cat-tile__img"><img src="${c.image}" alt="" loading="lazy" width="88" height="88"></span>
              <span class="cat-tile__name">${c.name}</span><span class="cat-tile__count">${c.count} ${c.count === 1 ? 'товар' : c.count < 5 ? 'товари' : 'товарів'}</span></a>`)}
          </div>
        </section>`)}
      </div>`);
    const activate = (slug) => {
      inner.querySelectorAll('.catalog-menu__group').forEach((a) => a.classList.toggle('is-active', a.dataset.group === slug));
      inner.querySelectorAll('.catalog-menu__panel').forEach((p) => {
        p.hidden = p.dataset.panel !== slug;
      });
    };
    let hoverTimer;
    inner.querySelectorAll('.catalog-menu__group').forEach((a) => {
      a.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => activate(a.dataset.group), 70);
      });
      a.addEventListener('focus', () => activate(a.dataset.group));
    });
  } catch (err) {
    mount(inner, html`<p class="catalog-menu__error">Не вдалося завантажити каталог. <a href="/catalog">Відкрити всі товари</a></p>`);
  }
}

function openCatalog(el) {
  const menu = el.querySelector('.catalog-menu');
  const btn = el.querySelector('.catalog-btn');
  closeSearch(el);
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add('is-open'));
  btn.setAttribute('aria-expanded', 'true');
  btn.classList.add('is-active');
  setOverlay(el, true, 'catalog');
  fillCatalog(el);
}

export function closeCatalog(el = document.querySelector('.header')) {
  const menu = el?.querySelector('.catalog-menu');
  if (!menu || menu.hidden) return;
  menu.classList.remove('is-open');
  el.querySelector('.catalog-btn').setAttribute('aria-expanded', 'false');
  el.querySelector('.catalog-btn').classList.remove('is-active');
  setOverlay(el, false, 'catalog');
  setTimeout(() => {
    if (!menu.classList.contains('is-open')) menu.hidden = true;
  }, 180);
}

export function toggleCatalog() {
  const el = document.querySelector('.header');
  if (el.querySelector('.catalog-menu').hidden) openCatalog(el);
  else closeCatalog(el);
}

function initCatalogMenu(el) {
  el.querySelector('[data-overlay]').addEventListener('click', () => {
    closeCatalog(el);
    closeSearch(el);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCatalog(el);
  });
}

// ------------------------------------------------------------------ search

function closeSearch(el) {
  const dd = el.querySelector('.search__dropdown');
  if (dd.hidden) return;
  dd.hidden = true;
  el.querySelector('.search').classList.remove('is-open');
  el.querySelector('.search__input').setAttribute('aria-expanded', 'false');
  setOverlay(el, false, 'search');
}

function highlight(text, q) {
  const tokens = q.trim().split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!tokens.length) return esc(text);
  const re = new RegExp(`(${tokens.join('|')})`, 'gi');
  return esc(text).replace(re, '<mark>$1</mark>');
}

function initSearch(el) {
  const form = el.querySelector('.search');
  const input = el.querySelector('.search__input');
  const dd = el.querySelector('.search__dropdown');
  const clear = el.querySelector('.search__clear');
  let seq = 0;
  let active = -1;

  const open = () => {
    closeCatalog(el);
    dd.hidden = false;
    form.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    setOverlay(el, true, 'search');
  };

  const options = () => [...dd.querySelectorAll('[role="option"]')];
  const setActive = (i) => {
    const opts = options();
    active = opts.length ? (i + opts.length) % opts.length : -1;
    opts.forEach((o, j) => o.classList.toggle('is-active', j === active));
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', opts[active].id);
      opts[active].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const showIdle = () => {
    const recent = store.state.searches;
    mount(dd, html`${recent.length ? html`<div class="suggest__section">
        <div class="suggest__head"><span>Ви шукали</span><button type="button" class="link-btn" data-clear-history>Очистити</button></div>
        ${recent.map((q, i) => html`<a class="suggest__row" role="option" id="sg-r${i}" href="/search?q=${encodeURIComponent(q)}">${svg('clock', 18)}<span>${q}</span></a>`)}
      </div>` : ''}
      <div class="suggest__section">
        <div class="suggest__head"><span>Популярні запити</span></div>
        <div class="suggest__chips">${POPULAR_QUERIES.map((q, i) => html`<a class="chip" role="option" id="sg-p${i}" href="/search?q=${encodeURIComponent(q)}">${q}</a>`)}</div>
      </div>`);
    active = -1;
    open();
  };

  const run = debounce(async () => {
    const q = input.value.trim();
    if (q.length < 2) {
      showIdle();
      return;
    }
    const id = ++seq;
    let res;
    try {
      res = await api.suggest(q);
    } catch {
      return;
    }
    if (id !== seq || document.activeElement !== input) return;
    active = -1;
    if (!res.products.length && !res.categories.length) {
      mount(dd, html`<div class="suggest__none">За запитом «${q}» нічого не знайдено. Спробуйте інше формулювання.</div>`);
    } else {
      mount(dd, html`${res.categories.length ? html`<div class="suggest__section">
          ${res.categories.map((c, i) => html`<a class="suggest__row suggest__row--cat" role="option" id="sg-c${i}" href="/search?q=${encodeURIComponent(q)}&category=${c.slug}">
            ${svg('search', 18)}<span><b>${q}</b> в категорії «${c.name}»</span></a>`)}</div>` : ''}
        <div class="suggest__section">
          ${res.products.map((p, i) => html`<a class="suggest__product" role="option" id="sg-p${i}" href="/product/${p.id}">
            <img src="${p.image}" alt="" width="48" height="48">
            <span class="suggest__name">${html([highlight(p.name, q)])}</span>
            <span class="suggest__price ${p.oldPrice ? 'is-sale' : ''}">${price(p.price)}</span></a>`)}
        </div>
        <a class="suggest__all" role="option" id="sg-all" href="/search?q=${encodeURIComponent(q)}">Усі результати (${num(res.total)}) ${svg('chevronRight', 18)}</a>`);
    }
    open();
  }, 160);

  input.addEventListener('focus', () => (input.value.trim().length >= 2 ? run() : showIdle()));
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    run();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (dd.hidden) open();
      setActive(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      options()[active].click();
    } else if (e.key === 'Escape') {
      closeSearch(el);
      input.blur();
    }
  });
  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    input.focus();
    showIdle();
  });
  dd.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus while clicking suggestions
  dd.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear-history]')) {
      store.clearSearches();
      showIdle();
      return;
    }
    const a = e.target.closest('a');
    if (a) {
      const q = new URL(a.href).searchParams.get('q');
      if (q) store.addSearch(q);
      closeSearch(el);
      input.blur();
    }
  });
  input.addEventListener('blur', () => setTimeout(() => {
    if (document.activeElement !== input) closeSearch(el);
  }, 120));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) {
      input.focus();
      return;
    }
    store.addSearch(q);
    closeSearch(el);
    input.blur();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  });
}
