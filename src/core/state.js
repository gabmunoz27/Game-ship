// Estado único de la partida. Todo lo que hay que guardar vive aquí y es JSON puro:
// nada de objetos de Three.js ni elementos de la página. Valores iniciales: Parche v1.1, 2.A.
import { VILLAGES } from '../data/villages.js';
import { getMap, FIRST_MAP } from '../maps/index.js';

export function createState() {
  const start = getMap(FIRST_MAP).spawns.inicio;
  const villages = {};
  for (const [id, v] of Object.entries(VILLAGES)) villages[id] = { trust: v.initialTrust, status: 'abastecida' };
  return {
    version: 2,
    map: FIRST_MAP, act: 1,
    day: 1, slot: 0, season: 'primavera', weather: 'despejado',
    coins: 60,
    boat: { x: start.x, z: start.z, heading: start.heading, speed: 0, turn: 0, course: null, hull: 100, upgrades: [] },
    hold: { capacity: 10, items: { supplies: 2 }, wet: {} },   // wet: unidades mojadas por la lluvia
    keyItems: [],
    shipyard: {}, // materiales ya entregados para cada mejora: { reinforced_hull: { oak_wood: 4 } }
    quests: {},
    villages,
    lastPort: 'portDun', nearPort: null, nearExit: null, docked: null,
    rng: 20260317,   // semilla del clima
    flags: {}
  };
}

const KEY = 'loch-morag-partida';
export function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; } }
export function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.version === 2 ? s : null; } catch { return null; }
}
