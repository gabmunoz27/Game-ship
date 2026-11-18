// Preferencias del navegador, fuera de la partida guardada.
export const levels = { musica: .55, efectos: .75, ambiente: .7 };
for (const bus of Object.keys(levels)) {
  try {
    const raw = localStorage.getItem('lm-vol-' + bus), n = Number(raw);
    if (raw !== null && Number.isFinite(n) && n >= 0 && n <= 1) levels[bus] = n;
  } catch {}
}
export function saveLevel(bus, value) {
  levels[bus] = value;
  try { localStorage.setItem('lm-vol-' + bus, String(value)); } catch {}
}
