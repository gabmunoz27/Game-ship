// Clima (GDD 2.D). Cambia cada vez que avanza una franja, según la tabla del mapa activo.
// Con lluvia, la carga delicada (la cebada) se moja durante la travesía, salvo con una bodega cubierta:
// la carga mojada vale la mitad. Puro: el azar sale de una semilla guardada en la partida, así se puede repetir.
import { mapOf } from '../maps/index.js';
import { emit } from '../core/events.js';
import { GOODS } from '../data/goods.js';
import { UPGRADES } from '../data/upgrades.js';

export const WEATHER = {
  despejado:          { name: 'Despejado' },
  nublado:            { name: 'Nublado' },
  lluvia:             { name: 'Lluvia', bad: true, wets: true },
  niebla:             { name: 'Niebla', bad: true },
  'viento-en-contra': { name: 'Viento en contra', bad: true }
};
export const WET_VALUE = .5;                                     // la carga mojada se vende a la mitad
const DEFAULT_TABLE = { despejado: .55, nublado: .25, lluvia: .14, niebla: .06 };

/** Mal tiempo: una travesía gasta el doble de suministros (Parche v1.1, 2.C). */
export const isBad = state => !!(WEATHER[state.weather] && WEATHER[state.weather].bad);

function rand(state) {
  if (!state.rng) state.rng = 20260317;
  state.rng = (state.rng * 16807) % 2147483647;
  return (state.rng - 1) / 2147483646;
}
/** Sortea el clima de la franja que empieza. */
export function roll(state) {
  const table = mapOf(state).weather || DEFAULT_TABLE;
  let r = rand(state), next = 'despejado';
  for (const [k, p] of Object.entries(table)) { if ((r -= p) < 0) { next = k; break; } }
  if (next !== state.weather) { const from = state.weather; state.weather = next; emit('weather:changed', { from, to: next }); }
  return next;
}
export const protectedHold = state => state.boat.upgrades.some(id => UPGRADES[id] && UPGRADES[id].protectsCargo);
export const wet = (state, good) => (state.hold.wet && state.hold.wet[good]) || 0;

/** Una travesía con este clima: moja la carga delicada que siga seca. Devuelve lo que se mojó. */
export function expose(state, weather = state.weather) {
  if (!WEATHER[weather] || !WEATHER[weather].wets || protectedHold(state)) return [];
  const soaked = []; state.hold.wet = state.hold.wet || {};
  for (const [g, n] of Object.entries(state.hold.items)) {
    if (!GOODS[g].delicate) continue;
    const dry = n - wet(state, g);
    if (dry > 0) { state.hold.wet[g] = n; soaked.push({ good: g, qty: dry }); }
  }
  if (soaked.length) emit('cargo:soaked', { soaked });
  return soaked;
}
