// Registro de módulos. Cada módulo arranca y se actualiza aislado:
// si uno falla se apaga solo, queda marcado con ✗ y el resto del juego sigue corriendo.
import { emit } from './events.js';

const systems = [];

export function register(sys) { systems.push({ sys, ok: true, error: null }); }

function guard(entry, phase, fn) {
  if (!entry.ok) return;
  try { fn(); } catch (err) {
    entry.ok = false; entry.error = `${phase}: ${err.message}`;
    console.error(`[módulo ${entry.sys.id}] falló en ${phase}`, err);
    emit('system:failed', { id: entry.sys.id, label: entry.sys.label, error: entry.error });
  }
}
export function initAll(ctx) { for (const e of systems) guard(e, 'init', () => e.sys.init && e.sys.init(ctx)); }
export function updateAll(ctx, dt) { for (const e of systems) guard(e, 'update', () => e.sys.update && e.sys.update(ctx, dt)); }
export function status() { return systems.map(e => ({ id: e.sys.id, label: e.sys.label, ok: e.ok, error: e.error })); }
