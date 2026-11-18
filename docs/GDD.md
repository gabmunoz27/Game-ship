# Documento de Diseño de Juego (GDD)
**Título provisional:** *Loch Morag* (o *Crónicas de las Highlands*)  
**Género:** Simulador de comercio narrativo, exploración naval y gestión atmosférica  
**Estilo visual:** Low-Poly 3D estilizado (Three.js)  
**Ambientación:** Tierras Altas de Escocia (*Highlands*) e islas exteriores  

---

## 1. Visión y Premisa Narrativa
* **El mundo:** Una red de fiordos (*lochs*), estrechos rocosos e islas aisladas en el norte de Escocia.
* **El protagonista:** Eres el nuevo patrón de un pequeño barco mercante de madera heredado tras la desaparición del antiguo barquero durante una tormenta invernal el año anterior.
* **El tono:** Melancólico, acogedor (*cozy*) y contemplativo, con profundo respeto por la fuerza de la naturaleza. No hay combates navales ni política imperial; el conflicto nace del aislamiento geográfico, el clima cambiante y los lazos humanos entre comunidades pequeñas.
* **Objetivo principal:** Reconectar las aldeas aisladas mediante el comercio y el intercambio de favores, restaurar las rutas marítimas y preparar a la región para sobrevivir al invierno.

---

## 2. Mecánicas Centrales (Core Loop)

### A. El Bucle Jugable (Ciclo de 4 Pasos)
1. **En el Muelle:** Hablas con los habitantes para conocer el estado del clima y sus necesidades, compras/intercambias mercancía y repones suministros de viaje.
2. **Navegación:** Te desplazas por el fiordo hacia otra aldea o punto de tránsito entre mapas, gestionando el viento, la niebla y el desgaste del casco.
3. **Entrega y Reacción:** Entregas los bienes solicitados. Sube la **Confianza** del pueblo, avanza la historia y cambian detalles visuales en la aldea (humo en chimeneas, luces encendidas, reparaciones).
4. **Paso del Tiempo:** Cada travesía avanza el reloj del día, alterando la visibilidad y la demanda de recursos.

### B. Bodega Compartida y Suministros
El barco cuenta con una cuadrícula de espacio físico limitado (inicia en **10 espacios**):
* **Carga comercial:** Mercancía destinada a venta o encargos narrativos.
* **Suministros de viaje (Turba/Carbón y Raciones):** Ocupan espacio real en esa misma bodega. Cada viaje consume suministros. Quedarse sin ellos en medio de una travesía penaliza la velocidad y el estado de la tripulación.
* **Decisión clave:** Equilibrar la ambición comercial (llevar más carga) frente a la seguridad del viaje (llevar reservas por si cambia el clima).

### C. Sistema de Comercio por "Necesidad y Vínculo"
* **Confianza > Oro:** El dinero permite comprar bienes básicos y reparaciones, pero el verdadero progreso ocurre al subir el medidor de **Confianza** de cada aldea cumpliendo entregas críticas.
* **Estados de cada aldea:**
  * **Abastecida (Verde):** Precios normales, diálogos cotidianos.
  * **Escasez (Ámbar):** Paga muy bien por un recurso específico y ofrece encargos secundarios.
  * **Crisis (Rojo):** Aislada por el clima; requiere entregas urgentes que desbloquean hitos narrativos.

### D. Tiempo y Clima Activo
* **Franjas horarias:** El día se divide en **Mañana → Tarde → Noche**. Zarpar entre aldeas avanza **1 franja**; viajar entre mapas avanza **2 franjas**. Estar en el muelle no consume tiempo.
* **Condiciones climáticas:**
  * **Despejado:** Navegación estándar y bajo consumo.
  * **Viento de Fiordo:** Canalizado entre las montañas; acelera a favor y ralentiza/consume más en contra.
  * **Niebla Espesa (*Haar*):** Reduce drásticamente la visibilidad en el agua, aumentando el riesgo de encallar en rocas si no hay faros activos o linterna de proa.
  * **Lluvia / Tormenta:** Daña mercancías delicadas si no se posee bodega cubierta y desgasta el casco.

---

## 3. Progresión del Barco (4 Mejoras Físicas)
Cada mejora se refleja visualmente en el modelo 3D del barco y funciona como llave orgánica para abrir nuevas regiones:

| Mejora | Efecto Mecánico | Desbloqueo de Mundo | Materiales Requeridos |
| :--- | :--- | :--- | :--- |
| **1. Casco Reforzado** | Mayor resistencia a colisiones con rocas y tormentas. | Permite cruzar *El Paso de las Piedras* hacia el **Mapa 2**. | Madera de pino + Hierro |
| **2. Vela Mayor de Lona** | Mayor velocidad base y menor penalización contra el viento. | Reduce a la mitad el consumo de suministros en viajes entre mapas. | Lana tejida + Cuerda de cáñamo |
| **3. Bodega Ampliada y Cubierta** | Aumenta el espacio de **10 a 18 casillas** y protege la carga de la lluvia. | Permite transportar bienes delicados (cebada seca, hierbas, correo) bajo tormenta. | Madera + Clavos de cobre |
| **4. Linterna de Proa** | Proyecta un cono de luz cálida frente al barco en oscuridad o niebla. | Permite navegar de noche y cruzar *La Boca de la Niebla* hacia el **Mapa 3**. | Aceite de arenque + Latón/Cristal |

---

## 4. Estructura del Mundo: Mapas Conectados

El mundo se divide en regiones independientes conectadas por puntos de tránsito (boyas o pasos rocosos) que consumen tiempo y suministros al cruzarse.

### Mapa 1: Loch Morag *(El Valle Protegido)*
* **Atmósfera:** Aguas tranquilas rodeadas de colinas verdes, bosques de pinos y acantilados bajos. Lluvia ligera y brisa suave.
* **Límite de salida:** *El Paso de las Piedras* (estrecho rocoso con corrientes fuertes; exige **Casco Reforzado**).
* **Villas:**
  1. **Port Dun (Puerto base en la costa):**
     * *Personaje:* **Mairead** (encargada del muelle, pragmática y conocedora del lago).
     * *Produce:* Pescado salado, Sal, Aceite de arenque.
     * *Necesita:* Turba seca, Madera de pino.
  2. **Glenmore (Valle interior):**
     * *Personaje:* **Callum** (cortador de turba y granjero desconfiado, hermano distanciado de Mairead).
     * *Produce:* Turba seca, Cebada, Madera de pino.
     * *Necesita:* Pescado salado, Herramientas.

### Mapa 2: El Estrecho de Kyle *(Los Acantilados)*
* **Atmósfera:** Fiordo profundo entre paredes de roca negra vertical, cascadas, viento canalizado constante y niebla vespertina.
* **Límite de salida:** *La Boca de la Niebla* (salida al mar abierto sin referencias; exige encender **El Faro** y equipar la **Linterna de Proa**).
* **Villas:**
  1. **Caer Loch (Astillero y Herrería):**
     * *Personaje:* **Torin** (maestro carpintero de ribera).
     * *Produce:* Hierro, Herramientas, Clavos de cobre.
     * *Necesita:* Madera de pino, Aceite de arenque.
     * *Función especial:* Único puerto donde se instalan las mejoras mayores del barco.
  2. **Dunvegan (Destilería del Valle Alto):**
     * *Personaje:* **Fiona** (destiladora obstinada guardiana de recetas tradicionales).
     * *Produce:* Whisky de malta, Lana tejida.
     * *Necesita:* Cebada, Turba seca.

### Mapa 3: Islas de Skye / Mar Exterior *(El Horizonte)*
* **Atmósfera:** Aguas abiertas, oleaje atlántico, islas dispersas y tormentas otoñales/invernales.
* **Villas:** **St. Kilda** (monasterio productor de hierbas medicinales) y **Portree** (puerto comercial mayor donde convergen los recursos de todas las regiones para el clímax de la historia).

---

## 5. Estructura Narrativa por Estaciones (4 Actos)

1. **Acto I — Primavera (El Deshielo):** Exploración inicial de *Loch Morag*. Reconectar *Port Dun* y *Glenmore*, resolver la historia de *"La Carta sin Entregar"* entre Mairead y Callum, y obtener el mapa seguro para reforzar el casco y cruzar al Mapa 2.
2. **Acto II — Verano (La Cosecha y el Faro):** Establecer el triángulo comercial entre los Mapas 1 y 2. Reunir piedra, aceite y piezas de cristal para restaurar **El Faro Apagado** en el islote central, encendiendo una guía real visible en el mundo 3D.
3. **Acto III — Otoño (Las Lluvias y los Secretos):** Lluvias constantes y niebla densa. Misiones contrarreloj de abastecimiento (como salvar el ahumadero de *Port Dun* antes de que se pierda la pesca) y descubrimiento del destino final del antiguo barquero.
4. **Acto IV — Invierno (La Prueba del Hielo):** Congelación de canales secundarios y tormentas severas. Clímax emocional y logístico: mantener abastecidas de turba, lana y alimentos a todas las comunidades hasta el regreso de la primavera.

---

## 6. Interfaz de Usuario (UI) del Muelle
Al atracar en un puerto se despliega un panel minimalista dividido en **3 pestañas**:
1. **El Muelle:** Retrato y diálogo del personaje local, tablón con 1 o 2 encargos activos y botón para *"Pasar la noche"* (avanza hasta la mañana siguiente).
2. **Comercio y Bodega:** Vista comparativa entre el inventario del pueblo (con indicadores visuales de abundancia/escasez) y la cuadrícula física del barco, incluyendo un botón rápido para reponer suministros de viaje.
3. **Astillero:** Barra de integridad del casco para reparaciones y acceso a las mejoras físicas del barco.