import * as THREE from 'three';
import { EXIT, shorePoint, shoreSpeed } from '../maps/current.js';
import { flat, instanced, seeded } from './helpers.js';
// El Paso de las Piedras: dos grupos de piedras altas en el agua que marcan la salida del lago.
export default {
  id: 'landmarks', label: 'Paso de las Piedras',
  init(ctx) {
    const rnd = seeded(71), items = [], tones = ['#9aa3ad', '#7f8a96', '#b4b9bd'];
    [-11, 11].forEach(side => { for (let i = 0; i < 6; i++) {
      const [x, z] = shorePoint(EXIT.a + (side + (rnd() - .5) * 4) / shoreSpeed(EXIT.a), -3 - rnd() * 9);
      const h = 4 + rnd() * 5, r = .9 + rnd() * .7;
      items.push({ x, z, y: h / 2 - 2, sx: r, sy: h, sz: r, rot: rnd() * 3, color: tones[Math.floor(rnd() * tones.length)] });
    } });
    ctx.scene.add(instanced(new THREE.CylinderGeometry(.7, 1, 1, 5), flat(), items));
  }
};
