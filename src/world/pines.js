import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SIZE, height, shoreDist, portFactor, beachWidth, noise } from '../maps/current.js';
import { flat, instanced, seeded } from './helpers.js';
// Bosque de pinos low-poly. Un solo modelo repetido con tamaño y tono distintos.
export default {
  id: 'pines', label: 'Pinos',
  init(ctx) {
    const C = new THREE.Color();
    const paint = (g, hex) => { C.set(hex); const n = g.attributes.position.count, arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) arr.set([C.r, C.g, C.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(arr, 3)); return g; };
    const cone = (r, h, y) => paint(new THREE.ConeGeometry(r, h, 7).translate(0, y, 0), '#ffffff');
    const geo = mergeGeometries([paint(new THREE.CylinderGeometry(.18, .26, 1.3, 5).translate(0, .65, 0), '#8a6a4a'), cone(1.55, 2.6, 2.3), cone(1.2, 2.3, 3.6), cone(.82, 2.1, 4.9)]);
    const rnd = seeded(37), items = [], tones = ['#2f5a36', '#3c6b3a', '#27503a', '#4d7a3a', '#2a4f33', '#6b8a34'];
    for (let n = 0; n < 14000 && items.length < 1700; n++) {
      const x = (rnd() - .5) * (SIZE.w - 6), z = (rnd() - .5) * (SIZE.d - 6), d = shoreDist(x, z);
      if (d < beachWidth(x, z) + 6 || portFactor(x, z) < .7 || noise(x * .045 + 20, z * .045) < .27) continue;
      const s = .95 + rnd() * .8;
      items.push({ x, z, y: height(x, z) - .2, sx: s, sy: s * (.9 + rnd() * .35), sz: s, rot: rnd() * 6, color: tones[Math.floor(rnd() * tones.length)] });
    }
    ctx.scene.add(instanced(geo, flat({ vertexColors: true }), items));
  }
};
