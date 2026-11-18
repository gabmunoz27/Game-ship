// Paso del tiempo (GDD 2.D): Mañana → Tarde → Noche. Estar en el muelle no consume tiempo.
import { emit } from '../core/events.js';
export const SLOTS = ['Mañana', 'Tarde', 'Noche'];
export const slotName = state => SLOTS[state.slot];

export function advance(state, slots = 1) {
  for (let i = 0; i < slots; i++) { state.slot++; if (state.slot >= SLOTS.length) { state.slot = 0; state.day++; } }
  emit('time:changed', { day: state.day, slot: state.slot });
}
export function sleepUntilMorning(state) { state.slot = 0; state.day++; emit('time:changed', { day: state.day, slot: 0 }); }

/** Posición continua en el calendario: crece 1 por franja. La parte visual la persigue para animar el cambio. */
export const phaseOf = state => state.day * SLOTS.length + state.slot;
/** Entre qué dos franjas está una fase y qué tan avanzado va: blend(5.25) → de Noche a Mañana, 25 %. */
export function blend(phase) {
  const n = SLOTS.length, i = Math.floor(phase), mod = k => ((k % n) + n) % n;
  return { from: mod(i), to: mod(i + 1), t: phase - i };
}
