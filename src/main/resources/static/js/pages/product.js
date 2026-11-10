import { api } from '../core/api.js';
import { html, mount, num, plural, price, date } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { rail, initRails, stars, stockClass, REVIEW_FORMS } from '../components/productCard.js';
import { breadcrumbs } from '../components/states.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { renderRecent } from './home.js';

const svg = (name, size) => html([icon(name, size)]);

const DELIVERY_ICONS = { pickup: 'store', branch: 'box', courier: 'truck', ukrposhta: 'mail' };

function skeleton() {
  return html`<div class="container page-pad pdp">
    <div class="sk sk--line sk--crumbs"></div>
    <div class="sk sk--title sk--title-lg"></div>
    <div class="pdp__top">
      <div class="sk sk--gallery"></div>
      <div class="pdp__aside"><div class="sk sk--buybox"></div></div>
    </div>
  </div>`;
}

function gallery(p) {
  const many = p.images.length > 1;
  return html`<div class="gallery" data-gallery>
    ${many ? html`<div class="gallery__thumbs" role="tablist" aria-label="Фото товару">
      ${p.images.map((src, i) => html`<button class="gallery__thumb ${i ? '' : 'is-active'}" type="button" role="tab" aria-selected="${!i}" data-thumb="${i}" aria-label="Фото ${i + 1}">
        <img src="${src}" alt="" width="72" height="72"></button>`)}
    </div>` : ''}
    <div class="gallery__main">
      <div class="gallery__track">
        ${p.images.map((src, i) => html`<button class="gallery__slide" type="button" data-zoom="${i}" aria-label="Відкрити фото ${i + 1} на весь екран">
          <img src="${src}" alt="${i ? '' : p.name}" width="600" height="600" ${i ? 'loading="lazy"' : ''}></button>`)}
      </div>
      ${many ? html`<button class="gallery__nav gallery__nav--prev" type="button" data-step="-1" aria-label="Попереднє фото">${svg('chevronLeft')}</button>
        <button class="gallery__nav gallery__nav--next" type="button" data-step="1" aria-label="Наступне фото">${svg('chevronRight')}</button>
        <div class="gallery__dots">${p.images.map((_, i) => html`<span class="${i ? '' : 'is-active'}"></span>`)}</div>` : ''}
      <div class="gallery__badges">
        ${p.discount ? html`<span class="badge badge--sale">−${p.discount}%</span>` : ''}
        ${p.badge === 'top' ? html`<span class="badge badge--top">Топ продажів</span>` : ''}
        ${p.badge === 'new' ? html`<span class="badge badge--new">Новинка</span>` : ''}
      </div>
      <span class="gallery__zoom-hint">${svg('zoom', 18)}</span>
    </div>
  </div>`;
}

function buyButtons(p) {
  if (p.stock === 'out') {
    return html`<button class="btn btn--disabled btn--lg btn--buy" type="button" disabled>Немає в наявності</button>`;
  }
  const inCart = store.inCart(p.id);
  return html`<button class="btn ${inCart ? 'btn--outline-green' : 'btn--primary'} btn--lg btn--buy" type="button"
      data-action="${inCart ? 'open-cart' : 'cart-add'}" data-id="${p.id}" data-source="pdp">
      ${svg(inCart ? 'cartCheck' : 'cart', 24)}${inCart ? 'У кошику' : 'Купити'}</button>`;
}

function wishButtonLarge(p) {
  const on = store.inWishlist(p.id);
  return html`<button class="icon-btn icon-btn--bordered wish-btn ${on ? 'is-active' : ''}" type="button" data-action="wish-toggle" data-id="${p.id}"
    aria-pressed="${on}" aria-label="${on ? 'Прибрати зі списку бажань' : 'Додати до списку бажань'}">${svg(on ? 'heartFilled' : 'heart', 24)}</button>`;
}

function buyBox(p) {
  return html`<div class="buybox">
    <div class="buybox__stock ${stockClass(p.stock)}">${p.stock !== 'out' ? svg('check', 18) : ''}${p.stockLabel}</div>
    <div class="buybox__row">
      <div class="buybox__prices">
        ${p.oldPrice ? html`<div class="buybox__old"><s>${price(p.oldPrice)}</s><span class="badge badge--sale">−${p.discount}%</span></div>` : ''}
        <div class="buybox__price ${p.oldPrice ? 'is-sale' : ''}">${num(p.price)}<span class="cur">₴</span></div>
      </div>
      <div class="buybox__buttons" data-buy>${buyButtons(p)}${wishButtonLarge(p)}</div>
    </div>
    ${p.oldPrice ? html`<p class="buybox__save">Економія ${price(p.oldPrice - p.price)}</p>` : ''}
    ${p.installment && p.stock !== 'out' ? html`<a class="buybox__credit" href="/info/credit">${svg('card', 20)}
      <span>Розстрочка 0% — від <b>${price(p.installment)}</b>/міс на 10 місяців</span>${svg('chevronRight', 18)}</a>` : ''}
  </div>`;
}

function deliveryBox(p) {
  return html`<div class="info-box">
    <h3 class="info-box__title">Доставка по Україні</h3>
    <ul class="delivery-list">
      ${p.delivery.map((d) => html`<li>
        <span class="delivery-list__icon">${svg(DELIVERY_ICONS[d.id] || 'truck', 22)}</span>
        <span class="delivery-list__name">${d.name}<small>Відправимо ${d.date}</small></span>
        <span class="delivery-list__price ${d.price === 'Безкоштовно' ? 'is-free' : ''}">${d.price}</span>
      </li>`)}
    </ul>
  </div>
  <div class="info-box info-box--grid">
    <div>${svg('card', 22)}<p><b>Оплата.</b> Під час отримання, карткою онлайн, Apple Pay, Google Pay, розстрочка 0%.</p></div>
    <div>${svg('shield', 22)}<p><b>Гарантія.</b> Офіційна гарантія виробника. <a href="/info/warranty">Умови гарантії</a></p></div>
    <div>${svg('refresh', 22)}<p><b>Обмін і повернення</b> протягом 14 днів. <a href="/info/returns">Детальніше</a></p></div>
  </div>`;
}

function specsTable(specs, limit) {
  const rows = limit ? specs.slice(0, limit) : specs;
  return html`<dl class="specs">${rows.map((s) => html`<div class="specs__row"><dt><span>${s.name}</span></dt><dd>${s.value}</dd></div>`)}</dl>`;
}

function histogram(p, h) {
  const total = h.reduce((a, b) => a + b.count, 0) || 1;
  return html`<div class="rv-summary">
    <div class="rv-summary__score"><b data-rv-rating>${String(p.rating).replace('.', ',')}</b>${stars(p.rating, 20)}
      <span data-rv-total>${num(p.reviews)} ${plural(p.reviews, REVIEW_FORMS)}</span></div>
    <ul class="rv-summary__bars">${h.map((r) => html`<li><span class="rv-summary__stars">${r.stars} ${svg('star', 14)}</span>
      <span class="rv-summary__bar"><span style="width:${(r.count / total) * 100}%"></span></span><span class="rv-summary__n">${num(r.count)}</span></li>`)}</ul>
    <button class="btn btn--primary" type="button" data-write-review>${svg('edit', 20)}Написати відгук</button>
  </div>`;
}

function reviewItem(r) {
  return html`<li class="review">
    <header class="review__head"><span class="avatar avatar--sm">${r.author[0]}</span>
      <span class="review__author">${r.author}</span>
      ${r.verified ? html`<span class="review__verified">${svg('check', 14)}Купив на Полиці</span>` : ''}
      <time class="review__date" datetime="${r.date}">${date(r.date)}</time></header>
    ${stars(r.rating, 16)}
    <p class="review__text">${r.text}</p>
    ${r.pros ? html`<p class="review__meta"><b>Переваги:</b> ${r.pros}</p>` : ''}
    ${r.cons ? html`<p class="review__meta"><b>Недоліки:</b> ${r.cons}</p>` : ''}
  </li>`;
}

export async function productPage(ctx) {
  const { outlet, params, isCurrent } = ctx;
  mount(outlet, skeleton());
  const p = await api.product(params.id);
  if (!isCurrent()) return null;
  document.title = `${p.name} — купити за ${num(p.price)} ₴ | Полиця`;
  store.addRecent(p.id);

  const specPreview = p.specs.length > 6 ? 6 : p.specs.length;

  mount(outlet, html`<div class="container page-pad pdp">
    ${breadcrumbs([...p.path.map((c) => ({ name: c.name, href: `/catalog/${c.slug}` })), { name: p.name }])}
    <h1 class="pdp__title">${p.name}</h1>
    <div class="pdp__meta">
      <a href="#reviews" class="pdp__rating" data-tab-link="reviews">${stars(p.rating, 18)}<span>${num(p.reviews)} ${plural(p.reviews, REVIEW_FORMS)}</span></a>
      <span class="pdp__code">Код: <b>${String(p.id).padStart(7, '0')}</b></span>
      <a class="pdp__brand" href="/catalog?brand=${encodeURIComponent(p.brand)}">Усі товари ${p.brand}</a>
    </div>
    <nav class="pdp-tabs" aria-label="Розділи сторінки товару">
      <a href="#about" class="pdp-tabs__tab is-active" data-tab-link="about">Усе про товар</a>
      <a href="#specs" class="pdp-tabs__tab" data-tab-link="specs">Характеристики</a>
      <a href="#reviews" class="pdp-tabs__tab" data-tab-link="reviews">Відгуки <span>${num(p.reviews)}</span></a>
      <a href="#similar" class="pdp-tabs__tab" data-tab-link="similar">Схожі товари</a>
    </nav>

    <div class="pdp__top" id="about">
      ${gallery(p)}
      <div class="pdp__aside">
        ${buyBox(p)}
        ${deliveryBox(p)}
      </div>
    </div>

    <div class="pdp__content">
      <section class="pdp-section">
        <h2 class="pdp-section__title">Опис ${p.name}</h2>
        <p class="pdp__desc">${p.description}</p>
        <h3 class="pdp-section__sub">Коротко про характеристики</h3>
        ${specsTable(p.specs, specPreview)}
        ${p.specs.length > specPreview ? html`<a class="link-more" href="#specs" data-tab-link="specs">Усі характеристики ${svg('chevronRight', 16)}</a>` : ''}
      </section>
      <section class="pdp-section" id="specs">
        <h2 class="pdp-section__title">Характеристики ${p.name}</h2>
        ${specsTable([{ name: 'Бренд', value: p.brand }, ...p.specs])}
      </section>
      <section class="pdp-section" id="reviews">
        <h2 class="pdp-section__title">Відгуки покупців <span class="muted">${num(p.reviews)}</span></h2>
        <div data-rv-summary>${histogram(p, p.ratingHistogram)}</div>
        <ul class="reviews" data-reviews><li class="review"><div class="sk sk--line"></div><div class="sk sk--line sk--short"></div></li></ul>
        <div class="reviews__more" data-reviews-more></div>
      </section>
    </div>

    ${p.similar.length ? html`<section class="section" id="similar"><div class="section__head"><h2 class="section__title">Схожі товари</h2>
      <a class="section__more" href="/catalog/${p.category}">Усі в категорії ${svg('chevronRight', 18)}</a></div>${rail(p.similar)}</section>` : ''}
    <div data-recent></div>
  </div>
  <div class="buy-bar" data-buy-bar>
    <div class="buy-bar__price">${p.oldPrice ? html`<s>${price(p.oldPrice)}</s>` : ''}<b class="${p.oldPrice ? 'is-sale' : ''}">${price(p.price)}</b></div>
    <div class="buy-bar__btns" data-buy>${buyButtons(p)}</div>
  </div>`);

  initRails(outlet);
  renderRecent(outlet.querySelector('[data-recent]'), { exclude: p.id });
  const cleanups = [initGallery(outlet, p), initTabs(outlet), initReviews(outlet, p)];

  // Keep the buy buttons in sync with the cart / wishlist.
  const unsub = store.subscribe((type) => {
    if (type !== 'cart' && type !== 'wishlist' && type !== 'sync') return;
    outlet.querySelectorAll('.buybox [data-buy]').forEach((el) => mount(el, html`${buyButtons(p)}${wishButtonLarge(p)}`));
    outlet.querySelectorAll('.buy-bar [data-buy]').forEach((el) => mount(el, buyButtons(p)));
  });

  // Show the compact buy bar once the main buy button scrolls out of view.
  const bar = outlet.querySelector('[data-buy-bar]');
  const buybox = outlet.querySelector('.buybox');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      bar.classList.toggle('is-visible', buybox.getBoundingClientRect().bottom < 0);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (location.hash) {
    const target = outlet.querySelector(location.hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  return {
    cleanup() {
      cleanups.forEach((fn) => fn?.());
      unsub();
      window.removeEventListener('scroll', onScroll);
    },
  };
}

// ------------------------------------------------------------------ gallery

function initGallery(root, p) {
  const g = root.querySelector('[data-gallery]');
  const track = g.querySelector('.gallery__track');
  const n = p.images.length;
  let i = 0;
  const go = (k) => {
    i = (k + n) % n;
    track.style.transform = `translateX(${-i * 100}%)`;
    g.querySelectorAll('[data-thumb]').forEach((t, j) => {
      t.classList.toggle('is-active', j === i);
      t.setAttribute('aria-selected', j === i);
    });
    g.querySelectorAll('.gallery__dots span').forEach((d, j) => d.classList.toggle('is-active', j === i));
  };
  g.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-thumb]');
    const step = e.target.closest('[data-step]');
    const zoom = e.target.closest('[data-zoom]');
    if (thumb) go(Number(thumb.dataset.thumb));
    else if (step) go(i + Number(step.dataset.step));
    else if (zoom && !g.dataset.swiped) openLightbox(p, Number(zoom.dataset.zoom));
  });
  g.querySelectorAll('[data-thumb]').forEach((t) => t.addEventListener('mouseenter', () => go(Number(t.dataset.thumb))));

  // swipe on touch screens
  let x0 = null;
  const main = g.querySelector('.gallery__main');
  main.addEventListener('touchstart', (e) => {
    x0 = e.touches[0].clientX;
    delete g.dataset.swiped;
  }, { passive: true });
  main.addEventListener('touchend', (e) => {
    if (x0 == null || n < 2) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) {
      g.dataset.swiped = '1';
      go(i + (dx < 0 ? 1 : -1));
      setTimeout(() => delete g.dataset.swiped, 300);
    }
    x0 = null;
  });
  return null;
}

function openLightbox(p, start) {
  let i = start;
  const m = openModal({
    variant: 'center',
    size: 'xl',
    label: `Фото: ${p.name}`,
    className: 'lightbox',
    content: html`<div class="lightbox__stage">
      <button class="icon-btn lightbox__close" type="button" data-close aria-label="Закрити">${svg('close', 28)}</button>
      <img class="lightbox__img" src="${p.images[i]}" alt="${p.name}">
      ${p.images.length > 1 ? html`<button class="lightbox__nav lightbox__nav--prev" type="button" data-lb="-1" aria-label="Попереднє фото">${svg('chevronLeft', 32)}</button>
        <button class="lightbox__nav lightbox__nav--next" type="button" data-lb="1" aria-label="Наступне фото">${svg('chevronRight', 32)}</button>` : ''}
      <span class="lightbox__counter">${i + 1} / ${p.images.length}</span>
    </div>`,
  });
  const img = m.el.querySelector('.lightbox__img');
  const counter = m.el.querySelector('.lightbox__counter');
  const go = (k) => {
    i = (k + p.images.length) % p.images.length;
    img.src = p.images[i];
    counter.textContent = `${i + 1} / ${p.images.length}`;
  };
  m.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]');
    if (b) go(i + Number(b.dataset.lb));
  });
  m.el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(i - 1);
    if (e.key === 'ArrowRight') go(i + 1);
  });
}

// ------------------------------------------------------------------ tabs

function initTabs(root) {
  const tabs = [...root.querySelectorAll('.pdp-tabs__tab')];
  root.addEventListener('click', (e) => {
    const link = e.target.closest('[data-tab-link]');
    if (!link) return;
    e.preventDefault();
    const target = root.querySelector(`#${link.dataset.tabLink}`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(history.state, '', `#${link.dataset.tabLink}`);
  });
  const sections = tabs.map((t) => root.querySelector(`#${t.dataset.tabLink}`)).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tabLink === visible.target.id));
  }, { rootMargin: '-140px 0px -55% 0px' });
  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

// ------------------------------------------------------------------ reviews

function initReviews(root, p) {
  const list = root.querySelector('[data-reviews]');
  const more = root.querySelector('[data-reviews-more]');
  let page = 0;
  let pages = 1;

  const loadPage = async (reset = false) => {
    if (reset) page = 0;
    const res = await api.reviews(p.id, page + 1);
    page = res.page;
    pages = res.pages;
    const items = res.items.map((r) => String(reviewItem(r))).join('');
    if (reset || page === 1) list.innerHTML = items;
    else list.insertAdjacentHTML('beforeend', items);
    mount(more, page < pages ? html`<button class="btn btn--outline" type="button" data-more-reviews>Показати ще відгуки</button>` : '');
  };

  more.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-more-reviews]');
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add('is-loading');
    try {
      await loadPage();
    } catch {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      toast('Не вдалося завантажити відгуки', { type: 'error' });
    }
  });

  root.querySelector('[data-rv-summary]').addEventListener('click', (e) => {
    if (e.target.closest('[data-write-review]')) openReviewForm(p, async (res) => {
      p.rating = res.rating;
      p.reviews = res.total;
      mount(root.querySelector('[data-rv-summary]'), histogram(p, res.histogram));
      root.querySelectorAll('.pdp-tabs__tab[data-tab-link="reviews"] span, .pdp-section#reviews .muted').forEach((el) => {
        el.textContent = num(res.total);
      });
      root.querySelector('.pdp__rating').innerHTML = `${stars(p.rating, 18)}<span>${num(p.reviews)} ${plural(p.reviews, REVIEW_FORMS)}</span>`;
      await loadPage(true);
    });
  });

  loadPage().catch(() => {
    list.innerHTML = '<li class="review review--error">Не вдалося завантажити відгуки.</li>';
  });
  return null;
}

function openReviewForm(p, onDone) {
  const user = store.state.user;
  const m = openModal({
    title: 'Написати відгук',
    size: 'md',
    content: html`<form class="form review-form" novalidate>
      <div class="review-form__product"><img src="${p.image}" alt="" width="56" height="56"><span>${p.name}</span></div>
      <fieldset class="field">
        <legend class="field__label">Ваша оцінка</legend>
        <div class="rate-input" role="radiogroup" aria-label="Оцінка">
          ${[5, 4, 3, 2, 1].map((v) => html`<input type="radio" name="rating" id="rate${v}" value="${v}"><label for="rate${v}" title="${v}" aria-label="${v} з 5">${svg('star', 32)}</label>`)}
        </div>
        <span class="field__error" data-error="rating"></span>
      </fieldset>
      <label class="field"><span class="field__label">Ваше ім’я</span>
        <input class="input" name="author" maxlength="60" value="${user?.name || ''}" autocomplete="name"><span class="field__error" data-error="author"></span></label>
      <label class="field"><span class="field__label">Переваги</span><input class="input" name="pros" maxlength="300"></label>
      <label class="field"><span class="field__label">Недоліки</span><input class="input" name="cons" maxlength="300"></label>
      <label class="field"><span class="field__label">Коментар</span>
        <textarea class="input textarea" name="text" rows="4" maxlength="2000" placeholder="Розкажіть, що сподобалося чи ні, як користуєтесь товаром"></textarea>
        <span class="field__error" data-error="text"></span></label>
      <p class="form__error" data-form-error hidden></p>
      <button class="btn btn--primary btn--lg btn--block" type="submit">Опублікувати відгук</button>
    </form>`,
  });
  const form = m.el.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating = Number(form.rating.value || 0);
    const body = { rating, author: form.author.value.trim(), text: form.text.value.trim(), pros: form.pros.value, cons: form.cons.value };
    const errors = {};
    if (!rating) errors.rating = 'Оберіть кількість зірок';
    if (body.author.length < 2) errors.author = 'Вкажіть ім’я';
    if (body.text.length < 10) errors.text = 'Напишіть щонайменше 10 символів';
    form.querySelectorAll('[data-error]').forEach((el) => {
      el.textContent = errors[el.dataset.error] || '';
    });
    form.author.classList.toggle('is-invalid', !!errors.author);
    form.text.classList.toggle('is-invalid', !!errors.text);
    if (Object.keys(errors).length) return;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.classList.add('is-loading');
    try {
      const res = await api.addReview(p.id, body);
      m.close();
      toast('Дякуємо! Ваш відгук опубліковано.');
      onDone(res);
    } catch (err) {
      const fe = form.querySelector('[data-form-error]');
      fe.textContent = err.message;
      fe.hidden = false;
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  });
}
