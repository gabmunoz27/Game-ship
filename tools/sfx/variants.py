# Corta cada llamada elegida como variante: public/sfx/<id>-<n>.m4a
# VARIANTS: id -> lista de (sound id de freesound, inicio s, fin s). Ver candidates/<id>.json para el análisis.
import json, math, os, sys
from process import read, write, windows, db, RATE
VARIANTS = {
 'oveja':   [(710297, 0, 1.9), (172712, .25, 2.4), (88423, 23.45, 25.9), (88423, 8.95, 11.6)],
 'vaca':    [(700380, .35, 1.98), (233130, .65, 3.3), (401636, 2.4, 4.2)],
 'gallina': [(607245, 0, 1.92), (455905, .05, 1.9), (455905, 2.65, 4.67)],
 'perro':   [(792440, 0, 1.2), (828526, 0, .92), (483698, 0, 1.28)],
 'gaviota': [(479595, .5, 1.9), (479595, 1.8, 3.2), (75195, 1.1, 1.93)],
 'bosque':  [(122618, .35, 1.8), (122618, 6.9, 8.8), (515291, .7, 3.3), (515291, 3.9, 7.0)],
 'buho':    [(655380, 4.5, 7.18), (864872, 1.45, 3.9), (864872, 6.05, 9.2), (415153, 3.7, 5.6)],
}
OUT = '../../public/sfx'
def highpass(s, hz=90):   # quita retumbe de viento y tráfico sin tocar la voz del animal
    a = math.exp(-2 * math.pi * hz / RATE); y = px = 0; out = []
    for x in s: y = a * (y + x - px); px = x; out.append(y)
    return out
def cut(path, a, b):
    s = read(path); s = s[int(a * RATE):int(b * RATE)]
    mean = sum(s) / len(s); s = highpass([v - mean for v in s])
    fi, fo = int(.005 * RATE), int(min(.3, len(s) / RATE * .25) * RATE)
    for i in range(fi): s[i] *= i / fi
    for i in range(fo): s[-1 - i] *= i / fo
    w = sorted(windows(s), reverse=True); act = w[:max(1, len(w) // 3)]
    g = min(db(-16) / (sum(act) / len(act)), db(-1) / max(abs(v) for v in s))
    return [v * g for v in s]
if __name__ == '__main__':
    for k in (sys.argv[1:] or VARIANTS):
        for f in os.listdir(OUT):
            if f.startswith(k + '-') and f.endswith('.m4a'): os.remove(os.path.join(OUT, f))
        for n, (sid, a, b) in enumerate(VARIANTS[k], 1):
            write(cut(f'raw/cand/{k}/{sid}.mp3', a, b), f'{OUT}/{k}-{n}.m4a')
        print(k, len(VARIANTS[k]), 'variantes', flush=True)
