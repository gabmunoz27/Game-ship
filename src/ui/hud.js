import { NAME } from '../maps/current.js';
import { slotName } from '../sim/time.js';
import { used } from '../sim/cargo.js';
// Marcador fijo: día, franja, monedas y bodega. Solo lee el estado; nunca lo cambia.
let el, last = '';
export default {
  id: 'hud', label: 'Marcador',
  init(ctx) { el = document.createElement('div'); el.className = 'hud scroll'; ctx.ui.top.append(el); },
  update(ctx) {
    const s = ctx.state, text = `Día ${s.day} · ${slotName(s)} · ${s.coins} monedas · Bodega ${used(s)}/${s.hold.capacity} · Casco ${s.boat.hull}%`;
    if (text === last) return; last = text;
    el.innerHTML = `<b>${NAME}</b><span>${text}</span>`;
  }
};
