import * as THREE from 'three';
// Renderizador, luz y cámara. Sol bajo para sombras largas; cámara ortográfica inclinada, como un mapa en relieve.
const SUN_DIR = new THREE.Vector3(70, 50, -42).normalize(), CAM_OFF = new THREE.Vector3(0, 160, 112);
const focus = new THREE.Vector3(), goal = new THREE.Vector3();
let renderer, camera, sun, viewH = 72;

function resize(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false);
  const a = w / h, vh = a < 1 ? viewH * 1.25 : viewH;
  Object.assign(camera, { left: -vh * a / 2, right: vh * a / 2, top: vh / 2, bottom: -vh / 2 }); camera.updateProjectionMatrix();
}

export default {
  id: 'scene', label: 'Escena, luz y cámara',
  init(ctx) {
    const canvas = ctx.canvas;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#22382c');
    const hemi = new THREE.HemisphereLight('#bcd4ff', '#4a5a3a', 1.5);
    scene.add(hemi);
    sun = new THREE.DirectionalLight('#fff0cf', 3.1);
    sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -100, right: 100, top: 100, bottom: -100, near: 1, far: 400 });
    sun.shadow.bias = -.0006; sun.shadow.normalBias = .35;
    scene.add(sun, sun.target);
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 600);
    Object.assign(ctx, { scene, camera, renderer, lights: { sun, hemi }, sunDir: SUN_DIR.clone(), night: 0 });
    focus.set(ctx.state.boat.x, 0, ctx.state.boat.z);
    resize(canvas);
    addEventListener('resize', () => resize(canvas));
    canvas.addEventListener('wheel', e => { e.preventDefault(); viewH = Math.max(30, Math.min(95, viewH * (e.deltaY > 0 ? 1.08 : .93))); resize(canvas); }, { passive: false });
  },
  update(ctx, dt) {
    focus.lerp(goal.set(ctx.state.boat.x, 0, ctx.state.boat.z), Math.min(1, dt * 2.5));
    camera.position.copy(focus).add(CAM_OFF); camera.lookAt(focus);
    sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(ctx.sunDir, 180);
  },
  render(ctx) { renderer.render(ctx.scene, camera); }
};
