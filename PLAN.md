# PLAN — Loch Morag

Este archivo es el centro del proyecto: dice qué módulos existen, de qué se encarga cada uno, cuáles están hechos y en qué orden se construye lo que falta. El diseño del juego está en `docs/GDD.md` y `docs/PARCHE-v1.1.md` (donde se contradicen, manda el parche); aquí está cómo se programa.

## Cómo está organizado

```
src/
  main.js      Conecta los módulos. No contiene reglas del juego.
  core/        Piezas base: eventos, estado de la partida, registro de módulos.
  data/        Contenido del GDD como datos: mercancías, villas, mejoras. Sin lógica.
  maps/        La forma de cada mapa, en matemática pura.
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
| Villas | `data/villages.js` | Parche 1.B | ✓ solo Mapa 1 |
| Mejoras | `data/upgrades.js` | Parche 1.A | ✓ Casco Reforzado; las otras tres, solo datos |
| Encargos | `data/quests.js` | Parche 3 | ✓ La Carta sin Entregar |
| Mapa Loch Morag | `maps/lochMorag.js` | GDD 4 | ✓ con el Paso de las Piedras |
| Tiempo | `sim/time.js` | GDD 2.D | ✓ incluye la fase continua que usa la luz |
| Bodega con peso por bien | `sim/cargo.js` | Parche 2.B | ✓ |
| Comercio | `sim/trade.js` | Parche 2.B | ✓ |
| Confianza y niveles | `sim/trust.js` | Parche 2.D | ✓ |
| Navegación | `sim/navigation.js` | GDD 2.A | ✓ rumbo recto |
| Travesías | `sim/voyage.js` | Parche 2.C | ✓ el consumo doble por mal tiempo espera al módulo de clima |
| Encargos | `sim/quests.js` | Parche 3 | ✓ |
| Mejoras y astillero | `sim/upgrades.js` | Parche 1.A | ✓ entrega de materiales por partes |
| Actos y salida del mapa | `sim/acts.js` | Parche 3 | ✓ cierre del Acto I |
| Clima | `sim/weather.js` | GDD 2.D | ○ |
| Estados de villa (escasez, crisis) | `sim/villages.js` | GDD 2.C | ○ el parche no les da números |
| Estaciones | `sim/seasons.js` | GDD 5 | ○ |
| Cambio de mapa | `sim/travel.js`, `maps/current.js` | GDD 4 | ○ |
| Escena, luz y cámara | `world/scene.js` | — | ✓ |
| Terreno, acantilados, rocas, pinos | `world/terrain.js` … | — | ✓ |
| Agua | `world/water.js` | — | ✓ |
| Villas y muelles | `world/villages.js` | — | ◐ casas de cajas |
| Paso de las Piedras | `world/landmarks.js` | GDD 4 | ◐ piedras provisionales |
| Barco | `world/boat.js` | GDD 3 | ◐ modelo provisional; muestra el refuerzo del casco |
| Rumbo y estela | `world/courseMarker.js` | — | ✓ |
| Luz del día y la noche | `world/daylight.js` | GDD 2.D | ✓ sol, colores y ventanas encendidas; se desliza al cambiar de franja |
| Clima visual (niebla, lluvia) | `world/atmosphere.js` | GDD 2.D | ○ |
| Marcador y avisos | `ui/hud.js`, `ui/notices.js` | — | ✓ |
| Panel del muelle | `ui/dockPanel.js` | GDD 6 | ✓ tres pestañas |
| Cierre de acto | `ui/actEnd.js` | Parche 3 | ✓ |
| Sonido | `audio/` | — | ○ |

## Orden de construcción

Primero un tramo corto del juego completo de principio a fin; después se ensancha.

1. ~~**Acto I jugable en Loch Morag.**~~ Hecho: los tres criterios de terminado del parche se cumplen y `npm run verify` lo juega entero en cada corrida.
2. **Guardar partida** y pulir el Acto I: más diálogo, el Mapa del Atajo con algún uso, sonido.
3. **El viaje pesa.** Clima (viento, niebla, lluvia) con su parte visual, desgaste y reparación del casco.
4. **Arte propio.** Barco, casas y personajes desde Blender (.glb) en lugar de los provisionales.
5. **Mapa 2.** El Estrecho de Kyle, cambio de mapa y el Faro.
6. **Estaciones y Mapa 3.**

## Cómo se agrega un módulo

1. Si trae contenido nuevo, primero los datos en `data/`.
2. Las reglas en `sim/`, como funciones que reciben el estado.
3. Sus comprobaciones en `verify/suites.js`, y `npm run verify`.
4. Lo visual en `world/` o `ui/`, con la forma `{ id, label, init(ctx), update(ctx, dt) }`.
5. Una línea en la lista de `src/main.js` y una fila en la tabla de este archivo.

## Probar la luz sin esperar

Abre el juego con `?franja=0` (Mañana), `?franja=1` (Tarde) o `?franja=2` (Noche) al final de la dirección, por ejemplo `http://localhost:5173/?franja=2`.

## Decisiones de diseño por cerrar

El parche v1.1 resolvió precios, herramientas, hierro, consumo y Confianza. Queda esto:

- **Los materiales del casco no caben en la bodega.** 4 de roble (8 espacios) más 3 de resina son 11, y la bodega tiene 10. Hoy se resuelve dejando materiales en el astillero por partes. Alternativa: bajar el roble a 3.
- **Quién da los Clavos de Hierro Viejo.** El punto 1.A dice Mairead; el punto 3 dice Callum al recibir la carta. Está programado el punto 3.
- **El Mapa del Atajo.** El punto 2.D lo lista como misión de Glenmore con Confianza 20; el punto 3 lo da como premio de la carta. Está programado el punto 3, y el mapa todavía no hace nada.
- **Sobra dinero.** En la ruta de prueba el acto se cierra en 12 travesías con unas 400 monedas de sobra. Lo que frena es la Confianza de Port Dun, no las monedas.
- **Precios que el parche no fija.** Vender donde nadie lo necesita (80 % del base) y revender en el puerto productor (50 %).
- **Qué cuesta pasar la noche.** Hoy es gratis y solo avanza el día; su sentido real depende de clima, estados de villa y estaciones. Opción preferida: que el mundo avance mientras duermes.
- **Estados de villa.** Abastecida, Escasez y Crisis siguen en el GDD pero sin números.
