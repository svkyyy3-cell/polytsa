import { route, startRouter, navigate, onNavigate } from './core/router.js';
import { api } from './core/api.js';
import { store } from './core/store.js';
import { renderHeader, toggleCatalog, closeCatalog } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { openSideMenu } from './components/sideMenu.js';
import { openCart, flyToCart } from './components/cart.js';
import { openAuth } from './components/auth.js';
import { closeAllModals } from './components/modal.js';
import { refreshCardButtons } from './components/productCard.js';
import { toast } from './components/toast.js';
import { homePage } from './pages/home.js';
import { catalogPage } from './pages/catalog.js';
import { productPage } from './pages/product.js';
import { cartPage, checkoutPage, orderPage } from './pages/checkout.js';
import { wishlistPage, accountPage, infoPage, notFoundPage, qrPage } from './pages/misc.js';

// ---------------------------------------------------------------- routes
route('/', homePage);
route('/catalog', catalogPage);
route('/catalog/:slug', catalogPage);
route('/search', catalogPage);
route('/product/:id', productPage);
route('/cart', cartPage);
route('/checkout', checkoutPage);
route('/order/:number', orderPage);
route('/wishlist', wishlistPage);
route('/account', accountPage);
route('/info/:slug', infoPage);
route('/qr', qrPage);
route('/404', notFoundPage);

// ---------------------------------------------------------------- global actions (event delegation)
const actions = {
  'cart-add'(el) {
    const id = Number(el.dataset.id);
    if (!id) return;
    const card = el.closest('[data-product]');
    const img = card?.querySelector('.card__img img')
      || (el.dataset.source === 'pdp' ? document.querySelector('.gallery__slide img') : null);
    store.addToCart(id);
    el.classList.add('is-pressed');
    setTimeout(() => el.classList.remove('is-pressed'), 300);
    flyToCart(img);
    toast('Товар додано до кошика', { link: { href: '/checkout', label: 'Оформити' } });
  },
  'open-cart'() {
    closeCatalog();
    openCart();
  },
  'wish-toggle'(el) {
    const id = Number(el.dataset.id);
    const on = store.toggleWishlist(id);
    toast(on ? 'Додано до списку бажань' : 'Прибрано зі списку бажань', on ? { link: { href: '/wishlist', label: 'Переглянути' } } : {});
  },
  'open-menu'() {
    closeCatalog();
    openSideMenu();
  },
  'open-catalog-mobile'() {
    openSideMenu({ expandCatalog: true });
  },
  'toggle-catalog'() {
    toggleCatalog();
  },
  account() {
    closeCatalog();
    if (store.state.user) navigate('/account');
    else openAuth();
  },
  'open-auth'() {
    closeAllModals();
    setTimeout(() => openAuth(), 0);
  },
  reload() {
    location.reload();
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  fn(el, e);
});

// A field's error message goes away as soon as the shopper edits that field.
const clearFieldError = (e) => {
  const input = e.target;
  if (!input.classList?.contains('is-invalid') && !input.closest?.('.radio-cards')) return;
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  const err = input.closest('.field')?.querySelector('.field__error')
    || input.closest('.panel, form')?.querySelector(`.field__error[data-error="${input.name}"]`);
  if (err) err.textContent = '';
};
document.addEventListener('input', clearFieldError);
document.addEventListener('change', clearFieldError);

// ---------------------------------------------------------------- shell
// Demo notice: shown until DEMO_MODE=false is set on the server.
api.config().then(({ demo }) => {
  document.querySelector('.demo-bar').hidden = !demo;
});

renderHeader(document.querySelector('.header'));
renderFooter(document.querySelector('.footer'));

store.subscribe((type) => {
  if (type === 'cart' || type === 'wishlist' || type === 'sync') refreshCardButtons(document);
});

// Mobile tab bar: highlight the current section.
onNavigate(({ url }) => {
  const p = url.pathname;
  document.querySelectorAll('.tabbar [data-tab]').forEach((t) => {
    const tab = t.dataset.tab;
    const on = (tab === 'home' && p === '/') || (tab === 'catalog' && (p.startsWith('/catalog') || p === '/search'))
      || (tab === 'cart' && (p === '/cart' || p === '/checkout')) || (tab === 'wishlist' && p === '/wishlist')
      || (tab === 'account' && p === '/account');
    t.classList.toggle('is-current', on);
    if (on) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
});

startRouter();
