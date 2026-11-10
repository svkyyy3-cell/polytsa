// Thin client for the Java JSON API.

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(url, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Немає з’єднання з сервером. Перевірте інтернет і спробуйте ще раз.', 0, null);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }
  if (!res.ok) throw new ApiError(data?.error || 'Щось пішло не так', res.status, data);
  return data;
}

let categoriesPromise;
let configPromise;

export function qs(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '' || v === false || (Array.isArray(v) && !v.length)) continue;
    sp.set(k, Array.isArray(v) ? v.join(',') : v === true ? '1' : String(v));
  }
  return sp.toString();
}

export const api = {
  home: () => request('/api/home'),
  // Site settings; falls back to demo mode if the server cannot be reached.
  config: () => (configPromise ??= request('/api/config').catch(() => ({ demo: true }))),
  categories: () => (categoriesPromise ??= request('/api/categories').catch((e) => {
    categoriesPromise = null;
    throw e;
  })),
  products: (params) => request(`/api/products?${qs(params)}`),
  product: (id) => request(`/api/products/${encodeURIComponent(id)}`),
  reviews: (id, page = 1) => request(`/api/products/${encodeURIComponent(id)}/reviews?page=${page}`),
  addReview: (id, review) => request(`/api/products/${encodeURIComponent(id)}/reviews`, { method: 'POST', body: review }),
  suggest: (q) => request(`/api/search/suggest?${qs({ q })}`),
  quote: (items, delivery) => request('/api/cart/quote', { method: 'POST', body: { items, delivery } }),
  placeOrder: (order) => request('/api/orders', { method: 'POST', body: order }),
  order: (number) => request(`/api/orders/${encodeURIComponent(number)}`),
};
