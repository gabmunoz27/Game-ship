import * as THREE from 'three';
import { SIZE, height, shoreDist, noise, hash } from '../maps/current.js';
import { flat } from './helpers.js';
// Terreno facetado: cada triángulo recibe un color plano según su altura y su pendiente.
export default {
  id: 'terrain', label: 'Terreno',
  init(ctx) {
    const cell = 2.5, nx = SIZE.w / cell, nz = SIZE.d / cell;
    const pt = (i, j) => {
      const edge = i === 0 || j === 0 || i === nx || j === nz;
      const x = -SIZE.w / 2 + i * cell + (edge ? 0 : (hash(i, j) - .5) * 1.5);
      const z = -SIZE.d / 2 + j * cell + (edge ? 0 : (hash(j + 91, i) - .5) * 1.5);
      return [x, height(x, z), z];
    };
    const pos = [], col = [], C = new THREE.Color(), deep = new THREE.Color('#1f5266');
    const greens = ['#a9c23c', '#8fae35', '#74962f', '#c2c650', '#5f8430'], sands = ['#d2c08f', '#c2ad7c'], slates = ['#3c4962', '#465472', '#313d55'];
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    const tri = (p, q, r) => {
      a.set(...p); b.set(...q).sub(a); c.set(...r).sub(a);
      const ny = b.cross(c).normalize().y;
      const y = (p[1] + q[1] + r[1]) / 3, cx = (p[0] + q[0] + r[0]) / 3, cz = (p[2] + q[2] + r[2]) / 3;
      const k = hash(Math.round(cx * 3), Math.round(cz * 3));
      if (y < -.02) C.set('#cdb98a').lerp(deep, Math.min(1, -y / 4.5));
      else if (ny < .8 && y > 1) C.set(slates[Math.floor(k * 3)]);
      else if (y < 1.1 && shoreDist(cx, cz) < 9) C.set(sands[Math.floor(k * 2)]);
      else { const patch = noise(cx * .06, cz * .06); C.set(patch > .68 ? '#cdb96c' : greens[Math.floor(((patch * 2.2 + k * .8) % 1) * greens.length)]); }
      pos.push(...p, ...q, ...r);
      for (let n = 0; n < 3; n++) col.push(C.r, C.g, C.b);
    };
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const p00 = pt(i, j), p01 = pt(i, j + 1), p10 = pt(i + 1, j), p11 = pt(i + 1, j + 1);
      if (hash(i * 7, j * 13) > .5) { tri(p00, p01, p10); tri(p10, p01, p11); } else { tri(p00, p01, p11); tri(p00, p11, p10); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, flat({ vertexColors: true })); m.receiveShadow = m.castShadow = true;
    ctx.scene.add(m);
  }
};
