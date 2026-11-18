// Renderiza muestras mono una sola vez. Las voces comparten el ruido y los buffers.
// En la reproducción se varían velocidad, nivel y (en bucles) punto de entrada.
const RATE = 16000, TAU = Math.PI * 2;
const noise = new Float32Array(RATE * 2);
for (let i = 0; i < noise.length; i++) noise[i] = Math.random() * 2 - 1;
const sin = cycles => Math.sin(TAU * cycles);

// Resonancias, cola y separación entre impactos. Las parciales del metal son inarmónicas.
const strikes = {
  atraque: [77,.42,1], zarpar: [103,.32,2,.19], botes: [72,.5,2,.58],
  cajas: [145,.22,2,.18], hacha: [192,.16,2,.78], puerta: [93,.34,1],
  yunque: [690,.67,3,.48], piedras: [310,.16,5,.107], telar: [180,.16,6,.23],
  monedas: [1730,.23,4,.083], carga: [85,.26,2,.095], bloqueo: [109,.26,2,.23],
  campana: [385,2.4,1], bruma: [182,2.9,1], encargo: [593,1,3,.22],
  rumbo: [930,.54,1], aviso: [780,.31,1], mejora: [390,.35,3,.28]
};
// Frecuencia inicial/final, duración de cada llamada, repeticiones y aspereza de garganta.
const calls = {
  gaviota: [980,620,.57,2,.15], bosque: [1830,2680,.16,4,.03],
  buho: [345,277,.55,2,.05], gallina: [510,330,.105,5,.45],
  vaca: [112,81,.97,1,.64], ninos: [451,573,.32,3,.29], perro: [213,135,.19,2,.8],
  oveja: [190,153,.72,1,.88], crujido: [114,174,.48,1,.95], polea: [540,425,.31,2,.7]
};

export function synthesize(ac, id, loop) {
  const hit = strikes[id], call = calls[id];
  const ring = ['yunque','monedas','campana','bruma','rumbo','aviso','encargo'].includes(id);
  const duration = loop ? 12 : hit ? hit[1] + (hit[2]-1)*(hit[3] || 0) + (id === 'mejora' ? .9 : 0)
    : call ? call[2] * (call[3] * 1.5) : ({ fuelle: 1.7, vagoneta: 2.2, aleteo: .83, mojada: .54 })[id];
  // Los bucles se renderizan con medio segundo de más y esa cola se funde sobre el principio:
  // así la unión no tiene silencio ni salto y no se oye un "hipo" cada vez que el bucle vuelve a empezar.
  const total = Math.ceil(duration * RATE), extra = loop ? Math.ceil(.6 * RATE) : 0;
  const buffer = ac.createBuffer(1, total, RATE);
  const out = buffer.getChannelData(0);
  const samples = loop ? new Float32Array(total + extra) : out;
  const offset = Math.floor(Math.random() * noise.length);
  let low = 0, body = 0, phase = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / RATE, p = t / duration;
    const white = noise[(i + offset) % noise.length];
    low += .16 * (white - low);
    body += .052 * (low - body);
    const swell = .54 + .28 * sin(p * 2) + .16 * sin(p * 5 + .23);
    const edge = loop ? 1 : Math.min(1, t * 80, (duration - t) * 55);
    let value;
    if (hit) {
      value = 0;
      const [base, tail, count, gap = 0] = hit;
      for (let j = 0; j < count + Number(id === 'mejora'); j++) {
        const age = t - j * gap;
        if (age < 0) break;
        const f = base * (1 + .028 * j) * (id === 'mejora' && j === count ? 2.35 : 1);
        const a = age * f;
        value += Math.min(1,age*270) * Math.exp(-5*age/tail) *
          (.38*sin(a) + .18*sin(a*2.71) + .12*sin(a*4.13)*Math.exp(-age*8)
          + low*(ring ? .35 : 2)*Math.exp(-age*19));
      }
    } else if (call) {
      const [start,end,len,,rough] = call, cycle = t / (len * 1.5);
      const u = Math.min(1,(cycle % 1)*1.5);
      const vibrato = sin(t * (id === 'oveja' ? 12 : 6.2));
      phase += (start + (end-start)*u + start*(.12*Math.sin(Math.PI*u) + .026*vibrato + .03*Math.sin(Math.floor(cycle)*2))) / RATE;
      value = Math.sin(Math.PI*u)**1.5 * (.35*sin(phase) + rough*(.23*sin(phase*3) + .14*sin(phase*5) + .45*low)) *
        (1 + rough*.4*vibrato);
    } else {
      const patter = Math.max(0, Math.abs(white) - .965) * 28;
      switch (id) {
        case 'casco': value = swell*(body*2.7 + .36*low) + .07*patter*sin(t*460); break;
        case 'orilla': value = swell*swell*(1.5*low + .12*white); break;
        case 'viento': value = swell*(body*2.6 + low*.24); break;
        case 'lona': value = body*(1.3 + .3*sin(t*43)) + .05*swell*sin(t*79 + .5*sin(p*4)); break;
        case 'lluvia': value = low*.83 + white*.15 + patter*.15; break;
        case 'cubierta': value = body*.8 + Math.max(0,sin(t*13+sin(t*5)))**20 * (.42*low+.14*sin(t*270))*swell; break;
        case 'grillos': value = .19*sin(t*3170 + .24*sin(t*41))*Math.max(0,sin(t*29))**3*Math.max(0,sin(p*9)); break;
        case 'mercado': {
          // Granos de vocales veladas: dos registros se alternan detrás del aire del muelle.
          const syllable = Math.max(0, sin(t*3.1 + .8*sin(p*2)));
          const bass = sin(t*124 + 1.7*sin(t*2.3));
          const alto = sin(t*192 + 2*sin(t*3.4));
          value = body + .15*syllable*(bass + .3*sin(t*612 + bass)) +
            .12*(1-syllable)*swell*(alto + .4*sin(t*762 + alto));
          break;
        }
        case 'cebada': value = (white-low)*.48*swell*swell; break;
        case 'aleteo': value = (body*2+low)*(.35 + .65*Math.abs(sin(t*6 + sin(t*2)))); break;
        case 'vagoneta': value = body*1.5 + Math.max(0,sin(t*7))**12*(low + .22*sin(t*355)); break;
        case 'fuelle': value = (low+.18*white)*Math.sin(Math.PI*p)**2; break;
        case 'mojada': value = (low*1.8+white*.3)*Math.exp(-3*p); break;
      }
    }
    samples[i] = Math.tanh(value) * edge;
  }
  if (loop) {
    out.set(samples.subarray(0, total));
    // Fundido de igual potencia: el ruido de la cola y el del principio no se parecen, así que se suman en potencia.
    for (let i = 0; i < extra; i++) { const k = i / extra; out[i] = samples[i] * Math.sqrt(k) + samples[total + i] * Math.sqrt(1 - k); }
  }
  return buffer;
}
