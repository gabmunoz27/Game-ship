import coinUrl from '../assets/coin.png';
// Iconos de mercancías y objetos, dibujados en el estilo de la moneda: formas gruesas y redondeadas,
// degradado cálido, borde oscuro y un brillo blanco. Son SVG, así que se ven nítidos a cualquier tamaño.
const RIM = '#8a3a0c';
const grad = (id, top, bottom) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
const S = `stroke="${RIM}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const shine = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>`;
const svg = (id, defs, body) => `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true"><defs>${defs.map(([k, a, b]) => grad(`${id}-${k}`, a, b)).join('')}</defs>${body.replaceAll('url(#', `url(#${id}-`)}</svg>`;

const ART = {
  fish: [[['a', '#bfe6f5', '#3f8fc2'], ['b', '#8fd0ee', '#2c6f9f']],
    `<path d="M33 24 L44 14 Q41 24 44 34 Z" fill="url(#b)" ${S}/><ellipse cx="21" cy="24" rx="16" ry="10" fill="url(#a)" ${S}/>
     <path d="M21 14.5 Q26 9 30 15" fill="url(#b)" ${S}/><circle cx="12" cy="22" r="2.2" fill="${RIM}"/>${shine('M13 17 Q20 14.5 27 17')}`],
  salt: [[['a', '#fff8e6', '#e2c88a'], ['b', '#ffffff', '#dfe9f2']],
    `<path d="M15 14 Q24 5 33 14 Z" fill="url(#b)" ${S}/><path d="M12 17 Q24 12 36 17 L39 38 Q24 45 9 38 Z" fill="url(#a)" ${S}/>
     <path d="M17 17 Q24 21 31 17" fill="none" ${S}/><path d="M19 28 l4 -4 l4 4 l-4 4 Z" fill="#fff" stroke="${RIM}" stroke-width="1.8" stroke-linejoin="round"/>${shine('M15 23 Q16 30 15.5 34')}`],
  peat: [[['a', '#9a6a44', '#4a2c1a'], ['b', '#b07d52', '#5e3a22']],
    `<rect x="6" y="27" width="17" height="13" rx="3.5" fill="url(#a)" ${S}/><rect x="25" y="27" width="17" height="13" rx="3.5" fill="url(#a)" ${S}/>
     <rect x="15" y="12" width="18" height="13" rx="3.5" fill="url(#b)" ${S}/>${shine('M19 16.5 H28')}${shine('M10 31.5 H17')}${shine('M29 31.5 H36')}`],
  oak_wood: [[['a', '#ffd9a0', '#d98a3c'], ['b', '#c98548', '#8a5226']],
    `<circle cx="14" cy="32" r="10" fill="url(#b)" ${S}/><circle cx="34" cy="32" r="10" fill="url(#b)" ${S}/><circle cx="24" cy="16" r="10" fill="url(#b)" ${S}/>
     <circle cx="14" cy="32" r="6" fill="url(#a)"/><circle cx="34" cy="32" r="6" fill="url(#a)"/><circle cx="24" cy="16" r="6" fill="url(#a)"/>
     <circle cx="14" cy="32" r="2.2" fill="none" stroke="${RIM}" stroke-width="1.6"/><circle cx="34" cy="32" r="2.2" fill="none" stroke="${RIM}" stroke-width="1.6"/><circle cx="24" cy="16" r="2.2" fill="none" stroke="${RIM}" stroke-width="1.6"/>`],
  resin: [[['a', '#ffe27a', '#f08a12']],
    `<path d="M24 5 C33 18 38 25 38 31 A14 14 0 0 1 10 31 C10 25 15 18 24 5 Z" fill="url(#a)" ${S}/><circle cx="28" cy="33" r="3" fill="#ffb53a" opacity=".8"/>${shine('M17 27 Q17 34 21 38')}`],
  supplies: [[['a', '#ffd9a0', '#c98548'], ['b', '#ffe9a8', '#f0a52a']],
    `<rect x="8" y="13" width="32" height="27" rx="5" fill="url(#a)" ${S}/><path d="M8 22 H40 M8 31 H40" fill="none" ${S}/>
     <rect x="20" y="10" width="8" height="33" rx="3" fill="url(#b)" ${S}/>${shine('M12 17 H17')}`],
  toolbox: [[['a', '#ff8a5a', '#c8321a'], ['b', '#ffe27a', '#f0a52a']],
    `<path d="M17 18 V13 Q17 9 21 9 H27 Q31 9 31 13 V18" fill="none" ${S} stroke-width="3.4"/><rect x="6" y="18" width="36" height="22" rx="5" fill="url(#a)" ${S}/>
     <path d="M6 27 H42" fill="none" ${S}/><rect x="20" y="23" width="8" height="8" rx="2" fill="url(#b)" ${S}/>${shine('M11 22.5 H16')}`],
  letter: [[['a', '#fffaf0', '#ecd9a8'], ['b', '#ff7a5a', '#c8321a']],
    `<rect x="6" y="12" width="36" height="25" rx="4" fill="url(#a)" ${S}/><path d="M7 14 L24 27 L41 14" fill="none" ${S}/><circle cx="24" cy="29" r="5.5" fill="url(#b)" ${S}/>${shine('M10 32 H15')}`],
  shortcut_map: [[['a', '#fff3c8', '#e6c478']],
    `<path d="M6 12 L18 8 L30 12 L42 8 V36 L30 40 L18 36 L6 40 Z" fill="url(#a)" ${S}/><path d="M18 8 V36 M30 12 V40" fill="none" stroke="${RIM}" stroke-width="1.6" opacity=".55"/>
     <path d="M11 30 Q16 20 23 25 T33 20" fill="none" stroke="#c8321a" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 5"/><path d="M33 16 l5 5 m0 -5 l-5 5" stroke="#c8321a" stroke-width="2.8" stroke-linecap="round"/>`],
  old_nails: [[['a', '#c9d2da', '#5d6873']],
    `<g transform="rotate(35 24 24)"><rect x="21.5" y="10" width="5" height="30" rx="2" fill="url(#a)" ${S}/><rect x="16" y="6" width="16" height="6" rx="3" fill="url(#a)" ${S}/></g>
     <g transform="rotate(-35 24 24)"><rect x="21.5" y="10" width="5" height="30" rx="2" fill="url(#a)" ${S}/><rect x="16" y="6" width="16" height="6" rx="3" fill="url(#a)" ${S}/></g>`],
  // Bienes del Estrecho de Kyle (Acto II)
  iron: [[['a', '#b9c3cf', '#4f5a68'], ['b', '#d6dde5', '#7d8896']],
    `<path d="M6 30 L12 22 H36 L42 30 Z" fill="url(#b)" ${S}/><path d="M6 30 H42 V38 H6 Z" fill="url(#a)" ${S}/>
     <path d="M12 22 L16 14 H32 L36 22 Z" fill="url(#b)" ${S}/>${shine('M18 17.5 H30')}${shine('M11 26 H22')}`],
  tools: [[['a', '#c9d2da', '#5d6a78'], ['b', '#ffd9a0', '#c98548']],
    `<path d="M14 40 L30 18" fill="none" stroke="${RIM}" stroke-width="7" stroke-linecap="round"/><path d="M14 40 L30 18" fill="none" stroke="url(#b)" stroke-width="4" stroke-linecap="round"/>
     <path d="M22 12 Q30 6 40 10 L36 20 Q30 16 26 20 Z" fill="url(#a)" ${S}/><path d="M34 40 L20 22" fill="none" stroke="${RIM}" stroke-width="6" stroke-linecap="round"/>
     <path d="M34 40 L20 22" fill="none" stroke="url(#b)" stroke-width="3" stroke-linecap="round"/><rect x="11" y="13" width="12" height="8" rx="2" transform="rotate(38 17 17)" fill="url(#a)" ${S}/>${shine('M27 12 Q31 10 35 11')}`],
  copper_nails: [[['a', '#ffc28a', '#b8551c']],
    `<path d="M10 10 H20 M15 10 V34 L15 38" fill="none" stroke="${RIM}" stroke-width="7" stroke-linecap="round"/><path d="M10 10 H20 M15 10 V36" fill="none" stroke="url(#a)" stroke-width="4" stroke-linecap="round"/>
     <path d="M24 14 H34 M29 14 V38" fill="none" stroke="${RIM}" stroke-width="7" stroke-linecap="round"/><path d="M24 14 H34 M29 14 V40" fill="none" stroke="url(#a)" stroke-width="4" stroke-linecap="round"/>
     <path d="M33 22 L41 16 M37 19 L41 41" fill="none" stroke="${RIM}" stroke-width="6" stroke-linecap="round"/><path d="M33 22 L41 16 M37 19 L41 41" fill="none" stroke="url(#a)" stroke-width="3" stroke-linecap="round"/>`],
  barley: [[['a', '#fff0a8', '#e0a52a'], ['b', '#d9c26a', '#8a7a2a']],
    `<path d="M24 44 V20" fill="none" stroke="${RIM}" stroke-width="5" stroke-linecap="round"/><path d="M24 44 V20" fill="none" stroke="url(#b)" stroke-width="2.5" stroke-linecap="round"/>
     ${[8, 14, 20, 26].map(y => `<ellipse cx="19" cy="${y + 4}" rx="4" ry="5.5" transform="rotate(-30 19 ${y + 4})" fill="url(#a)" ${S}/><ellipse cx="29" cy="${y + 4}" rx="4" ry="5.5" transform="rotate(30 29 ${y + 4})" fill="url(#a)" ${S}/>`).join('')}
     <ellipse cx="24" cy="7" rx="3.6" ry="5" fill="url(#a)" ${S}/><path d="M24 2 V-2" stroke="${RIM}" stroke-width="2"/>`],
  wool: [[['a', '#fffaf0', '#d9c9a8'], ['b', '#ff8a5a', '#c8321a']],
    `<circle cx="24" cy="26" r="16" fill="url(#a)" ${S}/><path d="M11 20 Q24 30 37 18 M9 28 Q24 38 39 26 M14 37 Q24 40 34 36" fill="none" stroke="url(#b)" stroke-width="3" stroke-linecap="round"/>
     <path d="M36 36 Q42 42 44 36" fill="none" stroke="url(#b)" stroke-width="3" stroke-linecap="round"/>${shine('M15 15 Q19 12 24 11.5')}`],
  hemp_rope: [[['a', '#f0d9a0', '#a8803c']],
    `<ellipse cx="24" cy="30" rx="17" ry="10" fill="none" stroke="${RIM}" stroke-width="9"/><ellipse cx="24" cy="30" rx="17" ry="10" fill="none" stroke="url(#a)" stroke-width="5.5"/>
     <ellipse cx="24" cy="22" rx="13" ry="7.5" fill="none" stroke="${RIM}" stroke-width="9"/><ellipse cx="24" cy="22" rx="13" ry="7.5" fill="none" stroke="url(#a)" stroke-width="5.5"/>
     <path d="M37 24 Q44 14 40 8" fill="none" stroke="${RIM}" stroke-width="7" stroke-linecap="round"/><path d="M37 24 Q44 14 40 8" fill="none" stroke="url(#a)" stroke-width="3.6" stroke-linecap="round"/>`],
  // Clima
  despejado: [[['a', '#fff3a0', '#f0a52a']],
    `${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M24 4 V10" transform="rotate(${a} 24 24)" stroke="${RIM}" stroke-width="4" stroke-linecap="round"/>`).join('')}<circle cx="24" cy="24" r="10.5" fill="url(#a)" ${S}/>${shine('M18 20 Q20 16.5 24 16')}`],
  luna: [[['a', '#fff6d0', '#d9c27a']],
    `<path d="M30 6 A18 18 0 1 0 42 30 A14 14 0 1 1 30 6 Z" fill="url(#a)" ${S}/>${shine('M14 22 Q15 16 19 13')}`],
  nublado: [[['a', '#ffffff', '#b9c6d2']],
    `<path d="M12 36 A8 8 0 0 1 12 20 A11 11 0 0 1 32 15 A9 9 0 0 1 37 36 Z" fill="url(#a)" ${S}/>${shine('M15 23 Q17 19 21 18')}`],
  lluvia: [[['a', '#eef3f8', '#9aaabb'], ['b', '#bfe6f5', '#3f8fc2']],
    `<path d="M12 28 A8 8 0 0 1 12 12 A11 11 0 0 1 32 7 A9 9 0 0 1 37 28 Z" fill="url(#a)" ${S}/>
     ${[[15, 33], [24, 36], [33, 33]].map(([x, y]) => `<path d="M${x} ${y} Q${x - 3} ${y + 5} ${x} ${y + 7} Q${x + 3} ${y + 5} ${x} ${y} Z" fill="url(#b)" ${S} stroke-width="1.8"/>`).join('')}`],
  niebla: [[['a', '#ffffff', '#b9c6d2']],
    `<path d="M10 24 A7 7 0 0 1 12 11 A10 10 0 0 1 30 9 A8 8 0 0 1 35 24 Z" fill="url(#a)" ${S}/>
     <path d="M6 30 H34 M12 37 H42 M8 44 H30" fill="none" stroke="${RIM}" stroke-width="4.5" stroke-linecap="round"/><path d="M6 30 H34 M12 37 H42 M8 44 H30" fill="none" stroke="#e8eef3" stroke-width="2" stroke-linecap="round"/>`],
  'viento-en-contra': [[['a', '#e8f4fb', '#8fb8d2']],
    `<path d="M5 18 H30 A6 6 0 1 0 24 12 M5 27 H38 A6 6 0 1 1 32 33 M5 36 H22" fill="none" stroke="${RIM}" stroke-width="6.5" stroke-linecap="round"/>
     <path d="M5 18 H30 A6 6 0 1 0 24 12 M5 27 H38 A6 6 0 1 1 32 33 M5 36 H22" fill="none" stroke="url(#a)" stroke-width="3" stroke-linecap="round"/>`],
  upgrade: [[['a', '#ffe27a', '#f08a12'], ['b', '#fff3c8', '#ffd04a']],
    `<path d="M24 5 L40 11 V24 Q40 36 24 43 Q8 36 8 24 V11 Z" fill="url(#a)" ${S}/><path d="M24 13 L32 16 V24 Q32 31 24 35 Q16 31 16 24 V16 Z" fill="url(#b)" ${S}/>${shine('M13 15 V24')}`]
};
ART.default = ART.supplies;

/** Icono como HTML. `coin` usa la imagen de la moneda; lo que no tenga dibujo propio usa el fardo. */
export function icon(id) {
  if (id === 'coin') return `<img class="icon" src="${coinUrl}" alt="">`;
  const key = ART[id] ? id : 'default', [defs, body] = ART[key];
  return svg(key, defs, body);
}
