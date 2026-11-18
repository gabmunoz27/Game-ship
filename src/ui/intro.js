import { narration, dialogue } from '../data/intro.js';
import { advance, finish, lineText, progress } from '../sim/intro.js';

let overlay, speaker, words;
export default {
  id: 'introText', label: 'Diálogo de inicio',
  init(ctx) {
    overlay = document.createElement('section');
    overlay.className = 'intro-film'; overlay.hidden = true;
    overlay.innerHTML = '<button class="intro-skip">Saltar</button><div class="intro-caption"><strong></strong><p></p><small>Toca o pulsa Espacio para continuar</small></div>';
    document.body.append(overlay);
    speaker = overlay.querySelector('strong'); words = overlay.querySelector('p');
    overlay.onclick = e => e.target.closest('button') ? finish(ctx.state) : advance(ctx.state);
    window.addEventListener('keydown', e => {
      if (!ctx.state.intro) return;
      e.stopImmediatePropagation();
      if (['Escape','Enter',' '].includes(e.key)) {
        e.preventDefault();
        if (!e.repeat) e.key === 'Escape' ? finish(ctx.state) : advance(ctx.state);
      }
    }, true);
  },
  update(ctx) {
    const i = ctx.state.intro;
    if (overlay.hidden !== !i) {
      overlay.hidden = !i;
      ctx.ui.root.inert = !!i;
    }
    if (!i) return;
    if (overlay.dataset.stage !== i.stage) overlay.dataset.stage = i.stage;
    if (i.stage === 'black') {
      if (words.dataset.line !== String(i.line)) {
        const earlier = narration.slice(0, i.line).join('\n\n');
        words.replaceChildren(document.createTextNode(earlier && earlier + '\n\n'));
        const current = document.createElement('span');
        current.textContent = narration[i.line];
        words.append(current);
        words.dataset.line = i.line;
      }
      words.lastElementChild.style.opacity = progress(i);
    } else if (i.stage === 'talk') {
      const name = dialogue[i.line][0], text = lineText(i);
      if (speaker.textContent !== name) speaker.textContent = name;
      const visible = text.slice(0, Math.floor(text.length * progress(i)));
      if (words.textContent !== visible) words.textContent = visible;
    }
  }
};
