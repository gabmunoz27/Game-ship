import * as THREE from 'three';
import { fishingBoat } from './harborBoats.js';
import { box, cyl } from './townKit.js';

let models = [];
export default {
  id: 'trafficModels', label: 'Velero y pesquero del lago',
  build(ctx) {
    models=[];
    if (ctx.state.map!=='lochMorag') return;
    for (let i=0;i<2;i++) {
      const hull=fishingBoat({ width:i?2.1:1.6, depth:i?4.8:3.8 },i?1:3);
      // La proa de estos cascos apunta a -Z en coordenadas locales.
      hull.rotation.y=Math.PI;
      if (i) hull.add(box(1.3,.72,1.1,'#997358',0,.7,.55),box(1.5,.1,1.35,'#576361',0,1.1,.55),
        cyl(.35,.3,.47,8,'#79644d',0,.59,-.76));
      const root=new THREE.Group(); root.add(hull);
      const foam = new THREE.InstancedMesh(new THREE.CircleGeometry(.26,7).rotateX(-Math.PI/2),
        new THREE.MeshBasicMaterial({color:'#e3ebe4',transparent:true,opacity:.55,depthWrite:false}),20);
      foam.frustumCulled=false;
      models.push({ root,hull,sail:hull.getObjectByName('vela'),foam,
        drops:Array.from({length:20},()=>({x:0,z:0,life:0})), next:0, timer:0 });
      ctx.world.add(root,foam);
    }
  },
  update(ctx,dt) {
    models.forEach((model,i)=>{
      const {root,hull,sail,foam}=model, boat=ctx.state.traffic?.[i];
      root.visible=foam.visible=!!boat && !ctx.state.intro;
      if (!root.visible) return;
      root.position.set(boat.x,.12+.05*Math.sin(ctx.time*1.6+i),boat.z);
      const delta=boat.heading-root.rotation.y;
      root.rotation.y+=Math.atan2(Math.sin(delta),Math.cos(delta))*Math.min(1,dt*4);
      hull.rotation.z=.045*Math.sin(ctx.time*1.5+i)+.04*Math.sin(root.rotation.y);
      if(sail) sail.rotation.y=Math.PI/2+.48*Math.sin(root.rotation.y);
      model.timer-=dt;
      if (boat.speed>.25 && model.timer<=0) {
        const drop=model.drops[model.next++%model.drops.length];
        drop.x=boat.x-1.9*Math.sin(root.rotation.y); drop.z=boat.z-1.9*Math.cos(root.rotation.y);
        drop.life=1; model.timer=.12;
      }
      model.drops.forEach((drop,j)=>{
        drop.life=Math.max(0,drop.life-dt*.55);
        const size=drop.life*(2-drop.life);
        foam.setMatrixAt(j,foamMatrix.makeScale(size,1,size).setPosition(drop.x,.065,drop.z));
      });
      foam.instanceMatrix.needsUpdate=true;
    });
  }
};
const foamMatrix=new THREE.Matrix4();
