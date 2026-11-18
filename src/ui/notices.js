import { on } from '../core/events.js';
// Consejo inicial y avisos breves ("El rumbo sale del agua").
export default {
  id: 'notices', label: 'Avisos',
  init(ctx) {
    const tip = document.createElement('div'); tip.className = 'tip scroll';
    tip.innerHTML = 'Haz clic en el agua para trazar el rumbo.<small>Rueda del mouse para acercar o alejar · M muestra los módulos</small>';
    const note = document.createElement('div'); note.className = 'notice';
    ctx.ui.mid.append(tip, note);
    let timer = 0;
    const show = text => { note.textContent = text; note.classList.add('on'); clearTimeout(timer); timer = setTimeout(() => note.classList.remove('on'), 3200); };
    on('course:set', () => { tip.hidden = true; });
    on('dock:entered', () => { tip.hidden = true; });
    on('exit:blocked', () => show('Las corrientes del Paso de las Piedras piden un casco reforzado'));
    on('notice', ({ text }) => show(text));
  }
};
