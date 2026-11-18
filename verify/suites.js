import assert from 'node:assert/strict';
import { on, emit, clear } from '../src/core/events.js';
import { createState } from '../src/core/state.js';
import { GOODS } from '../src/data/goods.js';
import { ITEMS } from '../src/data/items.js';
import { VILLAGES } from '../src/data/villages.js';
import { UPGRADES } from '../src/data/upgrades.js';
import { QUESTS } from '../src/data/quests.js';
import * as map from '../src/maps/current.js';
import * as time from '../src/sim/time.js';
import * as cargo from '../src/sim/cargo.js';
import * as trade from '../src/sim/trade.js';
import * as trust from '../src/sim/trust.js';
import * as nav from '../src/sim/navigation.js';
import * as voyage from '../src/sim/voyage.js';
import * as quests from '../src/sim/quests.js';
import * as upgrades from '../src/sim/upgrades.js';
import * as acts from '../src/sim/acts.js';

const fresh = () => { clear(); return createState(); };
const at = (s, id) => { s.docked = s.lastPort = id; return s; };
const moveTo = (s, x, z) => { s.boat.x = x; s.boat.z = z; };

export const suites = {
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
    ['en el Acto I todo lo que una villa necesita lo produce otra', () => { const made = Object.values(VILLAGES).flatMap(v => v.produces);
      for (const v of Object.values(VILLAGES)) for (const g of v.needs) assert.ok(made.includes(g) && GOODS[g].act === 1, g); }],
    ['materiales y objetos de las mejoras existen', () => { for (const u of Object.values(UPGRADES)) { for (const g of Object.keys(u.goods || {})) assert.ok(GOODS[g], g); for (const i of u.items || []) assert.ok(ITEMS[i], i); } }],
    ['el Casco Reforzado se puede reunir sin salir del mapa', () => { const u = UPGRADES.reinforced_hull, made = Object.values(VILLAGES).flatMap(v => v.produces), given = Object.values(QUESTS).flatMap(q => q.rewards);
      for (const g of Object.keys(u.goods)) assert.ok(made.includes(g), g); for (const i of u.items) assert.ok(given.includes(i), i); }],
    ['los objetos de los encargos existen', () => { for (const q of Object.values(QUESTS)) for (const i of [...q.gives, ...q.rewards]) assert.ok(ITEMS[i], i); }],
    ['cada villa del mapa tiene sus datos', () => { for (const p of map.PORTS) assert.ok(VILLAGES[p.village], p.village); }]
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
    ['rechaza un rumbo a tierra', () => { const s = fresh(); assert.equal(nav.plotCourse(s, 170, 0).reason, 'sin-agua'); }],
    ['el barco llega a su destino', () => { const s = fresh(); moveTo(s, 0, 0); assert.ok(nav.plotCourse(s, 20, 0).ok);
      for (let i = 0; i < 2000 && s.boat.course; i++) nav.step(s, 1 / 60); assert.equal(s.boat.course, null); assert.ok(Math.hypot(s.boat.x - 20, s.boat.z) < 2); }],
    ['el barco nunca sale del agua', () => { const s = fresh(); s.boat.heading = 0; for (let i = 0; i < 3000; i++) { s.boat.speed = 9; nav.step(s, 1 / 60); } assert.ok(map.navigable(s.boat.x, s.boat.z)); }],
    ['detecta el muelle cercano', () => { const s = fresh(); const d = map.portOf('glenmore').dock; moveTo(s, d[0], d[1]); nav.step(s, 1 / 60); assert.equal(s.nearPort, 'glenmore'); }]
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
