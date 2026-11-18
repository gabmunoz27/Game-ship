import { on, emit } from '../core/events.js';
// Botón redondo junto al clima: activa o silencia la música. Recuerda la elección en este navegador.
const ON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const OFF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
export default {
  id: 'soundButton', label: 'Botón de música',
  init(ctx) {
    const b = document.createElement('button'); b.className = 'sound-btn';
    const paint = m => { b.innerHTML = m ? OFF : ON; b.setAttribute('aria-label', m ? 'Activar música' : 'Silenciar música'); b.classList.toggle('off', m); };
    paint(ctx.music ? ctx.music.isMuted() : false);
    b.addEventListener('click', () => emit('music:mute'));
    on('music:muted', ({ muted }) => paint(muted));
    const chip = ctx.ui.top.querySelector('.weather-chip'); chip ? ctx.ui.top.insertBefore(b, chip) : ctx.ui.top.append(b);
  }
};
