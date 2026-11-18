import * as THREE from 'three';
// Barco provisional hecho con geometría simple; dibuja lo que diga state.boat.
// Se reemplaza por un modelo .glb de Blender, y las mejoras del GDD se mostrarán aquí.
let boat, band;
function build() {
  const g = new THREE.Group(), mat = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true, side: THREE.DoubleSide });
  const outline = (l, w) => { const s = new THREE.Shape(); s.moveTo(l, 0); s.quadraticCurveTo(l * .35, w, -l * .75, w * .82); s.lineTo(-l, w * .5);
    s.lineTo(-l, -w * .5); s.lineTo(-l * .75, -w * .82); s.quadraticCurveTo(l * .35, -w, l, 0); return s; };
  const slab = (l, w, depth, y, color) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(outline(l, w), { depth, bevelEnabled: false }).rotateX(-Math.PI / 2), mat(color)); m.position.y = y; return m; };
  g.add(slab(2.9, 1.15, .9, -.25, '#7a4a28'), slab(2.6, .92, .12, .62, '#c79a5c'));
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, .7, 1.2), mat('#9a6234')); cabin.position.set(-1.7, 1.05, 0);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, .12, 1.4), mat('#5e3a20')); roof.position.set(-1.7, 1.46, 0);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 4.4, 6), mat('#5e3a20')); mast.position.set(.3, 2.9, 0);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3.4, 5).rotateX(Math.PI / 2), mat('#5e3a20')); yard.position.set(.3, 4.6, 0);
  const sg = new THREE.PlaneGeometry(3.2, 3, 6, 4), p = sg.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 1.6, v = p.getY(i) / 1.5; p.setZ(i, (1 - u * u) * (1 - v * v * .5) * .55); }
  sg.computeVertexNormals();
  const sail = new THREE.Mesh(sg.rotateY(Math.PI / 2), mat('#efe3c4')); sail.position.set(.32, 3.05, 0); sail.rotation.y = .65;
  band = slab(2.97, 1.22, .22, .18, '#3b3f47'); band.visible = false; // refuerzo de hierro: aparece con el Casco Reforzado
  g.add(cabin, roof, mast, yard, sail, band);
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  g.scale.setScalar(1.35);
  return g;
}
export default {
  id: 'boat', label: 'Barco',
  init(ctx) { boat = build(); ctx.scene.add(boat); },
  update(ctx) {
    const b = ctx.state.boat, t = ctx.time;
    band.visible = b.upgrades.includes('reinforced_hull');
    boat.position.set(b.x, .12 + Math.sin(t * 1.6) * .06, b.z);
    boat.rotation.set(Math.sin(t * 1.3) * .03 + b.turn * .12, -b.heading, Math.sin(t * 1.1) * .025, 'YXZ');
  }
};
