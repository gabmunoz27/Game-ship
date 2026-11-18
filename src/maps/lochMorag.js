// Mapa 1: Loch Morag. Matemática pura (sin Three.js): de esta función de altura salen
// el terreno, el agua y también la navegación, así que lo que se ve y lo que se juega coinciden.
export const NAME = 'Loch Morag';
export const SIZE = { w: 360, d: 280 };
const RX = 88, RZ = 25; // lago largo y angosto

export const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => noise(x, y) * .6 + noise(x * 2.1, y * 2.1) * .3 + noise(x * 4.3, y * 4.3) * .1;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const bnd = a => 1 + .14 * Math.sin(3 * a + 1) + .08 * Math.sin(5 * a + 2.3) + .04 * Math.sin(8 * a + .7);
const field = (x, z) => { const dx = x / RX, dz = z / RZ; return Math.hypot(dx, dz) / bnd(Math.atan2(dz, dx)) - 1; };
const grad = (x, z) => { const e = .5; return [(field(x + e, z) - field(x - e, z)) / (2 * e), (field(x, z + e) - field(x, z - e)) / (2 * e)]; };

/** Distancia a la orilla: negativa dentro del lago, positiva en tierra. */
export function shoreDist(x, z) {
  const [gx, gz] = grad(x, z);
  return field(x, z) / Math.max(.004, Math.hypot(gx, gz));
}
/** Punto a distancia d de la orilla (hacia tierra si d > 0) en el ángulo a. */
export function shorePoint(a, d = 0) {
  const x = RX * bnd(a) * Math.cos(a), z = RZ * bnd(a) * Math.sin(a);
  const [gx, gz] = grad(x, z), g = Math.hypot(gx, gz) || 1;
  return [x + gx / g * d, z + gz / g * d];
}
/** Cuánto avanza la orilla al variar el ángulo; sirve para repartir cosas a distancia pareja. */
export const shoreSpeed = a => Math.hypot(RX * Math.sin(a), RZ * Math.cos(a)) * bnd(a);

/** Dónde está cada villa en la orilla. `land` es el centro del pueblo y `dock` la punta del muelle, ya en el agua. */
export const PORTS = [{ village: 'portDun', a: -.55 }, { village: 'glenmore', a: 2.9 }]
  .map(p => ({ ...p, land: shorePoint(p.a, 6), dock: shorePoint(p.a, -13) }));
export const portOf = id => PORTS.find(p => p.village === id);
/** 0 en un puerto (terreno bajo, sin acantilado), 1 lejos de todos. */
export const portFactor = (x, z) => Math.min(...PORTS.map(p => smooth(16, 34, Math.hypot(x - p.land[0], z - p.land[1]))));
export const beachWidth = (x, z) => 3 + 2.5 * noise(x * .05 + 7, z * .05 + 3);

export function height(x, z) {
  const d = shoreDist(x, z);
  if (d < 0) {
    const bumps = (noise(x * .3, z * .3) - .5) * .6 * Math.min(1, -d / 6);
    return Math.min(-.03, Math.max(-6.5, d * .32) + bumps);
  }
  const beach = .25 + d * .07;
  const plateau = 7 + 5 * fbm(x * .035, z * .035) + Math.min(d, 60) * .03;
  const low = 1 + d * .06 + fbm(x * .08, z * .08) * .8;
  const land = low + (plateau - low) * portFactor(x, z);
  const bw = beachWidth(x, z);
  return beach + (land - beach) * smooth(bw, bw + 2.2, d);
}
export const navigable = (x, z) => height(x, z) < -.9;

const s = shorePoint(PORTS[0].a, -17);
export const START = { x: s[0], z: s[1], heading: Math.PI * .75 };

/** Salida del mapa: El Paso de las Piedras, en la orilla sur. Exige el Casco Reforzado. */
const e = shorePoint(1.35, -8);
export const EXIT = { id: 'pasoPiedras', name: 'El Paso de las Piedras', a: 1.35, x: e[0], z: e[1], radius: 8, requires: 'reinforced_hull' };
