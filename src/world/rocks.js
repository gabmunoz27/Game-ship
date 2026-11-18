import * as THREE from 'three';
import { height, shoreDist, portFactor } from '../maps/current.js';
import { flat, instanced, seeded } from './helpers.js';
// Rocas sueltas en la orilla y bajo el agua poco profunda.
export default {
  id: 'rocks', label: 'Rocas',
  init(ctx) {
    const rnd = seeded(23), items = [], tones = ['#8b8f96', '#6f7f8f', '#b9a887', '#5b6b80', '#a3a9ad', '#7a8f8a'];
    for (let n = 0; n < 20000 && items.length < 320; n++) {
      const x = (rnd() - .5) * 240, z = (rnd() - .5) * 90, d = shoreDist(x, z);
      if (d < -10 || d > 2.5 || portFactor(x, z) < .3) continue;
      const s = .5 + rnd() * rnd() * 1.9;
      items.push({ x, z, y: height(x, z) + s * .12, sx: s, sy: s * .55, sz: s * (.7 + rnd() * .5), rot: rnd() * 6, color: tones[Math.floor(rnd() * tones.length)] });
    }
    ctx.scene.add(instanced(new THREE.DodecahedronGeometry(1, 0), flat(), items));
  }
};
