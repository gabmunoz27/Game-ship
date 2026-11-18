// Encargos narrativos: qué se ofrece en cada villa según la Confianza y el avance, y qué pasa al aceptar o entregar.
// Estados de un encargo: sin entrada → 'active' → 'done'.
import { QUESTS, QUEST_TRUST_REWARD } from '../data/quests.js';
import { emit } from '../core/events.js';
import * as trust from './trust.js';

export const stateOf = (state, id) => state.quests[id] || 'none';
export const hasItem = (state, item) => state.keyItems.includes(item);

/** Lo que el panel del muelle debe mostrar en esta villa: texto y, si se puede hacer algo, una acción. */
export function optionsAt(state, villageId) {
  const out = [];
  for (const [id, q] of Object.entries(QUESTS)) {
    const st = stateOf(state, id);
    if (st === 'none' && villageId === q.giver) {
      out.push(trust.of(state, villageId) >= q.trustNeeded
        ? { id, name: q.name, text: q.offer, action: 'accept', label: q.acceptLabel }
        : { id, name: q.name, text: `${q.locked} (Confianza ${q.trustNeeded})` });
    }
    if (st === 'active' && villageId === q.giver) out.push({ id, name: q.name, text: q.carrying });
    if (st === 'active' && villageId === q.target) out.push({ id, name: q.name, text: q.deliver, action: 'deliver', label: q.deliverLabel });
  }
  return out;
}
export function accept(state, id) {
  const q = QUESTS[id];
  if (!q || stateOf(state, id) !== 'none' || state.docked !== q.giver || trust.of(state, q.giver) < q.trustNeeded) return { ok: false };
  state.quests[id] = 'active'; state.keyItems.push(...q.gives);
  emit('quest:accepted', { id }); return { ok: true };
}
export function deliver(state, id) {
  const q = QUESTS[id];
  if (!q || stateOf(state, id) !== 'active' || state.docked !== q.target) return { ok: false };
  state.keyItems = state.keyItems.filter(i => !q.gives.includes(i)).concat(q.rewards);
  state.quests[id] = 'done'; trust.add(state, q.target, QUEST_TRUST_REWARD);
  emit('quest:completed', { id }); return { ok: true, text: q.done };
}
