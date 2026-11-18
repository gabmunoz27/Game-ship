import { narration, dialogue } from '../data/intro.js';
import { mapOf } from '../maps/index.js';
import { emit } from '../core/events.js';
import { grantHerring } from './quests.js';

export const walkTime = 4, boardTime = 2, returnTime = 3;
export function begin(s) {
  if (s.introSeen || s.intro) return;
  const port = mapOf(s).portOf('portDun');
  Object.assign(s.boat, { x: port.dock[0], z: port.dock[1], heading: Math.atan2(port.t[1], port.t[0]) });
  s.intro = { stage: 'black', line: 0, elapsed: 0, revealed: false };
}
export function finish(s) {
  if (s.introSeen) return;
  s.intro = null;
  s.introSeen = true;
  grantHerring(s);
}
export function lineText(i) {
  return i.stage === 'black' ? narration[i.line] : dialogue[i.line][1];
}
export function progress(i) {
  return i.revealed ? 1 : Math.min(1, i.elapsed / (i.stage === 'black' ? 2 : lineText(i).length / 33));
}
function enter(i, stage) {
  Object.assign(i, { stage, elapsed: 0, line: 0, revealed: false });
}
export function advance(s) {
  const i = s.intro;
  if (!i || !['black', 'talk'].includes(i.stage)) return;
  if (progress(i) < 1) { i.revealed = true; return; }
  const black = i.stage === 'black';
  if (++i.line === (black ? narration : dialogue).length) enter(i, black ? 'walk' : 'board');
  else Object.assign(i, { elapsed: 0, revealed: false });
}
export function tick(s, dt) {
  const i = s.intro;
  if (!i) return;
  const before = i.elapsed;
  i.elapsed += dt;
  if (i.stage === 'black' && i.elapsed >= 5) advance(s);
  if (i.stage === 'walk') {
    if (Math.floor(before * 2) < Math.floor(i.elapsed * 2)) emit('intro:step');
    if (i.elapsed >= walkTime) enter(i, 'talk');
  } else if (i.stage === 'board' && i.elapsed >= boardTime) {
    enter(i, 'return'); emit('intro:aboard');
  } else if (i.stage === 'return' && i.elapsed >= returnTime) finish(s);
}
