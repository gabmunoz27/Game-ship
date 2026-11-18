import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { seeded } from './helpers.js';
import { mat, glow, lamp, lightUp, box, cyl, house, lampPost, roundTree, person, townFrame, placePeople, animatePeople } from './townKit.js';
// Villa Strathlinn (Estrecho de Kyle): aldea de ladera con campos de cebada que se mecen, un corral de ovejas,
// la tejedora en su telar y un cordelero que camina a lo largo de la cuerda. Casas encaladas con techo de paja.
const STRAW = '#c9a85a';
let P, people = [], fields = [], light = null;
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);

function sheep(rnd) {
  const g = new THREE.Group(), wool = new THREE.Mesh(new THREE.IcosahedronGeometry(.55, 0), mat(rnd() > .8 ? '#d8d0bd' : '#f4efe2'));
  wool.scale.set(1.25, .85, .9); wool.position.y = .7; g.add(wool);
  const head = box(.32, .32, .4, '#2c2622', 0, .82, .62); g.add(head);
  [[-.25, -.22], [.25, -.22], [-.25, .22], [.25, .22]].forEach(([x, z]) => g.add(box(.1, .4, .1, '#2c2622', x, .2, z)));
  return g;
}
function loom() {
  const g = new THREE.Group();
  g.add(box(.12, 2, .12, '#6a4a2c', -1, 1, 0), box(.12, 2, .12, '#6a4a2c', 1, 1, 0), box(2.2, .12, .12, '#6a4a2c', 0, 1.95, 0), box(2.2, .12, .12, '#6a4a2c', 0, .5, 0));
  ['#a23d2a', '#f2e9d2', '#2f6f8a', '#a23d2a', '#d9a13a'].forEach((c, i) => g.add(box(.36, 1.3, .03, c, -.72 + i * .36, 1.2, 0)));
  return g;
}
function haystack(s) { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.2, 7), mat('#d4b45c')); c.position.y = 1.1; g.add(c); g.scale.setScalar(s); return g; }
/** Campo de cebada: espigas en hileras (una sola llamada de dibujo) que el viento mece. */
function field(P, u0, u1, v0, v1, rnd) {
  const stalks = [];
  for (let u = u0; u <= u1; u += .55) for (let v = v0; v <= v1; v += .5) { const [x, y, z] = P(u + (rnd() - .5) * .3, v + (rnd() - .5) * .3); stalks.push({ x, y, z, s: .8 + rnd() * .4, ph: x * .3 + z * .2 }); }
  const mesh = new THREE.InstancedMesh(new THREE.ConeGeometry(.3, 1.35, 5).translate(0, .67, 0), new THREE.MeshLambertMaterial({ flatShading: true }), stalks.length);
  const C = new THREE.Color(); stalks.forEach((s, i) => mesh.setColorAt(i, C.set(['#f0d264', '#e0c050', '#d4b048'][Math.floor(rnd() * 3)])));
  mesh.castShadow = mesh.receiveShadow = true; mesh.userData.stalks = stalks;
  return mesh;
}

export default {
  id: 'strathlinn', label: 'Villa Strathlinn',
  build(ctx) {
    const map = mapOf(ctx.state), port = map.portOf('strathlinn');
    people = []; fields = []; light = null;
    if (!port) return;
    P = townFrame(map, port);
    const g = new THREE.Group(), rnd = seeded(29), YARD = [0, 9];
    const put = (obj, u, v, face) => { const [x, y, z] = P(u, v); obj.position.set(x, y - .06, z);
      if (face) { const [fx, , fz] = P(...face); obj.rotation.y = Math.atan2(fx - x, fz - z); } g.add(obj); return obj; };

    for (let k = 0; k <= 1; k += .12) { const [x, y, z] = P((rnd() - .5) * .4, 2.2 + 5.5 * k); g.add(cyl(1.1, 1.2, .3, 7, '#c4b48a', x, y - .05, z)); }
    // campos de cebada con borde de tierra
    [[6, 16, 5, 13], [-17, -7, 9, 16]].forEach(([u0, u1, v0, v1]) => {
      const [cx, cy, cz] = P((u0 + u1) / 2, (v0 + v1) / 2), soil = box(u1 - u0 + 1.4, .2, v1 - v0 + 1.4, '#b89a52', cx, cy - .02, cz);
      const [ax, , az] = P(u0, v0), [bx, , bz] = P(u1, v0); soil.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(soil);
      const f = field(P, u0, u1, v0, v1, rnd); g.add(f); fields.push(f);
    });
    // casas encaladas con techo de paja
    [[3.5, 4.5, 4, 3, 2.4], [-3.5, 4.8, 3.6, 2.8, 2.3], [-12, 4.8, 4.4, 3.2, 2.6], [19, 11, 3.6, 2.8, 2.3]]
      .forEach(([u, v, w, d, h]) => put(house(w, d, h, STRAW, '#f4efe2', '#6a5a48'), u, v, YARD));
    put(loom(), -8.6, 7.2, [-8.6, 9]);
    [['#a23d2a', -10.6, 7.6], ['#2f6f8a', -10.9, 8.5], ['#f2e9d2', -10.2, 8.4]].forEach(([c, u, v]) => { const b = new THREE.Group(); b.add(cyl(.35, .35, .5, 8, c, 0, .25, 0)); put(b, u, v); });
    // corral de ovejas
    const PEN = [-2, 17.5], R = 4.2;
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; put(box(.15, .9, .15, '#6a4a2c', 0, .45, 0), PEN[0] + Math.cos(a) * R, PEN[1] + Math.sin(a) * R); }
    // el paseo del cordelero: postes y la cuerda tendida
    const [ra] = [[3, 20.5]], rb = [15, 20.5];
    [ra, rb].forEach(p => put(box(.25, 1.4, .25, '#6a4a2c', 0, .7, 0), ...p));
    { const [x0, y0, z0] = P(...ra), [x1, , z1] = P(...rb), rope = cyl(.06, .06, Math.hypot(x1 - x0, z1 - z0), 5, '#b9a06a');
      rope.rotation.z = Math.PI / 2; rope.rotation.y = -Math.atan2(z1 - z0, x1 - x0); rope.position.set((x0 + x1) / 2, y0 + 1.2, (z0 + z1) / 2); g.add(rope); }
    [[18.5, 4.5, 1], [20.5, 6.2, .8], [-19, 18.5, .9]].forEach(([u, v, s]) => put(haystack(s), u, v));
    [[13.5, 16.5, 1], [-14.5, 20.5, 1.2], [8, 22, .9]].forEach(([u, v, s]) => put(roundTree(s), u, v));
    [[-2.6, 3.2], [2.6, 3.1], [-5.5, 11.5]].forEach(([u, v]) => put(lampPost(), u, v));

    // vecinos y ovejas
    const add = (def, coat, extra, model) => { const m = model || person(coat, extra); g.add(m); people.push({ m, phase: rnd() * 6, ...def }); };
    for (let i = 0; i < 6; i++) add({ circle: [PEN[0] + (rnd() - .5) * 1.4, PEN[1] + (rnd() - .5) * 1.4, 1 + rnd() * 1.8], speed: .25 + rnd() * .3, calm: true }, null, null, sheep(rnd));
    add({ circle: [...PEN, R + 1.3], speed: .6, day: true }, '#5d6b4a', 'hat');                                    // el pastor rodea el corral
    add({ stand: [-8.6, 8.4], face: [-8.6, 7.2], dig: true, digSpeed: 2.6, day: true }, '#a23d2a');               // Ishbel en el telar
    add({ stand: [11, 9.5], face: [11, 11], dig: true, digSpeed: 2, day: true }, '#7a5a3c', 'spade');             // segador en la cebada
    add({ route: [[3.4, 21.3], [14.6, 21.3]], speed: .7, day: true }, '#3d4a63');                                 // el cordelero
    add({ route: [[0, -9], [0, 2.5], [2, 6.5], [9, 8]], speed: 1, day: true }, '#7a5a3c', 'load');                // porteador con sacos
    add({ circle: [PEN[0] + 5.5, PEN[1] - 4, 1.4], speed: 1.6, day: true, small: true }, '#d9a13a');
    placePeople(people, P);

    light = new THREE.PointLight('#ffcf70', 0, 30, 1.6); const [lx, ly, lz] = P(0, 7); light.position.set(lx, ly + 4, lz); g.add(light);
    g.traverse(o => { if (o.isMesh && o.material !== glow && o.material !== lamp) o.castShadow = o.receiveShadow = true; });
    ctx.world.add(g);
  },
  update(ctx) {
    if (!light) return;
    const t = ctx.time, night = ctx.night, wind = ctx.wind || 1;
    lightUp(night); light.intensity = night * 30;
    for (const f of fields) {
      f.userData.stalks.forEach((s, i) => { E.set(Math.sin(t * 1.7 + s.ph) * .12 * wind, 0, Math.sin(t * 1.3 + s.ph) * .16 * wind);
        M.compose(V.set(s.x, s.y - .05, s.z), Q.setFromEuler(E), S.set(s.s, s.s, s.s)); f.setMatrixAt(i, M); });
      f.instanceMatrix.needsUpdate = true;
    }
    animatePeople(people, P, t, night);
  }
};
