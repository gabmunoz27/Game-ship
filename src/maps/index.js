// Registro de mapas. Para agregar uno: crea su archivo en maps/ con defineMap() y súmalo aquí.
// Lo que se juega (sim/) y lo que se ve (world/) siempre preguntan por el mapa activo con mapOf(state).
import lochMorag from './lochMorag.js';
import kyle from './kyle.js';

export const MAPS = { lochMorag, kyle };
export const FIRST_MAP = 'lochMorag';
export const getMap = id => MAPS[id];
export const mapOf = state => MAPS[state.map] || MAPS[FIRST_MAP];
