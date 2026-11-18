import './ui.css';
// Esqueleto de la interfaz: tres zonas donde los demás módulos de UI colocan sus piezas.
export default {
  id: 'uiRoot', label: 'Interfaz: estructura',
  init(ctx) {
    const ui = document.getElementById('ui');
    ui.innerHTML = '<div class="top" style="justify-self:stretch;display:flex"></div><div class="mid"></div><div class="bottom"></div>';
    ctx.ui = { root: ui, top: ui.querySelector('.top'), mid: ui.querySelector('.mid'), bottom: ui.querySelector('.bottom') };
  }
};
