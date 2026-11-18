import * as THREE from 'three';
import { phaseOf, blend } from '../sim/time.js';
// Ciclo de luz del día. Lee la franja (Mañana, Tarde, Noche) y mueve el sol, cambia los colores y avisa a los demás
// cuánto de noche es (ctx.night, de 0 a 1). Al cambiar de franja la luz se desliza en un par de segundos.
const KEYS = [
  { sun: '#fff0cf', sunI: 3.1, dir: [70, 50, -42],  sky: '#bcd4ff', ground: '#4a5a3a', hemiI: 1.5,  bg: '#22382c', night: 0 }, // Mañana
  { sun: '#ffc27a', sunI: 3.3, dir: [-72, 34, -26], sky: '#e6d0ae', ground: '#5a5a38', hemiI: 1.35, bg: '#2c3a28', night: 0 }, // Tarde
  { sun: '#8fa8ff', sunI: .95,  dir: [-26, 58, 44],  sky: '#4a63b8', ground: '#1c2a3a', hemiI: .95,  bg: '#0a1018', night: 1 }  // Noche
];
const SPEED = .5; // franjas por segundo
const ca = new THREE.Color(), cb = new THREE.Color(), va = new THREE.Vector3(), vb = new THREE.Vector3();
let phase = null;
const mix = (a, b, t) => a + (b - a) * t;
const color = (target, key, t) => target.copy(ca.set(KEYS[key.from][key.name])).lerp(cb.set(KEYS[key.to][key.name]), t);

export default {
  id: 'daylight', label: 'Luz del día y la noche',
  update(ctx, dt) {
    const goal = phaseOf(ctx.state);
    if (phase === null) phase = goal;                       // al abrir la partida no hay transición
    const d = goal - phase; phase += Math.sign(d) * Math.min(Math.abs(d), SPEED * dt);
    const { from, to, t: raw } = blend(phase), t = raw * raw * (3 - 2 * raw);
    const A = KEYS[from], B = KEYS[to], { sun, hemi } = ctx.lights;
    sun.color.copy(ca.set(A.sun)).lerp(cb.set(B.sun), t); sun.intensity = mix(A.sunI, B.sunI, t);
    hemi.color.copy(ca.set(A.sky)).lerp(cb.set(B.sky), t); hemi.groundColor.copy(ca.set(A.ground)).lerp(cb.set(B.ground), t); hemi.intensity = mix(A.hemiI, B.hemiI, t);
    ctx.scene.background.copy(ca.set(A.bg)).lerp(cb.set(B.bg), t);
    ctx.sunDir.copy(va.set(...A.dir).normalize()).lerp(vb.set(...B.dir).normalize(), t).normalize();
    ctx.night = mix(A.night, B.night, t);
  }
};
