import coinUrl from '../assets/coin.png';
// Monedas, arriba a la derecha. Solo lee el estado; da un pequeño salto cuando el número cambia.
let el, num, last = null;
export default {
  id: 'coins', label: 'Contador de monedas',
  init(ctx) {
    el = document.createElement('div'); el.className = 'coins';
    el.innerHTML = `<img src="${coinUrl}" alt="Monedas" width="46" height="48"><span></span>`;
    num = el.querySelector('span'); ctx.ui.top.append(el);
  },
  update(ctx) {
    const c = ctx.state.coins; if (c === last) return;
    num.textContent = c;
    if (last !== null) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    last = c;
  }
};
