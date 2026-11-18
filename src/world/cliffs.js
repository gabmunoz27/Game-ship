import * as THREE from 'three';
import { height, shorePoint, shoreSpeed, portFactor, beachWidth } from '../maps/current.js';
import { flat, instanced, seeded } from './helpers.js';
// Acantilado de columnas de basalto alrededor del lago. Se interrumpe en los puertos.
export default {
  id: 'cliffs', label: 'Acantilados',
  init(ctx) {
    const rnd = seeded(11), items = [], tones = ['#3a4761', '#455371', '#2f3b53', '#536180'];
    for (let a = 0; a < Math.PI * 2; a += 2.5 / shoreSpeed(a)) {
      [[.8, .5, .45], [2.6, .78, .25], [4.3, .98, .1]].forEach(([off, base, vary], row) => {
        const aa = a + ((rnd() - .5) * 1.2 + row * .8) / shoreSpeed(a);
        const [sx, sz] = shorePoint(aa, 0), bw = beachWidth(sx, sz);
        const [x, z] = shorePoint(aa, bw + off + rnd() * .8);
        if (portFactor(x, z) < .8) return;
        const [tx, tz] = shorePoint(aa, bw + 7);
        const top = height(tx, tz) * (base + rnd() * vary), bottom = -1.5, r = 1.5 + rnd() * .8;
        items.push({ x, z, y: (top + bottom) / 2, sx: r, sy: top - bottom, sz: r, rot: rnd() * 3, color: tones[Math.floor(rnd() * tones.length)] });
      });
    }
    ctx.scene.add(instanced(new THREE.CylinderGeometry(1, 1, 1, 6), flat(), items));
  }
};
