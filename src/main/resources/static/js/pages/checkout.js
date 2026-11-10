import { api } from '../core/api.js';
import { html, mount, num, plural, price } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { navigate } from '../core/router.js';
import { renderCart } from '../components/cart.js';
import { breadcrumbs, emptyState } from '../components/states.js';
import { bindPhoneInput, formatPhone, isValidPhone, phoneDigits } from '../components/auth.js';

const svg = (name, size) => html([icon(name, size)]);
const ITEM_FORMS = ['товар', 'товари', 'товарів'];
const CITIES = ['Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Вінниця', 'Івано-Франківськ', 'Тернопіль', 'Полтава',
  'Чернігів', 'Черкаси', 'Житомир', 'Суми', 'Рівне', 'Луцьк', 'Ужгород', 'Хмельницький', 'Чернівці', 'Кропивницький', 'Миколаїв', 'Біла Церква'];

const DELIVERY = [
  { id: 'branch', icon: 'box', title: 'Нова пошта', text: 'Відділення або поштомат', when: 'завтра', price: 79 },
  { id: 'courier', icon: 'truck', title: 'Кур’єр Нової пошти', text: 'Доставка на вашу адресу', when: 'за 1–2 дні', price: 129 },
  { id: 'pickup', icon: 'store', title: 'Самовивіз з магазину «Полиця»', text: 'Без передоплати, оплата на місці', when: 'завтра', price: 0 },
  { id: 'ukrposhta', icon: 'mail', title: 'Укрпошта', text: 'Відділення Укрпошти', when: 'за 2–4 дні', price: 55 },
];

const PAYMENT = [
  { id: 'cod', title: 'Оплата під час отримання', text: 'Готівкою або карткою у відділенні' },
  { id: 'card', title: 'Карткою онлайн', text: 'Visa, Mastercard, Apple Pay, Google Pay' },
  { id: 'installment', title: 'Розстрочка 0% на 10 платежів', text: 'Для замовлень від 3 000 ₴' },
];

// ------------------------------------------------------------------ /cart

export function cartPage({ outlet }) {
  document.title = 'Кошик — Полиця';
  mount(outlet, html`<div class="container page-pad page-narrow">
    ${breadcrumbs([{ name: 'Кошик' }])}
    <h1 class="page-title">Кошик</h1>
    <div class="panel" data-cart></div>
  </div>`);
  const unsub = renderCart(outlet.querySelector('[data-cart]'), { mode: 'page' });
  return { cleanup: unsub };
}

// ------------------------------------------------------------------ /checkout

function radioCard(name, opt, checked, extra = '') {
  return html`<label class="radio-card">
    <input type="radio" name="${name}" value="${opt.id}" ${checked ? 'checked' : ''}>
    <span class="radio-card__dot"></span>
    ${opt.icon ? html`<span class="radio-card__icon">${svg(opt.icon, 24)}</span>` : ''}
    <span class="radio-card__body"><b>${opt.title}</b><small>${opt.text}</small></span>
    ${extra}
  </label>`;
}

export async function checkoutPage({ outlet, isCurrent }) {
  document.title = 'Оформлення замовлення — Полиця';
  if (!store.state.cart.length) {
    mount(outlet, html`<div class="container page-pad">${emptyState({
      iconName: 'cart', title: 'Кошик порожній', text: 'Додайте товари до кошика, щоб оформити замовлення.',
      action: html`<a class="btn btn--primary" href="/catalog">Перейти до каталогу</a>`,
    })}</div>`);
    return null;
  }

  const user = store.state.user;
  const [first = '', ...rest] = (user?.name || '').split(' ');
  let delivery = 'branch';
  let quote = null;

  mount(outlet, html`<div class="container page-pad checkout">
    ${breadcrumbs([{ name: 'Кошик', href: '/cart' }, { name: 'Оформлення замовлення' }])}
    <h1 class="page-title">Оформлення замовлення</h1>
    <form class="checkout__layout" novalidate data-checkout-form>
      <div class="checkout__steps">
        <section class="panel step">
          <h2 class="step__title"><span class="step__n">1</span>Ваші контактні дані</h2>
          <div class="form-grid">
            <label class="field"><span class="field__label">Прізвище</span><input class="input" name="surname" autocomplete="family-name" value="${rest.join(' ')}" maxlength="40"><span class="field__error" data-error="surname"></span></label>
            <label class="field"><span class="field__label">Ім’я</span><input class="input" name="name" autocomplete="given-name" value="${first}" maxlength="40"><span class="field__error" data-error="name"></span></label>
            <label class="field"><span class="field__label">Мобільний телефон</span><input class="input" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380 XX XXX XX XX" value="${user?.phone ? formatPhone(user.phone) : ''}"><span class="field__error" data-error="phone"></span></label>
            <label class="field"><span class="field__label">Електронна пошта <small>(необов’язково)</small></span><input class="input" name="email" type="email" autocomplete="email" value="${user?.email || ''}" maxlength="80"><span class="field__error" data-error="email"></span></label>
          </div>
        </section>

        <section class="panel step">
          <h2 class="step__title"><span class="step__n">2</span>Доставка</h2>
          <label class="field field--city"><span class="field__label">Місто</span>
            <input class="input" name="city" list="cities" autocomplete="address-level2" placeholder="Почніть вводити назву міста" value="Київ" maxlength="60">
            <datalist id="cities">${CITIES.map((c) => html`<option value="${c}">`)}</datalist>
            <span class="field__error" data-error="city"></span></label>
          <div class="radio-cards" role="radiogroup" aria-label="Спосіб доставки">
            ${DELIVERY.map((d, i) => radioCard('delivery', d, i === 0, html`<span class="radio-card__side"><span class="radio-card__when">${d.when}</span>
              <span class="radio-card__price" data-delivery-price="${d.id}">${d.price ? price(d.price) : 'Безкоштовно'}</span></span>`))}
          </div>
          <label class="field" data-point-field><span class="field__label" data-point-label>Відділення або поштомат</span>
            <input class="input" name="point" maxlength="120" placeholder="Наприклад: Відділення №12, вул. Хрещатик, 22"><span class="field__error" data-error="point"></span></label>
          <span class="field__error" data-error="delivery"></span>
        </section>

        <section class="panel step">
          <h2 class="step__title"><span class="step__n">3</span>Оплата</h2>
          <div class="radio-cards" role="radiogroup" aria-label="Спосіб оплати">
            ${PAYMENT.map((p, i) => radioCard('payment', p, i === 0))}
          </div>
          <span class="field__error" data-error="payment"></span>
        </section>
      </div>

      <aside class="checkout__summary">
        <div class="panel summary" data-summary>
          <h2 class="summary__title">Разом</h2>
          <div class="sk sk--line"></div><div class="sk sk--line sk--short"></div>
        </div>
      </aside>
    </form>
  </div>`);

  const form = outlet.querySelector('[data-checkout-form]');
  bindPhoneInput(form.phone);

  const drawSummary = () => {
    const q = quote;
    mount(outlet.querySelector('[data-summary]'), html`
      <h2 class="summary__title">Разом</h2>
      <ul class="summary__items">${q.items.filter((i) => i.available).map((i) => html`<li>
        <img src="${i.product.image}" alt="" width="56" height="56"><span class="summary__name">${i.product.name}<small>${i.qty} шт. × ${price(i.product.price)}</small></span>
        <b>${price(i.lineTotal)}</b></li>`)}</ul>
      ${q.hasUnavailable ? html`<p class="summary__warn">${svg('info', 18)}Товари, яких немає в наявності, не увійдуть у замовлення.</p>` : ''}
      <dl class="summary__rows">
        <div><dt>${q.count} ${plural(q.count, ITEM_FORMS)} на суму</dt><dd>${price(q.subtotal + q.savings)}</dd></div>
        ${q.savings ? html`<div class="is-sale"><dt>Знижка</dt><dd>−${price(q.savings)}</dd></div>` : ''}
        <div><dt>Вартість доставки</dt><dd>${q.deliveryCost ? price(q.deliveryCost) : html`<span class="is-free">Безкоштовно</span>`}</dd></div>
      </dl>
      <div class="summary__total"><span>До сплати</span><b>${price(q.total)}</b></div>
      <button class="btn btn--primary btn--lg btn--block" type="submit" data-submit>Замовлення підтверджую</button>
      <p class="form__error" data-form-error hidden></p>
      <p class="summary__legal">Підтверджуючи замовлення, я приймаю умови угоди користувача та положення про обробку персональних даних.</p>
      <a class="summary__edit" href="/cart">${svg('edit', 18)}Редагувати кошик</a>`);
  };

  const refreshQuote = async () => {
    try {
      quote = await api.quote(store.state.cart.map(({ id, qty }) => ({ id, qty })), delivery);
    } catch (err) {
      mount(outlet.querySelector('[data-summary]'), html`<p class="form__error">${err.message}</p>`);
      return;
    }
    if (!isCurrent()) return;
    // Free-delivery threshold reflected on the delivery options too.
    outlet.querySelectorAll('[data-delivery-price]').forEach((el) => {
      const d = DELIVERY.find((x) => x.id === el.dataset.deliveryPrice);
      const free = d.price === 0 || (quote.subtotal >= quote.freeDeliveryFrom && d.id !== 'ukrposhta');
      el.textContent = free ? 'Безкоштовно' : price(d.price);
      el.classList.toggle('is-free', free);
    });
    drawSummary();
  };

  const updatePointField = () => {
    const field = outlet.querySelector('[data-point-field]');
    const label = outlet.querySelector('[data-point-label]');
    field.hidden = delivery === 'pickup';
    label.textContent = delivery === 'courier' ? 'Адреса доставки' : delivery === 'ukrposhta' ? 'Відділення Укрпошти' : 'Відділення або поштомат';
    form.point.placeholder = delivery === 'courier' ? 'Вулиця, будинок, квартира' : 'Наприклад: Відділення №12, вул. Хрещатик, 22';
  };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'delivery') {
      delivery = e.target.value;
      form.point.classList.remove('is-invalid');
      form.querySelector('[data-error="point"]').textContent = '';
      updatePointField();
      refreshQuote();
    }
  });

  const showErrors = (errors) => {
    form.querySelectorAll('[data-error]').forEach((el) => {
      const msg = errors[el.dataset.error] || '';
      el.textContent = msg;
      const input = form.elements[el.dataset.error];
      if (input && input.classList) {
        input.classList.toggle('is-invalid', !!msg);
        input.setAttribute('aria-invalid', !!msg);
      }
    });
    const firstBad = form.querySelector('.is-invalid') || form.querySelector('[data-error]:not(:empty)');
    firstBad?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (firstBad?.focus) setTimeout(() => firstBad.focus({ preventScroll: true }), 300);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = (n) => form.elements[n].value.trim();
    const errors = {};
    if (v('surname').length < 2) errors.surname = 'Вкажіть прізвище';
    if (v('name').length < 2) errors.name = 'Вкажіть ім’я';
    if (!isValidPhone(v('phone'))) errors.phone = 'Вкажіть номер у форматі +380 XX XXX XX XX';
    if (v('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('email'))) errors.email = 'Перевірте email';
    if (v('city').length < 2) errors.city = 'Вкажіть місто';
    if (delivery !== 'pickup' && v('point').length < 2) errors.point = delivery === 'courier' ? 'Вкажіть адресу доставки' : 'Вкажіть відділення';
    const payment = form.elements.payment.value;
    if (payment === 'installment' && quote && quote.subtotal < 3000) errors.payment = 'Розстрочка доступна для замовлень від 3 000 ₴';
    showErrors(errors);
    if (Object.keys(errors).length) return;

    const btn = form.querySelector('[data-submit]');
    const formError = form.querySelector('[data-form-error]');
    btn.disabled = true;
    btn.classList.add('is-loading');
    formError.hidden = true;
    try {
      const order = await api.placeOrder({
        items: store.state.cart.map(({ id, qty }) => ({ id, qty })),
        customer: { name: v('name'), surname: v('surname'), phone: `+${phoneDigits(v('phone'))}`, email: v('email') },
        delivery,
        payment,
        address: { city: v('city'), point: delivery === 'pickup' ? '' : v('point') },
      });
      store.addOrder(order.number);
      if (!store.state.user) store.login({ name: `${v('name')} ${v('surname')}`, phone: `+${phoneDigits(v('phone'))}`, email: v('email') });
      store.clearCart();
      navigate(`/order/${order.number}`, { replace: true });
    } catch (err) {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (err.data?.fields) showErrors(err.data.fields);
      formError.textContent = err.data?.fields?.cart || err.message;
      formError.hidden = false;
    }
  });

  updatePointField();
  await refreshQuote();
  return null;
}

// ------------------------------------------------------------------ /order/:number

export function orderDetails(o) {
  return html`<div class="order-card">
    <div class="order-card__head">
      <div><span class="muted">Замовлення</span> <b>№ ${o.number}</b></div>
      <span class="status">${o.status}</span>
    </div>
    <ul class="order-card__items">${o.items.map((i) => html`<li>
      <a href="/product/${i.product.id}"><img src="${i.product.image}" alt="" width="64" height="64"></a>
      <a class="order-card__name" href="/product/${i.product.id}">${i.product.name}</a>
      <span class="muted">${i.qty} шт.</span><b>${price(i.lineTotal)}</b></li>`)}</ul>
    <dl class="order-card__info">
      <div><dt>Отримувач</dt><dd>${o.customer.surname} ${o.customer.name}, ${formatPhone(o.customer.phone)}</dd></div>
      <div><dt>Доставка</dt><dd>${o.delivery.label}, ${o.delivery.city}${o.delivery.point ? `, ${o.delivery.point}` : ''}<br><span class="muted">Орієнтовна дата відправлення: ${o.delivery.date}</span></dd></div>
      <div><dt>Оплата</dt><dd>${o.payment.label}</dd></div>
      <div><dt>Вартість доставки</dt><dd>${o.deliveryCost ? price(o.deliveryCost) : 'Безкоштовно'}</dd></div>
      <div class="order-card__total"><dt>Разом до сплати</dt><dd>${price(o.total)}</dd></div>
    </dl>
  </div>`;
}

export async function orderPage({ outlet, params, isCurrent }) {
  mount(outlet, html`<div class="container page-pad page-narrow"><div class="sk sk--buybox"></div></div>`);
  const o = await api.order(params.number);
  if (!isCurrent()) return null;
  document.title = `Замовлення № ${o.number} — Полиця`;
  mount(outlet, html`<div class="container page-pad page-narrow">
    <div class="success">
      <span class="success__icon">${svg('check', 40)}</span>
      <h1 class="page-title">Дякуємо! Замовлення № ${o.number} оформлено</h1>
      <p data-order-note>Менеджер зв’яжеться з вами за номером ${formatPhone(o.customer.phone)}, щоб підтвердити замовлення.</p>
    </div>
    ${orderDetails(o)}
    <div class="success__actions">
      <a class="btn btn--primary btn--lg" href="/">Продовжити покупки</a>
      <a class="btn btn--ghost btn--lg" href="/account">Мої замовлення</a>
    </div>
  </div>`);
  const { demo } = await api.config();
  if (demo && isCurrent()) {
    outlet.querySelector('[data-order-note]').textContent = 'Це демонстраційний магазин: замовлення збережено для прикладу, але його не буде доставлено й оплату не стягнуто.';
  }
  return null;
}

export { num };
