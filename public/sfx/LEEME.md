# Grabaciones de Loch Morag

Las grabaciones que trae el juego están aquí en `.m4a` (fuentes en `CREDITOS.md`). Para cambiar una, reemplaza su archivo o guarda un MP3 u OGG con el mismo identificador, por ejemplo `yunque.mp3`, y borra el `.m4a`: el juego busca primero `.m4a`, luego `.mp3` y luego `.ogg`. Si no encuentra ninguno, usa el sonido sintetizado en código (hoy: `fuelle` y `telar`). Recarga el juego después de cambiar archivos. Prepara los bucles con una unión limpia y los disparos con su cola natural. Usa mono para que la villa se pueda situar en estéreo.

**Variantes.** Los sonidos que tienen `variants: n` en `src/data/sounds.js` usan `<id>-1`, `<id>-2`… hasta `<id>-n` (por ejemplo `oveja-1.m4a` … `oveja-4.m4a`), y cada vez suena una al azar sin repetir la anterior. Para sumar una, agrega el archivo con el número siguiente y sube `variants`. Para buscar, analizar y recortar grabaciones nuevas están los scripts de `tools/sfx/` (gather.py, analyze.py, variants.py, credits.py).

| Identificador | Sonido | Tipo | Duración sugerida |
|---|---|---|---|
| `casco` | Agua contra el casco | bucle | 12–30 s |
| `lona` | Tensión de la vela | bucle | 12–30 s |
| `crujido` | Crujido de madera | disparo | 0,3–3 s |
| `aleteo` | Lona al viento | disparo | 0,3–3 s |
| `polea` | Cuerda en la polea | disparo | 0,3–3 s |
| `atraque` | Madera al atracar | disparo | 0,3–3 s |
| `zarpar` | Empujón al zarpar | disparo | 0,3–3 s |
| `orilla` | Olas en la orilla | bucle | 12–30 s |
| `viento` | Viento del mapa | bucle | 12–30 s |
| `lluvia` | Lluvia sobre el agua | bucle | 12–30 s |
| `cubierta` | Gotas en cubierta | bucle | 12–30 s |
| `grillos` | Grillos nocturnos | bucle | 12–30 s |
| `gaviota` | Gaviota | disparo | 0,3–3 s |
| `bosque` | Pájaros de bosque | disparo | 0,3–3 s |
| `buho` | Búho distante | disparo | 0,3–3 s |
| `bruma` | Campana de niebla | disparo | 0,3–3 s |
| `campana` | Campana del puerto | disparo | 0,3–3 s |
| `botes` | Botes contra el muelle | disparo | 0,3–3 s |
| `cajas` | Cajas apiladas | disparo | 0,3–3 s |
| `mercado` | Murmullo de gente | bucle | 12–30 s |
| `hacha` | Hacha en el tronco | disparo | 0,3–3 s |
| `gallina` | Gallinas | disparo | 0,3–3 s |
| `vaca` | Vaca distante | disparo | 0,3–3 s |
| `ninos` | Niños jugando | disparo | 0,3–3 s |
| `perro` | Perro distante | disparo | 0,3–3 s |
| `puerta` | Puerta de madera | disparo | 0,3–3 s |
| `yunque` | Martillo en el yunque | disparo | 0,3–3 s |
| `fuelle` | Fuelle de la fragua | disparo | 0,3–3 s |
| `vagoneta` | Ruedas sobre rieles | disparo | 0,3–3 s |
| `piedras` | Piedras de la mina | disparo | 0,3–3 s |
| `oveja` | Oveja | disparo | 0,3–3 s |
| `telar` | Telar de madera | disparo | 0,3–3 s |
| `cebada` | Espigas al viento | bucle | 12–30 s |
| `monedas` | Monedas en la mano | disparo | 0,3–3 s |
| `carga` | Fardo en la bodega | disparo | 0,3–3 s |
| `rumbo` | Rumbo trazado | disparo | 0,3–3 s |
| `mejora` | Instalación en el astillero | disparo | 0,3–3 s |
| `encargo` | Encargo completado | disparo | 0,3–3 s |
| `mojada` | Salpicadura sobre la carga | disparo | 0,3–3 s |
| `bloqueo` | Salida bloqueada | disparo | 0,3–3 s |
| `aviso` | Aviso discreto | disparo | 0,3–3 s |
