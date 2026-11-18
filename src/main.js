// Punto de entrada. Aquí solo se conectan los módulos: ninguna regla del juego vive en este archivo.
// Para apagar un módulo mientras se arregla, comenta su línea en la lista.
import { createState } from './core/state.js';
import { register, initAll, updateAll } from './core/systems.js';
import { step } from './sim/navigation.js';
import * as acts from './sim/acts.js';
import scene from './world/scene.js';
import terrain from './world/terrain.js';
import cliffs from './world/cliffs.js';
import rocks from './world/rocks.js';
import pines from './world/pines.js';
import villages from './world/villages.js';
import daylight from './world/daylight.js';
import water from './world/water.js';
import landmarks from './world/landmarks.js';
import boat from './world/boat.js';
import courseMarker from './world/courseMarker.js';
import input from './world/input.js';
import uiRoot from './ui/root.js';
import hud from './ui/hud.js';
import notices from './ui/notices.js';
import dockPanel from './ui/dockPanel.js';
import actEnd from './ui/actEnd.js';
import moduleStatus from './ui/moduleStatus.js';

const navigation = { id: 'navigation', label: 'Navegación', update: (ctx, dt) => step(ctx.state, dt) };
const actsSys = { id: 'acts', label: 'Actos y salida del mapa', update: ctx => acts.update(ctx.state) };

[scene, daylight, navigation, actsSys, terrain, cliffs, rocks, pines, villages, landmarks, water, boat, courseMarker, input,
  uiRoot, hud, notices, dockPanel, actEnd, moduleStatus].forEach(register);

const state = createState();
// ?franja=0|1|2 abre la partida en Mañana, Tarde o Noche: sirve para probar la luz sin esperar.
const franja = new URLSearchParams(location.search).get('franja');
if (franja !== null && [0, 1, 2].includes(+franja)) state.slot = +franja;

const ctx = { state, canvas: document.getElementById('c'), time: 0 };
initAll(ctx);

let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; ctx.time += dt;
  updateAll(ctx, dt);
  if (ctx.renderer) scene.render(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
