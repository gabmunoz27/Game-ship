import { returnTime } from '../sim/intro.js';
import { makeEwan } from './ewan.js';
import * as THREE from 'three';
import { on } from '../core/events.js';
import { used } from '../sim/cargo.js';
// "La Arenquera": el barco del jugador. Dibuja lo que diga state.boat y le pone carácter:
// proa en espiral con farol, cola de pez por timón, vela con el arenque dorado, gallardete y un patrón al timón.
// Todo el movimiento de aquí es solo visual (muelles y rebotes); las reglas viven en sim/navigation.js.
const mat = (c, extra = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, side: THREE.DoubleSide, ...extra });
const WOOD = '#8a5230', DARK = '#5b3520', DECK = '#cfa066', TEAL = '#2f7f86', RED = '#b5452c', CREAM = '#efe3c4', GOLD = '#e7b84a';
const LAMP_DAY = new THREE.Color('#f3d9a0'), LAMP_NIGHT = new THREE.Color('#ffd27a');

let boat, body, band, sailPivot, sail, pennant, tail, lanternPivot, lampCore, lampLight, skipper, head, crates = [];
// Muelle amortiguado: persigue un objetivo con un poco de rebote.
const spring = (k, c) => ({ x: 0, v: 0, step(target, dt) { this.v += ((target - this.x) * k - this.v * c) * dt; this.x += this.v * dt; return this.x; } });
const roll = spring(42, 6.5), pitch = spring(38, 7), sailYaw = spring(16, 4.2), lampA = spring(22, 2.2), lampB = spring(22, 2.2), squash = spring(130, 11), nod = spring(60, 7);
let prevSpeed = 0, accel = 0, billow = .4, hopCool = 0;

function sailTexture() {
  const cv = Object.assign(document.createElement('canvas'), { width: 256, height: 256 }), c = cv.getContext('2d');
  c.fillStyle = CREAM; c.fillRect(0, 0, 256, 256);
  c.fillStyle = RED; c.fillRect(0, 22, 256, 30); c.fillRect(0, 204, 256, 30);
  c.fillStyle = '#d9caa2'; for (let x = 64; x < 256; x += 64) c.fillRect(x - 1, 0, 2, 256);          // costuras
  c.fillStyle = GOLD; c.beginPath(); c.arc(128, 128, 54, 0, 7); c.fill();
  c.fillStyle = '#b8862d'; c.beginPath(); c.arc(128, 128, 54, 0, 7); c.lineWidth = 6; c.strokeStyle = '#b8862d'; c.stroke();
  c.fillStyle = '#8a5a1c';                                                                           // el arenque
  c.beginPath(); c.ellipse(120, 128, 30, 14, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(146, 128); c.lineTo(168, 112); c.lineTo(168, 144); c.closePath(); c.fill();
  c.fillStyle = GOLD; c.beginPath(); c.arc(102, 124, 3, 0, 7); c.fill();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function build() {
  const g = new THREE.Group(); body = new THREE.Group(); g.add(body);
  const outline = (l, w) => { const s = new THREE.Shape(); s.moveTo(l, 0); s.quadraticCurveTo(l * .45, w, -l * .6, w * .9); s.quadraticCurveTo(-l * .95, w * .8, -l, w * .35);
    s.lineTo(-l, -w * .35); s.quadraticCurveTo(-l * .95, -w * .8, -l * .6, -w * .9); s.quadraticCurveTo(l * .45, -w, l, 0); return s; };
  const slab = (l, w, depth, y, color) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(outline(l, w), { depth, bevelEnabled: false, curveSegments: 5 }).rotateX(-Math.PI / 2), mat(color)); m.position.y = y; return m; };
  // Casco rechoncho en capas: quilla, tablazón, franja pintada y regala clara.
  body.add(slab(2.35, 1.1, .4, -.35, DARK), slab(2.7, 1.38, .62, .05, WOOD), slab(2.76, 1.44, .16, .67, TEAL), slab(2.7, 1.38, .1, .83, CREAM), slab(2.45, 1.16, .06, .9, DECK));
  band = slab(2.8, 1.48, .26, .2, '#3b3f47'); band.visible = false; body.add(band);                  // Casco Reforzado

  // Proa en espiral, como las galeras de las islas.
  const curl = new THREE.CatmullRomCurve3([[2.35, .5, 0], [2.95, 1.2, 0], [3.1, 2.2, 0], [2.8, 2.95, 0], [2.25, 2.95, 0], [2.05, 2.5, 0], [2.4, 2.3, 0]].map(p => new THREE.Vector3(...p)));
  body.add(new THREE.Mesh(new THREE.TubeGeometry(curl, 18, .17, 5), mat(WOOD)));
  const knob = new THREE.Mesh(new THREE.IcosahedronGeometry(.24, 0), mat(GOLD)); knob.position.set(2.4, 2.3, 0); body.add(knob);
  // Farol colgado de la espiral: se mece con cada giro y se enciende de noche.
  lanternPivot = new THREE.Group(); lanternPivot.position.set(2.15, 2.75, 0);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .5, 4), mat(DARK)); cord.position.y = -.25;
  const cage = new THREE.Mesh(new THREE.BoxGeometry(.34, .1, .34), mat('#3b3f47')); cage.position.y = -.5;
  const cage2 = cage.clone(); cage2.position.y = -.98;
  lampCore = new THREE.Mesh(new THREE.BoxGeometry(.28, .4, .28), new THREE.MeshBasicMaterial({ color: LAMP_DAY })); lampCore.position.y = -.74;
  lampLight = new THREE.PointLight('#ffcf70', 0, 16, 1.6); lampLight.position.y = -.74;
  lanternPivot.add(cord, cage, cage2, lampCore, lampLight); body.add(lanternPivot);

  // Popa: una cola de pez hace de timón y colea al girar.
  const ts = new THREE.Shape(); ts.moveTo(0, 0); ts.lineTo(-.5, .2); ts.lineTo(-1.25, 1.05); ts.lineTo(-.95, .1); ts.lineTo(-1.3, -.75); ts.lineTo(-.5, -.2); ts.closePath();
  tail = new THREE.Mesh(new THREE.ExtrudeGeometry(ts, { depth: .16, bevelEnabled: false }).translate(0, 0, -.08), mat(RED)); tail.position.set(-2.6, 1.0, 0); body.add(tail);
  const post = new THREE.Mesh(new THREE.BoxGeometry(.3, 1.1, .3), mat(WOOD)); post.position.set(-2.5, .75, 0); body.add(post);

  // Palo, verga y vela (la vela gira sobre el palo).
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, 5, 6), mat(DARK)); mast.position.set(.2, 3.3, 0); body.add(mast);
  sailPivot = new THREE.Group(); sailPivot.position.set(.2, 0, 0); body.add(sailPivot);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 3.9, 5).rotateX(Math.PI / 2), mat(DARK)); yard.position.set(.06, 5.15, 0);
  const sg = new THREE.PlaneGeometry(3.6, 3.5, 8, 5), p = sg.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 1.8, v = p.getY(i) / 1.75; p.setZ(i, (1 - u * u) * (1 - v * v * .45) * .8); }
  sg.computeVertexNormals();
  sail = new THREE.Mesh(sg.rotateY(Math.PI / 2), mat('#ffffff', { map: sailTexture() })); sail.position.set(.08, 3.4, 0);
  sailPivot.add(yard, sail);
  // Gallardete en el tope: una tira que ondea.
  pennant = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .46, 7, 1).translate(-.75, 0, 0), mat(RED)); pennant.position.set(.2, 5.95, 0);
  const pp = pennant.geometry.attributes.position; pennant.userData.base = Float32Array.from(pp.array);
  for (let i = 0; i < pp.count; i++) pp.setY(i, pp.getY(i) * (1 + pp.getX(i) / 1.6));               // se afina hacia la punta
  pennant.userData.base = Float32Array.from(pp.array); body.add(pennant);

  ({ figure: skipper, head } = makeEwan());
  skipper.position.set(-1.65, .96, 0);
  skipper.rotation.y = Math.PI / 2;
  body.add(skipper);

  // Carga en cubierta: aparece según lo llena que vaya la bodega.
  [[1.25, .5, WOOD], [1.3, -.45, '#a8743c'], [-.55, .55, '#a8743c'], [-.6, -.5, WOOD]].forEach(([x, z, c], i) => {
    const m = i % 2 ? new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .62, 7), mat(c)) : new THREE.Mesh(new THREE.BoxGeometry(.62, .56, .62), mat(c));
    m.position.set(x, 1.24, z); m.rotation.y = i * .5; body.add(m); crates.push(m);
  });

  g.traverse(o => { if (o.isMesh && o !== lampCore) o.castShadow = o.receiveShadow = true; });
  g.scale.setScalar(1.3);
  return g;
}

export default {
  id: 'boat', label: 'Barco',
  init(ctx) {
    boat = build(); ctx.helm = skipper; ctx.scene.add(boat);
    // Al recibir rumbo da un saltito y el patrón asiente; al llegar, se mece.
    on('course:set', () => { if (hopCool <= 0) { squash.v += 1.5; nod.v += 5; hopCool = .7; } });
    on('course:cleared', () => { roll.v += .5; pitch.v -= .35; });
  },
  update(ctx, rawDt) {
    const b = ctx.state.boat, t = ctx.time, dt = Math.min(rawDt || 0, .05), sp = Math.min(1, b.speed / 9), turn = b.turn || 0;
    if (dt > 0) accel += ((b.speed - prevSpeed) / dt - accel) * Math.min(1, dt * 6);
    prevSpeed = b.speed; hopCool -= dt;
    const intro = ctx.state.intro;
    skipper.visible = !intro || intro.stage === 'return';
    band.visible = b.upgrades.includes('reinforced_hull');
    const fill = Math.ceil(Math.min(1, used(ctx.state) / ctx.state.hold.capacity) * crates.length);
    crates.forEach((c, i) => { c.visible = i < fill; });

    // Cuerpo: escora hacia el giro, levanta la proa al acelerar, cabecea con las olas y se aplasta al saltar.
    boat.position.set(b.x, .14 + Math.sin(t * 1.6) * .06 + sp * .07, b.z); boat.rotation.y = -b.heading;
    if (intro) {
      const departure = intro.stage === 'return' ? THREE.MathUtils.smoothstep(intro.elapsed / returnTime, 0, 1) : 0;
      boat.translateX(-.6 * (1 - departure)); // hasta embarcar, la popa queda cerca de las tablas sin que el timón las atraviese
    }
    const r = roll.step(turn * .3 * (.35 + .65 * sp) + Math.sin(t * 1.1) * .03, dt);
    const pi = pitch.step(Math.max(-.1, Math.min(.13, accel * .03)) + Math.sin(t * (1.5 + sp * 2.2)) * (.018 + .03 * sp), dt);
    body.rotation.set(r, 0, pi);
    const q = squash.step(0, dt); body.scale.set(1 - q * .45, 1 + q, 1 - q * .45);

    // Vela: gira con retraso hacia fuera del giro y se hincha con la velocidad; parada, flamea floja.
    sailPivot.rotation.y = sailYaw.step(.5 - turn * .62, dt);
    billow += ((.3 + sp * .95) - billow) * Math.min(1, dt * 2.2);
    sail.scale.x = billow + Math.sin(t * 7) * .05 * (1 - sp);
    // Gallardete: ondea hacia atrás, más tieso cuanto más corre.
    const pp = pennant.geometry.attributes.position, base = pennant.userData.base;
    for (let i = 0; i < pp.count; i++) { const x = base[i * 3], k = -x / 1.5; pp.setZ(i, Math.sin(t * (5 + sp * 6) + x * 4) * k * (.3 - sp * .12) + k * k * turn * .8); }
    pp.needsUpdate = true; pennant.rotation.y = -sailYaw.x * .25;

    tail.rotation.y = -turn * .7 + Math.sin(t * 2.3) * .06 * (1 - sp);
    lanternPivot.rotation.set(lampA.step(-turn * .5 * sp, dt) - r, 0, lampB.step(-accel * .05, dt) - pi);
    skipper.rotation.x = -r * .8; head.rotation.z = nod.step(0, dt) * -.5; head.rotation.y = turn * .5;

    const night = ctx.night || 0;
    lampCore.material.color.lerpColors(LAMP_DAY, LAMP_NIGHT, night); lampLight.intensity = night * 22;
  }
};
