// Inline SVG icon set (24x24, stroke-based). Usage: icon('cart') returns an SVG string.

const P = {
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  cart: '<path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
  cartCheck: '<path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/><path d="m10.5 10.5 1.8 1.8 3.4-3.6"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
  chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2h9.2L17.5 7M10.2 10.5v5.5M13.8 10.5v5.5"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
  filter: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  truck: '<path d="M3 6.5h11v9H3zM14 9.5h3.6l3.4 3.3v2.7h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  store: '<path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5h16M4 9.5c0 1.5 1.2 2.5 2.7 2.5s2.6-1 2.6-2.5c0 1.5 1.2 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.1 2.5 2.6 2.5S20 11 20 9.5M5.5 12v7.5h13V12M10 19.5v-4.5h4v4.5"/>',
  box: '<path d="m12 3.5 8 4v9l-8 4-8-4v-9l8-4ZM4 7.5l8 4 8-4M12 11.5v9"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
  phone: '<path d="M7.5 3.5h3l1.5 4-2 1.2a10 10 0 0 0 5.3 5.3l1.2-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 5.5 5.5a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  percent: '<path d="M18 6 6 18"/><circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
  fire: '<path d="M12 21c3.9 0 6.5-2.6 6.5-6.2 0-3.9-3.4-6.3-4.2-10.3-2.3 1.4-3.5 3.7-3.4 6.2-1.2-.6-2-1.8-2.2-3.2C7 9.1 5.5 11.4 5.5 14.8 5.5 18.4 8.1 21 12 21Z"/>',
  sparkle: '<path d="M12 3.5 13.8 10 20.5 12l-6.7 2-1.8 6.5-1.8-6.5L3.5 12l6.7-2L12 3.5Z"/>',
  trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0v-5ZM8 6.5H5v1.5a3 3 0 0 0 3 3M16 6.5h3v1.5a3 3 0 0 1-3 3M12 13.5v3.5M8.5 20h7M9.5 17h5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4v-9.5Z"/>',
  logout: '<path d="M14 4.5H6.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H14M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5"/>',
  edit: '<path d="M5 19h3.5L19 8.5 15.5 5 5 15.5V19ZM13.5 7l3.5 3.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  zoom: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/>',
  comment: '<path d="M4.5 5.5h15v10h-9L6 19.5v-4H4.5v-10Z"/>',
  thumb: '<path d="M7.5 10.5v9h-3v-9h3Zm0 0 3.8-6.2a1.8 1.8 0 0 1 3.3 1.3l-.8 3.4h4.6a2 2 0 0 1 2 2.4l-1.3 6.2a2 2 0 0 1-2 1.6H7.5"/>',
  // category icons
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.2"/><path d="M3 18.5h18"/>',
  phoneDevice: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17.5h2"/>',
  gamepad: '<path d="M7.5 8h9a4 4 0 0 1 3.9 4.8l-.7 3.4a2.2 2.2 0 0 1-3.8 1L14.5 15h-5l-1.4 2.2a2.2 2.2 0 0 1-3.8-1l-.7-3.4A4 4 0 0 1 7.5 8Z"/><path d="M8.5 10.5v3M7 12h3M15.5 11.5h0M17 13h0"/>',
  appliance: '<rect x="5" y="3.5" width="14" height="17" rx="1.8"/><circle cx="12" cy="13" r="4"/><path d="M8 6.5h1.5M12 6.5h4"/>',
  shirt: '<path d="m8.5 4 3.5 2 3.5-2 4.5 3-2 3.5-2-1V20h-8V9.5l-2 1L4 7l4.5-3Z"/>',
  beauty: '<path d="M9.5 3.5h5v3h-5zM8 6.5h8l1 3.5v10.5H7V10l1-3.5Z"/><path d="M10 13.5h4"/>',
  toy: '<rect x="4" y="11" width="7" height="7" rx="1"/><rect x="13" y="11" width="7" height="7" rx="1"/><rect x="8.5" y="4" width="7" height="7" rx="1"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="m6 16 4-7h5l3 7M10 9 8.5 6H6.5M15 9l-3 7h-6M14 6h2.5"/>',
  cup: '<path d="M5 8.5h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-6ZM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2M11 3.5v2M14 3.5v2"/>',
};

const FILLED = {
  heartFilled: '<path fill="currentColor" stroke="currentColor" d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z"/>',
};

export function icon(name, size = 24, cls = '') {
  const body = P[name] || FILLED[name] || '';
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const categoryIcon = {
  laptop: 'laptop', phone: 'phoneDevice', gamepad: 'gamepad', appliance: 'appliance', shirt: 'shirt',
  beauty: 'beauty', toy: 'toy', bike: 'bike', cup: 'cup',
};
