import { on, emit } from '../core/events.js';
// Pantalla de cierre de acto.
export default {
  id: 'actEnd', label: 'Cierre de acto',
  init(ctx) {
    const el = document.createElement('section'); el.className = 'act-end scroll'; el.hidden = true;
    el.innerHTML = `<h2>Fin del Acto I</h2><p><small>Primavera · El Deshielo</small></p>
      <p>El casco aguanta las corrientes del Paso de las Piedras. Detrás queda Loch Morag, con sus dos muelles hablándose otra vez. Delante, entre paredes de roca negra, empieza el Estrecho de Kyle.</p>
      <div class="row"><button data-go>Cruzar al Estrecho de Kyle</button><button data-stay>Seguir en Loch Morag</button></div>`;
    ctx.ui.mid.append(el);
    el.querySelector('[data-stay]').addEventListener('click', () => { el.hidden = true; });
    el.querySelector('[data-go]').addEventListener('click', () => { el.hidden = true; emit('travel:request', { exit: 'pasoPiedras' }); });
    on('act:completed', () => { el.hidden = false; });
  }
};
