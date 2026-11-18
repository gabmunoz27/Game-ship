import * as THREE from 'three';
import { box, cyl } from './townKit.js';

export function makeEwan() {
  const figure = new THREE.Group(), head = new THREE.Group(), limbs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(), arm = new THREE.Group();
    leg.position.set(side * .12, .44, 0);
    leg.add(box(.16, .4, .2, '#403f41', 0, -.2));
    arm.position.set(side * .26, .89, 0);
    arm.add(box(.13, .44, .16, '#2d4a5e', 0, -.2));
    limbs.push(leg, arm); figure.add(leg, arm);
  }
  figure.add(cyl(.23, .32, .58, 7, '#2d4a5e', 0, .68));
  figure.add(cyl(.21, .23, .12, 7, '#c29c56', 0, .98));
  head.position.y = 1.16;
  head.add(cyl(.18, .16, .31, 7, '#deb38d'), cyl(.22, .26, .13, 8, '#933e38', 0, .2, .025));
  const strap = box(.065, .59, .05, '#75513b', 0, .7, .235);
  strap.rotation.z = -.6;
  figure.add(head, strap, box(.21, .27, .31, '#926440', .26, .49));
  return { figure, head, limbs };
}
