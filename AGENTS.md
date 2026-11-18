# Guía para trabajar en Loch Morag (personas, ChatGPT, Codex y Claude)

Codex lee este archivo solo. A ChatGPT pégaselo al empezar una conversación, junto con los archivos que vas a cambiar.

## Qué es

Juego de comercio en barco, 3D low-poly, en las Highlands de Escocia. Three.js + Vite, JavaScript con módulos ES, sin frameworks. Diseño: `docs/GDD.md` y `docs/PARCHE-v1.1.md`. Estado y decisiones: `PLAN.md`.

```
npm install        # una vez, o cuando cambie package.json
npm run dev        # abre el juego en el navegador y se recarga solo
npm run verify     # comprueba las reglas del juego; tiene que decir "Todo en orden."
npm run build      # versión final en dist/
```

## Las cinco capas (la regla más importante)

| Carpeta | Qué contiene | Puede usar | No puede usar |
|---|---|---|---|
| `src/data/` | Contenido: bienes, villas, mejoras, encargos, música. Solo datos. | nada | funciones, Three.js, la página |
| `src/maps/` | La forma de cada mapa en matemática pura. | `maps/shared.js` | Three.js, la página |
| `src/sim/` | Las reglas: comercio, confianza, navegación, clima, viajes. | `data/`, `maps/`, `core/` | Three.js, la página (`document`, `window`) |
| `src/world/` | Lo que se ve en 3D. Lee la partida y la dibuja. | todo lo anterior y Three.js | cambiar reglas del juego |
| `src/ui/` | Lo que se ve en HTML: monedas, avisos, panel del muelle. | todo lo anterior | cambiar reglas del juego |

Además: `src/core/` (eventos, partida, registro de módulos), `src/audio/` (música) y `verify/` (pruebas).

Si una regla de juego aparece en `world/` o `ui/`, está en el lugar equivocado: va en `sim/` y la pantalla la lee.

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Precio, peso o nombre de un bien | `src/data/goods.js` |
| Qué produce o necesita una villa, su personaje o su saludo | `src/data/villages.js` |
| Materiales, costo o Confianza de una mejora | `src/data/upgrades.js` |
| Encargos (misiones) | `src/data/quests.js` y `src/sim/quests.js` |
| Precios de compra y venta (70 %, 140 %…) | `src/data/goods.js` (constantes) y `src/sim/trade.js` |
| Niveles de Confianza | `src/sim/trust.js` |
| Clima: probabilidades por mapa | el campo `weather` de cada mapa en `src/maps/` |
| Clima: qué hace (gasto doble, carga mojada) | `src/sim/weather.js` |
| Sonidos, paisajes de villas y mapas, grabaciones | `src/data/sounds.js`, `public/sfx/LEEME.md` |
| Mezcla por distancia, clima y movimiento | `src/sim/sound.js` |
| Reproducción, síntesis y volumen | `src/audio/sfx.js`, `synth.js`, `levels.js` |
| Música: títulos y archivos | `src/data/music.js`; los MP3 van en `public/music/` |
| Forma de un mapa, sus muelles y salidas | `src/maps/lochMorag.js`, `src/maps/kyle.js` |
| Huella de la cubierta y pilotes, colisión del casco y rutas | `src/maps/shared.js`, `src/sim/navigation.js`, `src/sim/pathfind.js`, dibujo en `src/world/villages.js` |
| Radio de llegada, rótulo y acercamiento | `src/data/villages.js` (arrivalRadius), `src/sim/navigation.js`, `src/ui/villageLabel.js`, `src/world/scene.js` |
| Bodega siempre visible | `src/ui/cargoBar.js`, `src/ui/icons.js`, `src/ui/ui.css` |
| Sonido de inicio de rumbo y arrastre | `src/world/input.js`, `src/sim/navigation.js`, `src/audio/sfx.js` |
| Un mapa nuevo | archivo nuevo en `src/maps/` + sumarlo en `src/maps/index.js` (ver `PLAN.md`) |
| Cómo se ve una villa | `src/world/glenmore.js`, `achnacarn.js`, `strathlinn.js`; Port Dun usa `world/villages.js` |
| Casas, faroles, vecinos (piezas comunes) | `src/world/townKit.js` |
| El barco y su movimiento visual | `src/world/boat.js`; la física del rumbo en `src/sim/navigation.js` |
| Agua, terreno, árboles, acantilados | `src/world/water.js`, `terrain.js`, `pines.js`, `cliffs.js` |
| Luz del día y la noche | `src/world/daylight.js` |
| Lluvia, niebla, viento (lo visual) | `src/world/weather.js` |
| Colores, fuentes y tamaños de la interfaz | `src/ui/ui.css` |
| Panel del muelle (comercio, astillero, encargos) | `src/ui/dockPanel.js` |
| Íconos | `src/ui/icons.js` |
| Textos de avisos | `src/ui/notices.js`, `src/ui/weatherChip.js` |
| Vista de desarrollador | `src/ui/devPanel.js` y `src/sim/dev.js` |
| Agregar o quitar un módulo | la lista de `src/main.js` |

## Forma de un módulo

Cada archivo de `world/`, `ui/` y `audio/` exporta un objeto así y se registra en la lista de `src/main.js`:

```js
export default {
  id: 'miModulo', label: 'Nombre legible',
  init(ctx) { /* se arma una vez */ },
  build(ctx) { /* opcional: lo que depende del mapa; va dentro de ctx.world y se rearma al cambiar de mapa */ },
  update(ctx, dt) { /* cada cuadro */ }
};
```

Si un módulo falla, se apaga solo y el resto del juego sigue. La tecla M muestra cuáles fallaron.

`ctx` trae: `state` (la partida), `scene`, `world`, `camera`, `cam`, `lights`, `ui`, `time`, `night` (0 a 1), `wind`, `music`.

## Cómo se comunican: eventos

Los módulos no se llaman entre sí. `sim/` cambia la partida y avisa con `emit('evento', datos)`; quien quiera, escucha con `on('evento', fn)` (en `src/core/events.js`).

Eventos que existen: `cargo:added` `cargo:changed` `cargo:soaked` `coins:changed` `trade:done` `trust:changed` `dock:entered` `dock:left` `dock:near` `port:near` `exit:near` `exit:blocked` `course:set` `course:updated` `course:cleared` `time:changed` `weather:changed` `map:changed` `travel:request` `upgrade:materials` `upgrade:installed` `item:gained` `quest:accepted` `quest:completed` `act:completed` `notice` `audio:ready` `audio:volume` `audio:preview` `audio:duck` `music:started` `music:next` `music:mute` `music:muted` `dev:moved` `system:failed`.

`port:near` anuncia entrar o salir del radio de la villa. `dock:near` controla el botón de atraque. `course:set` inicia el rumbo del gesto y `course:updated` actualiza su destino durante el arrastre.

## La partida

Todo el estado vive en un objeto (`src/core/state.js`) que tiene que poder guardarse como JSON: nada de clases, funciones ni objetos de Three.js adentro. Si agregas un dato a la partida, súmalo ahí con su valor inicial.

## Antes de dar un cambio por bueno

1. `npm run verify` dice "Todo en orden.". Si cambias una regla, ajusta o suma su prueba en `verify/suites.js`.
2. `npm run dev` y míralo en el navegador. Con D (o tocando las monedas) se abre la vista de desarrollador para saltar a cualquier lugar, hora o clima.
3. Haz un commit con un mensaje en español que diga qué cambió y por qué.

## Cosas que no hay que hacer

- No meter reglas de juego en `world/` o `ui/`.
- No usar `document` ni `window` en `sim/`, `data/` o `maps/` (las pruebas corren sin navegador).
- No reescribir un archivo entero para un cambio chico; cambiar solo lo necesario.
- No subir `node_modules/` ni `dist/`.
- Textos del juego en español.
