import { Vector3 } from 'three';
import { on } from '../core/events.js';
import { VILLAGES } from '../data/villages.js';
import { mapOf } from '../maps/index.js';
// Rótulo de llegada: al acercarse a un muelle se dibuja una línea desde el pueblo y el nombre aparece disolviéndose.
// Sigue al pueblo en pantalla mientras el barco está cerca y se desvanece al alejarse.
const v = new Vector3();
let el, anchor = null;
export default {
  id: 'villageLabel', label: 'Rótulo de llegada',
  init(ctx) {
    el = document.createElement('div'); el.className = 'village-label';
    el.innerHTML = '<div class="vl-text"><span class="vl-kind">Villa</span><span class="vl-name"></span></div><div class="vl-line"></div><div class="vl-dot"></div>';
    ctx.ui.root.append(el);
    on('port:near', ({ villageId }) => {
      const map = mapOf(ctx.state), p = map.portOf(villageId);
      if (!p) return el.classList.remove('on');
      const [x, z] = p.center || p.land;
      anchor = new Vector3(x, map.height(x, z) + 1.5, z);
      el.querySelector('.vl-name').textContent = VILLAGES[villageId].name;
      el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); // reinicia la animación
    });
  },
  update(ctx) {
    if (!anchor || !ctx.camera) return;
    v.copy(anchor).project(ctx.camera);
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    // En pantallas angostas la barra de arriba (clima y monedas) ocupa todo el ancho: el rótulo baja para no taparla.
      const top = w < 700 ? ctx.ui.top.getBoundingClientRect().bottom + 245 : 262;
      const x = Math.max(110, Math.min(w - 110, (v.x + 1) / 2 * w)), y = Math.max(top, Math.min(h - 20, (1 - v.y) / 2 * h));
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
};
