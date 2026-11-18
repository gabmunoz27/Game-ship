// Navegación: el jugador traza un rumbo recto sobre el agua y el barco lo sigue.
import { navigable, PORTS } from '../maps/current.js';
import { emit } from '../core/events.js';

const MAX_SPEED = 9, DOCK_RADIUS = 9;
const norm = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export function plotCourse(state, x, z) {
  const b = state.boat;
  if (state.docked) return { ok: false, reason: 'atracado' };
  if (!navigable(x, z)) return { ok: false, reason: 'sin-agua' };
  for (let t = 0; t <= 1; t += .02) if (!navigable(b.x + (x - b.x) * t, b.z + (z - b.z) * t)) return { ok: false, reason: 'cruza-tierra' };
  b.course = { x, z }; emit('course:set', b.course);
  return { ok: true };
}
export function cancelCourse(state) { state.boat.course = null; emit('course:cleared'); }

export function step(state, dt) {
  const b = state.boat; b.turn = 0;
  if (b.course) {
    const dx = b.course.x - b.x, dz = b.course.z - b.z, dist = Math.hypot(dx, dz);
    if (dist < 1.2) cancelCourse(state);
    else {
      b.turn = Math.max(-1, Math.min(1, norm(Math.atan2(dz, dx) - b.heading) * 2.5));
      b.heading = norm(b.heading + b.turn * 1.6 * dt);
      const want = Math.min(MAX_SPEED, 2 + dist * 1.2) * (1 - Math.abs(b.turn) * .5);
      b.speed += (want - b.speed) * Math.min(1, dt * 1.5);
    }
  }
  if (!b.course) b.speed *= Math.max(0, 1 - dt * 1.6);
  const nx = b.x + Math.cos(b.heading) * b.speed * dt, nz = b.z + Math.sin(b.heading) * b.speed * dt;
  if (navigable(nx, nz)) { b.x = nx; b.z = nz; } else b.speed = 0;

  const near = PORTS.find(p => Math.hypot(p.dock[0] - b.x, p.dock[1] - b.z) < DOCK_RADIUS);
  const id = near ? near.village : null;
  if (id !== state.nearPort) { state.nearPort = id; emit('port:near', { villageId: id }); }
}
