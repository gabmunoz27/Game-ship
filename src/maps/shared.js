// Piezas comunes a todos los mapas. Matemática pura: ni Three.js ni la página.
export const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export const fbm = (x, y) => noise(x, y) * .6 + noise(x * 2.1, y * 2.1) * .3 + noise(x * 4.3, y * 4.3) * .1;
export const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Dirección hacia tierra (normal de la orilla) en un punto, a partir de la distancia a la orilla. */
export function inland(shoreDist, x, z) {
  const e = .5, gx = shoreDist(x + e, z) - shoreDist(x - e, z), gz = shoreDist(x, z + e) - shoreDist(x, z - e), g = Math.hypot(gx, gz) || 1;
  return [gx / g, gz / g];
}

export const PIER = { inland: 2, seaward: 11, halfWidth: .9, pileRadius: .16 };
const HULL_RADIUS = 4;

// Intersección continua del recorrido del centro del casco con el muelle en sus ejes locales.
function crossesPier(port, ax, az, bx, bz) {
  let enter = 0, leave = 1;
  const dx = ax - port.shore[0], dz = az - port.shore[1];
  const margin = HULL_RADIUS + PIER.pileRadius;
  for (const [axis, min, max] of [[port.n, -(port.seaward ?? PIER.seaward) - margin, (port.inland ?? PIER.inland) + margin],
    [port.t, -(port.halfWidth ?? PIER.halfWidth) - margin, (port.halfWidth ?? PIER.halfWidth) + margin]]) {
    const start = dx * axis[0] + dz * axis[1];
    const delta = (bx - ax) * axis[0] + (bz - az) * axis[1];
    if (Math.abs(delta) < 1e-9) {
      if (start < min || start > max) return false;
    } else {
      const t1 = (min - start) / delta, t2 = (max - start) / delta;
      enter = Math.max(enter, Math.min(t1, t2));
      leave = Math.min(leave, Math.max(t1, t2));
      if (enter > leave) return false;
    }
  }
  return true;
}

/**
 * Arma un mapa completo a partir de su forma. Cada mapa solo describe:
 *   id, name, size {w,d}, shoreDist(x,z) (negativa en el agua, positiva en tierra),
 *   ports  [{ village, shore:[x,z], custom? }]        → se calcula land (centro del pueblo) y dock (amarre lateral)
 *   exits  [{ id, name, shore:[x,z], normal?, radius, requires?, to, spawn, stones? }] → se calcula x,z (punto de salida)
 *   spawns { nombre: { x, z, heading } }               → dónde aparece el barco según por dónde entra
 * y todo lo demás (altura, agua navegable, playas, puertos llanos) sale de aquí, igual para todos.
 */
export function defineMap(def) {
  const { shoreDist } = def;
  const frame = (shore, normal) => { const n = normal || inland(shoreDist, shore[0], shore[1]); return { shore, n, t: [-n[1], n[0]] }; };
  const ports = (def.ports || []).map(p => { const f = frame(p.shore, p.normal);
    const c = p.depth || 6;   // depth: qué tan tierra adentro queda el corazón del pueblo (para la cámara y el rótulo)
    const tipDepth = PIER.seaward + PIER.pileRadius + HULL_RADIUS + .4;
    const tipWidth = PIER.halfWidth + PIER.pileRadius + HULL_RADIUS + .4;
    const tipCorners = [-1, 1].map(side => p.shore.map((v, i) => v - f.n[i] * tipDepth + side * f.t[i] * tipWidth));
    return { ...p, ...f, tipCorners, center: [p.shore[0] + f.n[0] * c, p.shore[1] + f.n[1] * c], land: [p.shore[0] + f.n[0] * 6, p.shore[1] + f.n[1] * 6], dock: [p.shore[0] - f.n[0] * 9 + f.t[0] * 7, p.shore[1] - f.n[1] * 9 + f.t[1] * 7] }; });
  const exits = (def.exits || []).map(e => { const f = frame(e.shore, e.normal);
    return { radius: 8, ...e, ...f, x: e.shore[0] - f.n[0] * 8, z: e.shore[1] - f.n[1] * 8 }; });
  const portFactor = (x, z) => ports.length ? Math.min(...ports.map(p => smooth(16, 34, Math.hypot(x - p.land[0], z - p.land[1])))) : 1;
  const beachWidth = (x, z) => 3 + 2.5 * noise(x * .05 + 7, z * .05 + 3);
  function height(x, z) {
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
  const obstacles = ports.flatMap(port => [port, ...(port.waterfront || []).map(piece => {
    const shore = port.shore.map((x, i) => x + port.t[i] * piece.u + port.n[i] * piece.v);
    const halfWidth = piece.width / 2, seaward = piece.depth / 2;
    const clearance = HULL_RADIUS + PIER.pileRadius + .4;
    const tipCorners = [-1, 1].map(sign => shore.map((x, i) =>
      x - port.n[i] * (seaward + clearance) + sign * port.t[i] * (halfWidth + clearance)));
    return { shore, n: port.n, t: port.t, halfWidth, seaward, inland: seaward, tipCorners };
  })]);
  const blockingPier = (ax, az, bx, bz) => obstacles.find(p => crossesPier(p, ax, az, bx, bz));
  const pierClear = (ax, az, bx, bz) => !blockingPier(ax, az, bx, bz);
  const navigable = (x, z) => Math.abs(x) < def.size.w / 2 && Math.abs(z) < def.size.d / 2 && height(x, z) < -.9 && pierClear(x, z, x, z);
  /** Puntos de la orilla cada ~2.5 unidades, con su dirección hacia tierra. Sirven para acantilados y rocas. */
  let shoreCache = null;
  function shoreSamples() {
    if (shoreCache) return shoreCache;
    const c = 2.5, out = [], W = def.size.w / 2, D = def.size.d / 2;
    for (let x = -W + c; x < W - c; x += c) for (let z = -D + c; z < D - c; z += c) {
      const a = shoreDist(x, z), b = shoreDist(x + c, z), d = shoreDist(x, z + c);
      const cross = (p, q, dx, dz) => { if ((p < 0) === (q < 0)) return; const k = p / (p - q), px = x + dx * k, pz = z + dz * k; out.push({ x: px, z: pz, n: inland(shoreDist, px, pz) }); };
      cross(a, b, c, 0); cross(a, d, 0, c);
    }
    return (shoreCache = out);
  }
  return {
    ...def, ports, exits, height, blockingPier, pierClear, navigable, portFactor, beachWidth, shoreSamples,
    portOf: id => ports.find(p => p.village === id),
    exitOf: id => exits.find(e => e.id === id),
    SIZE: def.size, NAME: def.name
  };
}
