// Comercio por necesidad y vínculo (GDD 2.C, Parche v1.1 2.B): barato donde se produce, caro donde se necesita.
// Entregar lo que una villa necesita sube su Confianza.
import { GOODS, BUY_AT_SOURCE, SELL_WHERE_NEEDED, SELL_ELSEWHERE, SELL_BACK_AT_SOURCE } from '../data/goods.js';
import { VILLAGES } from '../data/villages.js';
import { emit } from '../core/events.js';
import * as cargo from './cargo.js';
import * as trust from './trust.js';

const round = x => Math.round(x - 1e-9); // 10,5 baja a 10, como en la tabla del parche

/** Una villa vende lo que produce, más suministros de viaje. */
export const onSale = villageId => [...VILLAGES[villageId].produces, 'supplies'];

export function buyPrice(state, villageId, good) {
  const g = GOODS[good], base = g.tradeable === false ? g.price : round(g.price * BUY_AT_SOURCE);
  return trust.of(state, villageId) >= trust.DISCOUNT_FROM ? round(base * (1 - trust.DISCOUNT)) : base;
}
/** Precio de venta, o null si ese bien no se vende. */
export function sellPrice(state, villageId, good) {
  const g = GOODS[good], v = VILLAGES[villageId];
  if (g.tradeable === false) return null;
  const k = v.needs.includes(good) ? SELL_WHERE_NEEDED : v.produces.includes(good) ? SELL_BACK_AT_SOURCE : SELL_ELSEWHERE;
  return round(g.price * k);
}
export function buy(state, villageId, good) {
  if (!onSale(villageId).includes(good)) return { ok: false, reason: 'no-se-vende' };
  const price = buyPrice(state, villageId, good);
  if (state.coins < price) return { ok: false, reason: 'sin-monedas' };
  if (!cargo.add(state, good)) return { ok: false, reason: 'bodega-llena' };
  state.coins -= price; emit('trade:done', { villageId, good, price: -price });
  return { ok: true, price };
}
export function sell(state, villageId, good) {
  const price = sellPrice(state, villageId, good);
  if (price === null) return { ok: false, reason: 'no-comercializable' };
  if (!cargo.remove(state, good)) return { ok: false, reason: 'no-tienes' };
  state.coins += price;
  if (VILLAGES[villageId].needs.includes(good)) trust.add(state, villageId, trust.PER_NEEDED_UNIT);
  emit('trade:done', { villageId, good, price });
  return { ok: true, price };
}
