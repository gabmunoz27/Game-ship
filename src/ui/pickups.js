import { on } from '../core/events.js';
import { GOODS } from '../data/goods.js';
import { ITEMS } from '../data/items.js';
import { UPGRADES } from '../data/upgrades.js';
import { icon } from './icons.js';
// Avisos de lo que se va obteniendo: nombre, cantidad e icono, apilados a la derecha.
// Si llega más de lo mismo mientras el aviso sigue en pantalla, se suma a la cantidad.
const LIFE = 3400, live = new Map();
let box;
function push(key, name, iconId, qty = 1) {
  let e = live.get(key);
  if (!e) {
    e = { qty: 0, el: document.createElement('div') }; e.el.className = 'pickup';
    e.el.innerHTML = `<span class="pk-name"></span>${icon(iconId)}`; box.append(e.el); live.set(key, e);
  } else { e.el.classList.remove('bump'); void e.el.offsetWidth; e.el.classList.add('bump'); }
  e.qty += qty;
  e.el.querySelector('.pk-name').innerHTML = `${name} <b>x${e.qty}</b>`;
  clearTimeout(e.timer);
  e.timer = setTimeout(() => { live.delete(key); e.el.classList.add('out'); setTimeout(() => e.el.remove(), 450); }, LIFE);
}
export default {
  id: 'pickups', label: 'Avisos de objetos obtenidos',
  init(ctx) {
    box = document.createElement('div'); box.className = 'pickups'; ctx.ui.root.append(box);
    on('cargo:added', ({ good, qty }) => push(good, GOODS[good].name, good, qty));
    on('item:gained', ({ item }) => push(item, ITEMS[item].name, item, 1));
    on('trade:done', ({ price }) => { if (price > 0) push('coin', 'Monedas', 'coin', price); });
    on('upgrade:installed', ({ id }) => push(id, UPGRADES[id].name, 'upgrade', 1));
  }
};
