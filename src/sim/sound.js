import { mapOf } from '../maps/index.js';
import { MAP_SOUNDS } from '../data/sounds.js';

const unit = n => Math.max(0, Math.min(1, n));

export function soundscape(state, night = 0, wind = 1, rightX = 1, rightZ = 0) {
  const map = mapOf(state), profile = MAP_SOUNDS[map.id] || MAP_SOUNDS.lochMorag;
  const { x, z, speed, turn } = state.boat;
  const sailing = unit(speed / 9), coast = unit(1 + map.shoreDist(x, z) / 30);
  const rain = Number(state.weather === 'lluvia');
  const villages = map.ports.map(({ village, dock }) => {
    const dx = dock[0] - x, dz = dock[1] - z, distance = Math.hypot(dx, dz);
    return { village, level: unit(1 - distance / 50) ** 2,
      pan: Math.max(-1, Math.min(1, (dx * rightX + dz * rightZ) / Math.max(8, distance))) };
  });
  return { villages, coast, night, sailing, strain: unit((Math.abs(turn || 0) + (wind - 1) * .4)),
    echo: profile.echo, cutoff: state.weather === 'niebla' ? 1050 : 9500,
    beds: { casco: .24 + .76 * sailing, lona: sailing * sailing, orilla: .23 + .77 * coast,
      viento: unit(.24 * wind * profile.wind), lluvia: rain, cubierta: rain, grillos: night * (.35 + .65 * coast) * (1 - .8 * rain) } };
}
