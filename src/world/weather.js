import * as THREE from 'three';
// Lo que se ve del clima: nubes que apagan el sol, lluvia que cae alrededor del barco, niebla que borra
// lo lejano y ráfagas de viento. Cada efecto entra y sale despacio. Corre después de daylight y le baja la luz.
// Avisa a los demás cuánto viento hay (ctx.wind, 1 = calma) para que la cebada y otros se mezan más.
const TARGET = {
  despejado:          { cloud: 0,   rain: 0, fog: 0,   wind: 0 },
  nublado:            { cloud: .6,  rain: 0, fog: 0,   wind: .2 },
  lluvia:             { cloud: .85, rain: 1, fog: .2,  wind: .4 },
  niebla:             { cloud: .5,  rain: 0, fog: 1,   wind: 0 },
  'viento-en-contra': { cloud: .3,  rain: 0, fog: 0,   wind: 1 }
};
const DROPS = 900, GUSTS = 70, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0), velocity = new THREE.Vector3();
const now = { cloud: 0, rain: 0, fog: 0, wind: 0 }, FOG_DAY = new THREE.Color('#b9c3c2'), FOG_NIGHT = new THREE.Color('#1c2630'), grey = new THREE.Color('#5b6670');
let rain, gusts, drops = [], streaks = [], first = true;

export default {
  id: 'weather', label: 'Clima: nubes, lluvia, niebla y viento',
  init(ctx) {
    rain = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, 1.6, .05), new THREE.MeshBasicMaterial({ color: '#cfe4f2', transparent: true, opacity: .55, depthWrite: false }), DROPS);
    gusts = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, .05, .05), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .45, depthWrite: false }), GUSTS);
    rain.frustumCulled = gusts.frustumCulled = false;
    drops = Array.from({ length: DROPS }, () => ({ x: ctx.state.boat.x + (Math.random() - .5) * 150, z: ctx.state.boat.z + (Math.random() - .5) * 110, y: Math.random() * 45 }));
    streaks = Array.from({ length: GUSTS }, () => ({ x: (Math.random() - .5) * 150, z: (Math.random() - .5) * 100, y: 1 + Math.random() * 5, life: Math.random() }));
    ctx.scene.fog = new THREE.Fog('#b9c3c2', 2000, 2001);   // siempre puesta (sin saltos de recompilar); lejos = invisible
    ctx.scene.add(rain, gusts);
  },
  update(ctx, dt) {
    const goal = TARGET[ctx.state.weather] || TARGET.despejado, k = first ? 1 : Math.min(1, dt * .5); first = false;
    for (const key in now) now[key] += (goal[key] - now[key]) * k;
    const { sun, hemi } = ctx.lights, b = ctx.state.boat, night = ctx.night || 0;
    sun.intensity *= 1 - now.cloud * .6; hemi.intensity *= 1 - now.cloud * .22;
    ctx.scene.background.lerp(grey, now.cloud * .35 * (1 - night));
    ctx.wind = 1 + now.wind * 1.8;
    // niebla: con la cámara a ~195 de distancia, el barco queda claro y lo lejano se pierde
    const fog = ctx.scene.fog; fog.color.lerpColors(FOG_DAY, FOG_NIGHT, night);
    fog.near = now.fog > .01 ? 200 - now.fog * 45 : 2000; fog.far = now.fog > .01 ? 200 + (1 - now.fog) * 260 + 40 : 2001;
    // lluvia alrededor del barco, inclinada por el viento
    rain.count = Math.round(DROPS * now.rain); rain.visible = rain.count > 0;
    velocity.set(38 * (.25 + now.wind * .3), -38, 0);
    Q.setFromUnitVectors(up, V.copy(velocity).normalize());
    for (let i = 0; i < rain.count; i++) { const d = drops[i]; d.y += dt * velocity.y; d.x += dt * velocity.x; d.z += dt * velocity.z; if (d.y < 0 || Math.abs(d.x - b.x) > 90 || Math.abs(d.z - b.z) > 65) {
        d.y = d.y < 0 ? d.y + 45 : Math.random() * 45;
        d.x = b.x + (Math.random() - .5) * 150; d.z = b.z + (Math.random() - .5) * 110;
      }
      M.compose(V.set(d.x, d.y, d.z), Q, S); rain.setMatrixAt(i, M); }
    rain.instanceMatrix.needsUpdate = true;
    // ráfagas: rayas blancas que cruzan el agua
    gusts.count = Math.round(GUSTS * Math.max(0, now.wind - .15) / .85); gusts.visible = gusts.count > 0;
    for (let i = 0; i < gusts.count; i++) { const g = streaks[i]; g.life -= dt * .7; g.x += dt * 30;
      if (g.life <= 0 || g.x > 75) { g.life = 1; g.x = -75 + Math.random() * 60; g.z = (Math.random() - .5) * 100; }
      const sc = Math.sin(g.life * Math.PI); M.compose(V.set(b.x + g.x, g.y, b.z + g.z), Q.identity(), S.set(sc, 1, 1)); gusts.setMatrixAt(i, M); S.set(1, 1, 1); }
    gusts.instanceMatrix.needsUpdate = true;
  }
};
