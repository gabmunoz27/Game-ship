import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { flat, instanced, seeded } from './helpers.js';
// Rocas sueltas en la orilla y bajo el agua poco profunda.
export default {
  id: 'rocks', label: 'Rocas',
  build(ctx) {
    const { height, shoreDist, portFactor, SIZE } = mapOf(ctx.state);
    const rnd = seeded(23), items = [], tones = ['#8b8f96', '#6f7f8f', '#b9a887', '#5b6b80', '#a3a9ad', '#7a8f8a'];
    for (let n = 0; n < 40000 && items.length < 320; n++) {
      const x = (rnd() - .5) * (SIZE.w - 40), z = (rnd() - .5) * (SIZE.d - 40), d = shoreDist(x, z);
      if (d < -10 || d > 2.5 || portFactor(x, z) < .3) continue;
      const s = .5 + rnd() * rnd() * 1.9;
      items.push({ x, z, y: height(x, z) + s * .12, sx: s, sy: s * .55, sz: s * (.7 + rnd() * .5), rot: rnd() * 6, color: tones[Math.floor(rnd() * tones.length)] });
    }
    ctx.world.add(instanced(new THREE.DodecahedronGeometry(1, 0), flat(), items));
  }
};
