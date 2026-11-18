import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mapOf } from '../maps/index.js';
import { fishingBoat } from './harborBoats.js';
import { anchorMonument, buildStreets, portHouses } from './portStreets.js';
import { person, placePeople, animatePeople, house, lampPost, lightUp, mat, box, cyl, townFrame } from './townKit.js';

let moored = [], workers = [], deckPoint;
// Se agrupan las piezas inmóviles por material para dibujar el pueblo en pocas llamadas.
function batch(group) {
  group.updateMatrixWorld(true);
  const materials = new Map();
  group.traverse(o => {
    if (!o.isMesh) return;
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld);
    if (!materials.has(o.material)) materials.set(o.material, []);
    materials.get(o.material).push(geo);
  });
  group.clear();
  for (const [material, geometries] of materials) {
    const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
    mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
  }
}
export default {
  id: 'portDun', label: 'Puerto pesquero de Port Dun',
  build(ctx) {
    moored = []; workers = [];
    const map = mapOf(ctx.state), port = map.portOf('portDun');
    if (!port) return;
    const P = townFrame(map,port), town = new THREE.Group();
    const angle = -Math.atan2(port.t[1],port.t[0]);
    function place(mesh,u,v,y) {
      const [x,h,z] = P(u,v);
      mesh.position.set(x,y ?? h,z); mesh.rotation.y = angle; town.add(mesh);
      return mesh;
    }
    const cottages = portHouses();
    for (let row=0; row<3; row++) for (let j=0; j<7; j++) {
      const u=j===4 ? (row%2 ? 2.6 : -5.1) : -31+j*7.2+(row%2)*2, v=7+row*7+Math.sin(j)*.8;
      const h=place(cottages[(row+j)%cottages.length].clone(),u,v);
      h.rotation.y += Math.sin(j*4+row)*.14;
      // Un zócalo ancla las casas en la pendiente.
      place(box(3.5,1.6,3,'#928a78'),u,v,h.position.y-.75).rotation.y=h.rotation.y;
    }
    for (let j=0; j<29; j++) {
      const v=j*.86;
      place(box(1.35,.28,1.05,'#ae926d'),-20,v,P(-20,v)[1]-.06);
    }
    buildStreets(place, P);
    place(anchorMonument(), -.4, 4);
    place(house(5.3,3,2.4,'#48545b','#998470'),-9,3.2);
    for(let j=0;j<7;j++) {
      const u=-14+j*.83;
      place(j%3 ? box(.68,.68,.64,'#a98155') : cyl(.34,.31,.8,8,'#7d563d'),u,1.25,1.05);
    }
    // Una red tendida entre dos postes junto al almacén.
    for(const u of [-15,-11]) place(cyl(.06,.09,2,6,'#614c37'),u,2,1.6);
    for(let j=0;j<=12;j++) place(box(.035,1,.035,'#675a48'),-15+j/3,2,1.85);
    for(let j=0;j<=4;j++) place(box(4,.035,.035,'#675a48'),-13,2,1.35+j*.25);
    for(const u of [-32,-19,-5,1]) place(lampPost(),u,.45,.73);
    deckPoint = (u,v) => {
      return [port.shore[0]+port.t[0]*u+port.n[0]*v,.78,port.shore[1]+port.t[1]*u+port.n[1]*v];
    };
    const piers = port.waterfront.filter(piece => piece.kind === 'pier');
    for (let i=0; i<5; i++) {
      const pier = piers[i % piers.length], lane = (i%2 ? -.24 : .24);
      const worker = person(['#506b66','#805648','#505c70'][i%3], 'hat');
      const load = i%2 ? cyl(.24,.23,.46,8,'#866443',.12,.81,.25) : box(.49,.4,.43,'#ab8259',0,.77,.28);
      worker.add(load); ctx.world.add(worker);
      workers.push({ m:worker, load, day:true, speed:1.1+i*.05, phase:i*1.4,
        route:[[-9+i*.3,.2+lane],[pier.u+lane,.2+lane],[pier.u+lane,pier.v-pier.depth*.35]] });
    }
    placePeople(workers, deckPoint);
    for (const piece of port.waterfront) {
      const {u,v,width,depth,kind} = piece;
      if (kind === 'boat') {
        const boat = fishingBoat(piece,moored.length);
        const [x,,z] = P(u,v); boat.position.set(x,.07,z); boat.rotation.y=angle; ctx.world.add(boat);
        const ropeEnd = new THREE.Vector3(...P(u-piece.side*(width/2+.44),v-depth*.33));
        ropeEnd.y=.78;
        const ropeStart = new THREE.Vector3(...P(u-piece.side*width*.42,v-depth*.33)); ropeStart.y=.39;
        const cord = new THREE.Line(new THREE.BufferGeometry().setFromPoints([ropeStart,ropeEnd]),new THREE.LineBasicMaterial({color:'#b39872'}));
        ctx.world.add(cord);
        place(cyl(.09,.11,2.2,6,'#604935'),u-piece.side*(width/2+.44),v-depth*.33,-.28);
        moored.push(boat); continue;
      }
      place(box(width,.22,depth,'#89694c'),u,v,.59);
      const along = kind === 'walkway', count = Math.ceil((along?width:depth)/.48);
      for(let j=0;j<count;j++) {
        const k=(j+.5)/count-.5;
        place(box(along?width/count-.025:width,.08,along?depth:depth/count-.025,j%4?'#ac875d':'#97744f'),
          u+(along?k*width:0),v+(along?0:k*depth),.73);
      }
      for(const x of [-1,1]) for(const z of [-1,1]) place(cyl(.13,.15,3,6,'#584334'),u+x*(width/2-.15),v+z*(depth/2-.15),-.56);
    }
    batch(town); ctx.world.add(town);
  },
  update(ctx) {
    lightUp(ctx.night);
    animatePeople(workers, deckPoint, ctx.time, ctx.night);
    moored.forEach((g,i) => {
      const phase=ctx.time*1.35+i*1.7;
      g.position.y=.08+.055*Math.sin(phase);
      g.rotation.x=.025*Math.sin(phase*.93); g.rotation.z=.045*Math.cos(phase);
    });
  }
};
