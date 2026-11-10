import { html, mount } from '../core/dom.js';
import { icon } from '../core/icons.js';

export function emptyState({ iconName = 'box', title, text, action }) {
  return html`<div class="empty">
    <div class="empty__icon">${html([icon(iconName, 40)])}</div>
    <h2 class="empty__title">${title}</h2>
    ${text ? html`<p class="empty__text">${text}</p>` : ''}
    ${action || ''}
  </div>`;
}

export function renderError(outlet, err) {
  const notFound = err?.status === 404;
  mount(outlet, html`<div class="container page-pad">${emptyState({
    iconName: notFound ? 'search' : 'info',
    title: notFound ? 'Сторінку не знайдено' : 'Не вдалося завантажити сторінку',
    text: notFound ? 'Можливо, товар більше не продається або посилання застаріло.' : err?.message,
    action: html`<div class="empty__actions">
      ${notFound ? '' : html`<button class="btn btn--primary" type="button" data-action="reload">Спробувати ще раз</button>`}
      <a class="btn ${notFound ? 'btn--primary' : 'btn--ghost'}" href="/">На головну</a></div>`,
  })}</div>`);
}

export function breadcrumbs(items) {
  return html`<nav class="crumbs" aria-label="Навігаційний ланцюжок"><ol>
    <li><a href="/" aria-label="Головна">${html([icon('home', 18)])}</a></li>
    ${items.map((it, i) => html`<li>${i === items.length - 1
      ? html`<span aria-current="page">${it.name}</span>`
      : html`<a href="${it.href}">${it.name}</a>`}</li>`)}
  </ol></nav>`;
}
