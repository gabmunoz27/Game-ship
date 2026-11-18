import { on, emit } from '../core/events.js';
import { cross } from '../sim/travel.js';
import { getMap } from '../maps/index.js';
// Cambio de mapa: la pantalla se funde a oscuro, se cruza la salida (la simulación cambia de mapa
// y el mundo se reconstruye detrás del telón) y aparece el nombre del lugar nuevo antes de aclarar.
const FADE = 650, HOLD = 1500;
export default {
  id: 'mapTransition', label: 'Transición entre mapas',
  init(ctx) {
    const el = document.createElement('div'); el.className = 'map-curtain';
    el.innerHTML = '<div class="mc-line"></div><div class="mc-name"></div><div class="mc-note"></div>';
    ctx.ui.root.append(el);
    let busy = false;
    on('travel:request', ({ exit }) => {
      if (busy) return; busy = true;
      el.classList.add('dark');
      setTimeout(() => {
        const res = cross(ctx.state, exit);
        if (!res.ok) { el.classList.remove('dark'); busy = false; return emit('notice', { text: 'No se puede cruzar ahora' }); }
        el.querySelector('.mc-name').textContent = getMap(res.to).name;
        el.querySelector('.mc-note').textContent = res.supplied ? 'La travesía gastó suministros y una franja del día' : 'Sin suministros: la travesía tomó el doble';
        // Se espera a que el mundo nuevo ya se haya dibujado un par de veces antes de mostrar el nombre y aclarar.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.classList.add('named');
          setTimeout(() => { el.classList.remove('dark', 'named'); busy = false; }, HOLD);
        }));
      }, FADE);
    });
  }
};
