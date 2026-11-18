import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { on, emit, clear } from '../src/core/events.js';
import { createState } from '../src/core/state.js';
import { GOODS } from '../src/data/goods.js';
import { ITEMS } from '../src/data/items.js';
import { VILLAGES } from '../src/data/villages.js';
import { UPGRADES } from '../src/data/upgrades.js';
import { QUESTS } from '../src/data/quests.js';
import { MAPS, getMap } from '../src/maps/index.js';
import * as pathfind from '../src/sim/pathfind.js';
import * as travel from '../src/sim/travel.js';
const lake = getMap('lochMorag'), kyle = getMap('kyle');
const map = { ...lake, PORTS: lake.ports, EXIT: lake.exitOf('pasoPiedras') };
import * as time from '../src/sim/time.js';
import * as cargo from '../src/sim/cargo.js';
import * as trade from '../src/sim/trade.js';
import * as trust from '../src/sim/trust.js';
import * as nav from '../src/sim/navigation.js';
import * as voyage from '../src/sim/voyage.js';
import * as quests from '../src/sim/quests.js';
import * as upgrades from '../src/sim/upgrades.js';
import * as acts from '../src/sim/acts.js';
import * as weather from '../src/sim/weather.js';
import * as dev from '../src/sim/dev.js';
import { soundscape } from '../src/sim/sound.js';
import { SOUNDS, VILLAGE_SOUNDS } from '../src/data/sounds.js';
import { synthesize } from '../src/audio/synth.js';
import * as music from '../src/sim/music.js';
import { TRACKS } from '../src/data/music.js';

const fresh = () => { clear(); return createState(); };
const at = (s, id) => { s.docked = s.lastPort = id; return s; };
const moveTo = (s, x, z) => { s.boat.x = x; s.boat.z = z; };

export const suites = {
  'sonido': [
    ['la escucha de prueba acepta sonidos y villas y acota los volúmenes', () => {
      fresh();
      const heard = [], levels = [];
      on('audio:preview', ({ id }) => heard.push(id));
      on('audio:volume', p => levels.push(p));
      for (const id of ['fuelle', 'achnacarn', 'desconocido']) dev.previewSound(id);
      dev.setAudioVolume('efectos', 2);
      dev.setAudioVolume('ambiente', 0);
      dev.setAudioVolume('musica', NaN);
      assert.deepEqual(heard, ['fuelle', 'achnacarn']);
      assert.deepEqual(levels, [{ bus: 'efectos', value: 1 }, { bus: 'ambiente', value: 0 }]);
    }],
    ['cada receta produce muestras finitas y audibles', () => {
      const context = { createBuffer(_, length) { const data = new Float32Array(length); return { getChannelData: () => data }; } };
      for (const [id, s] of Object.entries(SOUNDS)) {
        const samples = synthesize(context, id, s.type === 'bucle').getChannelData(0);
        assert.ok(samples.every(Number.isFinite) && samples.some(n => n > .025), id);
      }
      for (const p of Object.values(VILLAGE_SOUNDS)) for (const id of [...p.calls, p.bed].filter(Boolean)) assert.ok(SOUNDS[id], id);
    }],
    ['cada variante declarada tiene su grabación en public/sfx/', () => {
      for (const [id, s] of Object.entries(SOUNDS)) for (let n = 1; n <= (s.variants || 0); n++) {
        const base = new URL(`../public/${s.file.replace(/\.\w+$/, '')}-${n}`, import.meta.url).pathname;
        assert.ok(['.m4a', '.mp3', '.ogg'].some(ext => existsSync(decodeURIComponent(base) + ext)), `${id}-${n}`);
      }
    }],
    ['el muelle se acerca en estéreo y desaparece a distancia', () => {
      const s = fresh(), [x,z] = lake.ports[0].dock;
      moveTo(s,x-10,z); const left = soundscape(s).villages[0];
      moveTo(s,x+10,z); assert.equal(soundscape(s).villages[0].pan, -left.pan);
      moveTo(s,x,z); assert.equal(soundscape(s).villages[0].level,1);
      moveTo(s,x+60,z); assert.equal(soundscape(s).villages[0].level,0);
    }],
    ['el barco, la noche, el canal y el clima cambian la mezcla', () => {
      const s = fresh(), calm = soundscape(s);
      s.map = 'kyle'; s.weather = 'lluvia'; s.boat.speed = 9;
      const storm = soundscape(s,1,2);
      for (const id of ['lona','casco','lluvia','cubierta','grillos','viento']) assert.ok(storm.beds[id] > calm.beds[id],id);
      assert.ok(storm.echo > calm.echo);
      s.weather = 'niebla'; assert.ok(soundscape(s).cutoff < calm.cutoff);
    }]
  ],
  'core/events': [
    ['entrega el evento', () => { clear(); let got; on('x', p => { got = p; }); emit('x', 7); assert.equal(got, 7); }],
    ['un oyente roto no frena a los demás', () => { clear(); let ok = false; const err = console.error; console.error = () => {};
      on('x', () => { throw new Error('roto'); }); on('x', () => { ok = true; }); emit('x'); console.error = err; assert.ok(ok); }]
  ],
  'core/state': [
    ['se puede guardar como JSON sin perder nada', () => { const s = fresh(); assert.deepEqual(JSON.parse(JSON.stringify(s)), s); }],
    ['arranca como dice el parche: 60 monedas, 2 suministros, 8 espacios libres', () => { const s = fresh(); assert.equal(s.coins, 60); assert.equal(cargo.count(s, 'supplies'), 2); assert.equal(cargo.free(s), 8); }],
    ['Confianza inicial 10 en Port Dun y 0 en Glenmore', () => { const s = fresh(); assert.deepEqual([s.villages.portDun.trust, s.villages.glenmore.trust], [10, 0]); }],
    ['el barco empieza en agua navegable', () => { const s = fresh(); assert.ok(map.navigable(s.boat.x, s.boat.z)); }]
  ],
  'data': [
    ['toda mercancía que produce o necesita una villa existe', () => { for (const v of Object.values(VILLAGES)) for (const g of [...v.produces, ...v.needs]) assert.ok(GOODS[g], g); }],
    ['todo lo que una villa necesita lo produce otra (y en el Acto I, con bienes del Acto I)', () => { const made = Object.values(VILLAGES).flatMap(v => v.produces);
      for (const v of Object.values(VILLAGES)) for (const g of v.needs) { assert.ok(made.includes(g), g); if (v.map === 'lochMorag') assert.equal(GOODS[g].act, 1, g); } }],
    ['cada villa está en el muelle de su mapa', () => { for (const [id, v] of Object.entries(VILLAGES)) assert.ok(getMap(v.map) && getMap(v.map).portOf(id), id); }],
    ['cada mejora del Acto II que tiene astillero apunta a una villa que existe', () => { for (const u of Object.values(UPGRADES)) if (u.at) assert.ok(VILLAGES[u.at], u.name); }],
    ['materiales y objetos de las mejoras existen', () => { for (const u of Object.values(UPGRADES)) { for (const g of Object.keys(u.goods || {})) assert.ok(GOODS[g], g); for (const i of u.items || []) assert.ok(ITEMS[i], i); } }],
    ['el Casco Reforzado se puede reunir sin salir del mapa', () => { const u = UPGRADES.reinforced_hull, made = Object.values(VILLAGES).flatMap(v => v.produces), given = Object.values(QUESTS).flatMap(q => q.rewards);
      for (const g of Object.keys(u.goods)) assert.ok(made.includes(g), g); for (const i of u.items) assert.ok(given.includes(i), i); }],
    ['los objetos de los encargos existen', () => { for (const q of Object.values(QUESTS)) for (const i of [...q.gives, ...q.rewards]) assert.ok(ITEMS[i], i); }],
    ['cada villa del mapa tiene sus datos', () => { for (const p of map.PORTS) assert.ok(VILLAGES[p.village], p.village); }]
  ],
  'maps (todos)': [
    ['cada mapa tiene nombre, tamaño, forma y al menos una llegada', () => { for (const m of Object.values(MAPS)) { assert.ok(m.name && m.size && m.shoreDist, m.id); assert.ok(Object.keys(m.spawns).length, m.id); } }],
    ['cada llegada está en agua navegable y fuera de toda salida', () => { for (const m of Object.values(MAPS)) for (const [k, sp] of Object.entries(m.spawns)) {
      assert.ok(m.navigable(sp.x, sp.z), `${m.id}/${k}`); for (const e of m.exits) assert.ok(Math.hypot(e.x - sp.x, e.z - sp.z) > e.radius + 4, `${m.id}/${k} cae dentro de ${e.id}`); } }],
    ['cada salida está en el agua y lleva a una llegada que existe', () => { for (const m of Object.values(MAPS)) for (const e of m.exits) {
      assert.ok(m.navigable(e.x, e.z), `${m.id}/${e.id}`); assert.ok(getMap(e.to) && getMap(e.to).spawns[e.spawn], `${m.id}/${e.id} → ${e.to}/${e.spawn}`); } }],
    ['cada muelle está en agua navegable y su villa tiene datos', () => { for (const m of Object.values(MAPS)) for (const p of m.ports) { assert.ok(VILLAGES[p.village], p.village); assert.ok(m.navigable(...p.dock), `${m.id}/${p.village}`); } }],
    ['los bordes de cada mapa son tierra', () => { for (const m of Object.values(MAPS)) { const W = m.size.w / 2 - 2, D = m.size.d / 2 - 2;
      for (const [x, z] of [[W, 0], [-W, 0], [0, D], [0, -D]]) assert.ok(!m.navigable(x, z), `${m.id} (${x}, ${z})`); } }],
    ['desde cada llegada se puede ir por agua a cada muelle y a cada salida', () => { for (const m of Object.values(MAPS)) for (const sp of Object.values(m.spawns))
      for (const [x, z] of [...m.ports.map(p => p.dock), ...m.exits.map(e => [e.x, e.z])]) assert.ok(pathfind.findPath(m, [sp.x, sp.z], [x, z]), `${m.id} → (${x.toFixed(0)}, ${z.toFixed(0)})`); }]
  ],
  'maps/lochMorag': [
    ['el centro del lago es navegable', () => map.navigable(0, 0)],
    ['los bordes del mapa son tierra', () => !map.navigable(map.SIZE.w / 2 - 2, 0) && !map.navigable(0, map.SIZE.d / 2 - 2)],
    ['la punta de cada muelle está en agua navegable', () => { for (const p of map.PORTS) assert.ok(map.navigable(p.dock[0], p.dock[1]), p.village); }],
    ['el Paso de las Piedras está en agua navegable', () => map.navigable(map.EXIT.x, map.EXIT.z)]
  ],
  'sim/time': [
    ['tres franjas hacen un día', () => { const s = fresh(); time.advance(s, 3); assert.deepEqual([s.day, s.slot], [2, 0]); }],
    ['la fase crece 1 por franja', () => { const s = fresh(); const p0 = time.phaseOf(s); time.advance(s, 1); assert.equal(time.phaseOf(s), p0 + 1); }],
    ['la mezcla de luz sabe entre qué franjas está', () => { assert.deepEqual(time.blend(3.5), { from: 0, to: 1, t: .5 }); const b = time.blend(5.25); assert.deepEqual([b.from, b.to, b.t], [2, 0, .25]); }],
    ['pasar la noche lleva a la mañana siguiente', () => { const s = fresh(); time.advance(s, 1); time.sleepUntilMorning(s); assert.deepEqual([s.day, s.slot], [2, 0]); }]
  ],
  'sim/cargo': [
    ['la turba ocupa 2 espacios', () => { const s = fresh(); cargo.add(s, 'peat', 2); assert.equal(cargo.used(s), 6); }],
    ['no deja pasar de la capacidad', () => { const s = fresh(); assert.equal(cargo.add(s, 'peat', 5), false); assert.ok(cargo.add(s, 'peat', 4)); assert.equal(cargo.free(s), 0); }],
    ['avisa qué se cargó y cuánto', () => { const s = fresh(); let got; on('cargo:added', p => { got = p; }); cargo.add(s, 'fish', 2); assert.deepEqual(got, { good: 'fish', qty: 2 }); }],
    ['no deja sacar lo que no hay', () => { const s = fresh(); assert.equal(cargo.remove(s, 'fish'), false); }]
  ],
  'sim/trade': [
    ['precios de compra de la tabla del parche', () => { const s = fresh();
      assert.deepEqual(['fish', 'salt', 'resin', 'supplies'].map(g => trade.buyPrice(s, 'portDun', g)), [7, 8, 10, 6]);
      assert.deepEqual(['peat', 'oak_wood', 'supplies'].map(g => trade.buyPrice(s, 'glenmore', g)), [10, 11, 6]); }],
    ['precios de venta de la tabla del parche', () => { const s = fresh();
      assert.deepEqual(['fish', 'salt'].map(g => trade.sellPrice(s, 'glenmore', g)), [14, 17]);
      assert.deepEqual(['peat', 'oak_wood'].map(g => trade.sellPrice(s, 'portDun', g)), [20, 22]); }],
    ['los suministros no se venden', () => { const s = fresh(); assert.equal(trade.sell(s, 'glenmore', 'supplies').reason, 'no-comercializable'); assert.equal(cargo.count(s, 'supplies'), 2); }],
    ['comprar cobra y carga', () => { const s = fresh(); const r = trade.buy(s, 'portDun', 'fish'); assert.ok(r.ok); assert.equal(s.coins, 53); assert.equal(cargo.count(s, 'fish'), 1); }],
    ['no vende lo que la villa no produce', () => { const s = fresh(); assert.equal(trade.buy(s, 'portDun', 'peat').ok, false); }],
    ['vender un bien demandado da +2 de Confianza por unidad', () => { const s = fresh(); s.hold.items = { fish: 3 }; for (let i = 0; i < 3; i++) trade.sell(s, 'glenmore', 'fish'); assert.equal(s.villages.glenmore.trust, 6); }],
    ['vender algo que no necesitan no da Confianza', () => { const s = fresh(); s.hold.items = { resin: 1 }; trade.sell(s, 'glenmore', 'resin'); assert.equal(s.villages.glenmore.trust, 0); }],
    ['un Aliado compra con 10 % de descuento', () => { const s = fresh(); s.villages.portDun.trust = 50; assert.equal(trade.buyPrice(s, 'portDun', 'resin'), 9); }]
  ],
  'sim/trust': [
    ['niveles según los umbrales del parche', () => { const s = fresh(); const name = n => { s.villages.portDun.trust = n; return trust.tierOf(s, 'portDun').id; };
      assert.deepEqual([0, 19, 20, 49, 50, 79, 80, 100].map(name), ['forastero', 'forastero', 'conocido', 'conocido', 'aliado', 'aliado', 'patron', 'patron']); }],
    ['se queda entre 0 y 100', () => { const s = fresh(); trust.add(s, 'glenmore', -5); assert.equal(s.villages.glenmore.trust, 0); trust.add(s, 'glenmore', 500); assert.equal(s.villages.glenmore.trust, 100); }]
  ],
  'sim/navigation': [
    ['los cuatro muelles obligan a rodear la punta y permiten atracar por el costado', () => {
      for (const m of Object.values(MAPS)) for (const p of m.ports) {
        const s = fresh(); s.map = m.id;
        const side = t => p.shore.map((v, i) => v - 10 * p.n[i] + t * p.t[i]);
        const from = side(-8), to = side(8);
        assert.ok(!m.navigable(...side(.9)), p.village);
        assert.ok(!pathfind.clearLine(m, ...from, ...to), p.village);
        moveTo(s, ...from); s.boat.heading = Math.atan2(p.t[1], p.t[0]);
        const route = nav.plotCourse(s, ...to);
        assert.ok(route.ok && route.path.length > 1, p.village);
        let previous = from;
        for (const point of route.path) {
          assert.ok(pathfind.clearLine(m, ...previous, ...point), p.village);
          previous = point;
        }
        for (let i = 0; i < 1200; i++) {
          const { x, z } = s.boat; nav.step(s, 1 / 60);
          assert.ok(m.pierClear(x, z, s.boat.x, s.boat.z), p.village);
        }
        assert.equal(s.boat.course, null);
        assert.ok(Math.hypot(s.boat.x - to[0], s.boat.z - to[1]) < 4);
        assert.equal(s.nearPort, p.village);
        // Incluso sin ruta, la inercia no puede saltar de un lado al otro en un paso.
        moveTo(s, ...from); s.boat.heading = Math.atan2(p.t[1], p.t[0]); s.boat.speed = 90;
        nav.step(s, .4);
        assert.ok(m.pierClear(...from, s.boat.x, s.boat.z));
      }
    }],
    ['la llegada tiene histéresis y el atraque conserva su alcance', () => {
      const s = fresh(), p = lake.ports[0], radius = VILLAGES[p.village].arrivalRadius;
      const events = []; on('port:near', ({ villageId }) => events.push(villageId));
      for (const distance of [radius + 1, radius - 1, radius + 1, radius - 1, radius + 5]) {
        moveTo(s, ...p.dock.map((x, i) => x - distance * p.n[i])); nav.step(s, 0);
        assert.equal(s.nearPort, null);
      }
      assert.deepEqual(events, [p.village, null]);
    }],
    ['actualizar el rumbo del gesto mantiene un solo inicio', () => {
      const s = fresh(), events = [];
      for (const name of ['course:set', 'course:updated']) on(name, () => events.push(name));
      for (const updating of [false, true, true, false]) assert.ok(nav.plotCourse(s, ...lake.ports[0].dock, updating).ok);
      assert.deepEqual(events, ['course:set', 'course:updated', 'course:updated', 'course:set']);
    }],
    ['rechaza un rumbo a tierra', () => { const s = fresh(); assert.equal(nav.plotCourse(s, 170, 0).reason, 'sin-agua'); }],
    ['el barco llega a su destino', () => { const s = fresh(); moveTo(s, 0, 0); assert.ok(nav.plotCourse(s, 20, 0).ok);
      for (let i = 0; i < 2000 && s.boat.course; i++) nav.step(s, 1 / 60); assert.equal(s.boat.course, null); assert.ok(Math.hypot(s.boat.x - 20, s.boat.z) < 2); }],
    ['el barco nunca sale del agua', () => { const s = fresh(); s.boat.heading = 0; for (let i = 0; i < 3000; i++) { s.boat.speed = 9; nav.step(s, 1 / 60); } assert.ok(map.navigable(s.boat.x, s.boat.z)); }],
    ['si hay tierra en medio, el rumbo la rodea en vez de rechazarse', () => { const s = fresh(); s.map = 'kyle'; const i = kyle.islands[1];
      moveTo(s, i.x - 30, i.z); const r = nav.plotCourse(s, i.x + 30, i.z); assert.ok(r.ok, r.reason); assert.ok(r.path.length > 1, 'no rodeó la isla'); }],
    ['el barco sigue la ruta alrededor de la isla y llega sin tocar tierra', () => { const s = fresh(); s.map = 'kyle'; const i = kyle.islands[1];
      moveTo(s, i.x - 30, i.z); s.boat.heading = 0; nav.plotCourse(s, i.x + 30, i.z);
      for (let n = 0; n < 6000 && s.boat.course; n++) { nav.step(s, 1 / 60); assert.ok(kyle.navigable(s.boat.x, s.boat.z)); }
      assert.equal(s.boat.course, null, 'no llegó'); assert.ok(Math.hypot(s.boat.x - i.x - 30, s.boat.z - i.z) < 2); }],
    ['cada tramo de una ruta va por agua', () => { for (const m of Object.values(MAPS)) { const sp = Object.values(m.spawns)[0];
      for (let k = 0; k < 25; k++) { const x = (Math.sin(k * 7.1) * .45) * m.size.w, z = (Math.cos(k * 3.3) * .4) * m.size.d; if (!m.navigable(x, z)) continue;
        const path = pathfind.findPath(m, [sp.x, sp.z], [x, z]); if (!path) continue; let a = [sp.x, sp.z];
        for (const p of path) { assert.ok(pathfind.clearLine(m, ...a, ...p), `${m.id}: tramo por tierra`); a = p; } } } }],
    ['detecta el muelle cercano', () => { const s = fresh(); const d = map.portOf('glenmore').dock; moveTo(s, d[0], d[1]); nav.step(s, 1 / 60); assert.equal(s.nearPort, 'glenmore'); }]
  ],
  'sim/travel': [
    ['sin casco reforzado no se cruza el Paso', () => { const s = fresh(); assert.equal(travel.cross(s, 'pasoPiedras').reason, 'bloqueada'); assert.equal(s.map, 'lochMorag'); }],
    ['con el casco se cruza al Estrecho: cambia el mapa, gasta un suministro y una franja', () => { const s = fresh(); s.boat.upgrades.push('reinforced_hull'); let ev;
      on('map:changed', p => { ev = p; }); const r = travel.cross(s, 'pasoPiedras'); assert.ok(r.ok);
      assert.equal(s.map, 'kyle'); assert.equal(ev.to, 'kyle'); assert.equal(cargo.count(s, 'supplies'), 1); assert.equal(s.slot, 1); assert.ok(kyle.navigable(s.boat.x, s.boat.z)); }],
    ['al volver aparece junto al Paso, dentro del lago', () => { const s = fresh(); s.boat.upgrades.push('reinforced_hull'); travel.cross(s, 'pasoPiedras'); assert.ok(travel.cross(s, 'vueltaMorag').ok);
      assert.equal(s.map, 'lochMorag'); const e = lake.exitOf('pasoPiedras'); assert.ok(Math.hypot(e.x - s.boat.x, e.z - s.boat.z) < 30); }],
    ['sin suministros se cruza igual pero tarda dos franjas', () => { const s = fresh(); s.boat.upgrades.push('reinforced_hull'); cargo.remove(s, 'supplies', 2);
      assert.ok(travel.cross(s, 'pasoPiedras').supplied === false); assert.equal(s.slot, 2); }],
    ['no se cruza atracado', () => { const s = fresh(); s.boat.upgrades.push('reinforced_hull'); s.docked = 'portDun'; assert.equal(travel.cross(s, 'pasoPiedras').reason, 'atracado'); }],
    ['la partida sigue siendo JSON puro después de cruzar', () => { const s = fresh(); s.boat.upgrades.push('reinforced_hull'); travel.cross(s, 'pasoPiedras'); assert.deepEqual(JSON.parse(JSON.stringify(s)), s); }]
  ],
  'sim/weather': [
    ['el clima cambia al pasar las franjas y sale de la tabla del mapa', () => { const s = fresh(); const seen = new Set();
      for (let i = 0; i < 300; i++) { time.advance(s); seen.add(s.weather); } for (const w of seen) assert.ok(lake.weather ? lake.weather[w] : weather.WEATHER[w], w); assert.ok(seen.size >= 3); }],
    ['con la misma semilla el clima se repite', () => { const a = fresh(), b = fresh(); for (let i = 0; i < 20; i++) { time.advance(a); time.advance(b); } assert.equal(a.weather, b.weather); }],
    ['en el Estrecho llueve más que en el lago', () => { const count = id => { const s = fresh(); s.map = id; let n = 0; for (let i = 0; i < 2000; i++) { time.advance(s); if (s.weather === 'lluvia') n++; } return n; };
      assert.ok(count('kyle') > count('lochMorag')); }],
    ['con lluvia la cebada se moja en la travesía y vale la mitad', () => { const s = at(fresh(), 'portDun'); s.villages.portDun.trust = 0; cargo.add(s, 'barley', 4);
      const full = trade.sellPrice(s, 'glenmore', 'barley'); s.weather = 'lluvia'; voyage.undock(s); voyage.dock(s, 'glenmore');
      assert.equal(weather.wet(s, 'barley'), 4); assert.equal(trade.sellPrice(s, 'glenmore', 'barley'), Math.round(full * weather.WET_VALUE - 1e-9)); }],
    ['lo mojado se vende primero; lo seco conserva su precio', () => { const s = at(fresh(), 'glenmore'); cargo.add(s, 'barley', 3); s.hold.wet.barley = 1;
      const wetP = trade.sellPrice(s, 'glenmore', 'barley'); trade.sell(s, 'glenmore', 'barley'); assert.equal(weather.wet(s, 'barley'), 0); assert.ok(trade.sellPrice(s, 'glenmore', 'barley') > wetP); }],
    ['lo que no es delicado no se moja', () => { const s = at(fresh(), 'portDun'); cargo.add(s, 'salt', 3); s.weather = 'lluvia'; voyage.undock(s); voyage.dock(s, 'glenmore'); assert.equal(weather.wet(s, 'salt'), 0); }],
    ['con la bodega cubierta la lluvia no moja nada', () => { const s = at(fresh(), 'portDun'); s.boat.upgrades.push('covered_hold'); cargo.add(s, 'barley', 3); s.weather = 'lluvia';
      voyage.undock(s); voyage.dock(s, 'glenmore'); assert.equal(weather.wet(s, 'barley'), 0); }],
    ['instalar la bodega cubierta la agranda a 18', () => { const s = at(fresh(), 'achnacarn'); s.act = 2; s.villages.achnacarn.trust = 60; s.coins = 500; s.shipyard.covered_hold = { oak_wood: 4, copper_nails: 2 };
      assert.ok(upgrades.install(s, 'covered_hold').ok); assert.equal(s.hold.capacity, 18); }],
    ['cerrar el Acto I abre las mejoras del Acto II', () => { const s = fresh(); s.boat.upgrades.push('reinforced_hull'); const e = lake.exitOf('pasoPiedras'); moveTo(s, e.x, e.z); acts.update(s); assert.equal(s.act, 2); }],
    ['la partida con carga mojada sigue siendo JSON puro', () => { const s = at(fresh(), 'portDun'); cargo.add(s, 'barley', 2); s.weather = 'lluvia'; voyage.undock(s); voyage.dock(s, 'glenmore'); assert.deepEqual(JSON.parse(JSON.stringify(s)), s); }]
  ],
  'sim/music': [
    ['cada mapa tiene sus tres piezas y cada pieza su boceto', () => { for (const id of Object.keys(MAPS)) assert.equal(TRACKS.filter(t => t.map === id).length, 3, id);
      for (const t of TRACKS) { assert.ok(t.sketch && t.sketch.mode && t.sketch.root && t.sketch.tempo, t.id); assert.ok(t.file.endsWith('.mp3'), t.id); } }],
    ['solo suenan piezas del mapa en el que estás', () => { const s = fresh(); s.map = 'kyle'; for (let i = 0; i < 20; i++) assert.equal(music.pickNext(s, [], i / 20).map, 'kyle'); }],
    ['nunca repite la pieza que acaba de sonar', () => { const s = fresh(); let h = []; for (let i = 0; i < 30; i++) { const t = music.pickNext(s, h, (i * .37) % 1); assert.notEqual(t.id, h[h.length - 1]); h.push(t.id); } }],
    ['en tres piezas seguidas suenan las tres', () => { const s = fresh(), h = []; for (let i = 0; i < 3; i++) h.push(music.pickNext(s, h, .5).id); assert.equal(new Set(h).size, 3); }],
    ['una pieza marcada para la noche solo suena de noche', () => { TRACKS.push({ id: 'prueba', map: 'lochMorag', slots: [2], title: '', file: 'x.mp3', sketch: {} });
      try { const s = fresh(); s.slot = 0; assert.ok(!music.candidates(s).some(t => t.id === 'prueba')); s.slot = 2; assert.ok(music.candidates(s).some(t => t.id === 'prueba')); } finally { TRACKS.pop(); } }],
    ['los silencios entre piezas duran entre 40 y 90 segundos', () => { assert.equal(music.gapSeconds(0), 40); assert.equal(music.gapSeconds(1), 90); }]
  ],
  'sim/dev': [
    ['se puede saltar a cada lugar de cada mapa y el barco queda en el agua', () => { for (const m of dev.places()) for (const p of m.spots) { const s = fresh();
      assert.ok(dev.goTo(s, m.map, p.id).ok, p.id); assert.equal(s.map, m.map); assert.ok(getMap(m.map).navigable(s.boat.x, s.boat.z), `${m.map}/${p.id}`); } }],
    ['saltar junto a una salida no la dispara', () => { for (const m of dev.places()) for (const p of m.spots.filter(x => x.exit)) { const s = fresh(); dev.goTo(s, m.map, p.id);
      const e = getMap(m.map).exitOf(p.exit); assert.ok(Math.hypot(e.x - s.boat.x, e.z - s.boat.z) > e.radius, p.id); } }],
    ['saltar a otro mapa avisa para rearmar el mundo; al mismo mapa, no', () => { const s = fresh(); let n = 0; on('map:changed', () => n++);
      dev.goTo(s, 'kyle', 'villa:achnacarn'); dev.goTo(s, 'kyle', 'villa:strathlinn'); assert.equal(n, 1); }],
    ['las mejoras se ponen y se quitan, y la bodega vuelve a su tamaño', () => { const s = fresh(); dev.toggleUpgrade(s, 'covered_hold'); assert.equal(s.hold.capacity, 18);
      dev.toggleUpgrade(s, 'covered_hold'); assert.equal(s.hold.capacity, 10); }],
    ['mojar, dar carga y fijar Confianza', () => { const s = fresh(); dev.give(s, 'barley', 3); assert.equal(dev.soak(s)[0].qty, 3); dev.setTrust(s, 'glenmore', 50); assert.equal(s.villages.glenmore.trust, 50); }]
  ],
  'sim/voyage': [
    ['una travesía gasta 1 franja y 1 suministro', () => { const s = fresh(); const r = voyage.dock(s, 'glenmore'); assert.ok(r.traveled && r.supplied); assert.equal(s.slot, 1); assert.equal(cargo.count(s, 'supplies'), 1); }],
    ['con lluvia gasta 2 suministros', () => { const s = fresh(); s.weather = 'lluvia'; voyage.dock(s, 'glenmore'); assert.equal(cargo.count(s, 'supplies'), 0); assert.equal(s.slot, 1); }],
    ['volver al mismo muelle no gasta nada', () => { const s = fresh(); voyage.dock(s, 'portDun'); assert.equal(s.slot, 0); assert.equal(cargo.count(s, 'supplies'), 2); }],
    ['sin suministros tarda 2 franjas y resta 5 de Confianza', () => { const s = fresh(); s.hold.items = {}; s.villages.glenmore.trust = 12; voyage.dock(s, 'glenmore'); assert.equal(s.slot, 2); assert.equal(s.villages.glenmore.trust, 7); }],
    ['un Patrón de Confianza recibe un suministro al pasar la noche', () => { const s = at(fresh(), 'portDun'); s.villages.portDun.trust = 80; assert.ok(voyage.sleep(s).gift); assert.equal(cargo.count(s, 'supplies'), 3); }],
    ['atracado no se puede trazar rumbo', () => { const s = fresh(); voyage.dock(s, 'portDun'); assert.equal(nav.plotCourse(s, 0, 0).reason, 'atracado'); }]
  ],
  'sim/quests': [
    ['con Confianza 10 Mairead no ofrece la carta', () => { const s = at(fresh(), 'portDun'); assert.equal(quests.optionsAt(s, 'portDun')[0].action, undefined); assert.equal(quests.accept(s, 'carta').ok, false); }],
    ['con Confianza 20 entrega la caja y la carta, sin ocupar bodega', () => { const s = at(fresh(), 'portDun'); s.villages.portDun.trust = 20; const free = cargo.free(s);
      assert.ok(quests.accept(s, 'carta').ok); assert.deepEqual(s.keyItems, ['toolbox', 'letter']); assert.equal(cargo.free(s), free); }],
    ['avisa cada objeto de historia recibido', () => { const s = at(fresh(), 'portDun'); s.villages.portDun.trust = 20; const got = []; on('item:gained', p => got.push(p.item)); quests.accept(s, 'carta'); assert.deepEqual(got, ['toolbox', 'letter']); }],
    ['solo se entrega en Glenmore', () => { const s = at(fresh(), 'portDun'); s.villages.portDun.trust = 20; quests.accept(s, 'carta'); assert.equal(quests.deliver(s, 'carta').ok, false); }],
    ['entregarla da el Mapa del Atajo, los Clavos y +15 de Confianza', () => { const s = at(fresh(), 'portDun'); s.villages.portDun.trust = 20; quests.accept(s, 'carta'); at(s, 'glenmore');
      assert.ok(quests.deliver(s, 'carta').ok); assert.deepEqual(s.keyItems, ['shortcut_map', 'old_nails']); assert.equal(s.villages.glenmore.trust, 15); assert.equal(quests.optionsAt(s, 'glenmore').length, 0); }]
  ],
  'sim/upgrades': [
    ['los materiales del casco no caben juntos en la bodega inicial', () => { const u = UPGRADES.reinforced_hull, s = fresh(); const w = Object.entries(u.goods).reduce((a, [g, n]) => a + n * GOODS[g].weight, 0); assert.ok(w > s.hold.capacity); }],
    ['se entregan al astillero por partes', () => { const s = at(fresh(), 'portDun'); s.hold.items = { oak_wood: 4 }; assert.ok(upgrades.deliver(s, 'reinforced_hull').ok); assert.equal(cargo.used(s), 0);
      s.hold.items = { resin: 5 }; upgrades.deliver(s, 'reinforced_hull'); assert.deepEqual(s.shipyard.reinforced_hull, { oak_wood: 4, resin: 3 }); assert.equal(cargo.count(s, 'resin'), 2); }],
    ['sin requisitos no se instala', () => { const s = at(fresh(), 'portDun'); assert.equal(upgrades.install(s, 'reinforced_hull').ok, false); }],
    ['con todo reunido se instala y se cobra', () => { const s = at(fresh(), 'portDun'); Object.assign(s, { coins: 160, keyItems: ['old_nails'] }); s.shipyard = { reinforced_hull: { oak_wood: 4, resin: 2 } }; s.villages.portDun.trust = 50;
      assert.equal(upgrades.canInstall(s, 'reinforced_hull'), false); s.shipyard.reinforced_hull.resin = 3;
      assert.ok(upgrades.install(s, 'reinforced_hull').ok); assert.equal(s.coins, 10); assert.deepEqual(s.keyItems, []); assert.deepEqual(s.shipyard, {}); assert.ok(upgrades.has(s, 'reinforced_hull')); }],
    ['no se entrega ni se instala en Glenmore', () => { const s = at(fresh(), 'glenmore'); s.hold.items = { oak_wood: 4 }; assert.equal(upgrades.deliver(s, 'reinforced_hull').ok, false); assert.equal(upgrades.canInstall(s, 'reinforced_hull'), false); }],
    ['las mejoras del Acto II están cerradas', () => { const s = at(fresh(), 'portDun'); s.hold.items = { herring_oil: 2 }; assert.equal(upgrades.deliver(s, 'bow_lantern').ok, false); }]
  ],
  'sim/acts': [
    ['sin casco reforzado el Paso no cierra el acto', () => { const s = fresh(); let blocked = false; on('exit:blocked', () => { blocked = true; }); moveTo(s, map.EXIT.x, map.EXIT.z); acts.update(s); assert.ok(blocked); assert.equal(s.flags.act1Done, undefined); }],
    ['con casco reforzado, llegar al Paso cierra el Acto I', () => { const s = fresh(); let done = 0; on('act:completed', () => { done++; }); s.boat.upgrades.push('reinforced_hull'); moveTo(s, map.EXIT.x, map.EXIT.z); acts.update(s); acts.update(s); assert.equal(done, 1); assert.ok(s.flags.act1Done); }]
  ],
  'acto I completo': [
    ['el Acto I se puede terminar de principio a fin con las reglas actuales', () => {
      const s = fresh(); let trips = 0;
      const go = id => { voyage.undock(s); assert.ok(voyage.dock(s, id).supplied, 'viaje sin suministros'); trips++; };
      const fill = (v, g) => { while (trade.buy(s, v, g).ok); };
      const sellAll = (v, g) => { while (cargo.count(s, g)) trade.sell(s, v, g); };
      const restock = v => { while (cargo.count(s, 'supplies') < 2) assert.ok(trade.buy(s, v, 'supplies').ok); };
      voyage.dock(s, 'portDun');
      const yard = g => upgrades.delivered(s, 'reinforced_hull', g);
      for (let i = 0; i < 40 && !upgrades.has(s, 'reinforced_hull'); i++) {
        if (quests.stateOf(s, 'carta') === 'none') quests.accept(s, 'carta');
        restock('portDun'); fill('portDun', 'salt'); go('glenmore');
        sellAll('glenmore', 'salt'); quests.deliver(s, 'carta'); restock('glenmore');
        if (yard('oak_wood') < 4 && s.coins > 80) fill('glenmore', 'oak_wood'); else fill('glenmore', 'peat');
        go('portDun'); upgrades.deliver(s, 'reinforced_hull'); sellAll('portDun', 'peat'); sellAll('portDun', 'oak_wood');
        if (yard('oak_wood') >= 4 && yard('resin') < 3 && s.coins > 190) { for (let n = 0; n < 3; n++) trade.buy(s, 'portDun', 'resin'); upgrades.deliver(s, 'reinforced_hull'); }
        upgrades.install(s, 'reinforced_hull');
      }
      assert.ok(upgrades.has(s, 'reinforced_hull'), 'nunca se llegó a instalar el casco');
      voyage.undock(s); moveTo(s, map.EXIT.x, map.EXIT.z); acts.update(s); assert.ok(s.flags.act1Done);
      console.log(`     (ruta de prueba: ${trips} travesías, día ${s.day}, ${s.coins} monedas al final)`);
    }]
  ]
};
