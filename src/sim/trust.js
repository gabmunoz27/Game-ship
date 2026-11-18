// Confianza de 0 a 100 por villa y sus niveles (Parche v1.1, 2.D).
import { emit } from '../core/events.js';
export const TIERS = [
  { min: 0,  id: 'forastero', name: 'Forastero' },
  { min: 20, id: 'conocido',  name: 'Conocido' },
  { min: 50, id: 'aliado',    name: 'Aliado' },
  { min: 80, id: 'patron',    name: 'Patrón de Confianza' }
];
export const PER_NEEDED_UNIT = 2, LATE_PENALTY = 5, DISCOUNT_FROM = 50, DISCOUNT = .1, FREE_SUPPLY_FROM = 80;

export const of = (state, villageId) => state.villages[villageId].trust;
export const tierOf = (state, villageId) => [...TIERS].reverse().find(t => of(state, villageId) >= t.min);
export function add(state, villageId, amount) {
  const v = state.villages[villageId], before = v.trust;
  v.trust = Math.max(0, Math.min(100, v.trust + amount));
  if (v.trust !== before) emit('trust:changed', { villageId, trust: v.trust });
}
