import { html, mount } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { LOGO } from './header.js';
import { qrSvg, siteUrl } from './qr.js';

const svg = (name, size) => html([icon(name, size)]);
export const SUPPORT_PHONE = '0 800 30 77 77';

export const INFO_LINKS = [
  { href: '/info/delivery', label: 'Доставка' },
  { href: '/info/payment', label: 'Оплата' },
  { href: '/info/credit', label: 'Розстрочка та кредит' },
  { href: '/info/warranty', label: 'Гарантія' },
  { href: '/info/returns', label: 'Обмін і повернення' },
  { href: '/info/about', label: 'Про компанію' },
  { href: '/info/contacts', label: 'Контакти' },
];

export function renderFooter(el) {
  const year = new Date().getFullYear();
  mount(el, html`<div class="benefits">
      <div class="container benefits__row">
        <div class="benefit">${svg('truck', 30)}<div><b>Безкоштовна доставка</b><span>від 1 000 ₴ у відділення та кур’єром</span></div></div>
        <div class="benefit">${svg('shield', 30)}<div><b>Офіційна гарантія</b><span>на всю техніку від 12 місяців</span></div></div>
        <div class="benefit">${svg('refresh', 30)}<div><b>14 днів на повернення</b><span>без зайвих питань і довідок</span></div></div>
        <div class="benefit">${svg('card', 30)}<div><b>Розстрочка 0%</b><span>до 10 платежів без переплат</span></div></div>
      </div>
    </div>
    <div class="footer__main">
      <div class="container footer__grid">
        <div class="footer__brand">
          <a class="logo logo--dark" href="/">${LOGO}<span class="logo__text">полиця</span></a>
          <p>Онлайн-гіпермаркет техніки та товарів для дому. Понад 10 000 пунктів видачі по всій Україні.</p>
          <a class="footer__phone" href="tel:0800307777">${svg('phone', 20)}${SUPPORT_PHONE}</a>
          <span class="footer__hours">Безкоштовно по Україні, щодня 8:00–21:00</span>
          <a class="footer-qr" href="/qr" aria-label="QR-код сайту: відкрити на телефоні">
            <span class="footer-qr__code">${html([qrSvg(siteUrl(), { size: 84, margin: 1, label: 'QR-код сайту Полиця' })])}</span>
            <span class="footer-qr__text"><b>Полиця на телефоні</b>Наведіть камеру на код, щоб відкрити магазин</span>
          </a>
        </div>
        <nav class="footer__col" aria-label="Інформація про компанію">
          <h3>Інформація про компанію</h3>
          <a href="/info/about">Про нас</a>
          <a href="/info/contacts">Контакти</a>
          <a href="/info/warranty">Гарантія та сервіс</a>
          <a href="/info/returns">Обмін і повернення</a>
        </nav>
        <nav class="footer__col" aria-label="Допомога">
          <h3>Допомога</h3>
          <a href="/info/delivery">Доставка</a>
          <a href="/info/payment">Оплата</a>
          <a href="/info/credit">Розстрочка та кредит</a>
          <a href="/account">Статус замовлення</a>
        </nav>
        <nav class="footer__col" aria-label="Популярні розділи">
          <h3>Популярні розділи</h3>
          <a href="/catalog/smartphones">Смартфони</a>
          <a href="/catalog/laptops">Ноутбуки</a>
          <a href="/catalog/tv">Телевізори</a>
          <a href="/catalog/audio">Навушники та акустика</a>
          <a href="/catalog/consoles">Ігрові консолі</a>
        </nav>
        <div class="footer__col">
          <h3>Ми приймаємо</h3>
          <div class="pay-marks">
            <span class="pay-mark">Visa</span><span class="pay-mark">Mastercard</span>
            <span class="pay-mark">Apple Pay</span><span class="pay-mark">Google Pay</span>
          </div>
          <h3 class="footer__sub">Доставляємо</h3>
          <div class="pay-marks"><span class="pay-mark">Нова пошта</span><span class="pay-mark">Укрпошта</span><span class="pay-mark">Meest</span></div>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="container footer__bottom-row">
        <span>© 2011–${year} «Полиця» — інтернет-магазин. Усі права захищені.</span>
        <span>Ціни вказані в гривнях з урахуванням ПДВ.</span>
      </div>
    </div>`);
}
