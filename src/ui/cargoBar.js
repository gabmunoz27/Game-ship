import { on } from '../core/events.js';
import { GOODS } from '../data/goods.js';
import { used } from '../sim/cargo.js';
import { icon } from './icons.js';

export default {
  id: 'cargoBar', label: 'Bodega a bordo',
  init({ state, ui }) {
    const bar = document.createElement('section');
    bar.className = 'cargo-bar';
    bar.setAttribute('aria-label', 'Bodega');
    bar.innerHTML = '<strong></strong><div class="cargo-slots"></div><output hidden></output>';
    const [summary, slots, detail] = bar.children;
    ui.bottom.append(bar);
    let timer;
    slots.addEventListener('click', e => {
      const slot = e.target.closest('button');
      if (!slot) return;
      detail.textContent = slot.title;
      detail.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(() => { detail.hidden = true; }, 2800);
    });
    const render = () => {
      const { capacity, items, wet } = state.hold;
      summary.textContent = `Bodega · ${used(state)} / ${capacity}`;
      const cells = [];
      for (const [id, qty] of Object.entries(items)) {
        const good = GOODS[id];
        for (let i = 0; i < qty; i++) {
          const soaked = i < (wet?.[id] || 0);
          const label = `${good.name} × ${qty}${soaked ? ' · carga mojada' : ''}`;
          const cell = `<button type="button" class="${soaked ? 'wet' : ''}" aria-label="${label}" title="${label}">${icon(id)}</button>`;
          for (let j = 0; j < good.weight; j++) cells.push(cell);
        }
      }
      while (cells.length < capacity) cells.push('<span></span>');
      slots.innerHTML = cells.join('');
      detail.hidden = true;
    };
    let queued = false;
    for (const event of ['cargo:added', 'cargo:changed', 'cargo:soaked', 'upgrade:installed']) on(event, () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => { queued = false; render(); });
    });
    render();
  }
};
