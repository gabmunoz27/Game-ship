// Bus de eventos: los módulos se avisan entre sí sin conocerse.
// Si un oyente falla, se registra el error y los demás siguen recibiendo el evento.
const handlers = new Map();

export function on(type, fn) {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type).add(fn);
  return () => handlers.get(type).delete(fn);
}
export function emit(type, payload) {
  for (const fn of handlers.get(type) || []) {
    try { fn(payload); } catch (err) { console.error(`[eventos] fallo un oyente de "${type}"`, err); }
  }
}
export function clear() { handlers.clear(); }
