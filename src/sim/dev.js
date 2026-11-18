import { SOUNDS, VILLAGE_SOUNDS } from '../data/sounds.js';
// Atajos de desarrollador: llevan la partida a cualquier situación sin jugar hasta ahí.
// Puras como el resto de sim/: cambian el estado y avisan con eventos, y la pantalla reacciona sola.
import { MAPS, getMap } from '../maps/index.js';
import { emit } from '../core/events.js';
import { UPGRADES } from '../data/upgrades.js';
import { GOODS } from '../data/goods.js';
import * as cargo from './cargo.js';
import * as trust from './trust.js';

/** Lugares a los que se puede saltar en cada mapa: muelles, salidas y llegadas. */
export function places() {
  return Object.values(MAPS).map(m => ({ map: m.id, name: m.name, spots: [
    ...m.ports.map(p => ({ id: 'villa:' + p.village, village: p.village, x: p.dock[0], z: p.dock[1] })),
    ...m.exits.map(e => ({ id: 'salida:' + e.id, label: e.name, x: e.x, z: e.z, exit: e.id })),
    ...Object.entries(m.spawns).map(([k, s]) => ({ id: 'llegada:' + k, label: 'Llegada ' + k.replace(/^desde/, 'desde '), x: s.x, z: s.z, heading: s.heading }))
  ] }));
}

/** Pone el barco en un lugar de un mapa. Si el mapa cambia, avisa para que el mundo se rearme. */
export function goTo(state, mapId, spotId) {
  const map = getMap(mapId); if (!map) return { ok: false };
  const spot = places().find(p => p.map === mapId).spots.find(s => s.id === spotId); if (!spot) return { ok: false };
  const from = state.map, wasDocked = state.docked;
  // en una salida se queda un poco antes, para no dispararla sin querer
  const n = spot.exit && map.exitOf(spot.exit).n, [x, z] = n ? [spot.x - n[0] * 12, spot.z - n[1] * 12] : [spot.x, spot.z];
  state.map = mapId; state.docked = null; state.nearExit = null;
  if (state.nearPort) { state.nearPort = null; emit('dock:near', { villageId: null }); }
  if (state.nearVillage) { state.nearVillage = null; emit('port:near', { villageId: null }); }
  Object.assign(state.boat, { x, z, speed: 0, turn: 0, course: null, heading: spot.heading ?? state.boat.heading });
  if (wasDocked) emit('dock:left', { villageId: wasDocked });
  if (from !== mapId) emit('map:changed', { from, to: mapId, dev: true });
  emit('dev:moved', { map: mapId, spot: spotId });
  return { ok: true };
}
export function setSlot(state, slot) { state.slot = slot; emit('time:changed', { day: state.day, slot }); }
export function setWeather(state, w) { const from = state.weather; state.weather = w; if (from !== w) emit('weather:changed', { from, to: w }); }
export function addCoins(state, n) { state.coins += n; emit('coins:changed', { coins: state.coins, delta: n }); }
export function give(state, good, qty) { if (state.hold.capacity < 40) state.hold.capacity = Math.max(state.hold.capacity, cargo.used(state) + GOODS[good].weight * qty); return cargo.add(state, good, qty); }
export function emptyHold(state) { for (const g of Object.keys(state.hold.items)) cargo.remove(state, g, cargo.count(state, g)); state.hold.wet = {}; }
export function soak(state) { state.hold.wet = state.hold.wet || {}; const soaked = [];
  for (const [g, n] of Object.entries(state.hold.items)) if (GOODS[g].delicate && n > (state.hold.wet[g] || 0)) { soaked.push({ good: g, qty: n - (state.hold.wet[g] || 0) }); state.hold.wet[g] = n; }
  if (soaked.length) emit('cargo:soaked', { soaked }); return soaked; }
export function toggleUpgrade(state, id) {
  const list = state.boat.upgrades, i = list.indexOf(id), u = UPGRADES[id];
  if (i >= 0) { list.splice(i, 1); if (u.capacity) state.hold.capacity = 10; }
  else { list.push(id); if (u.capacity) state.hold.capacity = Math.max(state.hold.capacity, u.capacity); if (u.act > state.act) state.act = u.act; }
  if (u.capacity) emit('cargo:changed');
  if (list.includes(id)) emit('upgrade:installed', { id, dev: true });
  return list.includes(id);
}
export function setTrust(state, village, value) { trust.add(state, village, value - trust.of(state, village)); }

export function setAudioVolume(bus, value) {
  if (['musica', 'efectos', 'ambiente'].includes(bus) && Number.isFinite(value)) {
    emit('audio:volume', { bus, value: Math.min(1, Math.max(0, value)) });
  }
}
export function previewSound(id) {
  if (Object.hasOwn(SOUNDS, id) || Object.hasOwn(VILLAGE_SOUNDS, id)) emit('audio:preview', { id });
}
