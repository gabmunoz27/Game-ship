# Loch Morag

Juego de comercio y navegación en las Highlands, hecho con Three.js.

## Cómo correrlo

1. Abre esta carpeta en VS Code.
2. En la terminal: `npm install` (solo la primera vez).
3. `npm run dev` abre el juego en el navegador.
4. `npm run verify` comprueba las reglas del juego.

## Dónde mirar

- `PLAN.md` — estructura del código, estado de cada módulo y orden de construcción.
- `docs/GDD.md` — documento de diseño.

Para ver la luz de cada franja del día: añade `?franja=0`, `?franja=1` o `?franja=2` a la dirección del juego.
Con `?villa=glenmore` la partida abre frente al muelle de Glenmore, y con `?mapa=kyle` en el Estrecho de Kyle.

Si actualizas el proyecto y aparece un error de un paquete que falta, vuelve a ejecutar `npm install`.

**Vista de desarrollador:** pulsa D en el juego (o toca las monedas, o agrega `?dev` a la dirección) para saltar a cualquier villa o mapa, cambiar la hora y el clima, darte carga y mejoras y ver los eventos sin jugar.

**Música:** pon los MP3 en `public/music/` con los nombres del LEEME de esa carpeta. Mientras falte alguno suena un boceto hecho en código.

**Para trabajar con ChatGPT, Codex u otra persona:** lee `AGENTS.md`. Dice qué hay en cada carpeta, dónde se cambia cada cosa y las reglas para no romper nada.
