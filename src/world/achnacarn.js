import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { seeded } from './helpers.js';
import { mat, glow, lamp, lightUp, box, cyl, house, cart, lampPost, person, townFrame, placePeople, animatePeople } from './townKit.js';
// Villa Achnacarn (Estrecho de Kyle): pueblo de herreros al pie de una mina de cobre.
// La fragua brilla y echa humo, el herrero golpea el yunque, una vagoneta de mineral baja por los rieles
// y un minero pica en la boca de la mina. Casas de piedra gris con tejado de pizarra.
const fire = new THREE.MeshBasicMaterial({ color: '#ff8a2a' }), FIRE_A = new THREE.Color('#ff7a1a'), FIRE_B = new THREE.Color('#ffc04a');
const smokeMat = new THREE.MeshLambertMaterial({ color: '#8d8f94', transparent: true, opacity: .55, flatShading: true, depthWrite: false });
let P, people = [], light = null, smoke = [], chimneyTop = null;

/** La fragua: taller de piedra abierto al frente, con el fuego a la vista y una chimenea alta. */
function forge() {
  const g = new THREE.Group();
  g.add(box(5.4, 3, 4.2, '#9a9384', 0, 1.5, 0), box(5.8, .2, 4.6, '#4a4f5c', 0, 3.05, 0));
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-3.2, 0), new THREE.Vector2(3.2, 0), new THREE.Vector2(0, 2)]), { depth: 4.8, bevelEnabled: false }).translate(0, 0, -2.4), mat('#3d4a63'));
  roof.position.y = 3.1; g.add(roof);
  g.add(box(1.3, 5.2, 1.3, '#7d776b', 1.6, 4.2, -1.2), box(1.5, .3, 1.5, '#5d584f', 1.6, 6.9, -1.2));
  g.add(box(2.6, 1.8, .3, '#2a2420', -.6, 1, 2.1));                         // boca del taller
  g.add(box(1.6, .9, .2, fire, -.6, .8, 2.2));                              // el fuego de la fragua
  g.add(box(.3, 2.6, .3, '#5a4030', -2.1, 1.3, 2.25), box(.3, 2.6, .3, '#5a4030', .9, 1.3, 2.25));
  g.add(box(.5, .5, .08, glow, 1.9, 1.9, 2.13));
  return g;
}
function anvil() { const g = new THREE.Group(); g.add(box(.5, .6, .5, '#5a4030', 0, .3, 0), box(1, .32, .42, '#3b3f47', 0, .76, 0), box(.36, .2, .3, '#3b3f47', .62, .78, 0)); return g; }
/** Boca de mina en una loma: marco de vigas, oscuridad dentro y un farol colgado. */
function mine() {
  const g = new THREE.Group(), hill = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 0), mat('#5b5f68')); hill.scale.set(1.3, .75, .9); hill.position.set(0, 1.2, -3); g.add(hill);
  g.add(box(2.4, 2.6, 1.4, '#14110e', 0, 1.3, 1.6), box(.35, 3, .35, '#6a4a2c', -1.35, 1.5, 2.3), box(.35, 3, .35, '#6a4a2c', 1.35, 1.5, 2.3), box(3.3, .38, .45, '#6a4a2c', 0, 3.05, 2.3));
  const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.22, 0), lamp); l.position.set(1, 2.5, 2.6); g.add(l);
  return g;
}
const pile = (color, n, rnd) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(.35 + rnd() * .3, 0), mat(color)); r.position.set((rnd() - .5) * 1.8, .25 + (i > n * .6 ? .4 : 0), (rnd() - .5) * 1.4); r.rotation.set(rnd() * 3, rnd() * 3, 0); g.add(r); } return g; };
const ingots = color => { const g = new THREE.Group(); for (let i = 0; i < 7; i++) g.add(box(.7, .22, .3, color, (i % 4 - 1.5) * .34 + (i > 3 ? .17 : 0), .11 + (i > 3 ? .22 : 0), 0)); return g; };
function oreCart() { const g = new THREE.Group(); g.add(box(1.2, .6, .8, '#7a4a2c', 0, .62, 0), box(1, .22, .6, '#4f6a5a', 0, 1, 0)); [-.4, .4].forEach(x => [-.42, .42].forEach(z => { const w = cyl(.2, .2, .1, 8, '#2f2f33', x, .22, z); w.rotation.x = Math.PI / 2; g.add(w); })); return g; }

export default {
  id: 'achnacarn', label: 'Villa Achnacarn',
  build(ctx) {
    const map = mapOf(ctx.state), port = map.portOf('achnacarn');
    people = []; light = null; smoke = [];
    if (!port) return;
    P = townFrame(map, port);
    const g = new THREE.Group(), rnd = seeded(13), PLAZA = [0, 10];
    const put = (obj, u, v, face) => { const [x, y, z] = P(u, v); obj.position.set(x, y - .06, z);
      if (face) { const [fx, , fz] = P(...face); obj.rotation.y = Math.atan2(fx - x, fz - z); } g.add(obj); return obj; };

    // camino empedrado del muelle a la plaza, y la plaza
    for (let k = 0; k <= 1; k += .12) { const [x, y, z] = P((rnd() - .5) * .4, 2.2 + 6 * k); g.add(cyl(1.1, 1.2, .3, 7, '#a8a294', x, y - .05, z)); }
    const [px, py, pz] = P(...PLAZA); g.add(cyl(5.2, 5.5, .4, 12, '#a8a294', px, py - .08, pz));
    const f = put(forge(), -7.5, 10, [-7.5, 2]);
    chimneyTop = new THREE.Vector3(1.6, 7.2, -1.2).applyMatrix4(f.matrix.compose(f.position, f.quaternion, f.scale));
    put(anvil(), -6.6, 6.6, [-3, 6.6]);
    put(ingots('#c46a2a'), -11.2, 6.8, PLAZA); put(ingots('#4a4f5c'), -11.4, 8.3, PLAZA);   // cobre y hierro
    put(mine(), 10, 21, [10, 10]);
    // rieles de la mina a la plaza
    const [r0x, , r0z] = P(9.6, 18), [r1x, , r1z] = P(5.4, 8.4), len = Math.hypot(r1x - r0x, r1z - r0z), ang = Math.atan2(r1x - r0x, r1z - r0z);
    [-.45, .45].forEach(s => { const rail = box(.1, .1, len, '#3b3f47'); const [mx, my, mz] = P(7.5 + s, 13.2); rail.position.set(mx, my + .05, mz); rail.rotation.y = ang; g.add(rail); });
    for (let k = 0; k <= 1; k += .1) { const sl = box(1.3, .08, .25, '#6a4a2c'); const [x, y, z] = P(9.6 + (5.4 - 9.6) * k, 18 + (8.4 - 18) * k); sl.position.set(x, y, z); sl.rotation.y = ang; g.add(sl); }
    put(pile('#6b7a5a', 9, rnd), 13.5, 11.5); put(pile('#7a5a46', 7, rnd), 4, 6.8);                          // mineral de cobre y escoria
    [[-15, 14, 4, 3, 2.6], [-6.5, 18.5, 4.6, 3.2, 3.2], [1.5, 15.5, 3.8, 2.8, 2.5], [16.5, 13.5, 4, 3, 2.7]]
      .forEach(([u, v, w, d, h], i) => put(house(w, d, h, i % 2 ? '#3d4a63' : '#4f5a70', '#c9c1ae', '#6a645a'), u, v, PLAZA));
    put(cart(), -2.5, 5.6, [3, 5.6]);
    [[-2.8, 3.2], [2.8, 3.4], [-4.4, 13.5], [5, 12.8]].forEach(([u, v]) => put(lampPost(), u, v));
    [[2.4, -1.5], [3.1, -2.2]].forEach(([u, v]) => { const b = new THREE.Group(); b.add(cyl(.4, .36, .8, 7, '#8a5a34', 0, .4, 0)); put(b, u, v); });

    // vecinos
    const add = (def, coat, extra, model) => { const m = model || person(coat, extra); g.add(m); people.push({ m, phase: rnd() * 6, ...def }); };
    add({ stand: [-5.6, 6.6], face: [-6.6, 6.6], dig: true, digSpeed: 7 }, '#4a3a30', 'hat');                  // el herrero en el yunque
    add({ stand: [10, 17.6], face: [10, 21], dig: true, digSpeed: 3, day: true }, '#7a5a3c', 'spade');           // minero en la boca de la mina
    add({ route: [[9.6, 18], [5.4, 8.4]], speed: 1.1, day: true, roll: true }, null, null, oreCart());           // la vagoneta baja y sube
    add({ route: [[0, -9], [0, 2.5], [-3.5, 5.5], [-9.5, 7.5]], speed: 1, day: true }, '#2f6f8a', 'load');       // porteador muelle → fragua
    add({ route: [[-12, 11], [-2, 12.5], [12, 9.5]], speed: .7, day: true }, '#a23d2a');
    add({ stand: [1.2, 10.4], face: [2.2, 11], day: true }, '#5d6b4a', 'hat'); add({ stand: [2.2, 11], face: [1.2, 10.4], day: true }, '#d9a13a');
    placePeople(people, P);

    // humo de la chimenea
    for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.6, 0), smokeMat); s.userData.k = i / 7; g.add(s); smoke.push(s); }
    light = new THREE.PointLight('#ff9a40', 0, 26, 1.6); const [lx, ly, lz] = P(-7.5, 6.5); light.position.set(lx, ly + 2, lz); g.add(light);
    g.traverse(o => { if (o.isMesh && ![glow, lamp, fire, smokeMat].includes(o.material)) o.castShadow = o.receiveShadow = true; });
    ctx.world.add(g);
  },
  update(ctx) {
    if (!light) return;
    const t = ctx.time, night = ctx.night, flick = .75 + .25 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
    lightUp(night);
    fire.color.lerpColors(FIRE_A, FIRE_B, flick); light.intensity = (6 + night * 30) * flick;
    smoke.forEach(s => { const k = (s.userData.k + t * .12) % 1; s.position.set(chimneyTop.x + Math.sin(k * 6 + t) * .4 + k * 2.5, chimneyTop.y + k * 7, chimneyTop.z - k * 1.2); s.scale.setScalar(.5 + k * 1.8); });
    smokeMat.opacity = .5 * (1 - night * .5);
    animatePeople(people, P, t, night);
  }
};
