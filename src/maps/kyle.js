// Mapa 2: el Estrecho de Kyle. Un canal largo entre paredes de roca, con islas en medio.
// Achnacarn (herreros y mina de cobre) en la orilla norte; Strathlinn (cebada, lana y cuerda) en la ladera sur.
import { defineMap } from './shared.js';

const L = 158;                                                         // el canal va de x = −158 a x = 158
const mid = x => 16 * Math.sin(x * .021 + .4) + 6 * Math.sin(x * .053 + 2);   // línea central, serpentea
const slope = x => 16 * .021 * Math.cos(x * .021 + .4) + 6 * .053 * Math.cos(x * .053 + 2);
const half = x => 30 + 6 * Math.sin(x * .031 + 1.2) + 3 * Math.sin(x * .09);   // medio ancho
const ISLANDS = [[-78, 3, 9, .4], [-12, -4, 11.5, 1.7], [52, 6, 8, 2.9], [112, -3, 6.5, 4.1]]   // [x, desvío, radio, fase]
  .map(([x, off, r, ph]) => ({ x, z: mid(x) + off, r, ph }));

function shoreDist(x, z) {
  // Fuera del canal = tierra. Los extremos se cierran en media luna para que no queden esquinas rectas.
  const R = half(Math.sign(x) * (L - 30)), cut = Math.abs(x) - (L - R), across = Math.abs(z - mid(x)) / Math.hypot(1, slope(x));
  let d = cut > 0 ? Math.hypot(cut, across) - R : across - half(x);
  for (const i of ISLANDS) {
    const dx = x - i.x, dz = z - i.z, a = Math.atan2(dz, dx);
    const r = i.r * (1 + .16 * Math.sin(3 * a + i.ph) + .08 * Math.sin(5 * a + i.ph * 2)) * (1 + .35 * Math.abs(Math.cos(a)));   // islas alargadas
    d = Math.max(d, r - Math.hypot(dx, dz));
  }
  return d;
}

/** Punto de la orilla en x, del lado norte (−1) o sur (+1) del canal. */
function shoreAt(x, side) {
  let a = mid(x), b = mid(x) + side * 60;                        // a en el agua, b en tierra
  for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (shoreDist(x, m) < 0) a = m; else b = m; }
  return [x, (a + b) / 2];
}

export default defineMap({
  id: 'kyle', name: 'Estrecho de Kyle', size: { w: 420, d: 240 },
  shoreDist, islands: ISLANDS,
  ports: [{ village: 'achnacarn', shore: shoreAt(-104, -1), custom: true, depth: 12, camShift: .75 }, { village: 'strathlinn', shore: shoreAt(84, 1), custom: true, depth: 11 }],
  // Clima del Estrecho: más lluvia y niebla que en el lago, y a veces viento en contra.
  weather: { despejado: .35, nublado: .25, lluvia: .22, niebla: .1, 'viento-en-contra': .08 },
  // El mismo Paso de las Piedras, visto desde este lado: vuelve a Loch Morag.
  exits: [{ id: 'vueltaMorag', name: 'El Paso de las Piedras', shore: [-L, mid(-L)], normal: [-1, 0], to: 'lochMorag', spawn: 'desdeKyle', stones: true }],
  spawns: { desdeMorag: { x: -L + 30, z: mid(-L + 30), heading: Math.atan2(slope(-L + 30), 1) } }
});
