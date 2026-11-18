import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { flat, instanced, seeded } from './helpers.js';
// Acantilado de columnas de basalto a lo largo de toda orilla (lago, canal o isla). Se interrumpe en los puertos.
export default {
  id: 'cliffs', label: 'Acantilados',
  build(ctx) {
    const { height, portFactor, beachWidth, shoreSamples } = mapOf(ctx.state);
    const rnd = seeded(11), items = [], tones = ['#3a4761', '#455371', '#2f3b53', '#536180'];
    for (const p of shoreSamples()) {
      const t = [-p.n[1], p.n[0]], bw = beachWidth(p.x, p.z);
      const at = (along, d) => [p.x + t[0] * along + p.n[0] * d, p.z + t[1] * along + p.n[1] * d];
      [[.8, .5, .45], [2.6, .78, .25], [4.3, .98, .1]].forEach(([off, base, vary], row) => {
        const along = (rnd() - .5) * 1.2 + row * .8, [x, z] = at(along, bw + off + rnd() * .8);
        if (portFactor(x, z) < .8 || height(x, z) < 0) return;
        const [tx, tz] = at(along, bw + 7);
        const top = Math.max(1.5, height(tx, tz) * (base + rnd() * vary)), bottom = -1.5, r = 1.5 + rnd() * .8;
        items.push({ x, z, y: (top + bottom) / 2, sx: r, sy: top - bottom, sz: r, rot: rnd() * 3, color: tones[Math.floor(rnd() * tones.length)] });
      });
    }
    ctx.world.add(instanced(new THREE.CylinderGeometry(1, 1, 1, 6), flat(), items));
  }
};
