// Mercancías (Parche v1.1, tabla 2.B). Solo datos: para equilibrar se toca este archivo y nada más.
// weight: casillas de bodega que ocupa cada unidad. tradeable:false → se compra pero no se vende.
// act: a partir de qué acto entra en juego; las del acto 2 tienen precios provisionales.
export const GOODS = {
  supplies:     { name: 'Suministros de viaje', weight: 1, price: 6, tradeable: false, act: 1 },
  fish:         { name: 'Arenque salado',       weight: 1, price: 10, act: 1 },
  salt:         { name: 'Sal marina',           weight: 1, price: 12, act: 1 },
  peat:         { name: 'Turba seca',           weight: 2, price: 14, act: 1 },
  oak_wood:     { name: 'Madera de roble',      weight: 2, price: 16, act: 1 },
  resin:        { name: 'Resina / brea',        weight: 1, price: 15, act: 1 },

  iron:         { name: 'Hierro',               weight: 2, price: 20, act: 2 },
  tools:        { name: 'Herramientas nuevas',  weight: 1, price: 24, act: 2 },
  copper_nails: { name: 'Clavos de cobre',      weight: 1, price: 22, act: 2 },
  barley:       { name: 'Cebada',               weight: 1, price: 9,  act: 2, delicate: true },
  herring_oil:  { name: 'Aceite de arenque',    weight: 1, price: 18, act: 2 },
  whisky:       { name: 'Whisky de malta',      weight: 1, price: 28, act: 2 },
  wool:         { name: 'Lana tejida',          weight: 1, price: 16, act: 2 },
  hemp_rope:    { name: 'Cuerda de cáñamo',     weight: 1, price: 12, act: 2 }
};
export const BUY_AT_SOURCE = .7, SELL_WHERE_NEEDED = 1.4, SELL_ELSEWHERE = .8, SELL_BACK_AT_SOURCE = .5;
