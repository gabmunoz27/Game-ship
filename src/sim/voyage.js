// Travesías (Parche v1.1, 2.C). Atracar en una villa distinta a la anterior cuenta como un viaje:
// 1 franja y 1 suministro (2 con mal tiempo). Sin suministros suficientes, tarda 2 franjas y la villa pierde Confianza.
import { emit } from '../core/events.js';
import * as time from './time.js';
import * as cargo from './cargo.js';
import * as trust from './trust.js';

const BAD_WEATHER = ['lluvia', 'niebla', 'viento-en-contra'];
export const supplyCost = state => BAD_WEATHER.includes(state.weather) ? 2 : 1;

export function dock(state, villageId) {
  if (state.docked) return { ok: false, reason: 'ya-atracado' };
  let traveled = false, supplied = true;
  if (state.lastPort !== villageId) {
    traveled = true;
    const cost = supplyCost(state), have = cargo.count(state, 'supplies');
    supplied = have >= cost;
    if (have) cargo.remove(state, 'supplies', Math.min(have, cost));
    time.advance(state, supplied ? 1 : 2);
    if (!supplied) trust.add(state, villageId, -trust.LATE_PENALTY);
  }
  state.docked = state.lastPort = villageId; state.boat.speed = 0; state.boat.course = null;
  emit('dock:entered', { villageId, traveled, supplied });
  return { ok: true, traveled, supplied };
}
export function undock(state) {
  const villageId = state.docked; if (!villageId) return;
  state.docked = null; emit('dock:left', { villageId });
}
/** Pasar la noche en el muelle. Una villa con Confianza alta regala un suministro si cabe en la bodega. */
export function sleep(state) {
  if (!state.docked) return { ok: false };
  time.sleepUntilMorning(state);
  const gift = trust.of(state, state.docked) >= trust.FREE_SUPPLY_FROM && cargo.add(state, 'supplies');
  return { ok: true, gift };
}
