# Mide cada candidato sin escucharlo: ruido de fondo, distorsión, retumbe de viento y dónde está cada llamada.
# Uso: python3 analyze.py [id ...]  →  candidates/<id>.json con el campo "analysis".
import json, math, os, sys, wave, array, subprocess
R = 22050; W = R // 20                                  # ventanas de 50 ms
def load(path):
    tmp = path + '.a.wav'
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', f'LEI16@{R}', '-c', '1', path, tmp], check=True, capture_output=True)
    w = wave.open(tmp); d = array.array('h', w.readframes(w.getnframes())); w.close(); os.remove(tmp)
    return [v / 32768 for v in d]
def dbv(x): return 20 * math.log10(max(x, 1e-9))
def analyze(path):
    s = load(path); n = len(s)
    rms = [math.sqrt(sum(v*v for v in s[i:i+W]) / W) for i in range(0, n - W, W)] or [0]
    srt = sorted(rms); floor = dbv(srt[len(srt)//10]); peak = dbv(srt[int(len(srt)*.97)])
    clip = sum(1 for v in s if abs(v) > .985) / n
    lo = 0; low_e = 0; tot = 0; a = 1 - math.exp(-2 * math.pi * 150 / R)   # paso bajo de 150 Hz: retumbe/viento
    zc = 0
    for i, v in enumerate(s):
        lo += a * (v - lo); low_e += lo * lo; tot += v * v
        if i and (v > 0) != (s[i-1] > 0): zc += 1
    # llamadas: tramos por encima del fondo + 12 dB que duran al menos 0,15 s
    thr = floor + 12; ev = []; start = None
    for i, r in enumerate(rms + [0]):
        on = dbv(r) > thr
        if on and start is None: start = i
        if not on and start is not None:
            if i - start >= 3: ev.append([round(start * .05, 2), round(i * .05, 2), round(dbv(max(rms[start:i])), 1)])
            start = None
    merged = []
    for e in ev:   # junta llamadas separadas por menos de 0,25 s
        if merged and e[0] - merged[-1][1] < .25: merged[-1][1] = e[1]; merged[-1][2] = max(merged[-1][2], e[2])
        else: merged.append(e)
    return {'dur': round(n / R, 2), 'snr_db': round(peak - floor, 1), 'floor_db': round(floor, 1), 'peak_db': round(peak, 1),
            'clip_pct': round(clip * 100, 3), 'rumble_pct': round(100 * low_e / max(tot, 1e-12), 1),
            'brightness_hz': round(zc / 2 / (n / R)), 'events': merged[:12]}
if __name__ == '__main__':
    for k in (sys.argv[1:] or sorted(f[:-5] for f in os.listdir('candidates'))):
        c = json.load(open(f'candidates/{k}.json'))
        for x in c:
            if os.path.exists(x.get('file', '')) and 'analysis' not in x:
                try: x['analysis'] = analyze(x['file'])
                except Exception as e: x['analysis'] = {'error': str(e)}
        json.dump(c, open(f'candidates/{k}.json', 'w'), indent=1, ensure_ascii=False)
        print('==', k)
        for x in c:
            a = x.get('analysis', {})
            print(f"  {x['sid']:>7} {x['dl']:>6}dl r{x['rating']} {a.get('dur','?'):>6}s snr{a.get('snr_db','?'):>5} clip{a.get('clip_pct','?')} rumble{a.get('rumble_pct','?'):>5}% ev{len(a.get('events',[]))} | {x['title'][:38]} | {', '.join(x['tags'][:6])}")
