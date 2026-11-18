// Villas del Mapa 1 con la oferta y demanda del Acto I (Parche v1.1). Las de los mapas 2 y 3 se agregan con el mismo formato.
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
  }
};
