import { api } from '../core/api.js';
import { html, mount } from '../core/dom.js';
import { icon, categoryIcon } from '../core/icons.js';
import { store } from '../core/store.js';
import { openModal } from './modal.js';
import { LOGO } from './header.js';
import { INFO_LINKS, SUPPORT_PHONE } from './footer.js';

const svg = (name, size) => html([icon(name, size)]);

/** Left drawer: account, full category tree (accordion) and service links. */
export function openSideMenu({ expandCatalog = false } = {}) {
  const user = store.state.user;
  const m = openModal({
    variant: 'left',
    label: 'Меню',
    className: 'side-menu',
    content: html`<div class="side-menu__head">
        <a class="logo logo--dark" href="/">${LOGO}<span class="logo__text">полиця</span></a>
        <button class="icon-btn" type="button" data-close aria-label="Закрити меню">${svg('close')}</button>
      </div>
      <div class="side-menu__user">
        ${user ? html`<a class="side-menu__profile" href="/account"><span class="avatar">${user.name[0]}</span>
            <span><b>${user.name}</b><small>${user.phone}</small></span></a>`
          : html`<div class="side-menu__auth"><span class="avatar">${svg('user', 22)}</span>
            <div><p>Увійдіть, щоб бачити замовлення та отримувати персональні знижки</p>
            <button class="btn btn--primary btn--sm" type="button" data-action="open-auth">Увійти</button></div></div>`}
      </div>
      <nav class="side-menu__section" aria-label="Каталог">
        <button class="side-menu__catalog" type="button" aria-expanded="${expandCatalog}" data-toggle-catalog>
          ${svg('grid', 22)}<span>Каталог товарів</span>${svg('chevronDown', 20)}
        </button>
        <ul class="side-menu__tree" ${expandCatalog ? '' : 'hidden'}><li class="side-menu__loading">Завантаження…</li></ul>
      </nav>
      <nav class="side-menu__section" aria-label="Покупки">
        <a class="side-menu__link" href="/catalog?onSale=1&sort=discount">${svg('percent', 22)}Акції</a>
        <a class="side-menu__link" href="/wishlist">${svg('heart', 22)}Список бажань</a>
        <a class="side-menu__link" href="/cart">${svg('cart', 22)}Кошик</a>
        <a class="side-menu__link" href="/account">${svg('box', 22)}Мої замовлення</a>
      </nav>
      <nav class="side-menu__section" aria-label="Інформація">
        ${INFO_LINKS.map((l) => html`<a class="side-menu__link side-menu__link--plain" href="${l.href}">${l.label}</a>`)}
      </nav>
      <div class="side-menu__section side-menu__contacts">
        <a href="tel:${SUPPORT_PHONE.replace(/\s/g, '')}">${svg('phone', 20)}${SUPPORT_PHONE}</a>
        <span>${svg('clock', 20)}Щодня з 8:00 до 21:00</span>
      </div>`,
  });

  const tree = m.el.querySelector('.side-menu__tree');
  const toggle = m.el.querySelector('[data-toggle-catalog]');
  toggle.addEventListener('click', () => {
    const openNow = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', openNow);
    tree.hidden = !openNow;
  });

  api.categories().then((cats) => {
    mount(tree, html`${cats.map((g) => html`<li class="side-menu__group">
      <details>
        <summary>${svg(categoryIcon[g.icon] || 'box', 20)}<span>${g.name}</span>${svg('chevronDown', 18)}</summary>
        <ul>
          <li><a href="/catalog/${g.slug}">Усі товари розділу <span>${g.count}</span></a></li>
          ${g.children.map((c) => html`<li><a href="/catalog/${c.slug}">${c.name} <span>${c.count}</span></a></li>`)}
        </ul>
      </details></li>`)}`);
  }).catch(() => {
    mount(tree, html`<li><a href="/catalog">Усі товари</a></li>`);
  });
  return m;
}
