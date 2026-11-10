import qrcode from '../vendor/qrcode.js';
import { esc } from '../core/dom.js';

const DARK = '#221f1f';
const GREEN = '#00a046';

/**
 * QR code as an SVG string. With `logo`, the store mark is drawn in the centre;
 * error correction level H keeps the code readable with up to ~30% covered.
 */
export function qrSvg(text, { size = 160, margin = 2, logo = true, label } = {}) {
  const qr = qrcode(0, logo ? 'H' : 'M');
  qr.addData(unescape(encodeURIComponent(text)), 'Byte'); // UTF-8 bytes for Cyrillic in paths
  qr.make();
  const n = qr.getModuleCount();
  const total = n + margin * 2;

  // Keep the centre clear for the logo (about 22% of the code).
  const hole = logo ? Math.ceil(n * 0.22) | 1 : 0;
  const h0 = Math.floor((n - hole) / 2);
  const inHole = (r, c) => logo && r >= h0 && r < h0 + hole && c >= h0 && c < h0 + hole;

  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c) && !inHole(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }

  let mark = '';
  if (logo) {
    const s = hole - 1;
    const x = h0 + margin + 0.5;
    const k = s / 32; // the logo is drawn on a 32×32 grid
    mark = `<g transform="translate(${x} ${x}) scale(${k})">
      <rect width="32" height="32" rx="9" fill="${GREEN}"/>
      <rect x="8" y="6.5" width="5.5" height="5.5" rx="1.3" fill="#fff"/>
      <rect x="15" y="8" width="4.5" height="4" rx="1" fill="#fff"/>
      <circle cx="11.5" cy="18.3" r="2.7" fill="#fff"/>
      <rect x="17.5" y="15.2" width="6" height="5.8" rx="1.4" fill="#fff"/>
      <path d="M6.5 13.2h19M6.5 22.4h19" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}"
    shape-rendering="crispEdges" role="img" aria-label="${esc(label || `QR-код: ${text}`)}">
    <rect width="${total}" height="${total}" fill="#fff"/><path d="${d}" fill="${DARK}"/>${mark}</svg>`;
}

/** Address of the store as the visitor sees it (works on any domain once deployed). */
export const siteUrl = () => `${location.origin}/`;

export function downloadSvg(svg, filename) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  save(URL.createObjectURL(blob), filename);
}

export function downloadPng(svg, filename, px = 1024) {
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, px, px);
    URL.revokeObjectURL(url);
    canvas.toBlob((b) => save(URL.createObjectURL(b), filename), 'image/png');
  };
  img.src = url;
}

function save(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
