import { on, emit } from '../core/events.js';
import { pickNext, gapSeconds } from '../sim/music.js';
import { playSketch } from './sketch.js';
// Reproductor de música. Elige pieza con sim/music.js, la toca, deja un silencio y elige otra.
// Al cambiar de mapa funde la pieza que suena y, tras una pausa corta, entra la del mapa nuevo.
// El navegador no deja sonar nada hasta el primer toque o tecla: ahí arranca.
// Si falta el MP3 de una pieza, toca su boceto hecho en código (audio/sketch.js).
const VOLUME = .55, FADE = 3;
let ac, master, current = null, history = [], timer = 0, started = false, muted = false;
const info = { title: null, status: 'esperando el primer toque', source: null };
const missing = new Set();
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

// Los MP3 se descargan y decodifican con Web Audio (no con <audio>): así suenan también en iPhone,
// que bloquea los <audio> que arrancan sin un toque. Lo decodificado se guarda para no bajarlo dos veces.
const decoded = new Map();
async function playFile(track) {
  if (missing.has(track.id)) throw new Error('falta');
  let buffer = decoded.get(track.id);
  if (!buffer) {
    const res = await fetch(import.meta.env.BASE_URL + track.file).catch(() => null);
    if (!res || !res.ok) { missing.add(track.id); throw new Error('falta'); }
    buffer = await ac.decodeAudioData(await res.arrayBuffer()); decoded.set(track.id, buffer);
  }
  const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = buffer; g.gain.value = 0; src.connect(g).connect(master);
  const now = ac.currentTime; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(1, now + 2); src.start(now);
  return { duration: buffer.duration,
    stop(fade = FADE) { const t = ac.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + fade);
      setTimeout(() => { try { src.stop(); } catch (e) {} src.disconnect(); }, fade * 1000 + 100); } };
}

async function playNext(state) {
  clearTimeout(timer);
  const track = pickNext(state, history); if (!track) { info.title = null; info.status = 'este mapa no tiene música'; return; }
  history.push(track.id); if (history.length > 12) history.shift();
  let handle;
  try { handle = await playFile(track); info.source = 'mp3'; }
  catch (e) { handle = playSketch(ac, master, track); info.source = 'boceto'; }
  current = { track, handle };
  info.title = track.title; info.status = 'sonando';
  emit('music:started', { id: track.id, title: track.title, source: info.source });
  timer = setTimeout(() => rest(state), handle.duration * 1000);
}
function rest(state) {
  current = null; const gap = gapSeconds();
  info.title = null; info.status = `silencio (${Math.round(gap)} s)`;
  timer = setTimeout(() => playNext(state), gap * 1000);
}
function fadeOutAndWait(state, wait) {
  clearTimeout(timer); if (current) { current.handle.stop(FADE); current = null; }
  info.title = null; info.status = 'cambiando de mapa';
  timer = setTimeout(() => playNext(state), (FADE + wait) * 1000);
}
const applyVolume = () => { if (master) master.gain.setTargetAtTime(muted ? 0 : VOLUME, ac.currentTime, .3); };

export default {
  id: 'music', label: 'Música',
  init(ctx) {
    muted = store.get('lm-music-muted') === '1';
    const start = () => {
      if (started) return; started = true;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { info.status = 'este navegador no tiene audio'; return; }
      ac = new AC(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination); applyVolume();
      ac.resume(); info.status = 'empieza en un momento';
      timer = setTimeout(() => playNext(ctx.state), 2500);
    };
    addEventListener('pointerdown', start, { capture: true }); addEventListener('keydown', start, { capture: true });
    document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : ac.resume(); });
    on('map:changed', () => { if (started && ac) fadeOutAndWait(ctx.state, 2); });
    on('music:next', () => { if (!started) return; if (current) { current.handle.stop(1.5); current = null; } clearTimeout(timer); timer = setTimeout(() => playNext(ctx.state), 1700); });
    on('music:mute', ({ value } = {}) => { muted = value ?? !muted; store.set('lm-music-muted', muted ? '1' : '0'); applyVolume(); emit('music:muted', { muted }); });
    ctx.music = { info, isMuted: () => muted };
  }
};
