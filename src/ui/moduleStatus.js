import { on } from '../core/events.js';
import { status } from '../core/systems.js';
// Lista de módulos con ✓ o ✗. Se abre con la tecla M, o sola si algún módulo falla.
export default {
  id: 'moduleStatus', label: 'Estado de los módulos',
  init(ctx) {
    const el = document.createElement('div'); el.className = 'modules'; el.hidden = true; ctx.ui.root.append(el);
    const draw = () => { el.innerHTML = status().map(s => `<div class="${s.ok ? '' : 'bad'}">${s.ok ? '✓' : '✗'} ${s.label}${s.error ? `<br>&nbsp;&nbsp;${s.error}` : ''}</div>`).join(''); };
    addEventListener('keydown', e => { if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) { el.hidden = !el.hidden; draw(); } });
    on('system:failed', () => { el.hidden = false; draw(); });
  }
};
