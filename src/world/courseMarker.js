import * as THREE from 'three';
// Marcador dorado del destino, línea punteada del rumbo y estela del barco.
const WAKE = 70, M = new THREE.Matrix4();
let ring, line, dashTex, wake, puffs, puffI = 0, puffT = 0;
export default {
  id: 'courseMarker', label: 'Rumbo y estela',
  init(ctx) {
    ring = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.4, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e7b84a', transparent: true, opacity: .95 }));
    const cv = Object.assign(document.createElement('canvas'), { width: 32, height: 4 }), c2 = cv.getContext('2d');
    c2.fillStyle = '#fff'; c2.fillRect(0, 0, 20, 4);
    dashTex = new THREE.CanvasTexture(cv); dashTex.wrapS = THREE.RepeatWrapping;
    line = new THREE.Mesh(new THREE.PlaneGeometry(1, .22).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, opacity: .9 }));
    wake = new THREE.InstancedMesh(new THREE.CircleGeometry(.5, 10).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .7 }), WAKE);
    puffs = Array.from({ length: WAKE }, () => ({ x: 0, z: 0, life: 0 }));
    ctx.scene.add(ring, line, wake);
  },
  update(ctx, dt) {
    const b = ctx.state.boat, t = ctx.time, c = b.course;
    ring.visible = line.visible = !!c;
    if (c) {
      const dx = c.x - b.x, dz = c.z - b.z, dist = Math.hypot(dx, dz);
      ring.position.set(c.x, .12, c.z); ring.rotation.y = t * .6; ring.scale.setScalar(1 + Math.sin(t * 3) * .05);
      line.position.set(b.x + dx / 2, .1, b.z + dz / 2); line.rotation.y = -Math.atan2(dz, dx); line.scale.x = Math.max(.01, dist);
      dashTex.repeat.x = dist / 1.6; dashTex.offset.x = -t * .6;
    }
    puffT -= dt;
    if (b.speed > 1.5 && puffT <= 0) { puffT = .07; const p = puffs[puffI++ % WAKE], s = (Math.random() - .5) * 1.6;
      p.x = b.x - Math.cos(b.heading) * 3.6 - Math.sin(b.heading) * s; p.z = b.z - Math.sin(b.heading) * 3.6 + Math.cos(b.heading) * s; p.life = 1; }
    puffs.forEach((p, i) => { p.life = Math.max(0, p.life - dt * .45); const s = p.life * (1.6 - p.life) * 1.4; M.makeScale(s, 1, s).setPosition(p.x, .06, p.z); wake.setMatrixAt(i, M); });
    wake.instanceMatrix.needsUpdate = true;
  }
};
