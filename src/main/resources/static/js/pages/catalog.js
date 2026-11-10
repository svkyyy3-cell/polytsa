import { api } from '../core/api.js';
import { html, mount, num, plural, price } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { navigate } from '../core/router.js';
import { productCard, gridSkeleton, stars } from '../components/productCard.js';
import { breadcrumbs, emptyState } from '../components/states.js';

const svg = (name, size) => html([icon(name, size)]);
const PAGE_SIZE = 24;
const GOODS = ['товар', 'товари', 'товарів'];

const SORTS = [
  ['popular', 'Популярні'],
  ['rating', 'За рейтингом'],
  ['cheap', 'Від дешевих до дорогих'],
  ['expensive', 'Від дорогих до дешевих'],
  ['new', 'Новинки'],
  ['discount', 'Найбільша знижка'],
];

/** Reads the filter state from the URL. */
function readState(ctx) {
  const q = ctx.query;
  const num = (k) => (q.has(k) && q.get(k) !== '' && !Number.isNaN(Number(q.get(k))) ? Number(q.get(k)) : null);
  return {
    slug: ctx.params.slug || null,
    category: ctx.params.slug || q.get('category') || null,
    q: ctx.url.pathname === '/search' ? (q.get('q') || '').trim() : '',
    brands: (q.get('brand') || '').split(',').map((s) => s.trim()).filter(Boolean),
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    rating: num('rating'),
    available: q.get('available') === '1',
    onSale: q.get('onSale') === '1',
    sort: q.get('sort') || 'popular',
    page: Math.max(1, num('page') || 1),
  };
}

/** Builds the URL for a filter state (only non-default values are kept). */
function buildUrl(ctx, s) {
  const base = ctx.url.pathname;
  const sp = new URLSearchParams();
  if (s.q) sp.set('q', s.q);
  if (!s.slug && s.category) sp.set('category', s.category);
  if (s.brands.length) sp.set('brand', s.brands.join(','));
  if (s.minPrice != null) sp.set('minPrice', s.minPrice);
  if (s.maxPrice != null) sp.set('maxPrice', s.maxPrice);
  if (s.rating != null) sp.set('rating', s.rating);
  if (s.available) sp.set('available', '1');
  if (s.onSale) sp.set('onSale', '1');
  if (s.sort && s.sort !== 'popular') sp.set('sort', s.sort);
  if (s.page > 1) sp.set('page', s.page);
  const qs = sp.toString();
  return base + (qs ? `?${qs}` : '');
}

const activeCount = (s) => s.brands.length + (s.minPrice != null || s.maxPrice != null ? 1 : 0)
  + (s.rating != null ? 1 : 0) + (s.available ? 1 : 0) + (s.onSale ? 1 : 0) + (!s.slug && s.category ? 1 : 0);

function title(s, data) {
  if (s.q) return `Результати пошуку «${s.q}»`;
  if (data.category && s.slug) return data.category.name;
  if (s.onSale) return 'Акції та знижки';
  if (s.sort === 'new') return 'Новинки';
  return 'Усі товари';
}

// ------------------------------------------------------------------ filters UI

function filterBlock(id, label, body, collapsed) {
  return html`<section class="filter ${collapsed.has(id) ? 'is-collapsed' : ''}" data-filter="${id}">
    <button class="filter__head" type="button" aria-expanded="${!collapsed.has(id)}" data-collapse="${id}">
      <span>${label}</span>${svg('chevronDown', 18)}</button>
    <div class="filter__body">${body}</div>
  </section>`;
}

function categoryNav(s, data, tree) {
  if (s.slug && tree) {
    const current = tree.flatMap((g) => [g, ...g.children]).find((c) => c.slug === s.slug);
    const group = current?.parent ? tree.find((g) => g.slug === current.parent) : current;
    if (!group) return '';
    const keep = new URLSearchParams(window.location.search);
    keep.delete('page');
    const suffix = keep.toString() ? `?${keep}` : '';
    return html`<ul class="cat-nav">
      ${current?.parent ? html`<li><a class="cat-nav__back" href="/catalog/${group.slug}">${svg('chevronLeft', 16)}${group.name}</a></li>` : ''}
      ${group.children.map((c) => html`<li><a class="cat-nav__link ${c.slug === s.slug ? 'is-current' : ''}" href="/catalog/${c.slug}${suffix}">
        <span>${c.name}</span><span class="cat-nav__count">${c.count}</span></a></li>`)}
    </ul>`;
  }
  const cats = data.facets.categories;
  if (cats.length < 2 && !s.category) return '';
  return html`<ul class="cat-nav">
    ${s.category ? html`<li><button class="cat-nav__back" type="button" data-set-category="">${svg('chevronLeft', 16)}Усі категорії</button></li>` : ''}
    ${cats.map((c) => html`<li><button class="cat-nav__link ${c.slug === s.category ? 'is-current' : ''}" type="button" data-set-category="${c.slug}">
      <span>${c.name}</span><span class="cat-nav__count">${c.count}</span></button></li>`)}
  </ul>`;
}

function filtersHTML(s, data, tree, ui) {
  const f = data.facets;
  const brandQuery = ui.brandQuery.toLowerCase();
  const brands = f.brands.filter((b) => !brandQuery || b.name.toLowerCase().includes(brandQuery));
  const lo = f.priceMin;
  const hi = f.priceMax;
  const minV = s.minPrice ?? lo;
  const maxV = s.maxPrice ?? hi;
  const cats = categoryNav(s, data, tree);

  return html`
    ${cats ? filterBlock('category', 'Категорія', cats, ui.collapsed) : ''}
    ${filterBlock('price', 'Ціна, ₴', html`<form class="price-filter" data-price-form novalidate>
        <div class="price-filter__inputs">
          <input class="input input--sm" name="min" type="number" inputmode="numeric" min="0" value="${minV}" aria-label="Ціна від">
          <span class="price-filter__dash">—</span>
          <input class="input input--sm" name="max" type="number" inputmode="numeric" min="0" value="${maxV}" aria-label="Ціна до">
          <button class="btn btn--primary btn--sm" type="submit">OK</button>
        </div>
        ${hi > lo ? html`<div class="range" style="--lo:${((minV - lo) / (hi - lo)) * 100}%;--hi:${((maxV - lo) / (hi - lo)) * 100}%">
          <div class="range__track"><span class="range__fill"></span></div>
          <input type="range" name="rmin" min="${lo}" max="${hi}" step="1" value="${minV}" aria-label="Мінімальна ціна">
          <input type="range" name="rmax" min="${lo}" max="${hi}" step="1" value="${maxV}" aria-label="Максимальна ціна">
        </div>` : ''}
      </form>`, ui.collapsed)}
    ${filterBlock('brand', 'Бренд', html`
      ${f.brands.length > 7 ? html`<div class="filter__search">${svg('search', 18)}<input class="input input--sm" type="search" placeholder="Пошук бренду" value="${ui.brandQuery}" data-brand-search aria-label="Пошук бренду"></div>` : ''}
      <ul class="checks ${f.brands.length > 8 ? 'checks--scroll' : ''}">
        ${brands.map((b) => html`<li><label class="check ${!b.count && !s.brands.includes(b.name) ? 'is-disabled' : ''}">
          <input type="checkbox" data-brand="${b.name}" ${s.brands.includes(b.name) ? 'checked' : ''} ${!b.count && !s.brands.includes(b.name) ? 'disabled' : ''}>
          <span class="check__box">${svg('check', 14)}</span><span class="check__label">${b.name}</span><span class="check__count">${b.count}</span></label></li>`)}
        ${!brands.length ? html`<li class="checks__none">Бренд не знайдено</li>` : ''}
      </ul>`, ui.collapsed)}
    ${filterBlock('rating', 'Рейтинг', html`<ul class="checks">
      ${f.ratings.map((r) => html`<li><label class="check check--radio ${!r.count ? 'is-disabled' : ''}">
        <input type="radio" name="rating" data-rating="${r.value}" ${s.rating === r.value ? 'checked' : ''} ${!r.count && s.rating !== r.value ? 'disabled' : ''}>
        <span class="check__box"></span><span class="check__label">${stars(r.value, 14)} від ${String(r.value).replace('.', ',')}</span><span class="check__count">${r.count}</span></label></li>`)}
      ${s.rating != null ? html`<li><button class="link-btn" type="button" data-rating-clear>Будь-який рейтинг</button></li>` : ''}
    </ul>`, ui.collapsed)}
    ${filterBlock('availability', 'Наявність та акції', html`<ul class="checks">
      <li><label class="check"><input type="checkbox" data-toggle="available" ${s.available ? 'checked' : ''}>
        <span class="check__box">${svg('check', 14)}</span><span class="check__label">Є в наявності</span><span class="check__count">${f.available}</span></label></li>
      <li><label class="check"><input type="checkbox" data-toggle="onSale" ${s.onSale ? 'checked' : ''}>
        <span class="check__box">${svg('check', 14)}</span><span class="check__label">Зі знижкою</span><span class="check__count">${f.onSale}</span></label></li>
    </ul>`, ui.collapsed)}`;
}

function chipsHTML(s, data) {
  const chips = [];
  if (!s.slug && s.category) {
    const c = data.facets.categories.find((x) => x.slug === s.category);
    chips.push(['category', c ? c.name : s.category]);
  }
  s.brands.forEach((b) => chips.push([`brand:${b}`, b]));
  if (s.minPrice != null || s.maxPrice != null) {
    chips.push(['price', `${s.minPrice != null ? `від ${num(s.minPrice)}` : ''} ${s.maxPrice != null ? `до ${num(s.maxPrice)}` : ''} ₴`.trim()]);
  }
  if (s.rating != null) chips.push(['rating', `Рейтинг від ${String(s.rating).replace('.', ',')}`]);
  if (s.available) chips.push(['available', 'Є в наявності']);
  if (s.onSale) chips.push(['onSale', 'Зі знижкою']);
  if (!chips.length) return '';
  return html`<ul class="chips" aria-label="Обрані фільтри">
    ${chips.map(([k, label]) => html`<li><button class="chip chip--active" type="button" data-remove-filter="${k}" aria-label="Прибрати фільтр ${label}">${label}${svg('close', 14)}</button></li>`)}
    <li><button class="link-btn" type="button" data-reset>Скинути все</button></li>
  </ul>`;
}

function pagerHTML(data, extraLoaded) {
  if (data.pages <= 1) return '';
  const last = data.page + extraLoaded;
  const remaining = data.total - last * PAGE_SIZE;
  const pages = [];
  for (let i = 1; i <= data.pages; i++) {
    if (i === 1 || i === data.pages || Math.abs(i - data.page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return html`<div class="pager">
    ${remaining > 0 ? html`<button class="btn btn--outline pager__more" type="button" data-more>
      ${svg('refresh', 20)}Показати ще ${Math.min(PAGE_SIZE, remaining)} ${plural(Math.min(PAGE_SIZE, remaining), GOODS)}</button>` : ''}
    <nav class="pager__pages" aria-label="Сторінки">
      <button class="pager__arrow" type="button" data-page="${data.page - 1}" ${data.page <= 1 ? 'disabled' : ''} aria-label="Попередня сторінка">${svg('chevronLeft', 20)}</button>
      ${pages.map((p) => (p === '…' ? html`<span class="pager__gap">…</span>`
        : html`<button class="pager__page ${p >= data.page && p <= last ? 'is-current' : ''}" type="button" data-page="${p}" ${p === data.page ? 'aria-current="page"' : ''}>${p}</button>`))}
      <button class="pager__arrow" type="button" data-page="${last + 1}" ${last >= data.pages ? 'disabled' : ''} aria-label="Наступна сторінка">${svg('chevronRight', 20)}</button>
    </nav>
  </div>`;
}

// ------------------------------------------------------------------ page

export async function catalogPage(ctx) {
  const { outlet } = ctx;
  let state = readState(ctx);
  let data = null;
  let tree = null;
  let extraLoaded = 0;
  let reqId = 0;
  let lastCtx = ctx;
  const ui = { collapsed: new Set(), brandQuery: '', sheetOpen: false };

  mount(outlet, html`<div class="container catalog page-pad">
    <div data-crumbs><div class="sk sk--line sk--crumbs"></div></div>
    <header class="catalog__head"><h1 class="page-title" data-title><span class="sk sk--title"></span></h1><span class="catalog__count" data-count></span></header>
    <div data-subcats></div>
    <div class="catalog__layout">
      <aside class="filters" id="filters" aria-label="Фільтри">
        <div class="filters__sheet-head"><h2>Фільтри</h2>
          <button class="icon-btn" type="button" data-close-filters aria-label="Закрити фільтри">${svg('close')}</button></div>
        <div class="filters__body" data-filters>${Array.from({ length: 4 }, () => html`<div class="filter"><div class="sk sk--line"></div><div class="sk sk--line sk--short"></div><div class="sk sk--line sk--short"></div></div>`)}</div>
        <div class="filters__sheet-foot"><button class="btn btn--primary btn--block btn--lg" type="button" data-close-filters data-apply-label>Показати товари</button></div>
      </aside>
      <div class="filters__backdrop" data-close-filters></div>
      <div class="catalog__main">
        <div class="toolbar">
          <button class="btn btn--outline toolbar__filters" type="button" data-open-filters aria-controls="filters">${svg('filter', 20)}Фільтри<span class="toolbar__badge" data-active-count hidden></span></button>
          <div class="toolbar__chips" data-chips></div>
          <label class="sort"><span class="sort__label">Сортування:</span>
            <select class="select" data-sort aria-label="Сортування">${SORTS.map(([v, l]) => html`<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`)}</select>
          </label>
        </div>
        <div data-grid>${gridSkeleton(12, 'grid--catalog')}</div>
        <div data-pager></div>
      </div>
    </div>
  </div>`);

  const $ = (sel) => outlet.querySelector(sel);

  const apply = (patch, { resetPage = true } = {}) => {
    state = { ...state, ...patch };
    if (resetPage) state.page = 1;
    navigate(buildUrl(lastCtx, state), { keepScroll: true });
  };

  const load = async () => {
    const id = ++reqId;
    extraLoaded = 0;
    $('[data-grid]').classList.add('is-busy');
    const res = await api.products({
      category: state.category, q: state.q || null, brand: state.brands, minPrice: state.minPrice, maxPrice: state.maxPrice,
      rating: state.rating, available: state.available, onSale: state.onSale, sort: state.sort, page: state.page, size: PAGE_SIZE,
    });
    if (id !== reqId || !ctx.isCurrent()) return;
    data = res;
    if (state.slug && !res.category) {
      const err = new Error('Категорію не знайдено');
      err.status = 404;
      throw err;
    }
    if (state.slug && !tree) tree = await api.categories().catch(() => null);
    if (id !== reqId) return;
    draw();
  };

  const draw = () => {
    const t = title(state, data);
    document.title = `${t} — Полиця`;
    const crumbs = state.slug && data.path ? data.path.map((p) => ({ name: p.name, href: `/catalog/${p.slug}` }))
      : [{ name: state.q ? 'Пошук' : t, href: '#' }];
    mount($('[data-crumbs]'), breadcrumbs(crumbs));
    $('[data-title]').textContent = t;
    $('[data-count]').textContent = `${num(data.total)} ${plural(data.total, GOODS)}`;

    // Subcategory tiles on group pages
    const group = state.slug && data.category && !data.category.parent && tree ? tree.find((g) => g.slug === state.slug) : null;
    mount($('[data-subcats]'), group ? html`<div class="subcats">${group.children.map((c) => html`<a class="cat-tile cat-tile--sub" href="/catalog/${c.slug}">
      <span class="cat-tile__img"><img src="${c.image}" alt="" width="96" height="96" loading="lazy"></span><span class="cat-tile__name">${c.name}</span>
      <span class="cat-tile__count">${c.count} ${plural(c.count, GOODS)}</span></a>`)}</div>` : '');

    const scrollTop = $('[data-filters]').scrollTop;
    mount($('[data-filters]'), filtersHTML(state, data, tree, ui));
    $('[data-filters]').scrollTop = scrollTop;
    mount($('[data-chips]'), chipsHTML(state, data));
    const n = activeCount(state);
    $('[data-active-count]').textContent = n;
    $('[data-active-count]').hidden = !n;
    $('[data-apply-label]').textContent = `Показати ${num(data.total)} ${plural(data.total, GOODS)}`;
    $('[data-sort]').value = state.sort;

    const grid = $('[data-grid]');
    grid.classList.remove('is-busy');
    if (!data.items.length) {
      mount(grid, emptyState({
        iconName: 'search',
        title: state.q && !n ? `За запитом «${state.q}» нічого не знайдено` : 'Товарів за обраними фільтрами не знайдено',
        text: state.q && !n ? 'Перевірте правильність написання або спробуйте коротший запит, наприклад «iPhone» чи «навушники».' : 'Спробуйте змінити або скинути частину фільтрів.',
        action: n ? html`<button class="btn btn--primary" type="button" data-reset>Скинути фільтри</button>` : html`<a class="btn btn--primary" href="/catalog">Перейти до каталогу</a>`,
      }));
    } else {
      mount(grid, html`<div class="grid grid--catalog">${data.items.map(productCard)}</div>`);
    }
    mount($('[data-pager]'), pagerHTML(data, extraLoaded));
  };

  const loadMore = async (btn) => {
    btn.disabled = true;
    btn.classList.add('is-loading');
    const nextPage = data.page + extraLoaded + 1;
    try {
      const res = await api.products({
        category: state.category, q: state.q || null, brand: state.brands, minPrice: state.minPrice, maxPrice: state.maxPrice,
        rating: state.rating, available: state.available, onSale: state.onSale, sort: state.sort, page: nextPage, size: PAGE_SIZE,
      });
      extraLoaded++;
      $('[data-grid] .grid').insertAdjacentHTML('beforeend', res.items.map((p) => String(productCard(p))).join(''));
      mount($('[data-pager]'), pagerHTML(data, extraLoaded));
    } catch {
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  };

  // ---- events
  const setSheet = (open) => {
    ui.sheetOpen = open;
    outlet.querySelector('.catalog').classList.toggle('filters-open', open);
    document.body.classList.toggle('no-scroll', open);
  };

  outlet.addEventListener('click', (e) => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-collapse]'))) {
      const id = el.dataset.collapse;
      if (ui.collapsed.has(id)) ui.collapsed.delete(id);
      else ui.collapsed.add(id);
      el.closest('.filter').classList.toggle('is-collapsed');
      el.setAttribute('aria-expanded', !ui.collapsed.has(id));
    } else if ((el = t.closest('[data-remove-filter]'))) {
      const k = el.dataset.removeFilter;
      if (k.startsWith('brand:')) apply({ brands: state.brands.filter((b) => b !== k.slice(6)) });
      else if (k === 'price') apply({ minPrice: null, maxPrice: null });
      else if (k === 'rating') apply({ rating: null });
      else if (k === 'category') apply({ category: null });
      else apply({ [k]: false });
    } else if (t.closest('[data-reset]')) {
      apply({ brands: [], minPrice: null, maxPrice: null, rating: null, available: false, onSale: false, category: state.slug || null });
    } else if (t.closest('[data-rating-clear]')) {
      apply({ rating: null });
    } else if ((el = t.closest('[data-set-category]'))) {
      apply({ category: el.dataset.setCategory || null });
    } else if ((el = t.closest('[data-page]'))) {
      apply({ page: Number(el.dataset.page) }, { resetPage: false });
      outlet.querySelector('.catalog__head').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if ((el = t.closest('[data-more]'))) {
      loadMore(el);
    } else if (t.closest('[data-open-filters]')) {
      setSheet(true);
    } else if (t.closest('[data-close-filters]')) {
      setSheet(false);
    }
  });

  outlet.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-brand]')) {
      const b = t.dataset.brand;
      apply({ brands: t.checked ? [...state.brands, b] : state.brands.filter((x) => x !== b) });
    } else if (t.matches('[data-rating]')) {
      apply({ rating: Number(t.dataset.rating) });
    } else if (t.matches('[data-toggle]')) {
      apply({ [t.dataset.toggle]: t.checked });
    } else if (t.matches('[data-sort]')) {
      apply({ sort: t.value });
    } else if (t.matches('input[type="range"]')) {
      applyPrice(t.form);
    }
  });

  const applyPrice = (form) => {
    const lo = data.facets.priceMin;
    const hi = data.facets.priceMax;
    let min = Number(form.min.value);
    let max = Number(form.max.value);
    if (!Number.isFinite(min) || form.min.value === '') min = lo;
    if (!Number.isFinite(max) || form.max.value === '') max = hi;
    if (min > max) [min, max] = [max, min];
    apply({ minPrice: min > lo ? Math.round(min) : null, maxPrice: max < hi ? Math.round(max) : null });
  };

  outlet.addEventListener('submit', (e) => {
    if (!e.target.matches('[data-price-form]')) return;
    e.preventDefault();
    applyPrice(e.target);
  });

  outlet.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('[data-brand-search]')) {
      ui.brandQuery = t.value;
      const pos = t.selectionStart;
      mount($('[data-filters]'), filtersHTML(state, data, tree, ui));
      const input = $('[data-brand-search]');
      input.focus();
      input.setSelectionRange(pos, pos);
    } else if (t.matches('input[type="range"]')) {
      // Live-update the numbers and the highlighted range while dragging.
      const form = t.form;
      let a = Number(form.rmin.value);
      let b = Number(form.rmax.value);
      if (t.name === 'rmin' && a > b) form.rmin.value = a = b;
      if (t.name === 'rmax' && b < a) form.rmax.value = b = a;
      form.min.value = a;
      form.max.value = b;
      const lo = Number(form.rmin.min);
      const hi = Number(form.rmin.max);
      const range = form.querySelector('.range');
      range.style.setProperty('--lo', `${((a - lo) / (hi - lo)) * 100}%`);
      range.style.setProperty('--hi', `${((b - lo) / (hi - lo)) * 100}%`);
    }
  });

  const onKey = (e) => {
    if (e.key === 'Escape' && ui.sheetOpen) setSheet(false);
  };
  document.addEventListener('keydown', onKey);

  await load();

  return {
    async update(newCtx) {
      lastCtx = newCtx;
      ctx = newCtx;
      const next = readState(newCtx);
      state = next;
      await load();
    },
    cleanup() {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    },
  };
}

export { price };
