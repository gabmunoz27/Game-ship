// Mejoras del barco: qué falta para instalar una y la instalación en sí.
import { UPGRADES } from '../data/upgrades.js';
import { GOODS } from '../data/goods.js';
import { ITEMS } from '../data/items.js';
import { VILLAGES } from '../data/villages.js';
import { emit } from '../core/events.js';
import * as cargo from './cargo.js';
import * as trust from './trust.js';

export const has = (state, id) => state.boat.upgrades.includes(id);

export const delivered = (state, id, good) => (state.shipyard[id] && state.shipyard[id][good]) || 0;

/** Lista de requisitos con su estado, para mostrarla tal cual en el Astillero. */
export function requirements(state, id) {
  const u = UPGRADES[id], list = [];
  for (const [g, n] of Object.entries(u.goods || {})) list.push({ label: `${n} × ${GOODS[g].name}`, have: `${delivered(state, id, g)}/${n} entregados`, ok: delivered(state, id, g) >= n });
  for (const i of u.items || []) list.push({ label: ITEMS[i].name, have: state.keyItems.includes(i) ? 'a bordo' : 'falta', ok: state.keyItems.includes(i) });
  if (u.coins) list.push({ label: `${u.coins} monedas de mano de obra`, have: `tienes ${state.coins}`, ok: state.coins >= u.coins });
  if (u.trust) list.push({ label: `Confianza ${u.trust} en ${VILLAGES[u.at].name}`, have: `tienes ${trust.of(state, u.at)}`, ok: trust.of(state, u.at) >= u.trust });
  return list;
}
const open = (state, id) => { const u = UPGRADES[id]; return !!u && u.act <= state.act && !has(state, id) && state.docked === u.at; };

/** Cuántas unidades de la bodega sirven todavía para esta mejora. */
export function deliverable(state, id) {
  if (!open(state, id)) return 0;
  return Object.entries(UPGRADES[id].goods || {}).reduce((sum, [g, n]) => sum + Math.min(cargo.count(state, g), n - delivered(state, id, g)), 0);
}
/** Deja en el astillero los materiales que haya a bordo. Se puede hacer en varios viajes: no caben todos de una vez. */
export function deliver(state, id) {
  if (!deliverable(state, id)) return { ok: false };
  const yard = state.shipyard[id] || (state.shipyard[id] = {});
  for (const [g, n] of Object.entries(UPGRADES[id].goods)) {
    const qty = Math.min(cargo.count(state, g), n - delivered(state, id, g));
    if (qty > 0) { cargo.remove(state, g, qty); yard[g] = (yard[g] || 0) + qty; }
  }
  emit('upgrade:materials', { id }); return { ok: true };
}
export const canInstall = (state, id) => open(state, id) && requirements(state, id).every(r => r.ok);
export function install(state, id) {
  if (!canInstall(state, id)) return { ok: false };
  const u = UPGRADES[id];
  delete state.shipyard[id];
  state.keyItems = state.keyItems.filter(i => !(u.items || []).includes(i));
  state.coins -= u.coins || 0; state.boat.upgrades.push(id);
  emit('upgrade:installed', { id }); return { ok: true };
}
