import { on, emit } from '../core/events.js';
import { VILLAGES } from '../data/villages.js';
import { GOODS } from '../data/goods.js';
import { ITEMS } from '../data/items.js';
import { UPGRADES } from '../data/upgrades.js';
import * as trade from '../sim/trade.js';
import * as cargo from '../sim/cargo.js';
import * as voyage from '../sim/voyage.js';
import * as trust from '../sim/trust.js';
import * as quests from '../sim/quests.js';
import * as upgrades from '../sim/upgrades.js';
// Panel del muelle (GDD 6): pestañas Muelle, Comercio y Astillero.
// Solo muestra y pide acciones a la simulación; las reglas viven en src/sim.
const REASONS = { 'sin-monedas': 'No te alcanzan las monedas', 'bodega-llena': 'No cabe en la bodega' };
let btn, panel, tab = 'muelle', state, note = '';

function muelle(id, v) {
  const t = trust.tierOf(state, id);
  const qs = quests.optionsAt(state, id).map(q => `<h3>${q.name}</h3><p>${q.text}</p>${q.action ? `<div class="row"><span class="name"></span><button data-act="quest" data-quest="${q.id}" data-do="${q.action}">${q.label}</button></div>` : ''}`).join('');
  return `<h2>${v.npc.name} <span class="badge ${t.id}">${t.name}</span></h2>
    <p><small>${v.npc.role} · ${v.name} · Confianza ${trust.of(state, id)}/100</small></p><p>«${v.greeting}»</p>
    ${note ? `<p class="note">${note}</p>` : ''}
    <p><small>Aquí necesitan: ${v.needs.map(g => GOODS[g].name.toLowerCase()).join(' y ')}.</small></p>${qs}
    <div class="row"><span class="name"></span><button data-act="sleep">Pasar la noche</button></div>`;
}
function comercio(id, v) {
  const sale = trade.onSale(id).map(g => { const p = trade.buyPrice(state, id, g);
    return `<div class="row"><span class="name">${GOODS[g].name} <span class="tag">${GOODS[g].weight} esp.</span></span>
      <button data-act="buy" data-good="${g}" ${state.coins < p || !cargo.fits(state, g) ? 'disabled' : ''}>Comprar · ${p}</button></div>`; }).join('');
  const hold = Object.entries(state.hold.items).map(([g, n]) => { const p = trade.sellPrice(state, id, g);
    return `<div class="row"><span class="name">${GOODS[g].name} × ${n}${v.needs.includes(g) ? ' <span class="tag">la necesitan</span>' : ''}</span>
      ${p === null ? '<span class="tag">no se vende</span>' : `<button data-act="sell" data-good="${g}">Vender · ${p}</button>`}</div>`; }).join('') || '<p><small>La bodega está vacía.</small></p>';
  const items = state.keyItems.length ? `<h3>Objetos de historia</h3><div class="rows">${state.keyItems.map(i => `<div class="row"><span class="name">${ITEMS[i].name}</span><span class="tag">no ocupa bodega</span></div>`).join('')}</div>` : '';
  return `<h3>${v.name} vende</h3><div class="rows">${sale}</div>
    <h3>Tu bodega · ${cargo.used(state)}/${state.hold.capacity} espacios · ${state.coins} monedas</h3><div class="rows">${hold}</div>${items}`;
}
function astillero(id) {
  const rows = Object.entries(UPGRADES).map(([uid, u]) => {
    if (upgrades.has(state, uid)) return `<div class="row"><span class="name">${u.name}</span><span class="tag">instalada</span></div>`;
    if (u.act > state.act) return `<div class="row"><span class="name">${u.name}<br><span class="tag">${u.unlocks}</span></span><span class="tag">Acto II</span></div>`;
    const reqs = upgrades.requirements(state, uid).map(r => `<div class="row req ${r.ok ? 'ok' : ''}"><span class="name">${r.ok ? '✓' : '○'} ${r.label}</span><span class="tag">${r.have}</span></div>`).join('');
    const here = id === u.at;
    return `<div class="row"><span class="name">${u.name}<br><span class="tag">${u.unlocks}</span></span>
      ${here ? `<button data-act="install" data-upgrade="${uid}" ${upgrades.canInstall(state, uid) ? '' : 'disabled'}>Instalar</button>` : `<span class="tag">se instala en ${VILLAGES[u.at].name}</span>`}</div>${reqs}
      ${here && upgrades.deliverable(state, uid) ? `<div class="row"><span class="name"></span><button data-act="materials" data-upgrade="${uid}">Dejar materiales en el astillero</button></div>` : ''}`;
  }).join('');
  return `<h3>Casco · ${state.boat.hull}%</h3><div class="bar"><i style="width:${state.boat.hull}%"></i></div><h3>Mejoras</h3><div class="rows">${rows}</div>`;
}
function render() {
  const id = state.docked; if (!id) { panel.hidden = true; return; }
  const v = VILLAGES[id], body = tab === 'muelle' ? muelle(id, v) : tab === 'comercio' ? comercio(id, v) : astillero(id);
  const t = (key, label) => `<button role="tab" data-tab="${key}" aria-selected="${tab === key}">${label}</button>`;
  panel.innerHTML = `<div class="tabs" role="tablist">${t('muelle', 'El Muelle')}${t('comercio', 'Comercio y Bodega')}${t('astillero', 'Astillero')}<button class="leave" data-act="leave">Zarpar</button></div>${body}`;
  panel.hidden = false;
}

export default {
  id: 'dockPanel', label: 'Panel del muelle',
  init(ctx) {
    state = ctx.state;
    btn = document.createElement('button'); btn.className = 'dock-btn scroll'; btn.hidden = true;
    panel = document.createElement('section'); panel.className = 'panel scroll'; panel.hidden = true;
    ctx.ui.bottom.append(btn, panel);
    btn.addEventListener('click', () => { if (state.nearPort) voyage.dock(state, state.nearPort); });
    on('port:near', ({ villageId }) => { btn.hidden = !villageId || !!state.docked; if (villageId) btn.textContent = `Atracar en ${VILLAGES[villageId].name}`; });
    on('dock:entered', ({ traveled, supplied }) => { btn.hidden = true; tab = 'muelle';
      note = !traveled ? '' : supplied ? 'La travesía consumió suministros y una franja del día.' : 'Llegaste sin suministros: el viaje tomó el doble y en el muelle lo notaron (−5 de Confianza).';
      render(); });
    on('dock:left', () => { panel.hidden = true; btn.hidden = !state.nearPort; });
    panel.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tab) { tab = b.dataset.tab; note = ''; }
      const act = b.dataset.act, id = state.docked;
      if (act === 'leave') return voyage.undock(state);
      if (act === 'sleep') { const r = voyage.sleep(state); note = r.gift ? 'Amanece. Alguien dejó un fardo de suministros junto al barco.' : 'Amanece un día nuevo.'; }
      if (act === 'buy' || act === 'sell') { const r = trade[act](state, id, b.dataset.good); if (!r.ok && REASONS[r.reason]) emit('notice', { text: REASONS[r.reason] }); }
      if (act === 'quest') { const r = quests[b.dataset.do](state, b.dataset.quest); note = r.text || (r.ok ? 'Guardas la caja y la carta a bordo.' : ''); }
      if (act === 'materials') upgrades.deliver(state, b.dataset.upgrade);
      if (act === 'install') { const r = upgrades.install(state, b.dataset.upgrade); if (r.ok) emit('notice', { text: 'Casco reforzado instalado' }); }
      render();
    });
  }
};
