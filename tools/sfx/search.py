import re, json, sys, time, urllib.request, urllib.parse
Q = {  # id: (búsqueda, dur min, dur max)
 'casco':('water lapping boat hull',15,180),'lona':('sail wind rigging',15,180),'crujido':('wooden boat creak',0.5,5),
 'aleteo':('sail flapping',0.5,5),'polea':('rope pulley creak',0.3,4),'atraque':('boat bump dock',0.3,4),
 'zarpar':('rowing boat oar splash',0.5,5),'orilla':('lake shore gentle waves',20,240),'viento':('wind ambience',20,240),
 'lluvia':('rain on water',20,240),'cubierta':('rain on wood roof',20,240),'grillos':('crickets night',20,240),
 'gaviota':('seagull',0.5,5),'bosque':('songbird',0.5,6),'buho':('owl hoot',0.5,5),'bruma':('buoy bell',1,10),
 'campana':('ship bell',1,8),'botes':('boats knocking dock',1,8),'cajas':('wooden crate drop',0.3,3),
 'mercado':('crowd murmur outdoor',20,240),'hacha':('axe chop wood',0.3,3),'gallina':('chicken cluck',0.5,5),
 'vaca':('cow moo',1,6),'ninos':('children playing',2,10),'perro':('dog bark distant',0.5,5),'puerta':('wooden door creak',0.5,5),
 'yunque':('anvil hammer',0.3,4),'fuelle':('bellows',0.5,5),'vagoneta':('mine cart',1,8),'piedras':('rocks falling',0.5,5),
 'oveja':('sheep bleat',0.5,5),'telar':('loom weaving',1,8),'cebada':('wind grass field',20,240),'monedas':('coins hand',0.3,2.5),
 'carga':('sack drop',0.2,2),'rumbo':('small bell chime',0.5,3),'mejora':('hammering nails wood',1,5),'encargo':('handbell',0.5,4),
 'mojada':('water splash',0.3,2.5),'bloqueo':('wood thud',0.2,2),'aviso':('bell ding soft',0.3,2.5)}
def search(q, d0, d1):
    url = 'https://freesound.org/search/?' + urllib.parse.urlencode({'q':q,'f':'license:"Creative Commons 0"','d0':d0,'d1':d1,'s':'Downloads (most first)'})
    s = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=30).read().decode()
    out = []
    for b in s.split('class="bw-search__result"')[1:]:
        g = lambda p: (re.search(p, b) or [None,None])[1]
        rating = g(r'aria-label="Average rating of ([\d.]+)"')
        out.append({'sid':g(r'data-sound-id="(\d+)"'),'user':g(r'data-username="([^"]+)"'),'title':g(r'data-title="([^"]*)"'),
          'dur':float(g(r'data-duration="([\d.]+)"') or 0),'dl':int(g(r'data-num-downloads="(\d+)"') or 0),
          'rating':float(rating) if rating else None,'mp3':(g(r'data-mp3="([^"]+)"') or '').replace('-lq.mp3','-hq.mp3')})
    return out
if __name__ == '__main__':
  res = {}
  for k,(q,a,b) in Q.items():
      try: res[k] = search(q,a,b)[:6]
      except Exception as e: res[k] = []; print(k, 'ERROR', e, file=sys.stderr)
      time.sleep(1.2)
  json.dump(res, open('candidates.json','w'), indent=1)
  for k,v in res.items():
      print(f'== {k}')
      for c in v[:4]: print(f"   {c['sid']:>7} {c['dl']:>6}dl  r{c['rating']}  {c['dur']:6.1f}s  {c['title'][:55]}  ({c['user']})")
