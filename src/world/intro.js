import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { walkTime, boardTime, returnTime } from '../sim/intro.js';
import { townFrame, person } from './townKit.js';
import { makeEwan } from './ewan.js';

const ease = x => THREE.MathUtils.smoothstep(x, 0, 1);
const aim = new THREE.Vector3(), helm = new THREE.Vector3();
let ewan, mairead, P, camera, side;

export default {
  id: 'introScene', label: 'Ewan en el muelle',
  init(ctx) { camera = ctx.camera.clone(); },
  build(ctx) {
    const map = mapOf(ctx.state), port = map.portOf('portDun');
    if (!port) return;
    P = townFrame(map, port);
    // La cámara mira desde un costado del muelle: así Ewan y Mairead se ven frente a frente y el barco queda detrás.
    side = [-14 * port.t[0] - 6 * port.n[0], -14 * port.t[1] - 6 * port.n[1]];
    ewan = makeEwan(); mairead = person('#705568', 'hat');
    ewan.figure.scale.setScalar(1.3); mairead.scale.setScalar(1.45);
    mairead.position.set(...P(-.45, -8.6));
    mairead.visible = true; ewan.figure.visible = false;
    ctx.world.add(ewan.figure, mairead);
  },
  update(ctx) {
    const i = ctx.state.intro;
    ctx.introCamera = null;
    if (!i) { if (ewan) ewan.figure.visible = false; return; }
    const walk = i.stage === 'black' ? 0 : i.stage === 'walk' ? ease(i.elapsed / walkTime) : 1;
    const boarding = i.stage === 'return' ? 1 : i.stage === 'board' ? ease(i.elapsed / boardTime) : 0;
    const pullback = i.stage === 'return' ? ease(i.elapsed / returnTime) : 0;
    const actor = ewan.figure;
    actor.visible = boarding < 1;
    actor.position.set(...P(.3, 1.3 - 7.4 * walk));   // se detiene a unos pasos de Mairead, sin encimarse
    ctx.helm.getWorldPosition(helm);
    // Dos pasos hasta el borde y un último impulso hasta el timón.
    actor.position.lerp(helm, boarding);
    actor.position.y += Math.sin(Math.PI * boarding) * .8;
    const stride = i.stage === 'walk' ? Math.sin(walk * Math.PI * 14) : 0;
    actor.position.y += .055 * Math.abs(stride);
    actor.rotation.y = Math.atan2(helm.x - actor.position.x, helm.z - actor.position.z);
    if (i.stage === 'walk') {
      const [x,,z] = P(.3, -9);
      actor.rotation.y = Math.atan2(x - actor.position.x, z - actor.position.z);
    }
    if (i.stage === 'talk') actor.rotation.y = Math.atan2(mairead.position.x - actor.position.x, mairead.position.z - actor.position.z);
    mairead.rotation.y = Math.atan2(actor.position.x - mairead.position.x, actor.position.z - mairead.position.z);
    actor.rotation.z = stride * .04;
    ewan.limbs.forEach((limb, n) => { limb.rotation.x = stride * ([1,-1,-1,1][n]) * .58; });

    camera.copy(ctx.camera);
    aim.copy(actor.position).lerp(mairead.position, .33 * walk);
    aim.y += .85;
    camera.position.copy(aim);
    camera.position.x += side[0]; camera.position.y += 6 + 9 * (1 - walk); camera.position.z += side[1];

    camera.position.lerp(ctx.camera.position, pullback);
    camera.lookAt(aim.lerp(ctx.cameraFocus, pullback));
    const width = ctx.canvas.clientWidth / ctx.canvas.clientHeight;
    const shotHeight = Math.max(6.8, 6 / width) + 15 * (1 - walk);
    camera.zoom = THREE.MathUtils.lerp((camera.top - camera.bottom) / shotHeight, ctx.camera.zoom, pullback);
    camera.updateProjectionMatrix();
    ctx.introCamera = camera;
  }
};
