# Convierte raw/<id>.mp3 en out/<id>.m4a: mono, recortado, volumen parejo y, si es bucle, con unión sin corte.
import os, sys, math, wave, array, subprocess, json
sys.path.insert(0, '.')
from picks import PICKS
LOOPS = {'casco','lona','orilla','viento','lluvia','cubierta','grillos','mercado','cebada'}
RATE = 44100
def db(x): return 10 ** (x / 20)
def read(path):
    tmp = path + '.wav'
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', f'LEI16@{RATE}', path, tmp], check=True)
    w = wave.open(tmp); ch = w.getnchannels(); data = array.array('h', w.readframes(w.getnframes())); w.close(); os.remove(tmp)
    if ch == 1: return [v / 32768 for v in data]
    return [sum(data[i:i+ch]) / ch / 32768 for i in range(0, len(data), ch)]
def write(samples, path):
    tmp = path + '.wav'; w = wave.open(tmp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes(array.array('h', (max(-32767, min(32767, int(v * 32767))) for v in samples)).tobytes()); w.close()
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000', tmp, path], check=True); os.remove(tmp)
def windows(s, n=2205):  # RMS cada 50 ms
    return [math.sqrt(sum(v*v for v in s[i:i+n]) / max(1, len(s[i:i+n]))) for i in range(0, len(s), n)]
def process(k):
    sid, cap, start = PICKS[k]
    s = read(f'raw/{k}.mp3')
    mean = sum(s) / len(s); s = [v - mean for v in s]          # quita corriente continua
    if k in LOOPS:
        L = min(20 * RATE, len(s) - int(2.5 * RATE)); X = int(1.5 * RATE)
        off = min(int(1 * RATE), len(s) - L - X)
        seg = s[off:off + L + X]; out = seg[:L]
        for i in range(X):  # fundido de igual potencia: la cola entra sobre el principio
            a = i / X; out[i] = seg[i] * math.sqrt(a) + seg[L + i] * math.sqrt(1 - a)
        rms = math.sqrt(sum(v*v for v in out) / len(out)); g = db(-20) / rms
    else:
        if cap: s = s[int(start*RATE):int((start+cap)*RATE)]
        w = windows(s); peak = max(w); on = [i for i, v in enumerate(w) if v > peak * db(-40)]
        a, b = max(0, on[0] - 1) * 2205, min(len(s), (on[-1] + 2) * 2205)
        out = s[a:b]
        if not cap and len(out) > 6 * RATE: out = out[:6 * RATE]
        fi, fo = int(.004 * RATE), int(min(.25, len(out) / RATE * .2) * RATE)
        for i in range(fi): out[i] *= i / fi
        for i in range(fo): out[-1 - i] *= i / fo
        if cap:  # fragmentos cortados de una grabación larga: entrada suave
            fi = int(.3 * RATE)
            for i in range(fi): out[i] *= i / fi
        w = sorted(windows(out), reverse=True); active = w[:max(1, len(w) // 3)]
        g = db(-16) / (sum(active) / len(active))
    pk = max(abs(v) for v in out)
    g = min(g, db(-1) / pk)                                      # nunca pasar de -1 dB de pico
    out = [v * g for v in out]
    os.makedirs('out', exist_ok=True); write(out, f'out/{k}.m4a')
    return len(out) / RATE, 20 * math.log10(g)
if __name__ == '__main__':
    for k in (sys.argv[1:] or PICKS):
        d, gdb = process(k); print(f'{k:9} {d:5.1f}s  ganancia {gdb:+5.1f} dB  {os.path.getsize(f"out/{k}.m4a")//1024} KB', flush=True)
