// Salidas del mapa y cierre de acto. Al acercarse a una salida se avisa si está abierta o bloqueada.
// El Paso de las Piedras solo se cruza con el Casco Reforzado, y la primera vez cierra el Acto I (Parche v1.1, 3).
import { mapOf } from '../maps/index.js';
import { emit } from '../core/events.js';
import { has } from './upgrades.js';

export const isOpen = (state, exit) => !exit.requires || has(state, exit.requires);

export function update(state) {
  const b = state.boat, map = mapOf(state);
  const exit = map.exits.find(e => Math.hypot(e.x - b.x, e.z - b.z) < e.radius);
  const id = exit ? exit.id : null;
  if (id === state.nearExit) return;
  state.nearExit = id;
  if (!exit) return emit('exit:near', { exit: null });
  if (!isOpen(state, exit)) return emit('exit:blocked', { exit: exit.id, requires: exit.requires });
  if (exit.closesAct === 1 && !state.flags.act1Done) { state.flags.act1Done = true; state.act = Math.max(state.act, 2); b.course = null; emit('act:completed', { act: 1 }); }
  emit('exit:near', { exit: exit.id });
}
