import { on, emit } from '../core/events.js';
import { icon } from './icons.js';
import { WEATHER, protectedHold } from '../sim/weather.js';
import { SLOTS } from '../sim/time.js';
import { GOODS } from '../data/goods.js';
// Junto a las monedas: el día, la franja y el clima. Avisa cuando el tiempo cambia y cuando la lluvia moja la carga.
let el, last = '';
const SAY = { lluvia: 'Empieza a llover', niebla: 'Baja la niebla', 'viento-en-contra': 'Se levanta viento en contra', nublado: 'Se nubla', despejado: 'Escampa' };
export default {
  id: 'weatherChip', label: 'Día, franja y clima',
  init(ctx) {
    el = document.createElement('div'); el.className = 'weather-chip'; el.setAttribute('aria-live', 'polite');
    ctx.ui.top.append(el);
    const coins = ctx.ui.top.querySelector('.coins'); if (coins) ctx.ui.top.insertBefore(el, coins);
    on('weather:changed', ({ to }) => {
      const s = ctx.state, delicate = Object.keys(s.hold.items).some(g => GOODS[g].delicate);
      const extra = WEATHER[to].bad ? ' · cada travesía gasta el doble de suministros' : '';
      const wet = to === 'lluvia' && delicate && !protectedHold(s) ? ' · la cebada se mojará si zarpas' : '';
      emit('notice', { text: SAY[to] + extra + wet });
    });
    on('cargo:soaked', ({ soaked }) => emit('notice', { text: soaked.map(x => `La lluvia mojó ${x.qty} de ${GOODS[x.good].name.toLowerCase()}: ahora vale la mitad`).join(' · ') }));
  },
  update(ctx) {
    const s = ctx.state, key = `${s.day}|${s.slot}|${s.weather}`; if (key === last) return; last = key;
    const sky = s.slot === 2 && s.weather === 'despejado' ? 'luna' : s.weather;
    el.innerHTML = `${icon(sky)}<span><b>${SLOTS[s.slot]} · ${WEATHER[s.weather].name}</b><small>Día ${s.day}</small></span>`;
    el.classList.toggle('bad', !!WEATHER[s.weather].bad);
  }
};
