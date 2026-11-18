import * as THREE from 'three';
import { plotCourse } from '../sim/navigation.js';
import { emit } from '../core/events.js';
// Traduce un clic en la pantalla a un punto del agua y pide el rumbo a la simulación.
const REASONS = { 'sin-agua': 'Ahí no hay agua navegable', 'sin-ruta': 'No hay paso por agua hasta ahí' };
export default {
  id: 'input', label: 'Clic o arrastre para trazar rumbo',
  init(ctx) {
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
    // Un clic traza el rumbo; si mantienes pulsado y arrastras, el barco sigue al dedo.
    let started = false;
    const aim = (e, quiet) => {
      const r = ctx.canvas.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, ctx.camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      const res = plotCourse(ctx.state, hit.x, hit.z, started);
      if (res.ok) started = true;
      if (!quiet && !res.ok && REASONS[res.reason]) emit('notice', { text: REASONS[res.reason] });
    };
    let held = false, last = 0;
    ctx.canvas.addEventListener('pointerdown', e => { if (!e.isPrimary) return; started = false; held = true; aim(e, false); });
    ctx.canvas.addEventListener('pointermove', e => { if (held && e.isPrimary && e.timeStamp - last > 90) { last = e.timeStamp; aim(e, true); } });
    addEventListener('pointerup', e => { if (e.isPrimary) held = false; });
    addEventListener('pointercancel', e => { if (e.isPrimary) held = false; });
  }
};
