# CrafTerraria — Definición y Requisitos

> Nombre de la app: **CrafTerraria**. Barra superior con solo texto (sin ícono), definido el 2026-08-17.

> Documento vivo. Se va completando a medida que avanza el proceso de desarrollo.

## 1. Descripción del proyecto

App web que permite consultar recetas de crafteo de Terraria en español. El usuario puede:
- Buscar un ítem y ver con qué se craftea (ingredientes + estación requerida).
- Explorar todos los ítems del juego organizados por categorías.

Proyecto con fines de portafolio, en el marco de la carrera técnica de Analista Programador.

## 2. Alcance

### Dentro del alcance (v1)
- Buscador de ítems (por nombre) que muestre su(s) receta(s) de crafteo
- Vista de ingredientes necesarios + estación requerida por receta
- Listado de todos los ítems crafteables del juego, agrupados por categoría
- Filtro/navegación por categoría
- Ordenar/filtrar listado por daño (solo aplica a categorías con daño, ej. Armas) y por rareza (aplica a todos los ítems)
- Datos en español (nombres oficiales del juego)
- Diseño responsive dentro del rango de tamaños de celular (mobile-first; distintos anchos/alturas de móvil, no desktop)

### Fuera del alcance (v1)
- Cuentas de usuario / login
- Favoritos o listas personalizadas
- Calculadora de materiales base (recetas anidadas/recursivas) → candidato a v2
- Búsqueda por imagen
- Modo multijugador/colaborativo
- Otros idiomas además de español
- Otras mecánicas del juego no relacionadas a crafteo (bosses, biomas, NPCs)
- **Soporte desktop** → v1 es 100% mobile, desktop pasa completo a v2 (ver Roadmap v2)

### Riesgo identificado
Cubrir todos los ítems crafteables implica un volumen alto de datos a curar/traducir (Terraria tiene miles de ítems). Se abordará con una estrategia de carga progresiva/por lotes en la etapa de implementación, no de una sola vez.

### Roadmap v2 (ideas, no comprometidas — no diseñar en detalle hasta llegar ahí)
- **Soporte desktop real**: v1 es mobile-first; desktop se agrega vía media queries adicionales sobre la misma base (bajo esfuerzo, ya lo habilita RNF05). Un layout desktop *estructuralmente distinto* (ej. panel de detalle sin cambiar de pantalla) sí sería trabajo nuevo, no solo CSS.
- **Backend de usuario**: favoritos, builds guardadas, sesión/login. La capa de acceso a datos (sección 6) ya está pensada para que esto no requiera tocar componentes de v1, solo cambiar la implementación interna de las funciones de datos.
- **Backend de contenido**: actualizar items/recetas automáticamente ante nuevas versiones del juego, reutilizando el pipeline Python ya publicado (`extract.py`/`process.py`) como job periódico en vez de corrida manual.

## 3. Stack tecnológico

- **Frontend:** React JS
- **Datos:** JSON estático local (sin backend)
- **Idioma:** Español (con nombres oficiales del juego, no traducción literal)

## 4. Requisitos funcionales

| # | Requisito |
|---|---|
| RF01 | El sistema debe permitir buscar un ítem por nombre (texto libre) |
| RF02 | El sistema debe mostrar los resultados de búsqueda coincidentes |
| RF03 | El sistema debe mostrar, al seleccionar un ítem, su(s) receta(s) de crafteo con ingredientes y cantidades |
| RF04 | El sistema debe mostrar la estación requerida para craftear (si aplica) |
| RF05 | El sistema debe permitir navegar el listado completo de ítems agrupados por categoría |
| RF06 | El sistema debe permitir filtrar el listado por categoría |
| RF07 | El sistema debe mostrar el ícono/imagen de cada ítem |
| RF08 | El sistema debe indicar cuando un ítem no tiene receta de crafteo (se obtiene por otro medio) |
| RF09 | El sistema debe permitir navegar desde un ingrediente de una receta hacia la receta de ese ingrediente (navegación cruzada entre ítems) |
| RF10 | El sistema debe mostrar, para cada ítem, en qué otras recetas se usa como ingrediente ("usado para") |
| RF11 | El sistema debe permitir ordenar el listado de ítems por rareza |
| RF12 | El sistema debe permitir ordenar/filtrar el listado de ítems por daño, disponible solo en categorías donde el daño aplica (ej. Armas) |

**Nota técnica:** RF10 se deriva del set de recetas (índice inverso construido a partir de `ingredients[]`), no requiere una estructura de datos adicional ni duplicación.

## 5. Requisitos no funcionales

| # | Requisito |
|---|---|
| RNF01 | La búsqueda debe responder de forma percibida como instantánea (dato local en memoria, sin llamadas a red) |
| RNF02 | El código debe ser mantenible y estar documentado (componentes claros, README, comentarios donde aporte) — clave para portafolio |
| RNF03 | La interfaz debe ofrecer buena UI/UX: navegación intuitiva, feedback visual claro, diseño coherente |
| RNF04 | La app debe tener rutas propias por ítem y por categoría (URLs compartibles, ej: `/item/piqueta-de-hierro`) |
| RNF05 | El diseño debe priorizar la experiencia en móvil (mobile-first) en orientación vertical (portrait). Desktop queda fuera de v1 por completo (ver Alcance y Roadmap v2) — no es "después dentro de v1", es otra versión |

## 6. Arquitectura de la aplicación

### Enrutamiento
React Router. Se descarta SPA de una sola vista porque:
- Permite URLs directas y compartibles por ítem/categoría (mejor UX y SEO)
- Evita perder el estado de navegación al recargar
- Es el estándar de la industria — relevante para portafolio y futuras entrevistas
- Curva de entrada razonable para rutas simples (`/item/:id`, `/categoria/:nombre`)

### Tipo de arquitectura
Frontend puro basado en componentes, con datos estáticos locales (sin backend propio):

```
[JSON local] → [Capa de acceso a datos] → [Componentes React] → [UI]
```

### Estructura de carpetas

```
src/
├── components/       → piezas de UI reutilizables (Button, SearchBar, ItemCard)
├── pages/             → una por ruta (Home, ItemDetail, CategoryView)
├── data/              → items.json, recipes.json, i18n/es.json
├── hooks/             → lógica reutilizable (useSearch, useRecipe)
├── utils/             → funciones puras (ej: construir el índice "usado para")
├── router/            → configuración de React Router
└── App.jsx
```

### Capa de acceso a datos
Se crea una capa de servicio (ej: `dataService.js`) con funciones como `getItemById()`, `getRecipesByItem()`, `getUsedIn()`, en vez de que cada componente importe el JSON directamente.

Motivo: aísla en un solo lugar la lógica de cálculo del índice inverso (RF10) y, si en el futuro se reemplaza el JSON estático por una API real, solo se modifica esta capa sin tocar los componentes.

### Patrón de componentes: Container/Presentational (simplificado)
- **Pages** (containers): manejan lógica — leen la URL, piden datos a la capa de servicio, deciden qué mostrar.
- **Components** (presentational): reciben props y muestran UI, sin lógica de datos.

Separa "qué hace la app" de "cómo se ve".

### Manejo de estado
React state nativo (`useState`, `useContext` si se necesita para idioma/tema). No se usa Redux ni librerías externas de estado: con datos estáticos y sin autenticación, el estado nativo de React es suficiente y evita sobre-ingeniería.

## 7. Modelo de datos

### Entidad: Item
| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Identificador único interno (confirmado con datos reales: es numérico, ej. `1`, no `"1"`) |
| category | string | Categoría (Herramientas, Armas, Bloques, etc.) |
| subcategory | string (opcional) | Subcategoría |
| imageUrl | string | Ruta/URL del ícono |
| rarity | number | Nivel de rareza (valor numérico ordenable, ej: 0=Blanco, 1=Azul, 2=Verde... según escala oficial del juego) |
| damage | number (opcional) | Daño del ítem. Solo presente en categorías donde aplica (ej. Armas). Ausente/null en el resto |
| sellValue | number (opcional) | Valor de venta |

> El nombre (`name`) NO vive en Item — se resuelve desde el diccionario de traducción por `id`. Ver sección "Traducción".

**Casos especiales confirmados con datos reales (a decidir en etapa de diseño/desarrollo):**
- 45 ítems (peces de misión) traen `rarity: "quest"` (string) en vez de número — rompe el supuesto de orden numérico de RF11, necesitan tratamiento aparte al ordenar.
- 107 ítems traen `category: null` (la wiki no les asignó tipo). De esos, solo 7 son crafteables — bajo impacto, pero la UI necesita una categoría de respaldo tipo "Otros".

**Nota sobre RF11-RF12:** `rarity` se vuelve numérico (no texto libre) para poder ordenar directamente. `damage` es opcional porque no todas las categorías lo tienen — la UI debe mostrar el control de orden por daño solo cuando la categoría/selección actual tenga ítems con ese campo presente.

### Entidad: Recipe
| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único de la receta |
| resultItemId | number | Referencia al Item producido |
| resultQuantity | number | Cantidad producida |
| ingredients | array | Lista de `{ itemId, quantity }`. Si el ingrediente es un grupo tipo "Cualquier X" sin un ítem único (ej. "Any Iron Bar"), `itemId` es `null` y se agrega `categoryHint` (string) con el nombre del grupo |
| station | array de string \| null | Estación(es) requerida(s) — mueble real craftable (ej. "Iron Anvil") |
| requiredCondition | string \| null | Condición ambiental sin mueble asociado (ej. "Ecto Mist", "Shimmer"), separada de `station` |
| resultName | string (solo en recetas "huérfanas") | Nombre del resultado cuando `resultItemId` no tiene fila en Item (hueco de mantenimiento de la wiki, ~67 recetas) |
| resultImageUrl | string (solo en recetas "huérfanas", opcional) | Ícono del resultado cuando no hay fila en Item |

**Nota:** un Item puede tener múltiples Recipe (relación uno a muchos). Confirmado con datos reales (extracción vía Terraria Wiki/Cargo, ver sección 9).

**Caso especial `categoryHint` sin alternativas:** "Recorded Music Boxes" (75 variantes de caja musical grabable) no tiene un set cerrado de opciones — queda como `categoryHint` sin lista de itemIds asociada. La UI debe mostrar el nombre del grupo sin poder enlazar a un ítem concreto.

### Derivado (no almacenado): "Usado para" (RF10)
No es un campo de datos, se calcula recorriendo todas las `Recipe` y filtrando aquellas donde el `id` del ítem aparece dentro de `ingredients[]`. Se resuelve en runtime (ej: útil como índice inverso construido una vez al cargar la app).

### Traducción
Estructura separada del modelo base, en un diccionario plano por idioma:

```
items.json    → { id (number), category, subcategory, imageUrl, rarity, damage, sellValue }  (sin name)
recipes.json  → { id, resultItemId (number), resultQuantity, ingredients[], station, requiredCondition, resultName, resultImageUrl }
i18n/es.json  → { "1": "Piqueta de Hierro", ... }  (clave = id numérico como string, ver nota abajo)
```

**Nota sobre la clave del diccionario de traducción:** como `Item.id` es numérico (`1`, no `"iron_pickaxe"`), la clave real en `i18n/es.json` debe ser el número (o el número convertido a string, según lo pida `JSON.stringify`/acceso por clave en JS) — no un slug legible como se ilustró en versiones anteriores de este documento.

Motivo: separar estructura de contenido textual permite corregir/ampliar traducciones sin tocar el modelo, detectar traducciones faltantes con un script de comparación de claves, y escalar a otros idiomas en el futuro sin duplicar datos.

### Validación contra requisitos funcionales

| Requisito | Soportado por |
|---|---|
| RF01-02 Buscar por nombre | `es.json` (nombre) |
| RF03 Ver receta con ingredientes/cantidades | `ingredients[]` en Recipe |
| RF04 Estación requerida | `station` en Recipe |
| RF05-06 Listado/filtro por categoría | `category` en Item |
| RF07 Ícono | `imageUrl` en Item |
| RF08 Ítem sin receta | Ausencia de Recipe con ese `resultItemId` |
| RF09 Navegar a receta de un ingrediente | `itemId` dentro de `ingredients[]` referencia a otro Item |
| RF10 "Usado para" | Derivado (índice inverso), no almacenado |
| RF11 Ordenar por rareza | `rarity` (numérico) en Item |
| RF12 Ordenar/filtrar por daño | `damage` (opcional) en Item, condicionado a categoría |

## 8. Fuentes de datos

**Extracción completada y publicada.** Fuente: Terraria Wiki oficial (terraria.wiki.gg), vía endpoint Cargo Export. Repo público: https://github.com/Ren-reno/terraria-crafting-data-pipeline

**Resultado final, verificado directamente (no solo por documentación):**
- `items.json`: 6071 ítems
- `recipes.json`: 3905 recetas
- Suite de tests de calidad de datos: **26 passed, 0 failed** (confirmado corriendo `pytest` sobre el repo clonado)
- `resultImageUrl` en las 67 recetas huérfanas: 67/67 presentes
- Licencia documentada en `ATTRIBUTION.md`: datos bajo CC BY-NC-SA 4.0 (contenido de texto/estructura), imágenes con licencia variable por archivo (a confirmar puntualmente antes de publicación destacada), código del pipeline bajo MIT

Traducción al español: sigue pendiente, no bloquea el resto del desarrollo (se puede maquetar con nombres en inglés temporalmente y reemplazar después).

## 9. Próximos pasos

- [x] Revisar repo de GitHub con datos de items/recetas — descartados por desactualizados, se optó por extracción propia
- [x] Extraer datos reales desde Terraria Wiki (Cargo Export) — 6071 items, 3905 recetas, con tests de calidad en verde
- [x] Re-correr `process.py` para que las 67 recetas huérfanas incluyan `resultImageUrl` — **verificado: 67/67 ✅**
- [x] Decidir tratamiento de los 45 ítems con `rarity: "quest"` — se deja sin forzar a número, codificado como test de regresión
- [x] Decidir categoría de respaldo para los 7 ítems crafteables con `category: null` — misma lógica, test de regresión propio
- [x] Repo de datos publicado en GitHub, con README/LICENSE/ATTRIBUTION.md y 26 tests en verde (verificado corriendo la suite real)
- [ ] Definir estrategia concreta para nombres en español (cruce con Terraria Wiki ES por id interno) — v2 según lo documentado, no bloquea
- [x] Etapa de Diseño — Wireframes de baja fidelidad:
  - [x] Wireframe Home/Listado (mobile, vertical): buscador, categorías tipo chip, grid 2 columnas, paginación
  - [x] Wireframe Detalle de ítem (mobile, vertical): imagen, nombre, descripción, Crafting Recipe, Crafted At (estación), Used In
  - [x] Validado contra RF01-RF10: cubiertos en su totalidad
  - [ ] Diseñar estado alternativo de RF08 (ítem sin receta) como variante de la pantalla de Detalle
- [ ] Retomar mockup de alta fidelidad del Home en Figma (en pausa), agregando controles de RF11/RF12 (orden por rareza/daño)
  - **Estado exacto al 2026-08-17:** Frame 1 (Home) en Figma ya tiene, con estilo real aplicado (no placeholder): buscador, categorías tipo chip, grid 2 columnas (ícono real de espada pixel-art de prueba, se repite en todas las cards — falta conectar íconos reales por ítem), paginación con estados activo/inactivo.
  - Falta agregar a ese mismo Frame: barra superior con el nombre "CrafTerraria" (solo texto, sin ícono) y la fila "Ordenar por: Rareza / Daño" (chip "Daño" debe distinguirse visualmente como condicional).
  - Último prompt de referencia entregado (para generar imagen guía y replicar en Figma) ya incluye: header CrafTerraria, buscador, categorías, ordenar por, grid, paginación con patrón `< 1 2 3 ... 15 >` — pendiente que el usuario lo genere y replique.
  - Frame 2 (Detalle de ítem) existe solo como wireframe de baja fidelidad (estructura validada contra RF01-RF10), sin estilo real aplicado todavía.
- [ ] Mockup de alta fidelidad de Detalle de ítem, heredando el mismo lenguaje visual
- [ ] Buscar assets reales: sprites de ítems (ya se tiene `imageUrl` real por ítem desde la wiki) o pack de iconos pixel-art genérico si se prefiere no depender de assets de Re-Logic
- [ ] Buscar/crear texturas tileables genéricas (piedra, madera) optimizadas (.webp, comprimidas) para fondo — cuidando RNF01 (carga rápida)

## 10. Notas de referencia visual

Se generaron mockups de inspiración con IA (no assets finales) para definir dirección de arte: paleta cálida de antorcha, marco de piedra/madera, slots de ítem estilo inventario de Terraria. Sirven de guía de estilo, no de wireframe funcional (mezclan elementos fuera de alcance como Favoritos/Reciente/Settings, a excluir del wireframe real).

## 11. Historial de decisiones

| Fecha | Decisión |
|---|---|
| 2026-07-30 | Stack: React JS, datos estáticos en JSON, sin backend en v1 |
| 2026-07-30 | Modelo de datos separa estructura (items/recetas) de traducción (diccionario es) |
| 2026-07-30 | Calculadora de materiales base queda fuera de v1, candidata a v2 |
| 2026-07-30 | v1 cubre todos los ítems crafteables del juego (no un subconjunto) |
| 2026-07-30 | Se incluye navegación cruzada: ver receta de un ingrediente y "usado para" |
| 2026-07-30 | Se usará React Router para rutas por ítem y categoría (no SPA de una sola vista) |
| 2026-07-30 | Modelo de datos validado contra los 10 requisitos funcionales — sin brechas |
| 2026-07-30 | Diccionario de traducción separado del modelo base (items.json sin campo `name`) |
| 2026-07-30 | Arquitectura: frontend basado en componentes con capa de acceso a datos, patrón Container/Presentational, estado nativo de React (sin Redux) |
| 2026-08-04 | Diseño mobile-first confirmado: el foco real de la app es móvil; desktop es adaptación posterior, no punto de partida |
| 2026-08-04 | Orientación vertical (portrait) confirmada, se descarta forzar landscape por fricción de uso y complejidad técnica |
| 2026-08-04 | Wireframes de baja fidelidad completados (Home/Listado y Detalle de ítem), validados contra RF01-RF10 sin brechas. Listado usa paginación clásica (no scroll infinito) |
| 2026-08-04 | Se amplía el alcance de v1: se agregan RF11 (ordenar por rareza) y RF12 (ordenar/filtrar por daño, condicional a categoría). Modelo de Item actualizado: `rarity` pasa a numérico, se agrega `damage` opcional |
| 2026-08-14 | Repos de GitHub descartados por desactualizados; extracción de datos propia completada desde Terraria Wiki (Cargo Export): 6071 items, 3905 recetas, verificado con suite de tests (24 passed) |
| 2026-08-14 | Modelo de Recipe actualizado con estructura real confirmada: `requiredCondition` (separado de `station`), `categoryHint` para ingredientes tipo "Cualquier X", `resultName`/`resultImageUrl` para recetas huérfanas |
| 2026-08-14 | Hallazgos de datos reales pendientes de decisión: 45 ítems con `rarity: "quest"` (no numérico), 107 ítems con `category: null` (7 relevantes/crafteables). Pendiente técnico: re-correr `process.py` para aplicar `resultImageUrl` a huérfanas |
| 2026-08-14 | El pipeline de extracción de datos se prepara como repo standalone en GitHub (portafolio para roles junior de datos), separado del futuro repo de la app React. Trabajo de limpieza/README delegado al chat de extracción, con doc de instrucciones dedicado |
| 2026-08-17 | **Datos listos para desarrollo.** Repo publicado y verificado: 6071 items, 3905 recetas, 26/26 tests en verde, los 3 pendientes técnicos resueltos. Pendiente menor: 2 links rotos en `ATTRIBUTION.md`, sección "Qué aprendí" aún no escrita |
| 2026-08-17 | Nombre de la app definido: **CrafTerraria**. Barra superior solo con texto, sin ícono |
| 2026-08-17 | Corrección de consistencia: v1 es 100% mobile, desktop pasa completo a v2 (antes el documento sugería que desktop podía llegar "después, dentro de v1") |
| 2026-08-17 | Verificación de esquema real contra el repo publicado: `Item.id` corregido de `string` a `number` (era un supuesto de cuando el modelo era teórico, sin datos reales); snippet de la sección Traducción actualizado para incluir todos los campos reales (`damage`, `requiredCondition`, `resultName`, `resultImageUrl`) y aclarar que las claves de `i18n/es.json` deben ser numéricas, no slugs legibles |
