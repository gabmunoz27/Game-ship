// Mapa 1: Loch Morag. Un lago largo y angosto con dos villas y una salida al sur.
// Matemática pura: de shoreDist salen el terreno, el agua y también la navegación.
import { defineMap, inland } from './shared.js';

const RX = 88, RZ = 25;
const bnd = a => 1 + .14 * Math.sin(3 * a + 1) + .08 * Math.sin(5 * a + 2.3) + .04 * Math.sin(8 * a + .7);
const field = (x, z) => { const dx = x / RX, dz = z / RZ; return Math.hypot(dx, dz) / bnd(Math.atan2(dz, dx)) - 1; };
const grad = (x, z) => { const e = .5; return [(field(x + e, z) - field(x - e, z)) / (2 * e), (field(x, z + e) - field(x, z - e)) / (2 * e)]; };

/** Distancia a la orilla: negativa dentro del lago, positiva en tierra. */
function shoreDist(x, z) { const [gx, gz] = grad(x, z); return field(x, z) / Math.max(.004, Math.hypot(gx, gz)); }
/** Punto a distancia d de la orilla (hacia tierra si d > 0) en el ángulo a. Lo usa Glenmore para ubicar su pueblo. */
function shorePoint(a, d = 0) {
  const x = RX * bnd(a) * Math.cos(a), z = RZ * bnd(a) * Math.sin(a);
  const [gx, gz] = grad(x, z), g = Math.hypot(gx, gz) || 1;
  return [x + gx / g * d, z + gz / g * d];
}
const shoreSpeed = a => Math.hypot(RX * Math.sin(a), RZ * Math.cos(a)) * bnd(a);
const PASO = 1.35, inward = a => { const n = inland(shoreDist, ...shorePoint(a)); return Math.atan2(-n[1], -n[0]); };

const start = shorePoint(-.55, -17), back = shorePoint(PASO, -24);
// Coordenadas locales: u recorre la orilla y v crece hacia tierra.
// Los tamaños incluyen las bordas y los pilotes.
const waterfront = [{ kind: 'walkway', u: -19, v: .2, width: 38, depth: 1.5 }];
for (const [index, u] of [-19, -29, -37].entries()) {
  const v = -3.5 + index * .5;
  waterfront.push({ kind: 'pier', u, v, width: 1.45, depth: 9 });
  for (const side of [-1, 1]) waterfront.push({
    kind: 'boat', u: u + side * 1.9, v: v - 1, width: 1.65, depth: 4.4 + .45 * index, side
  });
}
waterfront.push({ kind: 'pier', u: -24, v: -8.8, width: 1.5, depth: 18.5 },
  { kind: 'boat', rig: 'queche', u: -20.7, v: -15.4, width: 4.6, depth: 12.5, side: 1 });
export default defineMap({
  id: 'lochMorag', name: 'Loch Morag', size: { w: 360, d: 280 },
  shoreDist, shorePoint, shoreSpeed,
  ports: [{ village: 'portDun', waterfront, a: -.55, shore: shorePoint(-.55) }, { village: 'glenmore', a: 2.9, shore: shorePoint(2.9), custom: true }],
  // El Paso de las Piedras: salida al Estrecho de Kyle. Exige el Casco Reforzado (Parche v1.1, 3).
  exits: [{ id: 'pasoPiedras', name: 'El Paso de las Piedras', a: PASO, shore: shorePoint(PASO), requires: 'reinforced_hull', to: 'kyle', spawn: 'desdeMorag', stones: true, closesAct: 1 }],
  spawns: {
    inicio: { x: start[0], z: start[1], heading: Math.PI * .75 },
    desdeKyle: { x: back[0], z: back[1], heading: inward(PASO) }
  }
});
