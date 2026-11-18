import * as THREE from 'three';
import { plotCourse } from '../sim/navigation.js';
import { emit } from '../core/events.js';
// Traduce un clic en la pantalla a un punto del agua y pide el rumbo a la simulación.
const REASONS = { 'sin-agua': 'Ahí no hay agua navegable', 'cruza-tierra': 'El rumbo sale del agua' };
export default {
  id: 'input', label: 'Clic para trazar rumbo',
  init(ctx) {
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
    ctx.canvas.addEventListener('pointerdown', e => {
      const r = ctx.canvas.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, ctx.camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      const res = plotCourse(ctx.state, hit.x, hit.z);
      if (!res.ok && REASONS[res.reason]) emit('notice', { text: REASONS[res.reason] });
    });
  }
};
