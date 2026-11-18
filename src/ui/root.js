import '@fontsource/cinzel/latin-700.css';
import '@fontsource/cinzel/latin-900.css';
import './ui.css';
// Esqueleto de la interfaz: tres zonas donde los demás módulos de UI colocan sus piezas.
export default {
  id: 'uiRoot', label: 'Interfaz: estructura',
  init(ctx) {
    const ui = document.getElementById('ui');
    ui.innerHTML = '<div class="top" style="justify-self:stretch;display:flex;align-items:flex-start;gap:12px"></div><div class="mid"></div><div class="bottom"></div>';
    ctx.ui = { root: ui, top: ui.querySelector('.top'), mid: ui.querySelector('.mid'), bottom: ui.querySelector('.bottom') };
  }
};
