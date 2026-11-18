import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { PIER } from '../maps/shared.js';
import { flat } from './helpers.js';
// Muelle principal compartido por las villas.
export default {
  id: 'villages', label: 'Villas y muelles',
  build(ctx) {
    const { ports: PORTS } = mapOf(ctx.state);
    const g = new THREE.Group();
    const wood = flat({ color: '#a5733f' }), dark = flat({ color: '#5e4127' });
    PORTS.forEach(port => {
      const [ax, az] = [port.shore[0] + port.n[0] * PIER.inland, port.shore[1] + port.n[1] * PIER.inland], [bx, bz] = [port.shore[0] - port.n[0] * PIER.seaward, port.shore[1] - port.n[1] * PIER.seaward];
      const len = Math.hypot(bx - ax, bz - az), ang = -Math.atan2(bz - az, bx - ax);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(len, .25, PIER.halfWidth * 2), wood);
      deck.position.set((ax + bx) / 2, .6, (az + bz) / 2); deck.rotation.y = ang; g.add(deck);
      for (let t = .15; t <= 1; t += .28) [-1, 1].forEach(s => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(PIER.pileRadius, PIER.pileRadius, 3, 6), dark);
        p.position.set(ax + (bx - ax) * t - Math.sin(-ang) * s * PIER.halfWidth, -.4, az + (bz - az) * t + Math.cos(-ang) * s * PIER.halfWidth); g.add(p);
      });
    });
    g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    ctx.world.add(g);
  }
};
