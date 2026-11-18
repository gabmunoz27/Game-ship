// Música provisional hecha en código (Web Audio): un boceto de cada pieza mientras no exista su MP3.
// Notas largas de fondo, arpa en arpegios y una voz principal (flauta, violín o cello) en el modo de la pieza.
// Siempre suena igual para la misma pieza (azar con semilla). No pretende ser la música final.
const MODES = { dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], phrygian: [0, 1, 3, 5, 7, 8, 10] };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const seeded = s => { let x = [...s].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7) >>> 0 || 1; return () => (x = x * 16807 % 2147483647) / 2147483647; };
const LENGTH = 96;   // segundos de cada boceto

let verb = null;
/** Reverberación compartida: una cola de ruido que se apaga en ~3 s, para que suene a sala de piedra o a lago abierto. */
function reverb(ac, out) {
  if (verb && verb.context === ac) return verb;
  const len = ac.sampleRate * 3.2, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  verb = ac.createConvolver(); verb.buffer = buf; const wet = ac.createGain(); wet.gain.value = .55; verb.connect(wet).connect(out);
  return verb;
}

/** Toca el boceto de una pieza. Devuelve { duration, stop(fade) }. */
export function playSketch(ac, out, track) {
  const { mode, root, tempo, voice } = track.sketch, scale = MODES[mode], beat = 60 / tempo, rnd = seeded(track.id);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(out); bus.connect(reverb(ac, out));
  const t0 = ac.currentTime + .1, end = t0 + LENGTH;
  const LEVEL = 2.8;   // para que el boceto suene parecido en volumen a un MP3 terminado
  bus.gain.setValueAtTime(0, t0); bus.gain.linearRampToValueAtTime(LEVEL, t0 + 6); bus.gain.setValueAtTime(LEVEL, end - 8); bus.gain.linearRampToValueAtTime(0, end);
  const note = deg => root + Math.floor(deg / 7) * 12 + scale[((deg % 7) + 7) % 7];
  const nodes = [];

  // Fondo: dos o tres notas largas (raíz y quinta) que cambian de acorde cada pocos compases.
  const chords = voice === 'drone' || voice === 'cello' ? [0, 0, -2, 0] : [0, 3, 0, 4, 5, 3, 0, 4];
  const bar = beat * 8;
  chords.forEach((deg, i) => { const at = t0 + i * bar * 1.5; if (at > end) return;
    [note(deg - 14), note(deg - 10), note(deg - 7)].forEach((m, k) => {
      const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
      o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = (k - 1) * 6;
      f.type = 'lowpass'; f.frequency.value = voice === 'drone' ? 420 : 620; f.Q.value = .3;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.035, at + bar * .5); g.gain.setValueAtTime(.035, at + bar * 1.2); g.gain.linearRampToValueAtTime(0, at + bar * 1.7);
      o.connect(f).connect(g).connect(bus); o.start(at); o.stop(at + bar * 1.75); nodes.push(o);
    }); });

  // Arpa: arpegios suaves, más densos en las piezas de arpa y casi ausentes en las de dron.
  const density = { harp: .8, whistle: .5, fiddle: .45, cello: .25, drone: .2 }[voice];
  for (let t = t0 + beat * 4; t < end - 6; t += beat / 2) {
    if (rnd() > density) continue;
    const i = Math.floor((t - t0) / (bar * 1.5)) % chords.length, deg = chords[i] + [0, 2, 4, 7, 9][Math.floor(rnd() * 5)];
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = hz(note(deg)); o2.type = 'sine'; o2.frequency.value = hz(note(deg) + 12);
    f.type = 'lowpass'; f.frequency.value = 2600;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .006); g.gain.exponentialRampToValueAtTime(.0008, t + 2.6);
    const g2 = ac.createGain(); g2.gain.value = .3; o2.connect(g2).connect(g);
    o.connect(g).connect(f).connect(bus); o.start(t); o2.start(t); o.stop(t + 2.7); o2.stop(t + 2.7); nodes.push(o, o2);
  }

  // Voz principal: frases lentas con vibrato y silencios entre frases.
  if (voice !== 'harp') {
    const lead = { whistle: { type: 'sine', oct: 12, vol: .07, cut: 3800 }, fiddle: { type: 'sawtooth', oct: 12, vol: .045, cut: 2200 },
      cello: { type: 'sawtooth', oct: -12, vol: .06, cut: 900 }, drone: { type: 'square', oct: -12, vol: .03, cut: 700 } }[voice];
    let t = t0 + bar * 1.5, deg = 4;
    while (t < end - bar) {
      const phrase = 3 + Math.floor(rnd() * 4);
      for (let n = 0; n < phrase && t < end - bar; n++) {
        deg += [-2, -1, -1, 1, 1, 2, 0][Math.floor(rnd() * 7)]; deg = Math.max(0, Math.min(9, deg));
        const len = beat * [2, 2, 3, 4][Math.floor(rnd() * 4)];
        const o = ac.createOscillator(), vib = ac.createOscillator(), vg = ac.createGain(), g = ac.createGain(), f = ac.createBiquadFilter();
        o.type = lead.type; o.frequency.value = hz(note(deg) + lead.oct);
        vib.frequency.value = 5; vg.gain.value = hz(note(deg) + lead.oct) * .004; vib.connect(vg).connect(o.frequency);
        f.type = 'lowpass'; f.frequency.value = lead.cut;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lead.vol, t + len * .3); g.gain.linearRampToValueAtTime(lead.vol * .7, t + len * .8); g.gain.linearRampToValueAtTime(0, t + len * 1.05);
        o.connect(f).connect(g).connect(bus); o.start(t); vib.start(t); o.stop(t + len * 1.1); vib.stop(t + len * 1.1); nodes.push(o, vib);
        t += len;
      }
      t += beat * (4 + Math.floor(rnd() * 6));   // respira entre frases
    }
  }

  return {
    duration: LENGTH,
    stop(fade = 3) { const now = ac.currentTime; bus.gain.cancelScheduledValues(now); bus.gain.setValueAtTime(bus.gain.value, now); bus.gain.linearRampToValueAtTime(0, now + fade);
      setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); bus.disconnect(); }, fade * 1000 + 200); }
  };
}
