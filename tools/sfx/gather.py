# Busca candidatos CC0 en freesound, lee su descripción y etiquetas, y descarga el preview de alta calidad.
# Resultado: candidates/<id>.json (datos) y raw/cand/<id>/<sid>.mp3 (audio). Necesita internet.
import json, os, re, sys, time, html, urllib.request, urllib.parse
from search import search
Q = {
 'oveja':[('sheep bleat',0.5,8),('sheep field recording',2,30),('ewe lamb',0.5,10),('sheep flock',3,40)],
 'vaca':[('cow moo',0.5,8),('cows field recording',3,40),('cattle moo',0.5,10)],
 'gallina':[('hen clucking',0.5,10),('chickens field recording',3,40),('chicken cluck',0.5,6)],
 'perro':[('dog bark distant',0.5,6),('dog barking field recording',1,20),('farm dog bark',0.5,10)],
 'gaviota':[('herring gull',0.5,10),('seagull call',0.5,6),('gulls harbour',2,30)],
 'bosque':[('blackbird song',1,15),('robin song',1,15),('wren song',1,15),('song thrush',1,15),('chaffinch',1,15)],
 'buho':[('tawny owl',0.5,10),('owl hoot',0.5,8)],
 'grillos':[('crickets night',20,240),('crickets field recording',20,240)],
 'monedas':[('coins hand',0.2,3),('coins pouch',0.2,3),('coin drop',0.2,2),('coins jingle',0.2,3),('handful of coins',0.2,3)],
 'carga':[('sack drop',0.2,2),('grain sack',0.2,3),('bag thud',0.2,2)],
 'cajas':[('wooden crate drop',0.2,3),('wooden box put down',0.2,3),('crate placed',0.2,3)],
 'crujido':[('wooden boat creak',0.5,6),('ship creak',0.5,6),('rope creak wood',0.5,6),('wood creak',0.5,4)],
 'atraque':[('boat hits dock',0.3,5),('wooden boat bump',0.3,5),('rowboat dock',0.3,6)],
 'polea':[('pulley creak',0.3,4),('block and tackle',0.3,6),('rope pulley',0.3,4)],
 'botes':[('boats moored creak',3,30),('boats knocking pier',2,30),('moored boat',3,30)],
 'ninos':[('children playing outdoors',5,40),('kids playing park',5,40),('children laughing',1,12)],
 'yunque':[('anvil',0.3,4),('blacksmith hammer anvil',0.3,6),('anvil strike',0.3,4)],
 'campana':[('ship bell',1,8),('harbour bell',1,8),('bell ring brass',1,8)],
 'encargo':[('hand bell',0.5,4),('brass bell',0.5,4)],
 'rumbo':[('small bell',0.3,3),('chime small',0.3,3)],
 'aviso':[('soft bell',0.3,2.5),('tiny bell',0.3,2.5)],
 'mojada':[('water splash small',0.3,2.5),('splash',0.3,2.5)],
 'bloqueo':[('wood thud',0.2,2),('wooden knock',0.2,2)],
 'hacha':[('axe chop',0.2,3),('chopping wood',0.2,3),('axe split log',0.2,3)],
 'piedras':[('rocks falling',0.5,5),('stones tumble',0.5,5),('gravel fall',0.5,5)],
}
UA = {'User-Agent':'Mozilla/5.0'}
def get(url): return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
def details(c):
    s = get("https://freesound.org/people/" + urllib.parse.quote(c["user"]) + f"/sounds/{c['sid']}/").decode('utf8','ignore')
    m = re.search(r'id="soundDescriptionSection">(.*?)</div>', s, re.S)
    c['description'] = html.unescape(re.sub(r'<[^>]+>', ' ', m[1])).strip()[:600] if m else ''
    c['tags'] = sorted(set(re.findall(r'href="/browse/tags/([^/"?]+)/?"', s)))[:25]
    c['title'] = html.unescape(c['title'] or '')
ids = sys.argv[1:] or list(Q)
for k in ids:
    seen, out = set(), []
    for q,a,b in Q[k]:
        try:
            for c in search(q,a,b)[:6]:
                if c['sid'] in seen or not c['mp3']: continue
                seen.add(c['sid']); c['query'] = q; out.append(c)
        except Exception as e: print(k, q, 'ERROR búsqueda', e)
        time.sleep(1)
    out = sorted(out, key=lambda c: -c['dl'])[:10]
    os.makedirs(f'raw/cand/{k}', exist_ok=True)
    for c in out:
        try: details(c); time.sleep(.6)
        except Exception as e: c['description'] = f'(no se pudo leer: {e})'; c['tags'] = []
        dst = f"raw/cand/{k}/{c['sid']}.mp3"
        if not os.path.exists(dst):
            try: open(dst,'wb').write(get(c['mp3'])); time.sleep(.3)
            except Exception as e: print(k, c['sid'], 'ERROR descarga', e)
        c['file'] = dst
    os.makedirs('candidates', exist_ok=True)
    json.dump(out, open(f'candidates/{k}.json','w'), indent=1, ensure_ascii=False)
    print(f'{k}: {len(out)} candidatos', flush=True)
