// Client state: cart, wishlist, recently viewed, signed-in profile and order history.
// Persisted in localStorage when available; the app still works if storage is blocked.

const KEY = 'polytsia:v1';
const MAX_RECENT = 16;
export const MAX_QTY = 10;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

const defaults = () => ({ cart: [], wishlist: [], recent: [], user: null, orders: [], searches: [] });
let state = { ...defaults(), ...load() };
const listeners = new Set();

function commit(type) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode / blocked): keep in memory only
  }
  listeners.forEach((fn) => fn(type, state));
}

// Keep several open tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  state = { ...defaults(), ...load() };
  listeners.forEach((fn) => fn('sync', state));
});

export const store = {
  get state() {
    return state;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // ---- cart
  cartCount: () => state.cart.reduce((n, l) => n + l.qty, 0),
  inCart: (id) => state.cart.some((l) => l.id === id),
  addToCart(id, qty = 1) {
    const line = state.cart.find((l) => l.id === id);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
    else state.cart.unshift({ id, qty: Math.min(MAX_QTY, qty) });
    commit('cart');
  },
  setQty(id, qty) {
    const line = state.cart.find((l) => l.id === id);
    if (!line) return;
    line.qty = Math.max(1, Math.min(MAX_QTY, Math.round(qty) || 1));
    commit('cart');
  },
  removeFromCart(id) {
    state.cart = state.cart.filter((l) => l.id !== id);
    commit('cart');
  },
  clearCart() {
    state.cart = [];
    commit('cart');
  },

  // ---- wishlist
  inWishlist: (id) => state.wishlist.includes(id),
  toggleWishlist(id) {
    const has = state.wishlist.includes(id);
    state.wishlist = has ? state.wishlist.filter((x) => x !== id) : [id, ...state.wishlist];
    commit('wishlist');
    return !has;
  },
  clearWishlist() {
    state.wishlist = [];
    commit('wishlist');
  },

  // ---- recently viewed
  addRecent(id) {
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, MAX_RECENT);
    commit('recent');
  },
  clearRecent() {
    state.recent = [];
    commit('recent');
  },

  // ---- search history
  addSearch(q) {
    const v = q.trim();
    if (!v) return;
    state.searches = [v, ...state.searches.filter((s) => s.toLowerCase() !== v.toLowerCase())].slice(0, 6);
    commit('searches');
  },
  clearSearches() {
    state.searches = [];
    commit('searches');
  },

  // ---- profile
  login(user) {
    state.user = { name: user.name.trim(), phone: user.phone, email: user.email || '' };
    commit('user');
  },
  updateUser(patch) {
    state.user = { ...state.user, ...patch };
    commit('user');
  },
  logout() {
    state.user = null;
    commit('user');
  },
  addOrder(number) {
    state.orders = [number, ...state.orders.filter((n) => n !== number)].slice(0, 30);
    commit('orders');
  },
};
