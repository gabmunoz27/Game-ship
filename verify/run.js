// Las puertas: comprueba las reglas del juego sin abrir el navegador.  →  npm run verify
// Cada módulo de src/sim, src/core, src/data y src/maps tiene aquí sus comprobaciones.
import { suites } from './suites.js';
let failed = 0;
for (const [name, checks] of Object.entries(suites)) {
  const errors = [];
  for (const [what, fn] of checks) { try { if (fn() === false) throw new Error('resultado inesperado'); } catch (e) { errors.push(`     ${what}: ${e.message}`); } }
  console.log(`${errors.length ? '✗' : '✓'} ${name}  (${checks.length - errors.length}/${checks.length})`);
  if (errors.length) { failed++; console.log(errors.join('\n')); }
}
console.log(failed ? `\n${failed} módulo(s) con fallos.` : '\nTodo en orden.');
process.exit(failed ? 1 : 0);
