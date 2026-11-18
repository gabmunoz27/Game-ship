// Cierre de acto: el Paso de las Piedras solo se cruza con el Casco Reforzado (Parche v1.1, 3).
import { EXIT } from '../maps/current.js';
import { emit } from '../core/events.js';
import { has } from './upgrades.js';

export function update(state) {
  const b = state.boat, near = Math.hypot(EXIT.x - b.x, EXIT.z - b.z) < EXIT.radius;
  if (near === state.nearExit) return;
  state.nearExit = near; if (!near) return;
  if (!has(state, EXIT.requires)) return emit('exit:blocked', { exit: EXIT.id });
  if (!state.flags.act1Done) { state.flags.act1Done = true; b.course = null; emit('act:completed', { act: 1 }); }
}
