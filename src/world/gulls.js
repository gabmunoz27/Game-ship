import * as THREE from 'three';
import { mapOf } from '../maps/index.js';
import { townFrame, mat } from './townKit.js';

const pose = new THREE.Object3D(), part = new THREE.Object3D(), matrix = new THREE.Matrix4();
let birds, bodies, wings;
export default {
  id: 'gulls', label: 'Gaviotas del lago',
  build(ctx) {
    birds = [];
    const map = mapOf(ctx.state);
    if (map.id !== 'lochMorag') return;
    for (const port of map.ports) {
      const P = townFrame(map,port);
      for (let i=0;i<6;i++) {
        const perched = i>=4 && port.village==='portDun';
        const [x,h,z] = perched ? (i===5 ? P(-9,3.2) : P(-24.6,-17.9)) : P(-12,-8);
        birds.push({ x,z, y:perched ? (i===5 ? h+5.18 : 1.05) : 6+i*.52, phase:i*1.15, perched });
      }
    }
    bodies = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),mat('#e5e3d7'),birds.length);
    const wing = new THREE.BufferGeometry();
    wing.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.12,.52,.12,.01,.97,.03,-.27,0,0,-.12,.97,.03,-.27,0,0,.19],3));
    wing.computeVertexNormals();
    wings = new THREE.InstancedMesh(wing,new THREE.MeshLambertMaterial({color:'#bfc4c3',side:THREE.DoubleSide}),birds.length*2);
    bodies.frustumCulled = wings.frustumCulled = false;
    ctx.world.add(bodies,wings);
  },
  update(ctx) {
    if (!birds.length) return;
    let n=0;
    for (const [i,b] of birds.entries()) {
      if (ctx.night>.55 && i%6!==5) continue;
      const a = b.phase+ctx.time*(.13+(i%3)*.012);
      pose.position.set(b.x,b.y,b.z);
      pose.rotation.set(0,b.phase,0);
      if (!b.perched) {
        pose.position.x+=Math.cos(a)*14; pose.position.z+=Math.sin(a)*8;
        pose.position.y+=Math.sin(a*2)*.75;
        pose.rotation.y=Math.atan2(-14*Math.sin(a),8*Math.cos(a));
      }
      pose.updateMatrix();
      part.rotation.set(0,0,0); part.scale.set(.16,.14,.39); part.updateMatrix();
      bodies.setMatrixAt(n,matrix.multiplyMatrices(pose.matrix,part.matrix));
      for (const side of [-1,1]) {
        const flap = Math.max(0,Math.sin(a*2))*Math.sin(ctx.time*7+b.phase)*.46;
        part.rotation.set(0,(side<0 ? Math.PI : 0)+(b.perched ? side*1.25 : 0), b.perched ? .15 : flap);
        part.scale.set(b.perched ? .38 : 1,1,1); part.updateMatrix();
        wings.setMatrixAt(n*2+(side+1)/2,matrix.multiplyMatrices(pose.matrix,part.matrix));
      }
      n++;
    }
    bodies.count=n; wings.count=n*2;
    bodies.instanceMatrix.needsUpdate=wings.instanceMatrix.needsUpdate=true;
  }
};
