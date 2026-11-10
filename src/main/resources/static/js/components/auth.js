import { html } from '../core/dom.js';
import { store } from '../core/store.js';
import { openModal } from './modal.js';
import { toast } from './toast.js';

/** Formats raw input into "+380 XX XXX XX XX" while typing. */
export function formatPhone(value) {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(3);
  else if (d.startsWith('80')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return `+380${parts.length ? ' ' : ''}${parts.join(' ')}`;
}

export const phoneDigits = (v) => v.replace(/\D/g, '');
export const isValidPhone = (v) => /^380\d{9}$/.test(phoneDigits(v));

export function bindPhoneInput(input) {
  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+380 ';
  });
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
  });
  input.addEventListener('blur', () => {
    if (input.value.trim() === '+380') input.value = '';
  });
}

export function openAuth({ onSuccess } = {}) {
  const m = openModal({
    title: 'Вхід',
    size: 'sm',
    content: html`<form class="form auth-form" novalidate>
      <p class="form__lead">Увійдіть, щоб бачити історію замовлень, зберігати список бажань і швидше оформлювати покупки.</p>
      <label class="field">
        <span class="field__label">Ім’я та прізвище</span>
        <input class="input" name="name" autocomplete="name" required minlength="2" maxlength="60" autofocus>
        <span class="field__error" data-error="name"></span>
      </label>
      <label class="field">
        <span class="field__label">Номер телефону</span>
        <input class="input" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380 XX XXX XX XX" required>
        <span class="field__error" data-error="phone"></span>
      </label>
      <button class="btn btn--primary btn--block btn--lg" type="submit">Увійти</button>
      <p class="form__note">Продовжуючи, ви погоджуєтеся з умовами використання сайту та політикою конфіденційності.</p>
    </form>`,
  });
  const form = m.el.querySelector('form');
  bindPhoneInput(form.phone);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const errors = {};
    if (name.length < 2) errors.name = 'Вкажіть ім’я';
    if (!isValidPhone(phone)) errors.phone = 'Вкажіть номер у форматі +380 XX XXX XX XX';
    form.querySelectorAll('[data-error]').forEach((el) => {
      el.textContent = errors[el.dataset.error] || '';
      el.previousElementSibling.classList.toggle('is-invalid', !!errors[el.dataset.error]);
      el.previousElementSibling.setAttribute('aria-invalid', !!errors[el.dataset.error]);
    });
    if (Object.keys(errors).length) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }
    store.login({ name, phone });
    m.close();
    toast(`Вітаємо, ${name.split(' ')[0]}! Ви увійшли в кабінет.`);
    onSuccess?.();
  });
  return m;
}
