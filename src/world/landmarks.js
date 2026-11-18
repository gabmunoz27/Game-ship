import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { flat, instanced, seeded } from './helpers.js';
// Piedras altas a ambos lados de cada salida del mapa (el Paso de las Piedras), para que se vea por dónde se sale.
export default {
  id: 'landmarks', label: 'Piedras de las salidas',
  build(ctx) {
    const rnd = seeded(71), items = [], tones = ['#9aa3ad', '#7f8a96', '#b4b9bd'];
    for (const e of mapOf(ctx.state).exits) if (e.stones) [-11, 11].forEach(side => { for (let i = 0; i < 6; i++) {
      const along = side + (rnd() - .5) * 4, d = -3 - rnd() * 9;
      const x = e.shore[0] + e.t[0] * along + e.n[0] * d, z = e.shore[1] + e.t[1] * along + e.n[1] * d;
      const h = 4 + rnd() * 5, r = .9 + rnd() * .7;
      items.push({ x, z, y: h / 2 - 2, sx: r, sy: h, sz: r, rot: rnd() * 3, color: tones[Math.floor(rnd() * tones.length)] });
    } });
    if (!items.length) return;
    ctx.world.add(instanced(new THREE.CylinderGeometry(.7, 1, 1, 5), flat(), items));
  }
};
