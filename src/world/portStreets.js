import * as THREE from 'three';
import { box, cyl, mat, house } from './townKit.js';
import { seeded } from './helpers.js';

export function portHouses() {
  const stone = house(3.5,3,2.3,'#525d65','#bbb6a3');
  const brick = house(3.5,3,2.4,'#525d65','#a36650');
  const tall = house(3.5,3,4.2,'#756955','#b3ad98');
  const terrace = house(3.5,3,4.1,'#525d65','#985f4d');
  for (const h of [brick,terrace]) {
    for (let y=.26;y<(h===brick?2.4:4.1);y+=.32) h.add(box(3.51,.023,3.01,'#b8856d',0,y));
  }
  tall.add(box(2.6,.14,.85,'#70523d',0,2.05,1.85),box(2.6,.1,.09,'#70523d',0,2.65,2.22));
  for (const x of [-1.22,-.62,0,.62,1.22]) tall.add(box(.07,.55,.07,'#70523d',x,2.35,2.22));
  return [stone,terrace,brick,stone,tall];
}
export function buildStreets(place,P) {
  const random = seeded(53), tones = ['#8c8980','#a09a90','#787a73'];
  function stone(u,v) {
    const p = place(cyl(.45,.49,.24,6,tones[Math.floor(random()*3)]),u,v,P(u,v)[1]+.045);
    p.scale.z = .84; p.rotation.y += random()*.4;
  }
  for (let row=0; row<35; row++) {
    const v=.8+row*.67;
    const center=-3+Math.min(v/4,1)*2;
    const span = row>=3 && row<=7 ? 4 : 1;
    for (let j=-span;j<=span;j++) stone(center+j*.8+(row%2)*.2,v);
  }
}
export function anchorMonument() {
  const g = new THREE.Group(), iron='#344044';
  g.add(cyl(1,1.25,.36,8,'#817f75',0,.18),box(1.55,.85,1.4,'#a4a093',0,.76),
    box(.72,.25,.04,'#b79b65',0,.78,.72),box(.23,2.6,.23,iron,0,2.45),
    box(1.45,.17,.2,iron,0,3.22));
  for(const side of [-1,1]) {
    const arm=box(.22,1.35,.23,iron,side*.54,1.77);
    arm.rotation.z=-side*.96;
    g.add(arm,cyl(0,.28,.68,3,iron,side*1.06,2.34));
  }
  const eye=new THREE.Mesh(new THREE.TorusGeometry(.27,.085,5,12),mat(iron));
  eye.position.y=3.94; g.add(eye); return g;
}
