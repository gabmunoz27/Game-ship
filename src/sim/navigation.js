// Navegación: el jugador marca un destino y el barco lo sigue, rodeando la tierra si hace falta.
import { mapOf } from '../maps/index.js';
import { VILLAGES } from '../data/villages.js';
import { findPath, clearLine } from './pathfind.js';
import { emit } from '../core/events.js';

const MAX_SPEED = 9, DOCK_RADIUS = 9, TURN_RATE = 1.9, TURN_EASE = 5, WAYPOINT = 4.5;
const norm = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

/** Traza el rumbo. course = { x, z, path: [[x,z], ...] }; path termina en el destino. */
export function plotCourse(state, x, z, updating = false) {
  const b = state.boat, map = mapOf(state);
  if (state.docked) return { ok: false, reason: 'atracado' };
  if (!map.navigable(x, z)) return { ok: false, reason: 'sin-agua' };
  const path = findPath(map, [b.x, b.z], [x, z]);
  if (!path) return { ok: false, reason: 'sin-ruta' };
  const end = path[path.length - 1];
  b.course = { x: end[0], z: end[1], path }; emit(updating ? 'course:updated' : 'course:set', b.course);
  return { ok: true, path };
}
export function cancelCourse(state) { state.boat.course = null; emit('course:cleared'); }

export function step(state, dt) {
  const b = state.boat, map = mapOf(state); let wantTurn = 0;
  if (b.course) {
    const path = b.course.path || [[b.course.x, b.course.z]];
    // Los puntos intermedios se dan por pasados un poco antes, así el barco enlaza curvas en vez de frenar.
    while (path.length > 1 && Math.hypot(path[0][0] - b.x, path[0][1] - b.z) < WAYPOINT && clearLine(map, b.x, b.z, ...path[1])) path.shift();
    const [tx, tz] = path[0], dx = tx - b.x, dz = tz - b.z, dist = Math.hypot(dx, dz);
    const left = dist + path.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);
    if (path.length === 1 && dist < 1.2) cancelCourse(state);
    else {
      wantTurn = Math.max(-1, Math.min(1, norm(Math.atan2(dz, dx) - b.heading) * 2.2));
      const want = Math.min(MAX_SPEED, 2 + left * 1.1) * (1 - Math.abs(b.turn || 0) * .42);
      b.speed += (want - b.speed) * Math.min(1, dt * 1.3);   // acelera y frena con inercia
    }
  }
  // El timón no salta: el giro se acerca poco a poco al que hace falta, y por eso el barco dibuja curvas.
  b.turn = (b.turn || 0) + (wantTurn - (b.turn || 0)) * Math.min(1, dt * TURN_EASE);
  if (Math.abs(b.turn) < .001) b.turn = 0;
  b.heading = norm(b.heading + b.turn * TURN_RATE * dt);
  if (!b.course) b.speed *= Math.max(0, 1 - dt * 1.1);       // sin rumbo, se desliza hasta parar
  const nx = b.x + Math.cos(b.heading) * b.speed * dt, nz = b.z + Math.sin(b.heading) * b.speed * dt;
  const pier = map.blockingPier(b.x, b.z, nx, nz);
  if (pier) {
    // Conserva el avance paralelo al borde que todavía tenga agua libre.
    for (const axis of [pier.n, pier.t]) {
      const along = (nx - b.x) * axis[0] + (nz - b.z) * axis[1];
      const x = b.x + axis[0] * along, z = b.z + axis[1] * along;
      if (Math.abs(along) > 1e-8 && map.pierClear(b.x, b.z, x, z) && map.navigable(x, z)) {
        b.x = x; b.z = z; break;
      }
    }
    b.speed *= Math.exp(-2 * dt);
  } else if (map.navigable(nx, nz)) { b.x = nx; b.z = nz; }
  else b.speed *= .3;

  const near = map.ports.find(p => Math.hypot(p.dock[0] - b.x, p.dock[1] - b.z) < DOCK_RADIUS);
  const id = near ? near.village : null;
  if (id !== state.nearPort) { state.nearPort = id; emit('dock:near', { villageId: id }); }
  const village = map.ports.find(p => {
    const radius = VILLAGES[p.village].arrivalRadius + (state.nearVillage === p.village ? 4 : 0);
    return Math.hypot(b.x - p.dock[0], b.z - p.dock[1]) <= radius;
  })?.village ?? null;
  if (village !== state.nearVillage) { state.nearVillage = village; emit('port:near', { villageId: village }); }
}
