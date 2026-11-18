import * as THREE from 'three';
// Piezas de pueblo compartidas por todas las villas hechas a mano (Glenmore, Achnacarn, Strathlinn…):
// materiales, casas, puestos, carretas, faroles, árboles, vecinos en miniatura y cómo se mueven.
// Todo es geometría provisional: se reemplaza por modelos de Blender sin tocar las villas.
const mats = new Map();
export const mat = color => { if (!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({ color, flatShading: true })); return mats.get(color); };
export const glow = new THREE.MeshBasicMaterial({ color: '#8a97a8' }), lamp = new THREE.MeshBasicMaterial({ color: '#d8c98f' });
const GLOW_DAY = new THREE.Color('#8a97a8'), GLOW_NIGHT = new THREE.Color('#ffd27a'), LAMP_DAY = new THREE.Color('#d8c98f'), LAMP_NIGHT = new THREE.Color('#fff0a8');
/** Ventanas y faroles se encienden con la noche. Lo llama cada villa en su update; da igual cuántas veces. */
export function lightUp(night) { glow.color.lerpColors(GLOW_DAY, GLOW_NIGHT, Math.min(1, night * 1.4)); lamp.color.lerpColors(LAMP_DAY, LAMP_NIGHT, night); }
export const box = (w, h, d, color, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? mat(color) : color); m.position.set(x, y, z); return m; };
export const cyl = (rt, rb, h, seg, color, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof color === 'string' ? mat(color) : color); m.position.set(x, y, z); return m; };

/** Casa de entramado: muros claros, vigas oscuras, tejado rojo a dos aguas, chimenea, puerta y ventanas. */
export function house(w, d, h, roofColor, wall = '#efe4c8', beam = '#5a4030') {
  const g = new THREE.Group();
  g.add(box(w, h, d, wall, 0, h / 2, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(box(.2, h, .2, beam, sx * w / 2, h / 2, sz * d / 2)));
  g.add(box(w + .12, .16, d + .12, beam, 0, h - .08, 0));
  if (h > 2.6) g.add(box(w + .12, .16, d + .12, beam, 0, h * .5, 0));
  [-1, 1].forEach(s => { g.add(box(.14, h * .5, .06, beam, s * w * .18, h * .25, d / 2 + .02)); });
  const rh = w * .5, shape = new THREE.Shape([new THREE.Vector2(-w / 2 - .4, 0), new THREE.Vector2(w / 2 + .4, 0), new THREE.Vector2(0, rh)]);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: d + .7, bevelEnabled: false }).translate(0, 0, -(d + .7) / 2), mat(roofColor));
  roof.position.y = h; g.add(roof);
  g.add(box(.5, 1.1, .5, '#8d8478', w * .22, h + rh * .75, -d * .15));
  g.add(box(.6, 1.1, .08, '#4a3323', 0, .55, d / 2 + .03));
  const rows = h > 2.6 ? [h * .28, h * .76] : [h * .58];
  rows.forEach(y => [-1, 1].forEach(s => { g.add(box(.5, .5, .08, glow, s * w * .32, y, d / 2 + .03), box(.5, .5, .08, glow, s * w * .32, y, -d / 2 - .03)); }));
  return g;
}
/** Puesto de mercado con toldo de rayas y mercancía sobre el mostrador. */
export function stall(c1, c2, goods) {
  const g = new THREE.Group();
  [[-1.1, -.55], [1.1, -.55], [-1.1, .55], [1.1, .55]].forEach(([x, z]) => g.add(cyl(.07, .07, z < 0 ? 2.1 : 1.7, 5, '#5a4030', x, z < 0 ? 1.05 : .85, z)));
  g.add(box(2.3, .7, 1, '#a5733f', 0, .35, 0));
  const awning = new THREE.Group();
  for (let i = 0; i < 6; i++) awning.add(box(.42, .08, 1.7, i % 2 ? c1 : c2, -1.05 + i * .42, 0, 0));
  awning.position.set(0, 1.95, .05); awning.rotation.x = .26; g.add(awning);
  goods.forEach((c, i) => g.add(box(.5, .3, .5, c, -.7 + i * .7, .85, .1)));
  return g;
}
export function cart() {
  const g = new THREE.Group();
  g.add(box(2, .5, 1.1, '#8a5a34', 0, .75, 0), box(1.6, .35, .8, '#3a2a20', 0, 1.1, 0), box(1.4, .08, .08, '#5a4030', 1.6, .7, .35), box(1.4, .08, .08, '#5a4030', 1.6, .7, -.35));
  [-.6, .6].forEach(z => { const w = cyl(.45, .45, .12, 10, '#4a3323', -.2, .45, z); w.rotation.x = Math.PI / 2; g.add(w); });
  return g;
}
export function well() {
  const g = new THREE.Group();
  g.add(cyl(.9, 1, .8, 8, '#a8a294', 0, .4, 0), cyl(.7, .7, .1, 8, '#2c6a8a', 0, .78, 0), box(.12, 1.6, .12, '#5a4030', -.8, 1.3, 0), box(.12, 1.6, .12, '#5a4030', .8, 1.3, 0));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.3, .8, 4), mat('#a23d2a')); roof.position.y = 2.5; roof.rotation.y = Math.PI / 4; g.add(roof);
  return g;
}
export function lampPost() { const g = new THREE.Group(); g.add(cyl(.06, .08, 2.2, 5, '#3b2f28', 0, 1.1, 0)); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.22, 0), lamp); b.position.y = 2.35; g.add(b); return g; }
export function roundTree(s) { const g = new THREE.Group(); g.add(cyl(.2, .28, 1.6, 5, '#7a5a3c', 0, .8, 0)); const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), mat('#5d9440')); c.position.y = 2.6; c.scale.y = .9; g.add(c); g.scale.setScalar(s); return g; }
/** Vecino en miniatura: abrigo cónico, cabeza y, a veces, gorro o un bulto al hombro. */
export function person(coat, extra) {
  const g = new THREE.Group(), body = new THREE.Mesh(new THREE.ConeGeometry(.3, .85, 6), mat(coat)); body.position.y = .42;
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.19, 0), mat('#e8c39e')); head.position.y = .98;
  g.add(body, head);
  if (extra === 'hat') g.add(cyl(.12, .24, .16, 6, '#3b2f28', 0, 1.17, 0));
  if (extra === 'load') g.add(box(.42, .3, .34, '#a5733f', .22, 1.02, 0));
  if (extra === 'spade') { const s = box(.06, 1.1, .06, '#5a4030', .34, .6, .1); s.rotation.z = -.3; g.add(s); }
  g.scale.setScalar(1.1);
  return g;
}


/**
 * Marco de coordenadas de una villa: u corre a lo largo de la orilla, v tierra adentro (negativo = sobre el muelle).
 * Devuelve P(u, v) → [x, y, z] apoyado en el terreno (o sobre la tabla del muelle cuando cae en el agua).
 */
export function townFrame(map, port, shift = [0, 0]) {
  const { shore: o, n, t } = port;
  return (u, v) => { u += shift[0]; v += shift[1]; const x = o[0] + t[0] * u + n[0] * v, z = o[1] + t[1] * u + n[1] * v;
    return [x, Math.max(map.height(x, z), v < 2.6 ? .73 : -9), z]; };
}
/** Prepara a los vecinos (largo de cada ruta, posición de los que se quedan quietos). */
export function placePeople(people, P) {
  people.forEach(p => { if (p.small) p.m.scale.multiplyScalar(.75); if (p.stand) { const [x, y, z] = P(...p.stand), [fx, , fz] = P(...p.face); p.m.position.set(x, y, z); p.m.rotation.y = Math.atan2(fx - x, fz - z); p.y = y; }
    if (p.route) { p.len = []; p.total = 0; for (let i = 1; i < p.route.length; i++) { const d = Math.hypot(p.route[i][0] - p.route[i - 1][0], p.route[i][1] - p.route[i - 1][1]); p.len.push(d); p.total += d; } } });
}
/** Mueve a los vecinos: van y vienen por su ruta, dan vueltas, trabajan (dig) o se balancean quietos. De noche se recogen los de día. */
export function animatePeople(people, P, t, night) {
  for (const p of people) {
    p.m.visible = !(p.day && night > .55);
    if (!p.m.visible) continue;
    if (p.route) {
      let s = ((t + p.phase * 5) * p.speed) % (p.total * 2); const back = s > p.total; if (back) s = p.total * 2 - s;
      let i = 0; while (i < p.len.length - 1 && s > p.len[i]) { s -= p.len[i]; i++; }
      const a = p.route[i], b = p.route[i + 1], k = Math.min(1, s / p.len[i]), [x, y, z] = P(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k);
      const [ax, , az] = P(...a), [bx, , bz] = P(...b), dir = back ? -1 : 1;
      p.m.position.set(x, y + (p.roll ? 0 : Math.abs(Math.sin(t * 7 + p.phase)) * .07), z); p.m.rotation.y = Math.atan2((bx - ax) * dir, (bz - az) * dir);
    } else if (p.circle) {
      const a = t * p.speed / p.circle[2] + p.phase, [x, y, z] = P(p.circle[0] + Math.cos(a) * p.circle[2], p.circle[1] + Math.sin(a) * p.circle[2]);
      const [nx, , nz] = P(p.circle[0] + Math.cos(a + .1) * p.circle[2], p.circle[1] + Math.sin(a + .1) * p.circle[2]);
      p.m.position.set(x, y + (p.calm ? Math.abs(Math.sin(t * 3 + p.phase)) * .03 : Math.abs(Math.sin(t * 10)) * .12), z); p.m.rotation.y = Math.atan2(nx - x, nz - z);
    } else {
      p.m.rotation.x = p.dig ? Math.max(0, Math.sin(t * (p.digSpeed || 2.2) + p.phase)) * .55 : 0;
      p.m.rotation.z = p.dig ? 0 : Math.sin(t * 1.4 + p.phase) * .06;
      p.m.position.y = p.y + (p.dig ? 0 : Math.max(0, Math.sin(t * .9 + p.phase * 3) - .93) * 1.6);
    }
  }
}
