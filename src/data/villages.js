// Villas de cada mapa con lo que producen y lo que necesitan. Mapa 1: Parche v1.1. Mapa 2 (Acto II): provisional, a equilibrar.
export const VILLAGES = {
  portDun: {
    name: 'Port Dun', map: 'lochMorag', initialTrust: 10,
    npc: { name: 'Mairead', role: 'Encargada del muelle' },
    greeting: 'Así que tú llevas ahora el barco del viejo. El lago no perdona a los que salen sin reservas.',
    produces: ['fish', 'salt', 'resin'],
    needs: ['peat', 'oak_wood']
  },
  glenmore: {
    name: 'Glenmore', map: 'lochMorag', initialTrust: 0,
    npc: { name: 'Callum', role: 'Cortador de turba' },
    greeting: 'No esperaba barco hasta el deshielo. Si traes arenque o sal, hablamos.',
    produces: ['peat', 'oak_wood'],
    needs: ['fish', 'salt']
  },
  // Estrecho de Kyle. Achnacarn: "el campo del montón de piedras", pueblo de herreros junto a una mina de cobre.
  achnacarn: {
    name: 'Achnacarn', map: 'kyle', initialTrust: 0,
    npc: { name: 'Fergus', role: 'Herrero' },
    greeting: 'Hacía tres inviernos que nadie cruzaba el Paso. La fragua come turba como un buey; si me la traes, hierro no te va a faltar.',
    produces: ['iron', 'copper_nails', 'tools'],
    needs: ['peat', 'fish', 'oak_wood']
  },
  // Strathlinn: "el valle de la cascada", campos de cebada y ovejas en la ladera sur.
  strathlinn: {
    name: 'Strathlinn', map: 'kyle', initialTrust: 0,
    npc: { name: 'Ishbel', role: 'Tejedora' },
    greeting: 'La cebada no aguanta la lluvia, y aquí llueve más que en ningún sitio. Si te la llevas, tápala bien.',
    produces: ['barley', 'wool', 'hemp_rope'],
    needs: ['salt', 'tools']
  }
};
