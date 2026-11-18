import { on } from '../core/events.js';
// Consejo inicial y avisos breves ("El rumbo sale del agua").
export default {
  id: 'notices', label: 'Avisos',
  init(ctx) {
    const tip = document.createElement('div'); tip.className = 'tip scroll';
    tip.innerHTML = 'Haz clic en el agua para trazar el rumbo.<small>Rueda del mouse para acercar o alejar · D abre la vista de desarrollador</small>';
    const note = document.createElement('div'); note.className = 'notice';
    ctx.ui.mid.append(note); ctx.ui.bottom.prepend(tip);
    let timer = 0;
    // Los avisos hacen fila: si llegan dos juntos (la lluvia mojó la carga y además escampó), se leen los dos.
    const queue = [];
    const next = () => { if (!queue.length) { note.classList.remove('on'); timer = 0; return; }
      note.textContent = queue.shift(); note.classList.add('on'); timer = setTimeout(next, 3200); };
    const show = text => { if (queue[queue.length - 1] === text || (timer && note.textContent === text && !queue.length)) return; queue.push(text); if (!timer) next(); };
    on('course:set', () => { tip.hidden = true; });
    on('dock:entered', () => { tip.hidden = true; });
    on('exit:blocked', ({ requires }) => show(requires === 'reinforced_hull' ? 'Las corrientes del Paso de las Piedras piden un casco reforzado' : 'Esta salida todavía está cerrada'));
    on('notice', ({ text }) => show(text));
  }
};
