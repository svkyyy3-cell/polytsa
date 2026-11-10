import { api } from '../core/api.js';
import { html, mount } from '../core/dom.js';
import { icon, categoryIcon } from '../core/icons.js';
import { store } from '../core/store.js';
import { rail, initRails, productGrid, gridSkeleton } from '../components/productCard.js';
import { heroCarousel, initHero } from '../components/carousel.js';
import { INFO_LINKS } from '../components/footer.js';

const svg = (name, size) => html([icon(name, size)]);

function section(title, body, { link, id, cls = '' } = {}) {
  return html`<section class="section ${cls}" ${id ? html`id="${id}"` : ''}>
    <div class="section__head"><h2 class="section__title">${title}</h2>
      ${link ? html`<a class="section__more" href="${link.href}">${link.label}${svg('chevronRight', 18)}</a>` : ''}</div>
    ${body}
  </section>`;
}

function sidebar(categories) {
  const user = store.state.user;
  return html`<aside class="home__aside" aria-label="Категорії">
    <nav class="side-cats">
      <ul>${categories.map((g) => html`<li><a class="side-cats__link" href="/catalog/${g.slug}">
        ${svg(categoryIcon[g.icon] || 'box', 22)}<span>${g.name}</span>${svg('chevronRight', 16)}</a></li>`)}</ul>
    </nav>
    <div class="aside-card">
      ${user ? html`<p class="aside-card__title">Вітаємо, ${user.name.split(' ')[0]}!</p>
          <p class="aside-card__text">Статус замовлень і обрані товари — в особистому кабінеті.</p>
          <a class="btn btn--primary btn--block btn--sm" href="/account">Особистий кабінет</a>`
        : html`<p class="aside-card__title">Ласкаво просимо!</p>
          <p class="aside-card__text">Увійдіть, щоб отримувати рекомендації, персональні бонуси та знижки.</p>
          <button class="btn btn--primary btn--block btn--sm" type="button" data-action="open-auth">Увійти в кабінет</button>`}
    </div>
    <nav class="aside-links" aria-label="Покупцям">
      <h3>Покупцям</h3>
      ${INFO_LINKS.slice(0, 5).map((l) => html`<a href="${l.href}">${l.label}</a>`)}
    </nav>
  </aside>`;
}

function categoryTiles(categories) {
  const leaves = categories.flatMap((g) => g.children).sort((a, b) => b.count - a.count).slice(0, 12);
  return html`<div class="cat-grid">${leaves.map((c) => html`<a class="cat-tile" href="/catalog/${c.slug}">
    <span class="cat-tile__img"><img src="${c.image}" alt="" loading="lazy" width="120" height="120"></span>
    <span class="cat-tile__name">${c.name}</span></a>`)}</div>`;
}

function promoTiles(promos) {
  return html`<div class="promo-grid">${promos.map((p) => html`<a class="promo promo--${p.theme}" href="${p.link}">
    <div class="promo__text"><h3>${p.title}</h3><p>${p.subtitle}</p><span class="promo__cta">${p.cta}${svg('chevronRight', 16)}</span></div>
    <img class="promo__img" src="${p.image}" alt="" loading="lazy" width="400" height="300"></a>`)}</div>`;
}

function brandGrid(brands) {
  return html`<div class="brand-grid">${brands.map((b) => html`<a class="brand" href="/catalog?brand=${encodeURIComponent(b.name)}">
    <span class="brand__name">${b.name}</span><span class="brand__count">${b.count} ${b.count === 1 ? 'товар' : b.count < 5 ? 'товари' : 'товарів'}</span></a>`)}</div>`;
}

function skeletonPage() {
  return html`<div class="container home">
    <aside class="home__aside"><div class="side-cats">${Array.from({ length: 9 }, () => html`<div class="sk sk--line sk--menu"></div>`)}</div></aside>
    <div class="home__main">
      <div class="sk sk--hero"></div>
      ${section('Пропозиції тижня', rail([], { skeleton: true }))}
    </div>
  </div>`;
}

export async function homePage({ outlet, isCurrent }) {
  document.title = 'Полиця — інтернет-магазин техніки та товарів для дому';
  mount(outlet, skeletonPage());
  const data = await api.home();
  if (!isCurrent()) return null;

  mount(outlet, html`<div class="container home">
    ${sidebar(data.categories)}
    <div class="home__main">
      ${heroCarousel(data.slides)}
      ${section('Пропозиції тижня', rail(data.featured), { link: { href: '/catalog?sort=popular', label: 'Усі пропозиції' } })}
      ${section('Популярні категорії', categoryTiles(data.categories), { link: { href: '/catalog', label: 'Увесь каталог' } })}
      ${section('Хіти продажів', rail(data.bestsellers), { link: { href: '/catalog?sort=popular', label: 'Дивитися всі' } })}
      ${promoTiles(data.promos)}
      ${section('Знижки та акції', rail(data.discounts), { link: { href: '/catalog?onSale=1&sort=discount', label: 'Усі акції' }, cls: 'section--sale' })}
      <div data-recent></div>
      ${section('Рекомендуємо для вас', productGrid(data.recommended, 'grid--dense'))}
      ${section('Популярні бренди', brandGrid(data.brands))}
      <section class="section seo-text">
        <h1>Полиця — онлайн-гіпермаркет техніки та товарів для дому</h1>
        <p>Смартфони, ноутбуки, телевізори, побутова техніка, кросівки, парфумерія та тисячі інших товарів з офіційною гарантією.
        Доставляємо по всій Україні у відділення Нової пошти, Укрпошти, поштомати та кур’єром, а замовлення від 1 000 ₴ — безкоштовно.
        Оплачуйте карткою онлайн, під час отримання або частинами — у розстрочку 0% до 10 платежів.</p>
      </section>
    </div>
  </div>`);

  initRails(outlet);
  const stopHero = initHero(outlet);
  renderRecent(outlet.querySelector('[data-recent]'));

  return { cleanup: stopHero };
}

/** "Recently viewed" row; renders nothing when the shopper has not viewed anything yet. */
export async function renderRecent(slot, { exclude } = {}) {
  if (!slot) return;
  const ids = store.state.recent.filter((id) => id !== exclude).slice(0, 12);
  if (!ids.length) {
    slot.innerHTML = '';
    return;
  }
  mount(slot, section('Ви нещодавно переглядали', rail([], { skeleton: true })));
  try {
    const res = await api.products({ ids, size: 12 });
    if (!res.items.length) {
      slot.innerHTML = '';
      return;
    }
    mount(slot, section('Ви нещодавно переглядали', rail(res.items), { id: 'recent' }));
    const head = slot.querySelector('.section__head');
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'link-btn';
    clear.textContent = 'Очистити';
    clear.addEventListener('click', () => {
      store.clearRecent();
      slot.innerHTML = '';
    });
    head.append(clear);
    initRails(slot);
  } catch {
    slot.innerHTML = '';
  }
}

export { gridSkeleton };
