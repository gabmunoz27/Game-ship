// Qué pieza toca ahora. Pura: recibe la partida, lo que ya sonó y un número al azar; no toca el audio.
import { TRACKS, GAP } from '../data/music.js';

/** Piezas que pueden sonar ahora: del mapa activo y, si la pieza lo pide, con ese clima y a esa hora. */
export function candidates(state) {
  return TRACKS.filter(t => t.map === state.map && (!t.weather || t.weather.includes(state.weather)) && (!t.slots || t.slots.includes(state.slot)));
}
/** La siguiente pieza: nunca repite la última si hay otra posible, y prefiere las que llevan más tiempo sin sonar. */
export function pickNext(state, history = [], r = Math.random()) {
  const list = candidates(state); if (!list.length) return null;
  const age = t => { const i = history.lastIndexOf(t.id); return i < 0 ? Infinity : history.length - i; };
  const fresh = list.filter(t => t.id !== history[history.length - 1]);
  const pool = (fresh.length ? fresh : list).slice().sort((a, b) => age(b) - age(a));
  const best = pool.filter(t => age(t) === age(pool[0]));
  return best[Math.floor(r * best.length) % best.length];
}
export const gapSeconds = (r = Math.random()) => GAP[0] + (GAP[1] - GAP[0]) * r;
