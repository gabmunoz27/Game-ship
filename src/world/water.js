import * as THREE from 'three';
import { SIZE, height } from '../maps/current.js';
// Agua pintada: color por profundidad, espuma en la orilla, y recibe las sombras del sol.
const uniforms = { uDepth: { value: null }, uTime: { value: 0 } };
export default {
  id: 'water', label: 'Agua',
  init(ctx) {
    const W = 512, H = 400, data = new Uint8Array(W * H * 4);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = -SIZE.w / 2 + (i + .5) / W * SIZE.w, z = -SIZE.d / 2 + (j + .5) / H * SIZE.d;
      data[(j * W + i) * 4] = Math.max(0, Math.min(255, -height(x, z) / 8 * 255)); data[(j * W + i) * 4 + 3] = 255;
    }
    const depth = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
    depth.magFilter = depth.minFilter = THREE.LinearFilter; depth.needsUpdate = true; uniforms.uDepth.value = depth;
    const mat = new THREE.MeshLambertMaterial({ transparent: true });
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, uniforms);
      sh.vertexShader = 'varying vec3 vW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vW=(modelMatrix*vec4(transformed,1.)).xyz;');
      sh.fragmentShader = `uniform sampler2D uDepth;uniform float uTime;varying vec3 vW;
        float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
          return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
        ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec2 uvw=vec2((vW.x+${(SIZE.w / 2).toFixed(1)})/${SIZE.w.toFixed(1)},(vW.z+${(SIZE.d / 2).toFixed(1)})/${SIZE.d.toFixed(1)});
        float dep=texture2D(uDepth,uvw).r*8.;
        float n=vn(vW.xz*.35+uTime*.12);
        vec3 col=mix(vec3(.30,.74,.72),vec3(.07,.42,.60),smoothstep(0.,2.4,dep));
        col=mix(col,vec3(.03,.22,.42),smoothstep(2.,6.,dep));
        float rip=smoothstep(.74,.78,vn(vec2(vW.x*.3+uTime*.07,vW.z*1.7)+n));
        col+=rip*.03*smoothstep(.8,2.,dep);
        float edge=.30+.22*sin(uTime*1.2+n*6.);
        float foam=1.-smoothstep(edge,edge+.1,dep);
        float ring=1.-smoothstep(0.,.09,abs(dep-(1.05+.3*sin(uTime*.7+n*5.))));
        foam=max(foam,ring*step(.5,n)*.75);
        col=mix(col,vec3(1.),foam);
        diffuseColor.rgb=col;
        diffuseColor.a=max(mix(.42,.95,smoothstep(0.,3.2,dep)),foam);`);
    };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SIZE.w, SIZE.d).rotateX(-Math.PI / 2), mat);
    mesh.receiveShadow = true; ctx.scene.add(mesh);
  },
  update(ctx) { uniforms.uTime.value = ctx.time; }
};
