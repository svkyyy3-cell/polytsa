import { html, prefersReducedMotion } from '../core/dom.js';
import { icon } from '../core/icons.js';

const svg = (name, size) => html([icon(name, size)]);
const INTERVAL = 6000;

export function heroCarousel(slides) {
  return html`<section class="hero" aria-roledescription="карусель" aria-label="Акції та пропозиції" data-hero>
    <div class="hero__viewport">
      <div class="hero__track">
        ${slides.map((s, i) => html`<a class="slide slide--${s.theme}" href="${s.link}" role="group" aria-roledescription="слайд"
            aria-label="${i + 1} з ${slides.length}: ${s.title}" ${i ? 'tabindex="-1" aria-hidden="true"' : ''}>
          <div class="slide__text">
            ${s.label ? html`<span class="slide__label">${s.label}</span>` : ''}
            <h2 class="slide__title">${s.title}</h2>
            <p class="slide__sub">${s.subtitle}</p>
            <span class="slide__cta">${s.cta}${svg('chevronRight', 18)}</span>
          </div>
          <div class="slide__media"><img src="${s.image}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1100" height="733"></div>
        </a>`)}
      </div>
    </div>
    <button class="hero__nav hero__nav--prev" type="button" aria-label="Попередній слайд">${svg('chevronLeft', 26)}</button>
    <button class="hero__nav hero__nav--next" type="button" aria-label="Наступний слайд">${svg('chevronRight', 26)}</button>
    <div class="hero__dots" role="tablist" aria-label="Оберіть слайд">
      ${slides.map((s, i) => html`<button class="hero__dot ${i ? '' : 'is-active'}" type="button" role="tab" aria-selected="${!i}" aria-label="Слайд ${i + 1}: ${s.title}"><span></span></button>`)}
    </div>
  </section>`;
}

/** Wires up autoplay, arrows, dots, swipe and keyboard. Returns a cleanup function. */
export function initHero(root) {
  const el = root.querySelector('[data-hero]');
  if (!el) return () => {};
  const track = el.querySelector('.hero__track');
  const slides = [...el.querySelectorAll('.slide')];
  const dots = [...el.querySelectorAll('.hero__dot')];
  let index = 0;
  let timer = null;
  let paused = false;

  const go = (i, { user = false } = {}) => {
    index = (i + slides.length) % slides.length;
    el.dataset.theme = (slides[index].className.match(/slide--(\w+)/) || [])[1] || 'light';
    track.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((s, j) => {
      s.setAttribute('aria-hidden', j !== index);
      s.tabIndex = j === index ? 0 : -1;
    });
    dots.forEach((d, j) => {
      d.classList.toggle('is-active', j === index);
      d.setAttribute('aria-selected', j === index);
    });
    if (user) restart();
  };

  const restart = () => {
    clearInterval(timer);
    timer = null;
    el.classList.remove('is-playing');
    if (paused || prefersReducedMotion() || slides.length < 2) return;
    void el.offsetWidth;
    el.classList.add('is-playing');
    timer = setInterval(() => {
      go(index + 1);
      el.classList.remove('is-playing');
      void el.offsetWidth;
      el.classList.add('is-playing');
    }, INTERVAL);
  };

  el.style.setProperty('--hero-interval', `${INTERVAL}ms`);
  go(0);
  el.querySelector('.hero__nav--prev').addEventListener('click', () => go(index - 1, { user: true }));
  el.querySelector('.hero__nav--next').addEventListener('click', () => go(index + 1, { user: true }));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i, { user: true })));

  const pause = (p) => {
    paused = p;
    el.classList.toggle('is-paused', p);
    restart();
  };
  el.addEventListener('mouseenter', () => pause(true));
  el.addEventListener('mouseleave', () => pause(false));
  el.addEventListener('focusin', () => pause(true));
  el.addEventListener('focusout', (e) => {
    if (!el.contains(e.relatedTarget)) pause(false);
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1, { user: true });
    if (e.key === 'ArrowRight') go(index + 1, { user: true });
  });

  // Swipe / drag
  let startX = null;
  let dx = 0;
  let dragged = false;
  const vp = el.querySelector('.hero__viewport');
  vp.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    dx = 0;
    dragged = false;
  });
  vp.addEventListener('pointermove', (e) => {
    if (startX == null) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 6 && !dragged) {
      dragged = true;
      track.classList.add('is-dragging');
      vp.setPointerCapture(e.pointerId);
    }
    if (dragged) track.style.transform = `translateX(calc(${-index * 100}% + ${dx}px))`;
  });
  const end = () => {
    if (startX == null) return;
    track.classList.remove('is-dragging');
    if (dragged && Math.abs(dx) > vp.clientWidth * 0.12) go(index + (dx < 0 ? 1 : -1), { user: true });
    else go(index);
    startX = null;
  };
  vp.addEventListener('pointerup', end);
  vp.addEventListener('pointercancel', end);
  // A drag should not also count as a click on the slide link.
  vp.addEventListener('click', (e) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    }
  }, true);
  vp.addEventListener('dragstart', (e) => e.preventDefault());

  const onVisibility = () => pause(document.hidden);
  document.addEventListener('visibilitychange', onVisibility);
  restart();
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
