// Música de cada mapa. Las piezas suenan una tras otra con silencios en medio (como en Valhalla o Minecraft).
// file: el MP3 en public/music/. Mientras no exista, suena una versión provisional hecha en código
//       con los datos de "sketch" (escala, nota base, tempo y voz principal).
// Más adelante: weather (['lluvia', 'niebla']) y slots ([2] = noche) limitan cuándo puede sonar cada pieza;
// si no se indican, suena con cualquier clima y a cualquier hora.
export const TRACKS = [
  { id: 'lochMorag-1', map: 'lochMorag', title: 'Mañana en el lago',   file: 'music/lochMorag-1.mp3', sketch: { mode: 'dorian',     root: 62, tempo: 70, voice: 'whistle' } },
  { id: 'lochMorag-2', map: 'lochMorag', title: 'Turba y humo',         file: 'music/lochMorag-2.mp3', sketch: { mode: 'mixolydian', root: 55, tempo: 66, voice: 'fiddle' } },
  { id: 'lochMorag-3', map: 'lochMorag', title: 'Regreso a Port Dun',   file: 'music/lochMorag-3.mp3', sketch: { mode: 'dorian',     root: 57, tempo: 76, voice: 'harp' } },
  { id: 'kyle-1',      map: 'kyle',      title: 'El Estrecho',          file: 'music/kyle-1.mp3',      sketch: { mode: 'aeolian',    root: 45, tempo: 60, voice: 'cello' } },
  { id: 'kyle-2',      map: 'kyle',      title: 'Hierro de Achnacarn',  file: 'music/kyle-2.mp3',      sketch: { mode: 'phrygian',   root: 52, tempo: 64, voice: 'drone' } },
  { id: 'kyle-3',      map: 'kyle',      title: 'Cebada al viento',     file: 'music/kyle-3.mp3',      sketch: { mode: 'mixolydian', root: 62, tempo: 72, voice: 'whistle' } }
];
/** Silencio entre piezas, en segundos (se sortea entre estos dos). */
export const GAP = [40, 90];
