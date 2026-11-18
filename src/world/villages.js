import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { hash } from '../maps/shared.js';
import { flat } from './helpers.js';
// Casas y muelle de cada villa del mapa. Provisionales: se reemplazan por modelos de Blender.
// Las ventanas se encienden con la noche (ctx.night).
const glass = new THREE.MeshBasicMaterial({ color: '#8a97a8' }), DAY = new THREE.Color('#8a97a8'), LIT = new THREE.Color('#ffcf70');
export default {
  id: 'villages', label: 'Villas y muelles',
  build(ctx) {
    const { ports: PORTS, height, shoreDist } = mapOf(ctx.state);
    // Punto del pueblo: tantos metros a lo largo de la orilla y tantos tierra adentro, corrigiendo la curva de la costa.
    const spot = (port, along, d) => { let x = port.shore[0] + port.t[0] * along + port.n[0] * d, z = port.shore[1] + port.t[1] * along + port.n[1] * d;
      for (let k = 0; k < 3; k++) { const err = d - shoreDist(x, z); x += port.n[0] * err; z += port.n[1] * err; } return [x, z]; };
    const g = new THREE.Group();
    const roofShape = new THREE.Shape([new THREE.Vector2(-1.9, 0), new THREE.Vector2(1.9, 0), new THREE.Vector2(0, 1.6)]);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 3, bevelEnabled: false }).translate(0, 0, -1.5);
    const wallGeo = new THREE.BoxGeometry(3.3, 2.2, 2.5), winGeo = new THREE.BoxGeometry(.7, .6, .08);
    const walls = flat({ color: '#eadfc2' }), roofs = [flat({ color: '#8a4a3a' }), flat({ color: '#4f5a70' }), flat({ color: '#b9893f' })];
    const wood = flat({ color: '#a5733f' }), dark = flat({ color: '#5e4127' });
    PORTS.forEach((port, pi) => {
      if (!port.custom) [[-20, 13], [-11, 9], [-2, 15], [9, 9.5], [18, 14], [3, 22], [-17, 22]].forEach(([along, d], i) => {
        const [x, z] = spot(port, along, d), h = new THREE.Group();
        const w = new THREE.Mesh(wallGeo, walls); w.position.y = 1.1;
        const r = new THREE.Mesh(roofGeo, roofs[(i + pi) % 3]); r.position.y = 2.2;
        h.add(w, r);
        [[-.9, 1.27], [.9, 1.27], [-.9, -1.27], [.9, -1.27]].forEach(([wx, wz]) => { const win = new THREE.Mesh(winGeo, glass); win.position.set(wx, 1.25, wz); h.add(win); }); h.position.set(x, height(x, z) - .1, z); h.rotation.y = (hash(i, 3 + pi) - .5) * 1.2;
        g.add(h);
      });
      const [ax, az] = [port.shore[0] + port.n[0] * 2, port.shore[1] + port.n[1] * 2], [bx, bz] = [port.shore[0] - port.n[0] * 11, port.shore[1] - port.n[1] * 11];
      const len = Math.hypot(bx - ax, bz - az), ang = -Math.atan2(bz - az, bx - ax);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(len, .25, 1.8), wood);
      deck.position.set((ax + bx) / 2, .6, (az + bz) / 2); deck.rotation.y = ang; g.add(deck);
      for (let t = .15; t <= 1; t += .28) [-1, 1].forEach(s => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 3, 6), dark);
        p.position.set(ax + (bx - ax) * t - Math.sin(-ang) * s * .9, -.4, az + (bz - az) * t + Math.cos(-ang) * s * .9); g.add(p);
      });
    });
    g.traverse(o => { if (o.isMesh && o.material !== glass) o.castShadow = o.receiveShadow = true; });
    ctx.world.add(g);
  },
  update(ctx) { glass.color.lerpColors(DAY, LIT, Math.min(1, ctx.night * 1.4)); }
};
