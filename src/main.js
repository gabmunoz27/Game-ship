// Punto de entrada. Aquí solo se conectan los módulos: ninguna regla del juego vive en este archivo.
// Para apagar un módulo mientras se arregla, comenta su línea en la lista.
import { createState } from './core/state.js';
import { mapOf, getMap } from './maps/index.js';
import { on, emit } from './core/events.js';
import { register, initAll, buildAll, clearWorld, updateAll } from './core/systems.js';
import { step } from './sim/navigation.js';
import * as acts from './sim/acts.js';
import scene from './world/scene.js';
import terrain from './world/terrain.js';
import cliffs from './world/cliffs.js';
import rocks from './world/rocks.js';
import pines from './world/pines.js';
import villages from './world/villages.js';
import daylight from './world/daylight.js';
import weather from './world/weather.js';
import water from './world/water.js';
import glenmore from './world/glenmore.js';
import achnacarn from './world/achnacarn.js';
import strathlinn from './world/strathlinn.js';
import landmarks from './world/landmarks.js';
import boat from './world/boat.js';
import courseMarker from './world/courseMarker.js';
import input from './world/input.js';
import uiRoot from './ui/root.js';
import cargoBar from './ui/cargoBar.js';
import coins from './ui/coins.js';
import weatherChip from './ui/weatherChip.js';
import sfx from './audio/sfx.js';
import music from './audio/music.js';
import soundButton from './ui/soundButton.js';
import pickups from './ui/pickups.js';
import villageLabel from './ui/villageLabel.js';
import notices from './ui/notices.js';
import dockPanel from './ui/dockPanel.js';
import actEnd from './ui/actEnd.js';
import exitPrompt from './ui/exitPrompt.js';
import mapTransition from './ui/mapTransition.js';
import devPanel from './ui/devPanel.js';
import moduleStatus from './ui/moduleStatus.js';

const navigation = { id: 'navigation', label: 'Navegación', update: (ctx, dt) => step(ctx.state, dt) };
const actsSys = { id: 'acts', label: 'Actos y salida del mapa', update: ctx => acts.update(ctx.state) };

[scene, daylight, weather, navigation, actsSys, terrain, cliffs, rocks, pines, villages, glenmore, achnacarn, strathlinn, landmarks, water, boat, courseMarker, input,
  uiRoot, cargoBar, coins, weatherChip, music, sfx, soundButton, pickups, villageLabel, notices, dockPanel, exitPrompt, actEnd, mapTransition, devPanel, moduleStatus].forEach(register);

const state = createState();
// ?franja=0|1|2 abre la partida en Mañana, Tarde o Noche: sirve para probar la luz sin esperar.
const franja = new URLSearchParams(location.search).get('franja');
if (franja !== null && [0, 1, 2].includes(+franja)) state.slot = +franja;
// ?mapa=kyle abre la partida en otro mapa (entrando por su primera llegada); ?villa=glenmore, frente a ese muelle.
const params = new URLSearchParams(location.search), mapa = getMap(params.get('mapa'));
if (mapa) { const sp = Object.values(mapa.spawns)[0]; state.map = mapa.id; Object.assign(state.boat, { x: sp.x, z: sp.z, heading: sp.heading }); }
// ?clima=lluvia (o niebla, nublado, viento-en-contra) abre con ese clima.
if (params.get('clima')) state.weather = params.get('clima');
const villa = mapOf(state).ports.find(p => p.village.toLowerCase() === params.get('villa')?.toLowerCase());
if (villa) { state.boat.x = villa.dock[0]; state.boat.z = villa.dock[1]; }

const ctx = { state, canvas: document.getElementById('c'), time: 0 };
// ?debug deja el juego a mano en la consola del navegador (window.game) para probar cosas.
if (params.has('debug')) window.game = { ctx, emit };
initAll(ctx);
buildAll(ctx);
// Al cruzar a otro mapa se desarma lo que se ve y se arma de nuevo con el mapa nuevo.
on('map:changed', () => { clearWorld(ctx); buildAll(ctx); ctx.snapCamera = true; if (ctx.renderer) ctx.renderer.compile(ctx.scene, ctx.camera); });

let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000) * (ctx.timeScale || 1); last = now; ctx.time += dt;   // timeScale: acelerar el juego desde la vista de desarrollador
  updateAll(ctx, dt);
  if (ctx.renderer) scene.render(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
