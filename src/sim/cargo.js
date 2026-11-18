// Bodega compartida (GDD 2.B): mercancía y suministros ocupan las mismas casillas, y cada bien pesa lo suyo.
import { GOODS } from '../data/goods.js';
import { emit } from '../core/events.js';

export const used = state => Object.entries(state.hold.items).reduce((sum, [g, n]) => sum + n * GOODS[g].weight, 0);
export const free = state => state.hold.capacity - used(state);
export const count = (state, good) => state.hold.items[good] || 0;
export const fits = (state, good, qty = 1) => !!GOODS[good] && free(state) >= GOODS[good].weight * qty;

export function add(state, good, qty = 1) {
  if (qty < 1 || !fits(state, good, qty)) return false;
  state.hold.items[good] = count(state, good) + qty; emit('cargo:changed'); return true;
}
export function remove(state, good, qty = 1) {
  if (qty < 1 || count(state, good) < qty) return false;
  state.hold.items[good] -= qty; if (!state.hold.items[good]) delete state.hold.items[good];
  emit('cargo:changed'); return true;
}
