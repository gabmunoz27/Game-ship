import { on, emit } from '../core/events.js';
import * as dev from '../sim/dev.js';
import { MAPS, mapOf } from '../maps/index.js';
import { VILLAGES } from '../data/villages.js';
import { UPGRADES } from '../data/upgrades.js';
import { WEATHER } from '../sim/weather.js';
import { SLOTS } from '../sim/time.js';
import { TIERS } from '../sim/trust.js';
import { icon } from './icons.js';
import { Vector2, Vector3, Plane, Raycaster } from 'three';
// Vista de desarrollador: un cajón para llegar a cualquier rincón del juego sin jugar hasta ahí.
// Se abre con D (o la tecla º/`), tocando el contador de monedas, o con ?dev en la dirección.
// Todo lo que hace pasa por sim/dev.js; este módulo solo dibuja botones y maneja la cámara libre.
let el, ctxRef, open = false;
const $ = s => el.querySelector(s);

function section(title, body) { return `<section><h3>${title}</h3>${body}</section>`; }
const btn = (act, label, extra = '', on = false) => `<button data-act="${act}" ${extra} class="${on ? 'on' : ''}">${label}</button>`;

function draw() {
  const s = ctxRef.state, map = mapOf(s), cam = ctxRef.cam;
  const go = dev.places().map(m => `<div class="dv-map${m.map === s.map ? ' here' : ''}"><b>${m.name}</b><div class="dv-row">${m.spots.map(p =>
    btn('go', p.village ? VILLAGES[p.village].name : p.label, `data-map="${m.map}" data-spot="${p.id}"`)).join('')}</div></div>`).join('');
  const sky = SLOTS.map((n, i) => btn('slot', n, `data-v="${i}"`, s.slot === i)).join('');
  const weather = Object.entries(WEATHER).map(([k, w]) => btn('weather', `${icon(k)}${w.name}`, `data-v="${k}"`, s.weather === k)).join('');
  const speed = [1, 3, 8].map(k => btn('speed', `×${k}`, `data-v="${k}"`, (ctxRef.timeScale || 1) === k)).join('');
  const ups = Object.entries(UPGRADES).map(([id, u]) => btn('upgrade', u.name, `data-v="${id}"`, s.boat.upgrades.includes(id))).join('');
  const trust = map.ports.map(p => { const v = s.villages[p.village];
    return `<div class="dv-trust"><span>${VILLAGES[p.village].name} <small>${v.trust}</small></span><div class="dv-row">${TIERS.map(t =>
      btn('trust', t.name.split(' ')[0], `data-village="${p.village}" data-v="${t.min}"`, v.trust >= t.min && (TIERS.find(x => x.min > t.min)?.min ?? 101) > v.trust)).join('')}</div></div>`; }).join('');
  el.querySelector('.dv-body').innerHTML =
    section('Ir a', go) +
    section('Cámara', `<div class="dv-row">${btn('overview', 'Vista general del mapa')}${btn('free', 'Cámara libre', '', cam.free)}${btn('boat', 'Volver al barco')}${btn('hud', 'Ocultar interfaz', '', document.body.classList.contains('dv-nohud'))}</div>
      <p class="dv-hint">Cámara libre: arrastra para recorrer el mapa y usa la rueda (o pellizca) para acercar. El barco no se mueve.</p>`) +
    section('Hora del día', `<div class="dv-row">${sky}</div>`) +
    section('Clima', `<div class="dv-row dv-icons">${weather}</div>`) +
    section('Velocidad del juego', `<div class="dv-row">${speed}</div>`) +
    section('Barco y bodega', `<div class="dv-row">${btn('coins', '+100 monedas')}${btn('give', '+3 suministros', 'data-v="supplies"')}${btn('give', '+3 cebada', 'data-v="barley"')}${btn('give', '+3 turba', 'data-v="peat"')}${btn('give', '+2 hierro', 'data-v="iron" data-q="2"')}${btn('soak', 'Mojar la carga')}${btn('empty', 'Vaciar bodega')}</div>
      <div class="dv-row">${ups}</div>`) +
    section(`Confianza en ${map.name}`, trust || '<p class="dv-hint">Este mapa no tiene villas.</p>') +
    section('Música', `<p class="dv-hint">${ctxRef.music ? (ctxRef.music.info.title ? `♪ ${ctxRef.music.info.title} · ${ctxRef.music.info.source === 'mp3' ? 'MP3' : 'boceto en código (falta el MP3)'}` : ctxRef.music.info.status) : ''}</p>
      <div class="dv-row">${btn('music-next', 'Tocar otra pieza ahora')}${btn('music-mute', ctxRef.music && ctxRef.music.isMuted() ? 'Activar música' : 'Silenciar música')}</div>`) +
    section('Ver eventos', `<div class="dv-row">${btn('label', 'Rótulo de llegada')}${btn('act', 'Cierre del Acto I')}${btn('cross', 'Cruzar de mapa (telón)')}${btn('pickup', 'Aviso de objeto')}${btn('modules', 'Estado de módulos (M)')}</div>`) +
    `<p class="dv-state">${map.name} · Día ${s.day} · ${SLOTS[s.slot]} · ${WEATHER[s.weather].name} · barco en (${s.boat.x.toFixed(0)}, ${s.boat.z.toFixed(0)}) · ${s.coins} monedas</p>`;
}

function act(a, d) {
  const s = ctxRef.state, cam = ctxRef.cam, map = mapOf(s);
  switch (a) {
    case 'go': cam.free = false; dev.goTo(s, d.map, d.spot); ctxRef.snapCamera = true; break;
    case 'overview': cam.free = true; cam.max = 300; cam.target.set(0, 0, 0); cam.h = Math.min(300, map.size.d * .95); cam.apply(); break;
    case 'free': cam.free = !cam.free; if (cam.free) { cam.max = 300; cam.target.set(s.boat.x, 0, s.boat.z); } break;
    case 'boat': cam.free = false; cam.max = 95; cam.h = 72; cam.apply(); break;
    case 'hud': document.body.classList.toggle('dv-nohud'); break;
    case 'slot': dev.setSlot(s, +d.v); break;
    case 'weather': dev.setWeather(s, d.v); break;
    case 'speed': ctxRef.timeScale = +d.v; break;
    case 'coins': dev.addCoins(s, 100); break;
    case 'give': dev.give(s, d.v, +(d.q || 3)); break;
    case 'soak': if (!dev.soak(s).length) emit('notice', { text: 'No hay carga delicada para mojar: dale cebada primero' }); break;
    case 'empty': dev.emptyHold(s); break;
    case 'upgrade': dev.toggleUpgrade(s, d.v); break;
    case 'trust': dev.setTrust(s, d.village, +d.v); break;
    case 'label': { const p = map.ports[0]; if (!p) return emit('notice', { text: 'Este mapa no tiene villas' });
      emit('port:near', { villageId: null }); setTimeout(() => emit('port:near', { villageId: p.village }), 60); break; }
    case 'act': emit('act:completed', { act: 1, dev: true }); break;
    case 'cross': { const e = map.exits[0]; if (e.requires && !s.boat.upgrades.includes(e.requires)) dev.toggleUpgrade(s, e.requires);
      s.docked = null; emit('travel:request', { exit: e.id }); toggle(false); break; }
    case 'pickup': emit('item:gained', { item: 'shortcut_map' }); break;
    case 'music-next': emit('music:next'); break;
    case 'music-mute': emit('music:mute'); break;
    case 'modules': dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); break;
  }
  if (open) draw();
}

function toggle(force) { open = force ?? !open; el.hidden = !open; if (open) draw(); }

/** Cámara libre: arrastrar mueve la cámara (no el barco) y dos dedos acercan o alejan. */
function freeCamera(ctx) {
  const canvas = ctx.canvas, ray = new Raycaster(), plane = new Plane(new Vector3(0, 1, 0), 0), hit = new Vector3(), ndc = new Vector2();
  const ground = (x, y) => { const r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, ctx.camera); return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; };
  const pts = new Map(); let start = null, pinch = 0;
  canvas.addEventListener('pointerdown', e => {
    if (!ctx.cam.free) return;
    e.stopImmediatePropagation(); canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    start = ground(e.clientX, e.clientY);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
  }, true);
  canvas.addEventListener('pointermove', e => {
    if (!ctx.cam.free || !pts.has(e.pointerId)) return;
    e.stopImmediatePropagation(); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) { ctx.cam.h = Math.max(ctx.cam.min, Math.min(ctx.cam.max, ctx.cam.h * pinch / d)); ctx.cam.apply(); } pinch = d; return; }
    const now = ground(e.clientX, e.clientY); if (!start || !now) return;
    ctx.cam.target.x += start.x - now.x; ctx.cam.target.z += start.z - now.z;
  }, true);
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (!pts.size) start = null; };
  canvas.addEventListener('pointerup', up, true); canvas.addEventListener('pointercancel', up, true);
}

export default {
  id: 'devPanel', label: 'Vista de desarrollador',
  init(ctx) {
    ctxRef = ctx;
    el = document.createElement('aside'); el.className = 'dev-panel'; el.hidden = true;
    el.innerHTML = `<header><b>Vista de desarrollador</b><button data-close aria-label="Cerrar">×</button></header>
      <p class="dv-hint">D (o º) abre y cierra · en el celular, toca las monedas</p><div class="dv-body"></div>`;
    document.getElementById('app').append(el);
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-close')) return toggle(false); if (b.dataset.act) act(b.dataset.act, b.dataset); });
    addEventListener('keydown', e => { if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
      if (['d', 'º', '`'].includes(e.key.toLowerCase())) toggle(); if (e.key === 'Escape' && open) toggle(false); });
    // Tocar (o hacer clic en) el contador de monedas abre y cierra el panel. Mantener apretado no sirve en iOS: sale la lupa.
    const coins = ctx.ui.top.querySelector('.coins');
    if (coins) { coins.classList.add('dv-trigger'); coins.setAttribute('role', 'button'); coins.setAttribute('aria-label', 'Abrir la vista de desarrollador'); coins.addEventListener('click', () => toggle()); }
    freeCamera(ctx);
    ['map:changed', 'time:changed', 'weather:changed', 'trust:changed', 'cargo:changed', 'upgrade:installed', 'music:started', 'music:muted'].forEach(ev => on(ev, () => { if (open) draw(); }));
    if (new URLSearchParams(location.search).has('dev')) toggle(true);
  },
  update(ctx) { if (open && ctx.time % 1 < .02) { const p = $('.dv-state'); if (p) draw(); } }
};
