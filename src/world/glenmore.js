import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { seeded } from './helpers.js';
// Villa Glenmore: torre con linterna, casas de entramado, plaza con puestos de mercado, pilas de turba
// y vecinos en miniatura que van y vienen. De noche se encienden la linterna, los faroles y las ventanas,
// y casi todos se recogen. Todo es geometría provisional: se reemplaza por modelos de Blender.
import { mat, glow, lamp, lightUp, box, cyl, house, stall, cart, well, lampPost, roundTree, person, placePeople, animatePeople } from './townKit.js';

let P, people = [], beacon;

/** Torre de piedra con balcón y linterna. */
function tower() {
  const g = new THREE.Group();
  g.add(cyl(1.75, 2.3, 8.5, 8, '#b9b2a2', 0, 4.25, 0), cyl(2.45, 2.6, .5, 8, '#8d8478', 0, .25, 0));
  for (let i = 0; i < 3; i++) g.add(cyl(1.9 - i * .14, 1.94 - i * .14, .18, 8, '#9a9384', 0, 2.2 + i * 2.2, 0));
  g.add(cyl(2.35, 2.1, .3, 8, '#5a4030', 0, 8.6, 0));
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(box(.1, .6, .1, '#5a4030', Math.cos(a) * 2.2, 9, Math.sin(a) * 2.2)); }
  beacon = cyl(1.15, 1.15, 1.5, 8, lamp, 0, 9.5, 0); g.add(beacon);
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .4; g.add(box(.12, 1.5, .12, '#3b2f28', Math.cos(a) * 1.18, 9.5, Math.sin(a) * 1.18)); }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.75, 2, 8), mat('#3d4a63')); cap.position.y = 11.25; g.add(cap);
  g.add(box(.6, 1.2, .1, '#4a3323', 0, .9, 2.2), box(.4, .6, .1, glow, 0, 4.4, 1.95), box(.4, .6, .1, glow, 0, 6.6, 1.82));
  return g;
}
export default {
  id: 'glenmore', label: 'Villa Glenmore',
  build(ctx) {
    // Solo existe en el mapa que tenga a Glenmore; en los demás el módulo queda en reposo.
    const map = mapOf(ctx.state), port = map.portOf('glenmore'), { shorePoint, height } = map;
    people = []; this.light = null;
    if (!port) return;
    const o = shorePoint(port.a, 0), far = shorePoint(port.a, 10);
    const n = [(far[0] - o[0]) / 10, (far[1] - o[1]) / 10], t = [-n[1], n[0]];
    // Coordenadas del pueblo: u corre a lo largo de la orilla, v tierra adentro (negativo = sobre el muelle).
    P = (u, v) => { const x = o[0] + t[0] * u + n[0] * v, z = o[1] + t[1] * u + n[1] * v; return [x, Math.max(height(x, z), v < 2.6 ? .73 : -9), z]; };
    // El muelle cae en una ensenada, así que el pueblo se asienta 7 unidades más allá, donde hay tierra firme.
    // Q usa coordenadas de la plaza; P, las del muelle.
    const SHIFT = [-7, .5], sh = ([u, v]) => [u + SHIFT[0], v + SHIFT[1]], Q = (u, v) => P(...sh([u, v]));
    const g = new THREE.Group(), SQ = [0, 13.5], rnd = seeded(5);
    const put = (obj, u, v, face, at = Q) => { const [x, y, z] = at(u, v); obj.position.set(x, y - .06, z);
      if (face) { const [fx, , fz] = Q(face[0], face[1]); obj.rotation.y = Math.atan2(fx - x, fz - z); } g.add(obj); return obj; };

    const [sx, sy, sz] = Q(...SQ); const plaza = cyl(7, 7.3, .5, 14, '#cbbd97', sx, sy - .05, sz); g.add(plaza);
    for (let k = 0; k <= 1; k += .14) { const [x, y, z] = P(-7 * k * k + (rnd() - .5) * .4, 2.4 + 5.6 * k); g.add(cyl(1.15, 1.25, .3, 7, '#c9b98f', x, y - .05, z)); }
    put(tower(), -13, 7.5, SQ);
    [[-9.5, 15.5, 3.6, 2.8, 2.4, '#b5472f'], [-8, 22, 4.2, 3, 3.4, '#a23d2a'], [0.5, 23.5, 5.4, 3.4, 3.6, '#c05a35'], [7, 21.5, 3.8, 2.8, 2.4, '#a23d2a'], [10.5, 16.5, 4, 3, 3.4, '#b5472f'], [13, 23.5, 3.4, 2.6, 2.3, '#c05a35']]
      .forEach(([u, v, w, d, h, c]) => put(house(w, d, h, c), u, v, SQ));
    put(stall('#c8452f', '#f2e9d2', ['#d98c2b', '#b9c24a', '#d98c2b']), -3.8, 10.8, SQ);
    put(stall('#2f6f8a', '#f2e9d2', ['#8fa3ad', '#e8e2d0']), 3.8, 11, SQ);
    put(stall('#5d9440', '#f2e9d2', ['#3a2a20', '#3a2a20', '#7a5a3c']), -3.6, 16.6, SQ);
    put(stall('#d9a13a', '#f2e9d2', ['#c8452f', '#e8c39e']), 4, 16.2, SQ);
    put(well(), 0, 13.5);
    put(cart(), 4.5, 8.5, [-2, 3]);
    [[-5.5, 8], [5.2, 9.2], [-6.4, 18.6], [6.6, 18.8]].forEach(([u, v]) => put(lampPost(), u, v));
    put(lampPost(), -1.2, 4.4, null, P);
    [[-2.6, 5.6], [-3.3, 6.1], [-3.6, 5.2]].forEach(([u, v]) => { const b = new THREE.Group(); b.add(cyl(.4, .36, .8, 7, '#8a5a34', 0, .4, 0)); put(b, u, v, null, P); });
    // pilas de turba (lo que produce Glenmore) y troncos de roble
    [[14.5, 18.5], [-13, 12.4]].forEach(([u, v]) => { const pile = new THREE.Group(); for (let i = 0; i < 9; i++) pile.add(box(.9, .4, .5, i % 2 ? '#3a2a20' : '#4a3628', (i % 3 - 1) * .95, .2 + Math.floor(i / 3) * .4, (rnd() - .5) * .2)); put(pile, u, v, SQ); });
    const logs = new THREE.Group(); for (let i = 0; i < 5; i++) { const l = cyl(.24, .24, 2.4, 6, '#8a6a44', (i < 3 ? i - 1 : i - 3.5) * .5, i < 3 ? .24 : .66, 0); l.rotation.x = Math.PI / 2; logs.add(l); } put(logs, -14.5, 14.5, SQ);
    [[16.5, 15.5, 1.1], [-12.5, 25.5, 1.3], [5, 27.5, 1], [-15.5, 19.5, .9]].forEach(([u, v, s]) => put(roundTree(s), u, v));

    // vecinos: route = camina entre puntos; stand = se queda en un sitio mirando a algo; day = se recoge de noche
    const add = (def, coat, extra) => { const m = person(coat, extra); g.add(m);
      for (const k of ['stand', 'face']) if (def[k]) def[k] = sh(def[k]);
      if (def.route) def.route = def.route.map(pt => pt[2] ? pt : sh(pt));       // el tercer valor marca puntos del muelle
      if (def.circle) def.circle = [...sh(def.circle), def.circle[2]];
      people.push({ m, phase: rnd() * 6, ...def }); };
    add({ route: [[0, -9, 1], [0, 2.6, 1], [-2.6, 5.4, 1], [-3.2, 9.6]], speed: 1.1, day: true }, '#7a5a3c', 'load');
    add({ route: [[-8.5, 13.6], [-1.6, 12.2], [6.5, 13.5]], speed: .9, day: true }, '#2f6f8a', 'hat');
    add({ route: [[1, 21], [1.6, 16], [4.2, 11]], speed: 1, day: true }, '#a23d2a');
    add({ route: [[-11.5, 9], [-5, 9.2], [-2, 12]], speed: .8 }, '#3d4a63', 'hat');
    add({ circle: [0, 13.5, 2.3], speed: 1.5, day: true, small: true }, '#d9a13a');
    add({ stand: [-4.4, 9.9], face: SQ }, '#5d9440', 'hat');
    add({ stand: [4.4, 10.1], face: SQ }, '#8d6a9f');
    add({ stand: [-4.3, 17.5], face: SQ, day: true }, '#7a5a3c');
    add({ stand: [4.7, 17.1], face: SQ, day: true }, '#c8452f', 'hat');
    add({ stand: [-2.9, 11.9], face: [-3.8, 10.8], day: true }, '#e8e2d0');
    add({ stand: [3.2, 15.3], face: [4, 16.2], day: true }, '#2f6f8a');
    add({ stand: [-1.4, 17.6], face: [-.5, 18.2] }, '#a23d2a', 'hat');
    add({ stand: [-.5, 18.3], face: [-1.4, 17.6] }, '#3d4a63');
    add({ stand: [-12.4, 10.8], face: [-13, 12.4], dig: true, day: true }, '#7a5a3c', 'spade');
    placePeople(people, P);

    const light = new THREE.PointLight('#ffcf70', 0, 46, 1.6); const [lx, ly, lz] = Q(-13, 7.5); light.position.set(lx, ly + 9.6, lz); g.add(light); this.light = light;
    g.traverse(obj => { if (obj.isMesh && obj.material !== glow && obj.material !== lamp) obj.castShadow = obj.receiveShadow = true; });
    plaza.castShadow = false;
    ctx.world.add(g);
  },
  update(ctx) {
    if (!this.light) return;
    const t = ctx.time, night = ctx.night;
    lightUp(night);
    this.light.intensity = night * 60; beacon.rotation.y = t * .6;
    animatePeople(people, P, t, night);
  }
};
