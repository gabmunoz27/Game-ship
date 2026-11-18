// Mejoras del barco. El Casco Reforzado sigue el Parche v1.1; las otras tres son del Acto II en adelante.
export const UPGRADES = {
  reinforced_hull: {
    name: 'Casco reforzado', act: 1, at: 'portDun',
    goods: { oak_wood: 4, resin: 3 }, items: ['old_nails'], coins: 150, trust: 50,
    unlocks: 'Permite cruzar el Paso de las Piedras'
  },
  // Acto II. Mano de obra y Confianza: provisionales, a equilibrar.
  main_sail:    { name: 'Vela mayor de lona',         act: 2, at: 'strathlinn', goods: { wool: 3, hemp_rope: 2 },        coins: 90,  trust: 40, unlocks: 'Mitad de consumo entre mapas' },
  covered_hold: { name: 'Bodega ampliada y cubierta', act: 2, at: 'achnacarn',  goods: { oak_wood: 4, copper_nails: 2 }, coins: 120, trust: 40, unlocks: 'Bodega de 18 casillas, la carga ya no se moja', capacity: 18, protectsCargo: true },
  bow_lantern:  { name: 'Linterna de proa',           act: 2, at: null,         goods: { herring_oil: 2 },               unlocks: 'Navegar de noche y cruzar la Boca de la Niebla' }
};
