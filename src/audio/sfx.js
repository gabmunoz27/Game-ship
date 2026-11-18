import { on, emit } from '../core/events.js';
import { SOUNDS, VILLAGE_SOUNDS } from '../data/sounds.js';
import { soundscape } from '../sim/sound.js';
import { synthesize } from './synth.js';
import { levels } from './levels.js';

const random = (lo, hi) => lo + Math.random() * (hi - lo);
const pick = list => list[Math.floor(Math.random() * list.length)];
const cache = new Map(), buses = {}, towns = {}, beds = {};
let ac, master, filter, echo, nextMix = 0, nextBoat = 0, nextBird = 0, voices = 0;
// Prueba de sonido de la vista de desarrollador: suena por su propia salida (previewBus), sin pasar por los
// volúmenes ni por el silencio, y mientras dura se apaga todo lo demás para oírla sola.
let preview = null, previewBus, previewLoopSrc = null, previousSpeed = 0, lastFlap = -10;
const targets = new WeakMap();
function target(param, value, fade = .35) {
  if (targets.get(param) === value) return;
  targets.set(param, value);
  param.setTargetAtTime(value, ac.currentTime, fade);
}
function gain(out, level = 0) {
  const node = ac.createGain();
  node.gain.value = level;
  node.connect(out);
  return node;
}

// Una promesa por id también comparte las peticiones en curso y recuerda las ausencias.
// Los sonidos con variantes (variants: n en data/sounds.js) tienen un archivo por variante: oveja-1, oveja-2…
// Si falta la variante se usa el archivo sin número y, si tampoco está, el sintetizado.
async function load(id, n) {
  const sound = SOUNDS[id];
  // Las grabaciones incluidas van en .m4a; un .mp3 u .ogg con el mismo nombre también sirve.
  const base = sound.file.replace(/\.\w+$/, '');
  const bases = n ? [`${base}-${n}`, base] : [base];
  for (const file of bases.flatMap(b => ['.m4a', '.mp3', '.ogg'].map(ext => b + ext))) {
    try {
      const res = await fetch(import.meta.env.BASE_URL + file);
      if (res.ok && !res.headers.get('content-type')?.includes('text/html')) {
        return await ac.decodeAudioData(await res.arrayBuffer());
      }
    } catch { /* Prueba el siguiente formato o el instrumento local. */ }
  }
  return synthesize(ac, id, sound.type === 'bucle');
}
function buffer(id, n = 0) {
  const key = n ? `${id}-${n}` : id;
  if (!cache.has(key)) cache.set(key, load(id, n));
  return cache.get(key);
}
// Elige una variante al azar sin repetir la anterior (0 = el sonido no tiene variantes).
const lastVariant = {};
function nextVariant(id) {
  const count = SOUNDS[id].variants || 0;
  if (count < 2) return count;
  let n; do n = 1 + Math.floor(Math.random() * count); while (n === lastVariant[id]);
  return (lastVariant[id] = n);
}

async function play(id, level = 1, out = buses[SOUNDS[id].bus], n = nextVariant(id)) {
  if (!ac || ac.state !== 'running' || voices >= 12 || level < .012) return;
  voices++;
  const requested = ac.currentTime;
  try {
    const sample = await buffer(id, n);
    if (ac.currentTime - requested > 1 || document.hidden) { voices--; return; }
    const src = ac.createBufferSource(), envelope = gain(out);
    src.buffer = sample;
    src.playbackRate.value = random(.92, 1.08);
    const now = ac.currentTime, length = sample.duration / src.playbackRate.value;
    envelope.gain.setTargetAtTime(level * SOUNDS[id].volume * random(.83,1), now, .005);
    envelope.gain.setTargetAtTime(0, now + length * .89, Math.min(.025,length*.022));
    src.connect(envelope);
    src.onended = () => { src.disconnect(); envelope.disconnect(); voices--; };
    src.start();
  } catch (err) { voices--; console.warn('No se pudo tocar', id, err); }
}

function volumes(ctx) {
  if (!ac) return;
  target(master.gain, preview || ctx.music.isMuted() ? 0 : .8, preview ? .08 : .35);
  for (const id of ['barco','eventos']) target(buses[id].gain, levels.efectos);
  for (const id of ['ambiente','villas']) target(buses[id].gain, levels.ambiente);
}

function start(ctx, context) {
  ac = context;
  master = gain(ac.destination);
  filter = ac.createBiquadFilter();
  filter.frequency.value = 9500;
  filter.connect(master);
  for (const id of ['barco','ambiente','villas','eventos']) buses[id] = gain(filter);
  const delay = ac.createDelay();
  delay.delayTime.value = .31;
  buses.villas.connect(delay);
  buses.ambiente.connect(delay);
  echo = gain(filter);
  delay.connect(echo);
  previewBus = gain(ac.destination, 1.6);
  for (const id of Object.keys(VILLAGE_SOUNDS)) {
    const pan = ac.createStereoPanner();
    pan.connect(buses.villas);
    towns[id] = { pan, node: gain(pan), next: 0, last: null };
  }
  volumes(ctx);
  for (const [id, sound] of Object.entries(SOUNDS)) {
    if (sound.type !== 'bucle') continue;
    const village = Object.keys(towns).find(v => VILLAGE_SOUNDS[v].bed === id);
    const node = gain(village ? towns[village].node : buses[sound.bus]);
    beds[id] = node;
    buffer(id).then(sample => {
      const src = ac.createBufferSource();
      src.buffer = sample;
      src.loop = true;
      src.connect(node);
      src.start(0, random(0,sample.duration));
    });
  }
}

function previewLoop(id, token) {
  buffer(id).then(sample => {
    if (preview !== token) return;   // la prueba ya terminó o la reemplazó otra
    const src = ac.createBufferSource(), g = gain(previewBus);
    src.buffer = sample; src.loop = true; src.connect(g);
    g.gain.setTargetAtTime(SOUNDS[id].volume, ac.currentTime, .1);
    src.start(ac.currentTime, random(0, sample.duration));
    src.onended = () => { src.disconnect(); g.disconnect(); };
    previewLoopSrc = { src, g };
  });
}
function stopPreview() {
  if (previewLoopSrc) { const { src, g } = previewLoopSrc; g.gain.setTargetAtTime(0, ac.currentTime, .15); src.stop(ac.currentTime + .8); previewLoopSrc = null; }
  if (preview) { preview = null; emit('audio:duck', { on: false }); }
}

function flap() {
  if (ac && ac.currentTime - lastFlap > 1.4) { lastFlap = ac.currentTime; play('aleteo'); }
}

export default {
  id: 'sfx', label: 'Efectos y paisajes sonoros',
  init(ctx) {
    on('audio:ready', ({ ac }) => start(ctx, ac));
    on('music:muted', () => volumes(ctx));
    on('audio:volume', () => volumes(ctx));
    on('audio:preview', ({ id }) => {
      if (!ac) return;
      stopPreview();
      const village = VILLAGE_SOUNDS[id], loop = !village && SOUNDS[id].type === 'bucle';
      // Paisaje de villa: 14 s de su fondo y sus sonidos sueltos. Bucle: 8 s. Disparo: lo que dure.
      const token = preview = { id, village: village ? id : null, until: ac.currentTime + (village ? 14 : loop ? 8 : 3), next: 0, last: null };
      emit('audio:duck', { on: true });
      volumes(ctx);
      if (village) { if (village.bed) previewLoop(village.bed, token); }
      else if (loop) previewLoop(id, token);
      else {
        const n = nextVariant(id);   // cada toque de Escuchar toca otra variante
        buffer(id, n).then(sample => { if (preview === token) preview.until = ac.currentTime + sample.duration + .6; });
        play(id, 1, previewBus, n);
      }
    });
    on('intro:step', () => play('crujido', .16));
    on('intro:aboard', () => play('zarpar', .55));
    const events = { 'dock:entered':'atraque', 'dock:left':'zarpar', 'cargo:added':'carga',
      'upgrade:installed':'mejora', 'quest:completed':'encargo',
      'cargo:soaked':'mojada', 'exit:blocked':'bloqueo', notice:'aviso' };
    for (const [event,id] of Object.entries(events)) on(event, () => play(id));
    let lastCourse = -Infinity;
    on('course:set', () => {
      if (ac && ac.currentTime - lastCourse >= 1.5) { lastCourse = ac.currentTime; play('rumbo'); }
    });
    // Comercio y saldo anuncian la misma transacción en el mismo turno.
    let queued = false;
    const coins = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => { queued = false; play('monedas'); });
    };
    on('trade:done', coins);
    on('coins:changed', coins);
    on('weather:changed', flap);
  },
  update(ctx) {
    if (!ac || ac.state !== 'running' || ac.currentTime < nextMix) return;
    const now = ac.currentTime;
    nextMix = now + .18;
    const axis = ctx.camera.matrixWorld.elements;
    const mix = soundscape(ctx.state, ctx.night, ctx.wind, axis[0], axis[2]);
    if (preview && now >= preview.until) { stopPreview(); volumes(ctx); }
    if (preview?.village && now >= preview.next) {
      preview.last = pick(VILLAGE_SOUNDS[preview.village].calls.filter(call => call !== preview.last));
      play(preview.last, 1, previewBus);
      preview.next = now + random(1.6, 3.4);
    }
    target(filter.frequency, mix.cutoff);
    target(echo.gain, mix.echo);
    for (const [id,node] of Object.entries(beds)) {
      const level = mix.beds[id] ?? (.95 - .86 * mix.night);
      target(node.gain, level*SOUNDS[id].volume);
    }
    for (const [id,town] of Object.entries(towns)) {
      const local = mix.villages.find(v => v.village === id);
      const level = local?.level || 0;
      target(town.node.gain, level);
      target(town.pan.pan, local?.pan || 0);
      if (level < .025 || now < town.next) continue;
      const night = Math.random() < mix.night;
      const list = night ? ['perro','puerta'] : VILLAGE_SOUNDS[id].calls;
      town.last = pick(list.filter(call => call !== town.last));
      play(town.last, night ? .4 : 1, town.node);
      town.next = now + (night ? random(14,30) : random(2.1,5.7));
    }
    if (now > nextBoat) {
      play(Math.random() < .72 ? 'crujido' : 'polea', .55 + .45 * mix.strain);
      nextBoat = now + random(6,16)/(1 + 2*mix.strain);
    }
    if ((previousSpeed < .12 && mix.sailing >= .12) || (Math.abs(ctx.state.boat.turn) > .35 && Math.random() < .07)) flap();
    previousSpeed = mix.sailing;
    if (now > nextBird) {
      const coast = Math.max(mix.coast, ...mix.villages.map(v => v.level));
      if (ctx.state.weather === 'niebla' && Math.random() < .4) play('bruma', .6);
      else if (Math.random() < mix.night) play('buho', .6);
      else play(Math.random() < coast ? 'gaviota' : 'bosque', .55 + coast*.3);
      nextBird = now + random(5,14)*(1 + mix.night);
    }
  }
};
