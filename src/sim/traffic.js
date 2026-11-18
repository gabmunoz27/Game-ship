// Las elipses están separadas y tienen agua profunda en todo su recorrido.
export const routes = [
  { x: -30, z: -2, rx: 18, rz: 7, rate: .19 },
  { x: 4, z: -4, rx: 9, rz: 5, rate: .22 }
];
export function trafficPoint(route, phase) {
  return { x: route.x + route.rx * Math.cos(phase), z: route.z + route.rz * Math.sin(phase) };
}
export function stepTraffic(state, dt) {
  if (state.map !== 'lochMorag' || state.intro) return;
  state.traffic ??= []; // Partidas guardadas antes de incorporar el tráfico.
  for (const [i, route] of routes.entries()) {
    const vessel = state.traffic[i] ??= { phase: i * Math.PI };
    const distance = phase => {
      const p = trafficPoint(route, phase);
      return Math.hypot(p.x - state.boat.x, p.z - state.boat.z);
    };
    const gap = distance(vessel.phase);
    let phase = vessel.phase + route.rate * dt * Math.min(1, Math.max(0, (gap - 7) / 6));
    // Si la jugadora sigue avanzando, hacer espacio sobre la misma ruta de agua segura.
    if (distance(phase) < 6.5) {
      const increment = distance(phase + .01) >= distance(phase - .01) ? .01 : -.01;
      while (distance(phase) < 6.5) phase += increment;
    }
    const point = trafficPoint(route, phase);
    vessel.speed = dt > 0 ? Math.hypot(point.x - (vessel.x ?? point.x), point.z - (vessel.z ?? point.z)) / dt : 0;
    vessel.phase = phase % (2 * Math.PI);
    Object.assign(vessel, point, { heading: Math.atan2(-route.rx * Math.sin(phase), route.rz * Math.cos(phase)) });
  }
}
