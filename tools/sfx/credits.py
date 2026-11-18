# Rehace public/sfx/CREDITOS.md a partir de las grabaciones que hay en public/sfx/.
# originales.json: la primera tanda (un archivo por sonido). variants.py + candidates/: las variantes.
import glob, html, json, os
from variants import VARIANTS
OUT = '../../public/sfx'
meta = {int(x['sid']): x for f in glob.glob('candidates/*.json') for x in json.load(open(f))}
orig = json.load(open('originales.json'))
for x in orig.values(): meta.setdefault(int(x['sid']), x)
link = x = lambda x: f"https://freesound.org/people/{x['user'].replace(' ', '%20')}/sounds/{x['sid']}/"
rows = []
for f in sorted(os.listdir(OUT)):
    if not f.endswith('.m4a'): continue
    k = f[:-4]
    if '-' in k:
        base, n = k.rsplit('-', 1); sid, a, b = VARIANTS[base][int(n) - 1]; x = meta[sid]; tramo = f' ({a:g}–{b:g} s)'
    else:
        x = orig[k]; tramo = ''
    rows.append(f"| `{f}` | {html.unescape(x['title']).replace('|', '/')}{tramo} | {x['user']} | {link(x)} |")
open(f'{OUT}/CREDITOS.md', 'w').write('\n'.join([
 '# Créditos de sonido', '',
 'Todas las grabaciones vienen de [Freesound](https://freesound.org) con licencia **CC0** (dominio público): se pueden usar, cambiar y vender sin pedir permiso ni dar crédito. Igual las listamos aquí para saber de dónde salió cada una.', '',
 '| Archivo | Grabación | Autor | Enlace |', '|---|---|---|---|', *rows, '',
 'Procesadas para el juego (con `tools/sfx/`): mono, recortadas, sin retumbe grave, con volumen parejo y, en los bucles, con la unión fundida para que no se note el corte.',
 'Los sonidos con número (`oveja-1`, `oveja-2`…) son variantes que se alternan al azar; entre paréntesis, el tramo usado de la grabación.', '',
 'Siguen sintetizados en código (no hubo grabación CC0 que sirviera): `fuelle` y `telar`.', '']))
print(len(rows), 'grabaciones')
