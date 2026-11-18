# Resumen de trabajo con Claude — Loch Morag

Para retomar en VS Code (Claude Code, Codex, Copilot o ChatGPT). Léase junto con `AGENTS.md` (reglas y dónde cambiar cada cosa) y `PLAN.md` (estado y pendientes).

## El proyecto

Juego de comercio en barco, 3D low-poly, en las Highlands de Escocia. Three.js + Vite, JavaScript con módulos ES, sin frameworks. Textos del juego en español.

```
npm install      # una vez
npm run dev      # jugar con recarga automática
npm run verify   # tiene que decir "Todo en orden."
npm run build    # versión final en dist/
```

Arquitectura en cinco capas: `data/` (contenido) → `maps/` (forma del mapa, matemática pura) → `sim/` (reglas, sin Three.js ni DOM) → `world/` (3D) → `ui/` (HTML). Las reglas viven solo en `sim/`. Los módulos se comunican por eventos (`core/events.js`) y se registran en la lista de `src/main.js`. Un módulo que falla se apaga solo (tecla M para verlos).

## Lo que se hizo, en orden

1. **Barco con personalidad ("La Arenquera")** — `world/boat.js` reescrito: proa en espiral con farol, timón en cola de pez, vela con arenques, patrón, cajas que aparecen según la carga. Movimiento con resortes: se inclina en las curvas, cabecea al acelerar, la vela se retrasa, salta al fijar rumbo y asiente al llegar. `sim/navigation.js` con inercia y giro suave; `world/input.js` permite tocar o arrastrar para trazar rumbo. Inspirado en la fluidez de Boatem (Monument Valley), sin copiarlo.
2. **Varios mapas** — `maps/shared.js` (`defineMap`) genera terreno, agua navegable, playas, muelles y salidas a partir de una función de distancia a la costa. `maps/index.js` registra los mapas (`lochMorag`, `kyle`). Los módulos de `world/` arman lo que depende del mapa en `build(ctx)` y se rearman al cambiar de mapa. Cruce entre mapas: `sim/travel.js`, `ui/exitPrompt.js`, `ui/mapTransition.js` (cortina con el nombre del destino). El fin del Acto I ofrece cruzar al Estrecho de Kyle.
3. **Rutas alrededor de islas** — `sim/pathfind.js` (A* sobre la cuadrícula de agua, con suavizado). Un toque al otro lado de una isla traza el camino en vez de rechazarlo. `ui/courseMarker.js` dibuja la ruta con varios tramos.
4. **Estrecho de Kyle: dos villas nuevas** — Achnacarn (herrero Fergus: forja, mina, vagoneta; produce hierro, clavos de cobre, herramientas) y Strathlinn (tejedora Ishbel: cebada que se mece con el viento, ovejas, telar; produce cebada, lana, cuerda de cáñamo). Piezas compartidas en `world/townKit.js`. Datos en `data/villages.js`; mejoras del Acto II en `data/upgrades.js` (`covered_hold` en Achnacarn, `main_sail` en Strathlinn, `bow_lantern`).
5. **Clima** — `sim/weather.js`: despejado, nublado, lluvia, niebla, viento en contra; probabilidades por mapa (campo `weather` de cada mapa), azar con semilla guardada en la partida. Mal clima duplica el gasto de provisiones; lluvia moja la carga delicada (vale la mitad) salvo con bodega cubierta. Visual en `world/weather.js`; aviso en `ui/weatherChip.js`; los avisos ahora van en cola.
6. **Vista de desarrollador** — `ui/devPanel.js` + `sim/dev.js`. Se abre con la tecla D o **tocando las monedas** (un toque; nunca mantener presionado, porque en iOS sale la lupa). Permite saltar a cualquier villa o mapa, cámara libre (arrastrar y pellizcar), cambiar hora, clima, velocidad, monedas, carga, mejoras, confianza y música. También por URL: `?mapa=`, `?villa=`, `?clima=`, `?dev`.
7. **Música** — 3 piezas por mapa con silencios de 40–90 s entre ellas. `data/music.js` (lista), `sim/music.js` (elige sin repetir), `audio/music.js` (reproductor; arranca con el primer toque, funde al cambiar de mapa, botón de silencio en `ui/soundButton.js`). Mientras no estén los MP3, suena un boceto sintetizado (`audio/sketch.js`). Los MP3 van en `public/music/` con estos nombres: `lochMorag-1.mp3` `lochMorag-2.mp3` `lochMorag-3.mp3` `kyle-1.mp3` `kyle-2.mp3` `kyle-3.mp3`. Estilo buscado: relajante, celta, tipo Valhalla / Age of Empires, pero original (no usar música de esos juegos).
8. **Guía para otras herramientas** — `AGENTS.md`: capas, tabla de "dónde cambiar cada cosa", forma de un módulo, eventos, checklist.
9. **Ambientación y efectos** — El barco, el clima y los cuatro muelles comparten el contexto de la música. El panel D permite probar sonidos y paisajes y guardar tres volúmenes. Los nombres para sustituir cada síntesis por una grabación están en `public/sfx/LEEME.md`.

10. **Navegación y HUD** — Los cuatro muelles tienen colisión y amarre lateral. La cámara y el rótulo reaccionan a 20 unidades del amarre y se retiran al superar 24. El gesto de rumbo suena una vez con un intervalo mínimo de 1,5 segundos. La barra de bodega muestra peso, capacidad y humedad. La lluvia usa el mismo vector para orientarse y desplazarse.

Arreglos de iOS que no hay que deshacer: `#ui` tiene `pointer-events:none`, así que cualquier cosa tocable necesita `pointer-events:auto`; la música usa `decodeAudioData` en lugar de `<audio>`.

## Decisiones provisionales (revisar)

Precios de los bienes del Acto II, costos de las mejoras (90/120 monedas, confianza 40) y probabilidades del clima los puso Claude como punto de partida.

## Pendiente

- Poner los 6 MP3 reales en `public/music/`.
- Encargos propios del Estrecho de Kyle.
- Que la vela mayor reduzca el gasto de viaje y que navegar de noche requiera el farol de proa.
- Mapa 3 (con la destilería que compre la cebada a buen precio).
- Música por clima y hora del día (el sistema ya lo admite con campos `weather`/`slots` en cada pista).
