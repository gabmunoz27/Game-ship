import { on, emit } from '../core/events.js';
import { mapOf, getMap } from '../maps/index.js';
// Botón "Cruzar a …" cuando el barco está en una salida abierta del mapa.
export default {
  id: 'exitPrompt', label: 'Botón de salida del mapa',
  init(ctx) {
    const btn = document.createElement('button'); btn.className = 'dock-btn scroll'; btn.hidden = true;
    ctx.ui.bottom.append(btn);
    let current = null;
    on('exit:near', ({ exit }) => {
      current = exit; btn.hidden = !exit; if (!exit) return;
      const e = mapOf(ctx.state).exitOf(exit), to = getMap(e.to);
      btn.textContent = `Cruzar ${to.id === 'lochMorag' ? 'a' : 'al'} ${to.name}`;
    });
    on('map:changed', () => { current = null; btn.hidden = true; });
    btn.addEventListener('click', () => { if (current) emit('travel:request', { exit: current }); });
  }
};
