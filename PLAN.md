# PLAN — Loch Morag

Este archivo es el centro del proyecto: dice qué módulos existen, de qué se encarga cada uno, cuáles están hechos y en qué orden se construye lo que falta. El diseño del juego está en `docs/GDD.md` y `docs/PARCHE-v1.1.md` (donde se contradicen, manda el parche); aquí está cómo se programa.

## Cómo está organizado

```
src/
  main.js      Conecta los módulos. No contiene reglas del juego.
  core/        Piezas base: eventos, estado de la partida, registro de módulos.
  data/        Contenido del GDD como datos: mercancías, villas, mejoras. Sin lógica.
  maps/        La forma de cada mapa, en matemática pura. maps/index.js es el registro; shared.js arma cada mapa con defineMap().
  sim/         Las reglas del juego: tiempo, bodega, comercio, navegación, travesías.
  world/       Lo que se ve en 3D (Three.js): terreno, agua, barco, cámara.
  ui/          Lo que se ve en HTML: marcador, avisos, panel del muelle.
verify/        Comprobaciones automáticas de las reglas.
docs/          GDD.md y PARCHE-v1.1.md: tus documentos de diseño.
```

## Las cinco reglas

1. **Las reglas del juego no saben que existe la pantalla.** Nada en `sim/`, `data/`, `maps/` ni `core/` importa Three.js ni toca la página. Por eso se pueden comprobar solas, sin abrir el navegador.
2. **La pantalla no decide nada.** `world/` y `ui/` leen el estado y piden acciones a `sim/` (comprar, atracar, trazar rumbo). Nunca cambian monedas, carga o tiempo por su cuenta.
3. **Un módulo, un archivo, una responsabilidad.** Si el agua se ve mal, el problema está en `world/water.js` y en ningún otro lado.
4. **Los módulos no se llaman entre sí: se avisan.** Usan eventos (`dock:entered`, `trade:done`, `time:changed`). Agregar un módulo nuevo no obliga a editar los existentes.
5. **Todo lo que se guarda vive en un solo objeto.** `core/state.js` es JSON puro, así que guardar partida es escribir ese objeto.

## Qué pasa cuando algo falla

- Cada módulo arranca y se actualiza aislado. Si uno lanza un error, se apaga solo, aparece con ✗ en la lista de módulos (tecla **M** dentro del juego) y el resto sigue funcionando.
- Para apagar un módulo a mano mientras se arregla, se comenta su línea en la lista de `src/main.js`.
- `npm run verify` comprueba las reglas del juego en un par de segundos. Se corre antes y después de cada cambio: si algo que funcionaba se rompe, dice qué módulo y qué regla.

## Módulos

Estado: ✓ hecho y comprobado · ◐ provisional · ○ pendiente.

| Módulo | Archivo | Diseño | Estado |
|---|---|---|---|
| Eventos | `core/events.js` | — | ✓ |
| Estado de la partida | `core/state.js` | Parche 2.A | ✓ (guardar y cargar existen, falta el botón) |
| Registro de módulos | `core/systems.js` | — | ✓ |
| Mercancías y fórmula de precios | `data/goods.js` | Parche 2.B | ✓ Acto I; las del Acto II son provisionales |
| Objetos de historia | `data/items.js` | Parche 1.B | ✓ |
| Villas | `data/villages.js` | Parche 1.B | ✓ Mapa 1; Mapa 2 provisional (precios y Confianza a equilibrar) |
| Mejoras | `data/upgrades.js` | Parche 1.A | ✓ Casco Reforzado; las otras tres, solo datos |
| Encargos | `data/quests.js` | Parche 3 | ✓ La Carta sin Entregar |
| Registro de mapas | `maps/index.js`, `maps/shared.js` | GDD 4 | ✓ `mapOf(state)` da el mapa activo |
| Mapa Loch Morag | `maps/lochMorag.js` | GDD 4 | ✓ con el Paso de las Piedras |
| Mapa Estrecho de Kyle | `maps/kyle.js` | GDD 4 | ✓ canal con 4 islas, Achnacarn y Strathlinn, vuelta al lago; clima más duro |
| Piezas de pueblo | `world/townKit.js` | — | ✓ casas, puestos, faroles, vecinos y su animación, compartidos por las villas |
| Villa Achnacarn | `world/achnacarn.js` | — | ✓ fragua con fuego y humo, mina con vagoneta, herrero, minero |
| Villa Strathlinn | `world/strathlinn.js` | — | ✓ campos de cebada que se mecen con el viento, ovejas, telar, cordelero |
| Clima | `sim/weather.js`, `world/weather.js`, `ui/weatherChip.js` | GDD 2.D | ✓ cambia cada franja según el mapa; lluvia, niebla, viento; la cebada se moja y vale la mitad |
| Tiempo | `sim/time.js` | GDD 2.D | ✓ incluye la fase continua que usa la luz |
| Barra de bodega | `ui/cargoBar.js` | Parche 2.B | ✓ espacios por peso, suministros y carga mojada |
| Bodega con peso por bien | `sim/cargo.js` | Parche 2.B | ✓ |
| Comercio | `sim/trade.js` | Parche 2.B | ✓ |
| Confianza y niveles | `sim/trust.js` | Parche 2.D | ✓ |
| Navegación | `sim/navigation.js` | GDD 2.A | ✓ sigue puntos de paso con giro suave |
| Rutas | `sim/pathfind.js` | — | ✓ A* en grilla + suavizado: rodea islas, cabos y muelles con margen para el casco |
| Travesías | `sim/voyage.js` | Parche 2.C | ✓ el consumo doble por mal tiempo espera al módulo de clima |
| Encargos | `sim/quests.js` | Parche 3 | ✓ |
| Mejoras y astillero | `sim/upgrades.js` | Parche 1.A | ✓ entrega de materiales por partes |
| Actos y salidas del mapa | `sim/acts.js` | Parche 3 | ✓ todas las salidas de cada mapa; cierre del Acto I |
| Clima | `sim/weather.js` | GDD 2.D | ○ |
| Estados de villa (escasez, crisis) | `sim/villages.js` | GDD 2.C | ○ el parche no les da números |
| Estaciones | `sim/seasons.js` | GDD 5 | ○ |
| Cambio de mapa | `sim/travel.js`, `ui/mapTransition.js`, `ui/exitPrompt.js` | GDD 4 | ✓ gasta suministros y una franja (dos sin suministros); el mundo se rearma detrás de un telón |
| Escena, luz y cámara | `world/scene.js` | — | ✓ |
| Terreno, acantilados, rocas, pinos | `world/terrain.js` … | — | ✓ |
| Agua | `world/water.js` | — | ✓ |
| Villas y muelles | `world/villages.js` | — | ◐ casas de cajas |
| Villa Glenmore | `world/glenmore.js` | GDD 4 | ◐ torre, casas, mercado y vecinos animados con geometría provisional |
| Paso de las Piedras | `world/landmarks.js` | GDD 4 | ◐ piedras provisionales |
| Barco | `world/boat.js` | GDD 3 | ✓ "La Arenquera": escora, vela, farol y carga reaccionan al movimiento; muestra el refuerzo del casco |
| Rumbo y estela | `world/courseMarker.js` | — | ✓ |
| Luz del día y la noche | `world/daylight.js` | GDD 2.D | ✓ sol, colores y ventanas encendidas; se desliza al cambiar de franja |
| Clima visual (niebla, lluvia) | `world/atmosphere.js` | GDD 2.D | ○ |
| Avisos de texto | `ui/notices.js` | — | ✓ |
| Contador de monedas | `ui/coins.js` | — | ✓ arriba a la derecha, con el icono de la moneda |
| Iconos | `ui/icons.js`, `assets/coin.png` | — | ✓ mercancías y objetos de historia en el estilo de la moneda |
| Avisos de objetos obtenidos | `ui/pickups.js` | — | ✓ nombre, cantidad e icono al comprar, recibir o vender |
| Rótulo de llegada | `ui/villageLabel.js` | — | ✓ línea que se dibuja y nombre y zoom suave dentro del radio de cada villa, con histéresis |
| Panel del muelle | `ui/dockPanel.js` | GDD 6 | ✓ tres pestañas |
| Cierre de acto | `ui/actEnd.js` | Parche 3 | ✓ |
| Sonido | `audio/sfx.js`, `audio/synth.js`, `sim/sound.js`, `data/sounds.js` | — | ✓ barco, clima, villas en estéreo y eventos. Mezcla y escucha de prueba en el panel D |

## Orden de construcción

Primero un tramo corto del juego completo de principio a fin; después se ensancha.

1. ~~**Acto I jugable en Loch Morag.**~~ Hecho: los tres criterios de terminado del parche se cumplen y `npm run verify` lo juega entero en cada corrida.
2. **Guardar partida** y pulir el Acto I: más diálogo, el Mapa del Atajo con algún uso.
3. **El viaje pesa.** Clima (viento, niebla, lluvia) con su parte visual, desgaste y reparación del casco.
4. **Arte propio.** Barco, casas y personajes desde Blender (.glb) en lugar de los provisionales.
5. **Mapa 2.** Ya están las villas y el clima. Faltan encargos propios del Estrecho, el efecto de la Vela mayor y el límite de navegar de noche sin Linterna.
6. **Estaciones y Mapa 3.**

## Cómo se agrega un módulo

1. Si trae contenido nuevo, primero los datos en `data/`.
2. Las reglas en `sim/`, como funciones que reciben el estado.
3. Sus comprobaciones en `verify/suites.js`, y `npm run verify`.
4. Lo visual en `world/` o `ui/`, con la forma `{ id, label, init(ctx), update(ctx, dt) }`.
5. Una línea en la lista de `src/main.js` y una fila en la tabla de este archivo.

## Probar la luz sin esperar

Abre el juego con `?franja=0` (Mañana), `?franja=1` (Tarde) o `?franja=2` (Noche) al final de la dirección, por ejemplo `http://localhost:5173/?franja=2`.

Con `?villa=glenmore` (o `?villa=portDun`) la partida abre frente a ese muelle. Con `?mapa=kyle` abre en el Estrecho (`?mapa=kyle&villa=achnacarn` frente a ese muelle). Con `?clima=lluvia` (o `niebla`, `nublado`, `viento-en-contra`) abre con ese clima. Con `?debug` el juego queda en la consola como `window.game`. Se combinan: `?villa=glenmore&franja=2`.

## Decisiones de diseño por cerrar

El parche v1.1 resolvió precios, herramientas, hierro, consumo y Confianza. Queda esto:

- **Los materiales del casco no caben en la bodega.** 4 de roble (8 espacios) más 3 de resina son 11, y la bodega tiene 10. Hoy se resuelve dejando materiales en el astillero por partes. Alternativa: bajar el roble a 3.
- **Quién da los Clavos de Hierro Viejo.** El punto 1.A dice Mairead; el punto 3 dice Callum al recibir la carta. Está programado el punto 3.
- **El Mapa del Atajo.** El punto 2.D lo lista como misión de Glenmore con Confianza 20; el punto 3 lo da como premio de la carta. Está programado el punto 3, y el mapa todavía no hace nada.
- **Sobra dinero.** En la ruta de prueba el acto se cierra en 12 travesías con unas 400 monedas de sobra. Lo que frena es la Confianza de Port Dun, no las monedas.
- **Precios que el parche no fija.** Vender donde nadie lo necesita (80 % del base) y revender en el puerto productor (50 %).
- **Qué cuesta pasar la noche.** Hoy es gratis y solo avanza el día; su sentido real depende de clima, estados de villa y estaciones. Opción preferida: que el mundo avance mientras duermes.
- **Día, franja y casco mientras navegas.** La bodega tiene barra propia. El casco se consulta en el panel del muelle.
- **Port Dun sigue con casas de cajas.** Glenmore ya tiene pueblo propio; falta decidir el carácter de Port Dun.
- **Estados de villa.** Abastecida, Escasez y Crisis siguen en el GDD pero sin números.

## Cómo se agrega un mapa

1. Crea `src/maps/<nombre>.js` con `defineMap({ id, name, size, shoreDist, ports, exits, spawns })`. Solo hace falta la forma (`shoreDist`: negativa en el agua, positiva en tierra); la altura, las playas, el agua navegable y los puntos de la orilla salen solos.
2. Súmalo a `MAPS` en `src/maps/index.js`.
3. Conecta una salida de otro mapa con `to: '<id>'` y `spawn: '<llegada>'`.
4. `npm run verify` comprueba que cada llegada y cada muelle estén en el agua, que cada salida lleve a una llegada que existe y que desde cada llegada se pueda ir por agua a todo.

Los módulos de `world/` que dependen del mapa se arman en `build(ctx)` dentro de `ctx.world`; al cruzar se vacía y se vuelve a armar. Un módulo nuevo de ese tipo solo tiene que usar `build` en vez de `init`.

## Decisiones del Acto II que tomé yo (cámbialas en los datos si no te convencen)

- **Nombres.** Achnacarn ("el campo del montón de piedras"): herreros y mina de cobre, con Fergus el herrero. Strathlinn ("el valle de la cascada"): cebada, ovejas y cuerda, con Ishbel la tejedora.
- **Qué produce y qué necesita cada una.** Achnacarn produce hierro, clavos de cobre y herramientas; necesita turba, arenque y roble. Strathlinn produce cebada, lana y cuerda; necesita sal y herramientas. Así el lago le vende al Estrecho y el Estrecho comercia consigo mismo.
- **Mejoras.** La Bodega cubierta se instala en Achnacarn (120 monedas, Confianza 40) y la Vela mayor en Strathlinn (90, Confianza 40). La Linterna de proa todavía no tiene astillero.
- **Clima.** Lago: 55 % despejado, 25 % nublado, 14 % lluvia, 6 % niebla. Estrecho: 35 / 25 / 22 / 10, más 8 % de viento en contra. Lluvia, niebla y viento duplican el gasto de suministros.
- **Carga mojada.** Con lluvia, la cebada que viaja sin Bodega cubierta se moja y vale la mitad. Lo mojado se vende primero.
- **Nadie compra todavía la cebada a buen precio:** la destilería es del Mapa 3.

## Vista de desarrollador

Para ver todo sin jugar hasta ahí. Se abre con **D** (o º), tocando el contador de monedas o agregando `?dev` a la dirección.

- **Ir a:** salta a cualquier villa, salida o llegada de cualquier mapa.
- **Cámara:** vista general del mapa, cámara libre (arrastrar para recorrer, rueda o pellizco para acercar, el barco no se mueve), volver al barco y ocultar la interfaz para capturas.
- **Hora del día y clima:** cambian al instante.
- **Velocidad del juego:** ×1, ×3 u ×8.
- **Barco y bodega:** monedas, carga, mojar la carga, vaciar la bodega y poner o quitar cualquier mejora.
- **Confianza:** fija el nivel de cada villa del mapa (Forastero, Conocido, Aliado, Patrón).
- **Ver eventos:** el rótulo de llegada, el cierre del Acto I, el telón al cruzar de mapa, un aviso de objeto obtenido y el estado de los módulos.

Todo pasa por `sim/dev.js` (con sus pruebas); el cajón es `ui/devPanel.js`. Para quitarlo de una versión pública basta con sacar `devPanel` de la lista de `main.js`.

## Música

- **Piezas:** `src/data/music.js` lista 3 por mapa, con título y archivo. Los MP3 van en `public/music/` (ver el LEEME de esa carpeta).
- **Orden:** `sim/music.js` elige la siguiente sin repetir la última y prefiere las que llevan más tiempo sin sonar. Entre pieza y pieza hay entre 40 y 90 segundos de silencio.
- **Reproductor:** `audio/music.js` arranca con el primer toque o tecla (los navegadores no dejan antes), funde la música al cruzar de mapa y se pausa si la pestaña queda oculta. Los MP3 se decodifican con Web Audio para que suenen en iPhone.
- **Mientras falte un MP3,** `audio/sketch.js` toca un boceto de esa pieza hecho en código, con la escala, el tempo y la voz anotados en los datos.
- **Botón de sonido:** junto al clima, silencia música y efectos y recuerda la elección. La vista de desarrollador muestra qué suena y permite saltar a otra pieza.
- **Más adelante:** a cada pieza se le puede poner `weather: ['lluvia']` o `slots: [2]` (noche) para que solo suene con ese clima o a esa hora. Ya está probado.
