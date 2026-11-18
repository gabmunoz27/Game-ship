// Encargos narrativos. Cada uno: quién lo da, a quién se entrega, qué objetos de historia mueve y sus textos.
export const QUEST_TRUST_REWARD = 15;
export const QUESTS = {
  arenque: {
    name: 'Arenque para Glenmore', automatic: true, objective: 'Lleva 2 arenques a Callum, en Glenmore',
    giver: 'portDun', target: 'glenmore', gives: [], rewards: [],
    good: 'fish', quantity: 2, coins: 25, giverTrust: 10,
    returnGreeting: 'Volviste. Y entero. Ahora sí podemos hablar.',
    carrying: 'Lleva dos cajas de arenque salado a Callum en Glenmore.',
    deliver: 'Callum espera las dos cajas de arenque de Mairead.',
    deliverLabel: 'Entregar dos cajas de arenque',
    done: '«¿Arenque? ¿Te lo mandó Mairead?» (silencio) «Dile que… no. No le digas nada. Toma, por el viaje.»'
  },
  carta: {
    name: 'La Carta sin Entregar', objective: 'Lleva la caja y la carta a Callum',
    giver: 'portDun', trustNeeded: 20, gives: ['toolbox', 'letter'],
    target: 'glenmore', rewards: ['shortcut_map', 'old_nails'],
    locked: 'Mairead te mira de reojo. Todavía no eres de los que reciben encargos.',
    offer: 'Mairead saca una caja de herramientas vieja y un sobre gastado. «Son de mi hermano Callum. Llevan un invierno esperando. Llévaselos a Glenmore y no le digas que te lo pedí yo.»',
    acceptLabel: 'Llevar la caja y la carta',
    carrying: 'La caja y la carta de Mairead siguen a bordo. Callum está en Glenmore.',
    deliver: 'Tienes a bordo la caja de herramientas y la carta para Callum.',
    deliverLabel: 'Entregar la caja y la carta',
    done: 'Callum lee la carta dos veces sin decir nada. Luego te pone en la mano un mapa doblado y un puñado de clavos negros. «Del barco del viejo. Los saqué de la bahía. A ti te van a servir más que a mí.»'
  }
};
