// Cruzar de un mapa a otro por una salida. Cuenta como una travesía (Parche v1.1, 2.C):
// gasta suministros y una franja; sin suministros suficientes tarda dos franjas.
import { getMap, mapOf } from '../maps/index.js';
import { emit } from '../core/events.js';
import { isOpen } from './acts.js';
import { supplyCost } from './voyage.js';
import * as time from './time.js';
import * as cargo from './cargo.js';
import * as weather from './weather.js';

export function cross(state, exitId) {
  const from = mapOf(state), exit = from.exitOf(exitId);
  if (!exit) return { ok: false, reason: 'sin-salida' };
  if (state.docked) return { ok: false, reason: 'atracado' };
  if (!isOpen(state, exit)) return { ok: false, reason: 'bloqueada' };
  const to = getMap(exit.to), spawn = to && to.spawns[exit.spawn];
  if (!spawn) return { ok: false, reason: 'sin-destino' };
  const cost = supplyCost(state), have = cargo.count(state, 'supplies'), supplied = have >= cost;
  if (have) cargo.remove(state, 'supplies', Math.min(have, cost));
  weather.expose(state);
  time.advance(state, supplied ? 1 : 2);
  state.map = to.id;
  Object.assign(state.boat, { x: spawn.x, z: spawn.z, heading: spawn.heading, speed: 0, turn: 0, course: null });
  state.nearPort = null; state.nearExit = null;
  emit('map:changed', { from: from.id, to: to.id, supplied });
  return { ok: true, to: to.id, supplied };
}
