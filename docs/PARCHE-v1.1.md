# Parche de Diseño v1.1 — Resolución de Bloqueos y Balance del Acto I

Transcripción del parche de Aithana. Complementa a `GDD.md`; donde se contradicen, manda este.

## 1. Resolución de bloqueos del Acto I

**A. Casco Reforzado sin depender del Mapa 2.** Se fabrica con recursos de Loch Morag más un ítem de historia: 4× Madera de Roble (Glenmore), 3× Resina / Brea de Pino (Port Dun), 1× Clavos de Hierro Viejo (ítem único de misión) y 150 monedas de mano de obra.

**B. Herramientas en Glenmore.** En el Acto I Glenmore demanda Arenque Salado y Sal Marina. Las herramientas que Mairead envía a Callum son un ítem único de misión ("Caja de Herramientas de Mairead"): no ocupa bodega ni se vende. La demanda comercial de Herramientas Nuevas se activa en el Acto II.

## 2. Balance numérico inicial

**Jugador:** 60 monedas, bodega de 10 espacios, 2× Suministros de Viaje, Confianza 10 en Port Dun y 0 en Glenmore.

**Fórmula:** compra en puerto productor ≈ 70 % del precio base; venta en puerto demandante ≈ 140 %.

| ID | Recurso | Espacio | Base | Compra en origen | Venta en destino |
|---|---|---|---|---|---|
| supplies | Suministros de Viaje | 1 | 6 | Ambos puertos (6) | No comercializable |
| fish | Arenque Salado | 1 | 10 | Port Dun (7) | Glenmore (14) |
| salt | Sal Marina | 1 | 12 | Port Dun (8) | Glenmore (17) |
| peat | Turba Seca | 2 | 14 | Glenmore (10) | Port Dun (20) |
| oak_wood | Madera de Roble | 2 | 16 | Glenmore (11) | Port Dun (22) / mejora |
| resin | Resina / Brea | 1 | 15 | Port Dun (10) | Material de mejora |

**Travesía Port Dun ↔ Glenmore:** avanza 1 franja; consume 1 suministro con clima despejado o viento a favor, 2 con lluvia, niebla o viento en contra. Sin suministros: el viaje tarda 2 franjas y resta 5 de Confianza en el destino.

**Confianza (0 a 100 por villa):** +2 por unidad vendida de un bien demandado; +15 por encargo narrativo.

| Rango | Nivel | Efecto |
|---|---|---|
| 0–19 | Forastero | Comercio básico |
| 20–49 | Conocido | Desbloquea la misión del puerto |
| 50–79 | Aliado | 10 % de descuento en compras y permite instalar el Casco Reforzado |
| 80–100 | Patrón de Confianza | 1 Suministro gratis al pasar la noche en su muelle |

## 3. Criterios de terminado del Acto I

1. **Bucle económico:** comprar pescado y sal en Port Dun, vender en Glenmore y volver con turba y madera, gestionando bodega y suministros.
2. **Confianza:** llegar a 20 en Port Dun → recibir la Caja de Herramientas y la Carta → entregarlas a Callum → recibir el Mapa del Atajo y los Clavos de Hierro Viejo.
3. **Cierre:** reunir 4× Roble, 3× Resina, los Clavos y 150 monedas, llegar a 50 de Confianza en Port Dun, instalar el Casco Reforzado y navegar al Paso de las Piedras.
