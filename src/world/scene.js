import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
// Renderizador, luz y cámara. Sol bajo para sombras largas; cámara ortográfica inclinada, como un mapa en relieve.
const SUN_DIR = new THREE.Vector3(70, 50, -42).normalize(), CAM_OFF = new THREE.Vector3(0, 160, 112);
const focus = new THREE.Vector3(), goal = new THREE.Vector3();
let renderer, camera, sun, cam;

function resize(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false);
  const a = w / h, vh = a < 1 ? cam.h * 1.25 : cam.h;
  Object.assign(camera, { left: -vh * a / 2, right: vh * a / 2, top: vh / 2, bottom: -vh / 2 }); camera.updateProjectionMatrix();
  // si se aleja mucho la cámara, la sombra del sol cubre más terreno
  const r = Math.max(100, vh * a * .75); Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r }); sun.shadow.camera.updateProjectionMatrix();
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
    const world = new THREE.Group(); world.name = 'mapa'; scene.add(world);   // aquí va todo lo que cambia con el mapa
    // ctx.cam: zoom (h = alto visible), límites, y cámara libre (free) que mira a cam.target en vez de al barco. La usa la vista de desarrollador.
    cam = { h: 72, min: 30, max: 95, free: false, target: new THREE.Vector3(), apply: () => resize(canvas) };
    Object.assign(ctx, { cam, cameraFocus: focus, scene, world, camera, renderer, lights: { sun, hemi }, sunDir: SUN_DIR.clone(), night: 0 });
    focus.set(ctx.state.boat.x, 0, ctx.state.boat.z);
    resize(canvas);
    addEventListener('resize', () => resize(canvas));
    canvas.addEventListener('wheel', e => { e.preventDefault(); cam.h = Math.max(cam.min, Math.min(cam.max, cam.h * (e.deltaY > 0 ? 1.08 : .93))); resize(canvas); }, { passive: false });
  },
  update(ctx, dt) {
    // Cerca de un muelle la cámara se corre hacia el pueblo para que se vea entero.
    const s = ctx.state, port = s.nearVillage && mapOf(s).portOf(s.nearVillage);
    if (ctx.snapCamera) { focus.set(s.boat.x, 0, s.boat.z); ctx.snapCamera = false; }
    goal.set(s.boat.x, 0, s.boat.z);
    if (port && !cam.free) { const c = port.center || port.land, k = port.camShift || .5; goal.x += (c[0] - goal.x) * k; goal.z += (c[1] - goal.z) * k; }
    if (cam.free) { goal.copy(cam.target); focus.copy(goal); }   // cámara libre: sin retraso, así arrastrar se siente pegado al dedo
    else focus.lerp(goal, Math.min(1, dt * (port ? 1.2 : 2.5)));
    const targetZoom = port && !cam.free ? 1.13 : 1;
    if (camera.zoom !== targetZoom) {
      camera.zoom = cam.free || Math.abs(camera.zoom - targetZoom) < .0001 ? targetZoom
        : THREE.MathUtils.damp(camera.zoom, targetZoom, 2, dt);
      camera.updateProjectionMatrix();
    }
    camera.position.copy(focus).add(CAM_OFF); camera.lookAt(focus);
    sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(ctx.sunDir, 180);
  },
  render(ctx) { renderer.render(ctx.scene, ctx.introCamera || camera); }
};
