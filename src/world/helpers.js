import * as THREE from 'three';
// Utilidades compartidas por los módulos visuales.
export function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
export const flat = (extra = {}) => new THREE.MeshLambertMaterial({ flatShading: true, ...extra });

const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0);
/** Muchas copias de una misma geometría en una sola llamada de dibujo. items: {x,y,z,sx,sy,sz,rot,color} */
export function instanced(geo, mat, items) {
  const mesh = new THREE.InstancedMesh(geo, mat, items.length);
  items.forEach((it, i) => {
    Q.setFromAxisAngle(UP, it.rot || 0);
    M.compose(V.set(it.x, it.y, it.z), Q, S.set(it.sx, it.sy, it.sz));
    mesh.setMatrixAt(i, M); mesh.setColorAt(i, C.set(it.color));
  });
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}
