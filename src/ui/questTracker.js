import { on } from '../core/events.js';
import { QUESTS } from '../data/quests.js';
import { objectiveOf } from '../sim/quests.js';

export default {
  id: 'questTracker', label: 'Encargos activos',
  init({ state, ui }) {
    const panel = document.createElement('section');
    panel.className = 'quest-tracker';
    panel.innerHTML = '<button aria-controls="active-quests">Encargos</button><ul id="active-quests"></ul>';
    ui.root.append(panel);
    const button = panel.querySelector('button'), list = panel.querySelector('ul');
    const key = 'loch-morag-encargos-plegados';
    let folded = matchMedia('(max-width:600px)').matches;
    try { const value = localStorage.getItem(key); if (value !== null) folded = value === '1'; } catch {}
    function fold() {
      list.hidden = folded;
      button.setAttribute('aria-expanded', String(!folded));
    }
    button.onclick = () => {
      folded = !folded;
      fold();
      try { localStorage.setItem(key, folded ? '1' : '0'); } catch {}
    };
    // Nombre del encargo arriba y objetivo debajo: dos líneas cortas en vez de una larga que choque con el rótulo de la villa.
    const fill = (row, name, text) => {
      const title = document.createElement('strong'), goal = document.createElement('span');
      title.textContent = name; goal.textContent = text; row.replaceChildren(title, goal);
    };
    function refresh() {
      for (const [id, quest] of Object.entries(QUESTS)) {
        const text = objectiveOf(state, id);
        let row = list.querySelector('[data-id="' + id + '"]');
        if (text) {
          if (!row) {
            row = document.createElement('li');
            row.dataset.id = id;
            list.append(row);
          }
          fill(row, quest.name, text);
        } else if (row && !row.classList.contains('finished')) {
          fill(row, quest.name, 'Completado');
          row.classList.add('finished');
          setTimeout(() => { row.remove(); panel.hidden = !list.childElementCount; }, 700);
        }
      }
      panel.hidden = !list.childElementCount;
    }
    fold();
    refresh();
    for (const event of ['quest:accepted','quest:completed','cargo:changed','cargo:added','trade:done','map:changed']) on(event, refresh);
  }
};
