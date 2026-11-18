// Encargos narrativos. Cada uno: quién lo da, a quién se entrega, qué objetos de historia mueve y sus textos.
export const QUEST_TRUST_REWARD = 15;
export const QUESTS = {
  carta: {
    name: 'La Carta sin Entregar',
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
