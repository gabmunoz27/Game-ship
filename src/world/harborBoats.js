import * as THREE from 'three';
import { box, cyl, mat } from './townKit.js';

export function fishingBoat(piece, i) {
  const g = new THREE.Group(), shape = new THREE.Shape();
  shape.moveTo(0, .48); shape.lineTo(.42,.28); shape.lineTo(.49,-.16);
  shape.lineTo(.31,-.44); shape.lineTo(-.26,-.44); shape.lineTo(-.48,-.17);
  shape.lineTo(-.39,.28); shape.closePath();
  const hull = new THREE.ExtrudeGeometry(shape,{depth:.22,bevelThickness:.12,bevelSize:.016,bevelSegments:1});
  hull.rotateX(-Math.PI/2); hull.scale(piece.width,1,piece.depth);
  g.add(new THREE.Mesh(hull, mat(['#584639','#435d67','#81534a'][i%3])));
  for (const z of [-.8,.55]) g.add(box(piece.width*.78,.09,.3,'#b39872',0,.36,z));
  if (piece.rig === 'queche') {
    g.scale.y = 1.8;
    g.add(box(2,.7,2.4,'#854e3d',0,.65,2.4),box(2.3,.12,2.7,'#b9a480',0,1.05,2.4));
    for (const [z,height] of [[-2,4.5],[2.4,3.2]]) {
      g.add(cyl(.055,.1,height,7,'#684634',0,height/2+.3,z));
      const boom = cyl(.14,.16,height*.65,7,'#c5ae87',0,1.45,z+height*.29);
      boom.rotation.x = Math.PI/2; g.add(boom);
    }
  } else if (i === 3) {
    g.add(cyl(.045,.075,3.3,5,'#73563a',0,1.78));
    const sail = new THREE.Shape();
    sail.moveTo(0,.65); sail.lineTo(0,3.2); sail.lineTo(1.45,.8);
    const cloth = new THREE.Mesh(new THREE.ShapeGeometry(sail), new THREE.MeshLambertMaterial({color:'#d9c8a1',side:THREE.DoubleSide}));
    cloth.name = 'vela'; cloth.rotation.y = Math.PI/2; g.add(cloth);
  } else if (i % 2 === 0) g.add(box(.1,.09,2.7,'#c1a37d',.4,.44));
  return g;
}
