// History-API router. A page handler renders into the outlet and may return
// { cleanup, update }. When only the query string changes on the same page,
// `update` is called instead of a full re-render (used by catalog filters).

const routes = [];
const hooks = new Set();
let current = null; // { route, params, instance }
let navId = 0;

export function route(pattern, handler) {
  const keys = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => {
    keys.push(k);
    return '([^/]+)';
  })}/?$`);
  routes.push({ pattern, re, keys, handler });
}

export function onNavigate(fn) {
  hooks.add(fn);
}

function match(pathname) {
  for (const r of routes) {
    const m = pathname.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => {
        params[k] = decodeURIComponent(m[i + 1]);
      });
      return { route: r, params };
    }
  }
  return null;
}

function saveScroll() {
  try {
    history.replaceState({ ...(history.state || {}), scroll: window.scrollY }, '');
  } catch {
    // ignore
  }
}

export function navigate(url, { replace = false, keepScroll = false } = {}) {
  const target = new URL(url, location.href);
  if (target.origin !== location.origin) {
    location.href = target.href;
    return;
  }
  saveScroll();
  if (replace) history.replaceState({}, '', target.pathname + target.search + target.hash);
  else history.pushState({}, '', target.pathname + target.search + target.hash);
  render({ scroll: keepScroll ? null : 0 });
}

export async function render({ scroll = 0 } = {}) {
  const url = new URL(location.href);
  const found = match(url.pathname) || match('/404');
  const app = document.getElementById('app');
  const id = ++navId;
  const samePage = current && current.route === found.route
    && JSON.stringify(current.params) === JSON.stringify(found.params);

  if (samePage && current.instance?.update) {
    const ctx = { params: found.params, query: url.searchParams, url, outlet: current.outlet, isCurrent: () => id === navId };
    hooks.forEach((fn) => fn(ctx));
    try {
      await current.instance.update(ctx);
    } catch (err) {
      console.warn(err);
    }
    if (scroll != null && ctx.isCurrent()) window.scrollTo({ top: scroll });
    return;
  }

  // Every page gets a fresh element, so listeners a page attaches die with it.
  const outlet = document.createElement('div');
  outlet.className = 'page page-enter';
  const ctx = { params: found.params, query: url.searchParams, url, outlet, isCurrent: () => id === navId };
  hooks.forEach((fn) => fn(ctx));
  current?.instance?.cleanup?.();
  current = { route: found.route, params: found.params, instance: null, outlet };
  app.replaceChildren(outlet);
  if (scroll != null) window.scrollTo({ top: scroll });
  try {
    const instance = await found.route.handler(ctx);
    if (ctx.isCurrent()) current.instance = instance || null;
    else instance?.cleanup?.();
  } catch (err) {
    if (err?.status !== 404) console.warn(err);
    if (ctx.isCurrent()) {
      const { renderError } = await import('../components/states.js');
      renderError(outlet, err);
    }
  }
}

export function startRouter() {
  history.scrollRestoration = 'manual';
  window.addEventListener('popstate', async (e) => {
    const y = e.state?.scroll ?? 0;
    await render({ scroll: null });
    requestAnimationFrame(() => window.scrollTo({ top: y }));
  });

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || a.dataset.external != null) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash, { keepScroll: a.dataset.keepScroll != null });
  });
  render();
}
