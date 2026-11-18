// Encargos narrativos: qué se ofrece en cada villa según la Confianza y el avance, y qué pasa al aceptar o entregar.
// Estados de un encargo: sin entrada → 'active' → 'done'.
import { QUESTS, QUEST_TRUST_REWARD } from '../data/quests.js';
import { emit } from '../core/events.js';
import * as trust from './trust.js';

import * as cargo from './cargo.js';

export function grantHerring(state) {
  const q = QUESTS.arenque;
  if (state.quests.arenque || !cargo.add(state, q.good, q.quantity)) return;
  state.quests.arenque = 'active';
  emit('quest:accepted', { id: 'arenque' });
  emit('notice', { text: q.name + ' · ' + q.carrying });
}
export const stateOf = (state, id) => state.quests[id] || 'none';
export const hasItem = (state, item) => state.keyItems.includes(item);

export function objectiveOf(state, id) {
  const quest = QUESTS[id];
  if (!quest || stateOf(state, id) !== 'active') return null;
  if (!quest.good) return quest.objective;
  const aboard = Math.min(cargo.count(state, quest.good), quest.quantity);
  return `${quest.objective} · ${aboard}/${quest.quantity} a bordo`;
}

/** Lo que el panel del muelle debe mostrar en esta villa: texto y, si se puede hacer algo, una acción. */
export function greeting(state, villageId, fallback) {
  const q = QUESTS.arenque;
  return villageId === q.giver && state.quests.arenque === 'done' && !state.quests.carta ? q.returnGreeting : fallback;
}

export function optionsAt(state, villageId) {
  const out = [];
  for (const [id, q] of Object.entries(QUESTS)) {
    const st = stateOf(state, id);
    if (!q.automatic && st === 'none' && villageId === q.giver) {
      out.push(trust.of(state, villageId) >= q.trustNeeded
        ? { id, name: q.name, text: q.offer, action: 'accept', label: q.acceptLabel }
        : { id, name: q.name, text: `${q.locked} (Confianza ${q.trustNeeded})` });
    }
    if (st === 'active' && villageId === q.giver) out.push({ id, name: q.name, text: q.carrying });
    if (st === 'active' && villageId === q.target) out.push({ id, name: q.name, text: q.deliver, action: !q.good || cargo.count(state, q.good) >= q.quantity ? 'deliver' : null, label: q.deliverLabel });
  }
  return out;
}
export function accept(state, id) {
  const q = QUESTS[id];
  if (!q || q.automatic || stateOf(state, id) !== 'none' || state.docked !== q.giver || trust.of(state, q.giver) < q.trustNeeded) return { ok: false };
  state.quests[id] = 'active'; state.keyItems.push(...q.gives);
  q.gives.forEach(item => emit('item:gained', { item }));
  emit('quest:accepted', { id }); return { ok: true };
}
export function deliver(state, id) {
  const q = QUESTS[id];
  if (!q || stateOf(state, id) !== 'active' || state.docked !== q.target) return { ok: false };
  if (q.good && !cargo.remove(state, q.good, q.quantity)) return { ok: false };
  if (q.coins) {
    state.coins += q.coins;
    emit('coins:changed', { coins: state.coins, delta: q.coins });
    trust.add(state, q.giver, q.giverTrust);
  }
  state.keyItems = state.keyItems.filter(i => !q.gives.includes(i)).concat(q.rewards);
  state.quests[id] = 'done'; trust.add(state, q.target, QUEST_TRUST_REWARD);
  q.rewards.forEach(item => emit('item:gained', { item }));
  emit('quest:completed', { id }); return { ok: true, text: q.done };
}
