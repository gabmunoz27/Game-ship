// Estado único de la partida. Todo lo que hay que guardar vive aquí y es JSON puro:
// nada de objetos de Three.js ni elementos de la página. Valores iniciales: Parche v1.1, 2.A.
import { VILLAGES } from '../data/villages.js';
import { START } from '../maps/current.js';

export function createState() {
  const villages = {};
  for (const [id, v] of Object.entries(VILLAGES)) villages[id] = { trust: v.initialTrust, status: 'abastecida' };
  return {
    version: 2,
    map: 'lochMorag', act: 1,
    day: 1, slot: 0, season: 'primavera', weather: 'despejado',
    coins: 60,
    boat: { x: START.x, z: START.z, heading: START.heading, speed: 0, turn: 0, course: null, hull: 100, upgrades: [] },
    hold: { capacity: 10, items: { supplies: 2 } },
    keyItems: [],
    shipyard: {}, // materiales ya entregados para cada mejora: { reinforced_hull: { oak_wood: 4 } }
    quests: {},
    villages,
    lastPort: 'portDun', nearPort: null, nearExit: false, docked: null,
    flags: {}
  };
}

const KEY = 'loch-morag-partida';
export function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; } }
export function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.version === 2 ? s : null; } catch { return null; }
}
