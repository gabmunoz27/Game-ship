// Rutas que rodean la tierra. Pura (sin Three.js ni página): recibe un mapa y dos puntos y devuelve
// una lista de puntos de paso por agua navegable, o null si no hay manera de llegar.
// Cómo: una grilla de celdas de agua (con un margen para no rozar la orilla), A* sobre ella
// y al final se quitan los puntos que sobran tirando líneas rectas.
const CELL = 3, MARGIN = 1.6;
const grids = new Map();   // una grilla por mapa; se calcula la primera vez y se reutiliza

function gridOf(map) {
  if (grids.has(map.id)) return grids.get(map.id);
  const W = map.size.w, D = map.size.d, nx = Math.floor(W / CELL), nz = Math.floor(D / CELL);
  const ok = new Uint8Array(nx * nz), cx = i => -W / 2 + (i + .5) * CELL, cz = j => -D / 2 + (j + .5) * CELL;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = cx(i), z = cz(j);
    ok[j * nx + i] = map.navigable(x, z) && map.navigable(x + MARGIN, z) && map.navigable(x - MARGIN, z) && map.navigable(x, z + MARGIN) && map.navigable(x, z - MARGIN) ? 1 : 0;
  }
  const g = { nx, nz, ok, cx, cz, cell: (x, z) => [Math.floor((x + W / 2) / CELL), Math.floor((z + D / 2) / CELL)] };
  grids.set(map.id, g); return g;
}

/** ¿Se puede ir en línea recta sin tocar tierra? (la misma prueba que usaba el rumbo recto) */
export function clearLine(map, ax, az, bx, bz) {
  const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / .8));
  for (let k = 0; k <= n; k++) { const t = k / n; if (!map.navigable(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
  return true;
}

/** Celda de agua más cercana a un punto (por si el punto queda en el margen de la orilla). */
function nearestOpen(g, i, j) {
  for (let r = 0; r < 6; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
    const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < g.nx && b < g.nz && g.ok[b * g.nx + a]) return [a, b];
  }
  return null;
}

/** Devuelve [[x,z], ...] terminando en el destino, o null. Si la línea recta sirve, es un solo punto. */
export function findPath(map, from, to) {
  if (clearLine(map, from[0], from[1], to[0], to[1])) return [[to[0], to[1]]];
  const g = gridOf(map), s = nearestOpen(g, ...g.cell(...from)), e = nearestOpen(g, ...g.cell(...to));
  if (!s || !e) return null;
  const N = g.nx * g.nz, si = s[1] * g.nx + s[0], ei = e[1] * g.nx + e[0];
  const cost = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const h = k => { const dx = Math.abs(k % g.nx - e[0]), dz = Math.abs(Math.floor(k / g.nx) - e[1]); return Math.max(dx, dz) + .414 * Math.min(dx, dz); };
  // Montículo binario sencillo para A*.
  const heap = [], f = new Float32Array(N);
  const push = k => { heap.push(k); let c = heap.length - 1; while (c) { const p = (c - 1) >> 1; if (f[heap[p]] <= f[k]) break; heap[c] = heap[p]; c = p; } heap[c] = k; };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { let c = 0; for (;;) { let m = 2 * c + 1; if (m >= heap.length) break; if (m + 1 < heap.length && f[heap[m + 1]] < f[heap[m]]) m++; if (f[heap[m]] >= f[last]) break; heap[c] = heap[m]; c = m; } heap[c] = last; } return top; };
  cost[si] = 0; f[si] = h(si); push(si);
  while (heap.length) {
    const k = pop(); if (closed[k]) continue; closed[k] = 1; if (k === ei) break;
    const i = k % g.nx, j = Math.floor(k / g.nx);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= g.nx || b >= g.nz) continue;
      const n = b * g.nx + a; if (!g.ok[n] || closed[n]) continue;
      if (di && dj && (!g.ok[j * g.nx + a] || !g.ok[b * g.nx + i])) continue;   // no cortar esquinas de tierra
      const c = cost[k] + (di && dj ? 1.414 : 1);
      if (c < cost[n]) { cost[n] = c; prev[n] = k; f[n] = c + h(n); push(n); }
    }
  }
  if (!closed[ei]) return null;
  const cells = []; for (let k = ei; k !== -1; k = prev[k]) cells.push([g.cx(k % g.nx), g.cz(Math.floor(k / g.nx))]);
  cells.reverse();
  const pts = [from, ...cells.slice(1, -1), [to[0], to[1]]];
  if (!clearLine(map, ...cells[cells.length - 1], to[0], to[1])) pts[pts.length - 1] = cells[cells.length - 1];
  // Suavizado: desde cada punto, salta al más lejano que se vea en línea recta.
  const out = []; let a = 0;
  while (a < pts.length - 1) { let b = pts.length - 1; while (b > a + 1 && !clearLine(map, ...pts[a], ...pts[b])) b--; out.push(pts[b]); a = b; }
  return out;
}
