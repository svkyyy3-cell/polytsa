import { api } from '../core/api.js';
import { html, mount, num, plural, price, esc } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { productGrid, gridSkeleton, refreshCardButtons } from '../components/productCard.js';
import { breadcrumbs, emptyState } from '../components/states.js';
import { openAuth, bindPhoneInput, formatPhone, isValidPhone } from '../components/auth.js';
import { toast } from '../components/toast.js';
import { orderDetails } from './checkout.js';
import { renderRecent } from './home.js';
import { INFO_LINKS, SUPPORT_PHONE } from '../components/footer.js';
import { qrSvg, siteUrl, downloadSvg, downloadPng } from '../components/qr.js';

const svg = (name, size) => html([icon(name, size)]);
const GOODS = ['товар', 'товари', 'товарів'];

// ------------------------------------------------------------------ /wishlist

export async function wishlistPage({ outlet, isCurrent }) {
  document.title = 'Список бажань — Полиця';

  const draw = async () => {
    const ids = store.state.wishlist;
    if (!ids.length) {
      mount(outlet, html`<div class="container page-pad">
        ${breadcrumbs([{ name: 'Список бажань' }])}
        <h1 class="page-title">Список бажань</h1>
        ${emptyState({ iconName: 'heart', title: 'Список бажань порожній',
          text: 'Натискайте на сердечко на картці товару, щоб зберегти його тут і повернутися до нього пізніше.',
          action: html`<a class="btn btn--primary" href="/catalog?sort=popular">Переглянути хіти продажів</a>` })}
      </div>`);
      return;
    }
    if (!outlet.querySelector('[data-wl-grid]')) {
      mount(outlet, html`<div class="container page-pad">
        ${breadcrumbs([{ name: 'Список бажань' }])}
        <div class="page-head"><h1 class="page-title">Список бажань <span class="muted" data-wl-count></span></h1>
          <div class="page-head__actions">
            <button class="btn btn--primary" type="button" data-wl-all>${svg('cart', 20)}Купити все</button>
            <button class="btn btn--ghost" type="button" data-wl-clear>${svg('trash', 20)}Очистити</button>
          </div></div>
        <div class="wl-total" data-wl-total></div>
        <div data-wl-grid>${gridSkeleton(Math.min(ids.length, 10))}</div>
      </div>`);
    }
    const res = await api.products({ ids, size: 60 });
    if (!isCurrent()) return;
    const items = res.items;
    outlet.querySelector('[data-wl-count]').textContent = `${items.length}`;
    const buyable = items.filter((p) => p.stock !== 'out');
    mount(outlet.querySelector('[data-wl-total]'), html`${items.length} ${plural(items.length, GOODS)} на суму <b>${price(buyable.reduce((s, p) => s + p.price, 0))}</b>`);
    mount(outlet.querySelector('[data-wl-grid]'), productGrid(items));
    outlet.querySelector('[data-wl-all]').disabled = !buyable.some((p) => !store.inCart(p.id));
    outlet._wl = buyable;
  };

  outlet.addEventListener('click', (e) => {
    if (e.target.closest('[data-wl-all]')) {
      const list = outlet._wl || [];
      let added = 0;
      list.forEach((p) => {
        if (!store.inCart(p.id)) {
          store.addToCart(p.id);
          added++;
        }
      });
      if (added) toast(`Додано до кошика: ${added} ${plural(added, GOODS)}`, { link: { href: '/cart', label: 'До кошика' } });
    } else if (e.target.closest('[data-wl-clear]')) {
      store.clearWishlist();
    }
  });

  await draw();
  const unsub = store.subscribe((type) => {
    if (type === 'wishlist' || type === 'sync') draw();
    if (type === 'cart') {
      refreshCardButtons(outlet);
      const btn = outlet.querySelector('[data-wl-all]');
      if (btn) btn.disabled = !(outlet._wl || []).some((p) => !store.inCart(p.id));
    }
  });
  return { cleanup: unsub };
}

// ------------------------------------------------------------------ /account

export async function accountPage({ outlet, isCurrent }) {
  document.title = 'Особистий кабінет — Полиця';
  const user = store.state.user;
  if (!user) {
    mount(outlet, html`<div class="container page-pad page-narrow">
      ${breadcrumbs([{ name: 'Особистий кабінет' }])}
      ${emptyState({ iconName: 'user', title: 'Увійдіть в особистий кабінет',
        text: 'Тут ви побачите свої замовлення, список бажань і переглянуті товари.',
        action: html`<button class="btn btn--primary btn--lg" type="button" data-action="open-auth">Увійти</button>` })}
    </div>`);
    const unsub = store.subscribe((type) => {
      if (type === 'user' && store.state.user) accountPage({ outlet, isCurrent });
    });
    return { cleanup: unsub };
  }

  mount(outlet, html`<div class="container page-pad account">
    ${breadcrumbs([{ name: 'Особистий кабінет' }])}
    <div class="account__layout">
      <aside class="panel account__side">
        <div class="account__user"><span class="avatar avatar--lg">${user.name[0]}</span><div><b>${user.name}</b><span>${formatPhone(user.phone)}</span></div></div>
        <nav class="account__nav">
          <a href="#orders">${svg('box', 22)}Мої замовлення <span>${store.state.orders.length}</span></a>
          <a href="/wishlist">${svg('heart', 22)}Список бажань <span>${store.state.wishlist.length}</span></a>
          <a href="#profile">${svg('user', 22)}Особисті дані</a>
          <button type="button" data-logout>${svg('logout', 22)}Вийти</button>
        </nav>
      </aside>
      <div class="account__main">
        <section class="panel" id="orders">
          <h2 class="panel__title">Мої замовлення</h2>
          <div data-orders><div class="sk sk--line"></div><div class="sk sk--line sk--short"></div></div>
        </section>
        <section class="panel" id="profile">
          <h2 class="panel__title">Особисті дані</h2>
          <form class="form form-grid" data-profile novalidate>
            <label class="field"><span class="field__label">Ім’я та прізвище</span><input class="input" name="name" value="${user.name}" maxlength="60"><span class="field__error" data-error="name"></span></label>
            <label class="field"><span class="field__label">Телефон</span><input class="input" name="phone" type="tel" value="${formatPhone(user.phone)}"><span class="field__error" data-error="phone"></span></label>
            <label class="field"><span class="field__label">Електронна пошта</span><input class="input" name="email" type="email" value="${user.email || ''}" maxlength="80"><span class="field__error" data-error="email"></span></label>
            <div class="form-grid__actions"><button class="btn btn--primary" type="submit">Зберегти зміни</button></div>
          </form>
        </section>
        <div data-recent></div>
      </div>
    </div>
  </div>`);

  // orders
  const box = outlet.querySelector('[data-orders]');
  const numbers = store.state.orders;
  if (!numbers.length) {
    mount(box, html`<p class="muted">У вас ще немає замовлень. <a href="/catalog?sort=popular">Перегляньте хіти продажів</a></p>`);
  } else {
    const results = await Promise.all(numbers.map((n) => api.order(n).catch(() => null)));
    if (!isCurrent()) return null;
    const found = results.filter(Boolean);
    mount(box, found.length ? html`${found.map(orderDetails)}`
      : html`<p class="muted">Історія замовлень зберігається до перезапуску демо-сервера. Оформіть нове замовлення, і воно з’явиться тут.</p>`);
  }

  // profile
  const form = outlet.querySelector('[data-profile]');
  bindPhoneInput(form.phone);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = {};
    if (form.name.value.trim().length < 2) errors.name = 'Вкажіть ім’я';
    if (!isValidPhone(form.phone.value)) errors.phone = 'Вкажіть номер у форматі +380 XX XXX XX XX';
    if (form.email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value.trim())) errors.email = 'Перевірте email';
    form.querySelectorAll('[data-error]').forEach((el) => {
      el.textContent = errors[el.dataset.error] || '';
      form.elements[el.dataset.error].classList.toggle('is-invalid', !!errors[el.dataset.error]);
    });
    if (Object.keys(errors).length) return;
    store.updateUser({ name: form.name.value.trim(), phone: `+${form.phone.value.replace(/\D/g, '')}`, email: form.email.value.trim() });
    toast('Дані збережено');
  });

  outlet.querySelector('[data-logout]').addEventListener('click', () => {
    store.logout();
    toast('Ви вийшли з кабінету');
    accountPage({ outlet, isCurrent });
  });
  outlet.querySelectorAll('.account__nav a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    outlet.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  }));

  renderRecent(outlet.querySelector('[data-recent]'));
  return null;
}

// ------------------------------------------------------------------ /info/:slug

const INFO = {
  delivery: {
    title: 'Доставка',
    body: html`<p>Доставляємо замовлення по всій Україні. Безкоштовна доставка у відділення Нової пошти та кур’єром — для замовлень від 1 000 ₴.</p>
      <div class="info-cards">
        <div class="info-card">${svg('box', 28)}<h3>Нова пошта</h3><p>Відділення та поштомати. Відправляємо в день замовлення, якщо воно оформлене до 18:00.</p><b>79 ₴ · безкоштовно від 1 000 ₴</b></div>
        <div class="info-card">${svg('truck', 28)}<h3>Кур’єр</h3><p>Доставка на адресу в зручний для вас час. Підйом на поверх великогабаритної техніки — за домовленістю.</p><b>129 ₴ · безкоштовно від 1 000 ₴</b></div>
        <div class="info-card">${svg('store', 28)}<h3>Самовивіз</h3><p>Забирайте з магазинів «Полиця» у 26 містах України без передоплати.</p><b>Безкоштовно</b></div>
        <div class="info-card">${svg('mail', 28)}<h3>Укрпошта</h3><p>Зручно для невеликих міст і сіл. Термін доставки — 2–4 дні.</p><b>55 ₴</b></div>
      </div>
      <h2>Терміни зберігання</h2>
      <p>Замовлення зберігається у відділенні Нової пошти 5 днів, у магазинах «Полиця» — 3 дні. Після цього замовлення автоматично скасовується.</p>`,
  },
  payment: {
    title: 'Оплата',
    body: html`<ul class="info-list">
      <li><b>Під час отримання.</b> Готівкою або карткою у відділенні перевізника чи кур’єру. Комісія за переказ — за тарифами перевізника.</li>
      <li><b>Карткою онлайн.</b> Visa, Mastercard, Apple Pay та Google Pay. Платежі захищені технологією 3-D Secure.</li>
      <li><b>Розстрочка 0%.</b> До 10 платежів для замовлень від 3 000 ₴. Детальніше на сторінці <a href="/info/credit">розстрочки</a>.</li>
      <li><b>Безготівковий розрахунок</b> для юридичних осіб з ПДВ — рахунок-фактура надсилається на email протягом робочого дня.</li></ul>`,
  },
  credit: {
    title: 'Розстрочка та кредит',
    body: html`<p>Купуйте зараз — платіть частинами без переплат. Розстрочка доступна для замовлень від 3 000 ₴.</p>
      <div class="info-cards">
        <div class="info-card">${svg('card', 28)}<h3>0% до 10 платежів</h3><p>Перший платіж — через місяць після покупки. Жодних комісій та прихованих платежів.</p></div>
        <div class="info-card">${svg('clock', 28)}<h3>Рішення за 2 хвилини</h3><p>Оформлення онлайн за паспортом та ІПН, без довідок про доходи.</p></div>
        <div class="info-card">${svg('shield', 28)}<h3>Надійні партнери</h3><p>Розстрочку надають провідні банки України. Умови узгоджуються під час оформлення.</p></div>
      </div>
      <p>Щоб скористатися розстрочкою, оберіть спосіб оплати «Розстрочка 0%» під час <a href="/cart">оформлення замовлення</a>.</p>`,
  },
  warranty: {
    title: 'Гарантія',
    body: html`<p>На всю техніку діє офіційна гарантія виробника від 12 місяців. Термін гарантії вказаний у характеристиках товару.</p>
      <ul class="info-list"><li>Гарантійний талон або чек зберігаються в особистому кабінеті.</li>
      <li>Приймаємо техніку на гарантійний ремонт у будь-якому магазині «Полиця» або забираємо Новою поштою за наш рахунок.</li>
      <li>Середній термін ремонту — 14 днів. Якщо ремонт неможливий, замінимо товар або повернемо кошти.</li></ul>`,
  },
  returns: {
    title: 'Обмін і повернення',
    body: html`<p>Відповідно до Закону України «Про захист прав споживачів» ви можете повернути або обміняти товар належної якості протягом 14 днів.</p>
      <ul class="info-list"><li>Товар не був у використанні, збережено товарний вигляд, пломби та ярлики.</li>
      <li>Повернення через відділення Нової пошти — безкоштовне за кодом повернення з особистого кабінету.</li>
      <li>Кошти повертаються на картку протягом 3 банківських днів після отримання товару.</li></ul>`,
  },
  about: {
    title: 'Про компанію',
    body: html`<p>«Полиця» — український онлайн-гіпермаркет, який з 2011 року допомагає обирати техніку та товари для дому. Ми працюємо з офіційними постачальниками й даємо гарантію на кожну покупку.</p>
      <div class="stats"><div><b>4 млн</b><span>покупців щороку</span></div><div><b>26</b><span>магазинів по Україні</span></div><div><b>10 000+</b><span>пунктів видачі</span></div><div><b>98%</b><span>замовлень вчасно</span></div></div>`,
  },
  contacts: {
    title: 'Контакти',
    body: html`<div class="info-cards">
      <div class="info-card">${svg('phone', 28)}<h3>Гаряча лінія</h3><p><a href="tel:0800307777">${SUPPORT_PHONE}</a><br>Безкоштовно по Україні, щодня 8:00–21:00</p></div>
      <div class="info-card">${svg('mail', 28)}<h3>Email</h3><p><a href="mailto:support@polytsia.ua">support@polytsia.ua</a><br>Відповідаємо протягом 2 годин</p></div>
      <div class="info-card">${svg('pin', 28)}<h3>Головний офіс</h3><p>м. Київ, вул. Велика Васильківська, 72<br>Пн–Пт 9:00–18:00</p></div>
    </div>`,
  },
};

export function infoPage({ outlet, params }) {
  const page = INFO[params.slug];
  if (!page) return notFoundPage({ outlet });
  document.title = `${page.title} — Полиця`;
  mount(outlet, html`<div class="container page-pad info">
    ${breadcrumbs([{ name: 'Допомога', href: '/info/delivery' }, { name: page.title }])}
    <div class="info__layout">
      <nav class="panel info__nav" aria-label="Розділи допомоги">
        ${INFO_LINKS.map((l) => html`<a href="${l.href}" class="${l.href === `/info/${params.slug}` ? 'is-current' : ''}">${l.label}</a>`)}
      </nav>
      <article class="panel info__body"><h1 class="page-title">${page.title}</h1>${page.body}</article>
    </div>
  </div>`);
  return null;
}

// ------------------------------------------------------------------ /qr

export function qrPage({ outlet, query }) {
  document.title = 'QR-код магазину — Полиця';
  const initial = query.get('url') || siteUrl();
  mount(outlet, html`<div class="container page-pad page-narrow">
    ${breadcrumbs([{ name: 'QR-код магазину' }])}
    <div class="panel qr-page">
      <div class="qr-page__code" data-qr></div>
      <div class="qr-page__side">
        <h1 class="page-title">QR-код магазину</h1>
        <p class="qr-page__lead">Наведіть камеру телефона на код — відкриється «Полиця». Роздрукуйте його для вітрини, листівки чи упаковки.</p>
        <form class="form" data-qr-form novalidate>
          <label class="field"><span class="field__label">Посилання в коді</span>
            <input class="input" name="url" type="url" inputmode="url" value="${initial}" maxlength="500" spellcheck="false">
            <span class="field__error" data-error="url"></span></label>
          <div class="qr-page__presets">
            <button class="chip" type="button" data-preset="/">Головна</button>
            <button class="chip" type="button" data-preset="/catalog?onSale=1&sort=discount">Акції</button>
            <button class="chip" type="button" data-preset="/catalog?sort=popular">Хіти продажів</button>
          </div>
        </form>
        <div class="qr-page__actions">
          <button class="btn btn--primary" type="button" data-dl="png">Завантажити PNG</button>
          <button class="btn btn--outline" type="button" data-dl="svg">Завантажити SVG</button>
          <button class="btn btn--ghost" type="button" data-print>Друкувати</button>
          <button class="btn btn--ghost" type="button" data-copy>Копіювати посилання</button>
        </div>
      </div>
    </div>
  </div>`);

  const box = outlet.querySelector('[data-qr]');
  const form = outlet.querySelector('[data-qr-form]');
  let current = '';
  const valid = (v) => {
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };
  const draw = () => {
    const v = form.url.value.trim();
    const ok = valid(v);
    form.querySelector('[data-error="url"]').textContent = ok || !v ? '' : 'Вкажіть повне посилання, що починається з https://';
    form.url.classList.toggle('is-invalid', !ok && !!v);
    if (!ok) return;
    current = v;
    box.innerHTML = `${qrSvg(v, { size: 280, margin: 3 })}<span class="qr-page__url">${esc(v.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</span>`;
  };
  form.addEventListener('input', draw);
  form.addEventListener('submit', (e) => e.preventDefault());
  outlet.addEventListener('click', async (e) => {
    const t = e.target;
    const preset = t.closest('[data-preset]');
    const dl = t.closest('[data-dl]');
    if (preset) {
      form.url.value = new URL(preset.dataset.preset, location.origin).href;
      draw();
    } else if (dl && current) {
      const code = qrSvg(current, { size: 1024, margin: 4 });
      if (dl.dataset.dl === 'svg') downloadSvg(code, 'polytsia-qr.svg');
      else downloadPng(code, 'polytsia-qr.png');
    } else if (t.closest('[data-print]')) {
      window.print();
    } else if (t.closest('[data-copy]') && current) {
      try {
        await navigator.clipboard.writeText(current);
        toast('Посилання скопійовано');
      } catch {
        form.url.select();
        toast('Не вдалося скопіювати автоматично — посилання виділено', { type: 'error' });
      }
    }
  });
  draw();
  return null;
}

// ------------------------------------------------------------------ 404

export function notFoundPage({ outlet }) {
  document.title = 'Сторінку не знайдено — Полиця';
  mount(outlet, html`<div class="container page-pad">${emptyState({
    iconName: 'search',
    title: 'Такої сторінки не існує',
    text: 'Можливо, її видалили або в адресі є помилка. Скористайтеся пошуком або перейдіть до каталогу.',
    action: html`<div class="empty__actions"><a class="btn btn--primary" href="/">На головну</a><a class="btn btn--ghost" href="/catalog">До каталогу</a></div>`,
  })}</div>`);
  return null;
}

export { num, openAuth };
