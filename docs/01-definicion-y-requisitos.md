# CrafTerraria — Definición y Requisitos

> Nombre de la app: **CrafTerraria**. Barra superior con solo texto (sin ícono), definido el 2026-08-17.

> Documento vivo. Se va completando a medida que avanza el proceso de desarrollo. Última actualización: 2026-10-21.

## 1. Descripción del proyecto

App web, íntegramente en inglés, que permite consultar recetas de crafteo de Terraria. El usuario puede:
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
- Interfaz y datos en inglés (nombres de ítems tal como los publica la wiki oficial)
- Diseño responsive, mobile-first: de celular (vertical) a desktop, con el mismo código y las mismas rutas en todos los tamaños

### Fuera del alcance (v1)
- Cuentas de usuario / login
- Favoritos o listas personalizadas
- Calculadora de materiales base (recetas anidadas/recursivas) → candidato a v2
- Búsqueda por imagen
- Modo multijugador/colaborativo
- Otros idiomas además de inglés (el español es candidato a v2, ver Roadmap v2)
- Otras mecánicas del juego no relacionadas a crafteo (bosses, biomas, NPCs)
- Layout de desktop *estructuralmente distinto* (ej. panel de detalle junto al listado, sin cambiar de pantalla) → candidato a v2 (ver Roadmap v2)

### Riesgo identificado
Cubrir todos los ítems crafteables implica un volumen alto de datos (Terraria tiene miles de ítems). Se abordará con una estrategia de carga progresiva/por lotes en la etapa de implementación, no de una sola vez.

Además, soportar móvil y desktop en la v1 duplica el trabajo de diseño (wireframes y mockups en dos anchos). Se mitiga con una base mobile-first, un solo árbol de componentes y las diferencias de layout resueltas con CSS (media queries), no con componentes distintos.

### Roadmap v2 (ideas, no comprometidas — no diseñar en detalle hasta llegar ahí)
- **Layout desktop estructuralmente distinto**: la v1 ya es responsive (móvil y desktop comparten el modelo de navegación: cada ítem es una página). Un panel de detalle junto al listado, sin cambiar de pantalla, sería trabajo nuevo, no solo CSS.
- **Backend de usuario**: favoritos, builds guardadas, sesión/login. La capa de acceso a datos (sección 6) ya está pensada para que esto no requiera tocar componentes de v1, solo cambiar la implementación interna de las funciones de datos.
- **Backend de contenido**: actualizar items/recetas automáticamente ante nuevas versiones del juego, reutilizando el pipeline Python ya publicado (`extract.py`/`process.py`) como job periódico en vez de corrida manual.
- **Español**: nombres oficiales del juego (no traducción literal), con un diccionario separado por idioma (ver sección 7, "Idioma y traducción"). La fuente de los nombres está por definir.

## 3. Stack tecnológico

- **Frontend:** React JS
- **Datos:** JSON estático local (sin backend)
- **Idioma:** Inglés (interfaz y nombres de ítems, tal como vienen de la wiki oficial). Español → v2 (ver Roadmap v2)

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
| RNF04 | La app debe tener rutas propias por ítem y por categoría (URLs compartibles, ej: `/item/1`). Las rutas de ítem usan el `id`, no el nombre: hay 7 nombres repetidos entre ítems distintos |
| RNF05 | El diseño debe ser responsive y mobile-first: la base es el celular en orientación vertical (portrait) y tablet/desktop se agregan con media queries (`min-width`), con el mismo árbol de componentes y las mismas rutas. Debe verse y usarse bien en celular, tablet y desktop. No se rediseña el celular en horizontal (landscape) |

### Criterios responsive (propuesta, a confirmar en el diseño)

- **Breakpoints** (mobile-first, `min-width`): base por debajo de 600 px (celular); desde 600 px (celular grande o tablet); desde 960 px (desktop, con el contenido centrado y un ancho máximo).
- **Grid de ítems:** 2 columnas en la base y más columnas al crecer el ancho (ej. 3 desde 600 px y 4 o 5 desde 960 px).
- **Detalle de ítem:** una columna en móvil; en desktop, dos columnas (receta y estación a un lado, "Used in" al otro), siempre en su propia ruta.
- **Interacción:** objetivos táctiles de al menos 44 px en móvil; estados hover y foco visibles en desktop; todo navegable con teclado.
- **Verificación:** revisar cada pantalla a 360, 768 y 1280 px de ancho.

## 6. Arquitectura de la aplicación

### Enrutamiento
React Router. Se descarta SPA de una sola vista porque:
- Permite URLs directas y compartibles por ítem/categoría (mejor UX y SEO)
- Evita perder el estado de navegación al recargar
- Es el estándar de la industria — relevante para portafolio y futuras entrevistas
- Curva de entrada razonable para rutas simples (`/item/:id`, `/category/:name`)

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
├── data/              → items.json, recipes.json, ingredient_categories.json (copiados del repo de datos)
├── hooks/             → lógica reutilizable (useSearch, useRecipe)
├── utils/             → funciones puras (ej: construir el índice "usado para")
├── router/            → configuración de React Router
└── App.jsx
```

### Capa de acceso a datos
Se crea una capa de servicio (ej: `dataService.js`) con funciones como `getItemById()`, `getRecipesByItem()`, `getUsedIn()`, `getItemImageUrl()`, en vez de que cada componente importe el JSON directamente.

Motivo: aísla en un solo lugar la lógica de cálculo del índice inverso (RF10) y, si en el futuro se reemplaza el JSON estático por una API real, solo se modifica esta capa sin tocar los componentes.

### Patrón de componentes: Container/Presentational (simplificado)
- **Pages** (containers): manejan lógica — leen la URL, piden datos a la capa de servicio, deciden qué mostrar.
- **Components** (presentational): reciben props y muestran UI, sin lógica de datos.

Separa "qué hace la app" de "cómo se ve".

### Manejo de estado
React state nativo (`useState`, `useContext` si se necesita para tema). No se usa Redux ni librerías externas de estado: con datos estáticos y sin autenticación, el estado nativo de React es suficiente y evita sobre-ingeniería.

## 7. Modelo de datos

### Entidad: Item
| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Identificador único interno (confirmado con datos reales: es numérico, ej. `1`, no `"1"`) |
| name | string | Nombre del ítem en inglés, tal como lo publica la wiki oficial. **No es único** (7 nombres se repiten entre ids distintos): no usarlo como clave ni en URLs |
| category | string (puede ser `null`) | Categoría tal como viene de la wiki: en inglés y minúscula, unas 36 (ej. `furniture`, `weapon`, `armor`, `tool`, `block`). La UI define la etiqueta a mostrar. `null` en 106 ítems (ver casos especiales) |
| subcategory | string (puede ser `null`) | Subcategoría (`null` en la mayoría de los ítems) |
| imageUrl | string | URL del ícono (presente en todos los ítems de los datos actuales) |
| rarity | number o `"quest"` | Nivel de rareza, ordenable según la escala oficial del juego. Los datos incluyen valores negativos (`-1`, `-12`, `-13`) además de `0` a `10`; `"quest"` en 45 ítems y `null` en 1 ítem |
| damage | number (opcional) | Daño del ítem. Solo presente en categorías donde aplica (ej. Armas). Ausente en el resto |
| damageType | string (opcional) | Tipo de daño: `Melee`, `Ranged`, `Magic` o `Summon`. Solo en ítems que lo tienen |
| defense | number (opcional) | Defensa (ej. armaduras). Ausente en el resto |
| sellValue | number (opcional) | Valor de venta |

> Desde la re-extracción del 2026-10-15, el nombre (`name`, en inglés) vive en `items.json`. El diseño anterior (diccionario de traducción aparte, sin `name` en Item) pasa a v2. Ver sección "Idioma y traducción".

**Casos especiales confirmados con datos reales (a decidir en etapa de diseño/desarrollo):**
- 45 ítems (peces de misión) traen `rarity: "quest"` (string) en vez de número — rompe el supuesto de orden numérico de RF11, necesitan tratamiento aparte al ordenar.
- 106 ítems traen `category: null` (la wiki no les asignó tipo). De esos, solo 8 son crafteables — bajo impacto, pero la UI necesita una categoría de respaldo tipo "Other".
- 1 ítem trae `rarity: null` y algunos traen valores negativos (`-1`, `-12`, `-13`): RF11 debe decidir dónde ubicarlos al ordenar.

**Nota sobre RF11-RF12:** `rarity` se vuelve numérico (no texto libre) para poder ordenar directamente. `damage` es opcional porque no todas las categorías lo tienen — la UI debe mostrar el control de orden por daño solo cuando la categoría/selección actual tenga ítems con ese campo presente.

### Entidad: Recipe
| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único y **estable** de la receta, con formato `{resultItemId}-{n}` (`n` = posición entre las recetas de ese ítem, ordenadas por contenido). Sirve como clave (React `key`, favoritos futuros); solo cambia si cambian las recetas de ese mismo ítem |
| resultItemId | number | Referencia al Item producido |
| resultQuantity | number | Cantidad producida |
| ingredients | array | Lista de `{ itemId, quantity }`. Si el ingrediente es un grupo tipo "Any X" sin un ítem único (ej. "Any Iron Bar"), `itemId` es `null` y se agrega `categoryHint` (string) con el nombre del grupo; los ids de cada grupo están en `ingredient_categories.json` (ej. `"Any Iron Bar": [22, 704]`) |
| station | array de string \| null | Estación(es) requerida(s) — mueble real craftable (ej. "Iron Anvil") |
| requiredCondition | string \| null | Condición ambiental sin mueble asociado (ej. "Ecto Mist", "Shimmer"), separada de `station` |
| resultName | string (solo en recetas "huérfanas") | Nombre del resultado cuando `resultItemId` no tiene fila en Item (hueco de mantenimiento de la wiki; 46 recetas / 45 ítems en la extracción del 2026-10-15) |
| resultImageUrl | string (solo en recetas "huérfanas", opcional) | Ícono del resultado cuando no hay fila en Item |

**Nota:** un Item puede tener múltiples Recipe (relación uno a muchos). Confirmado con datos reales (extracción vía Terraria Wiki/Cargo, ver sección 9).

**Caso especial `categoryHint` sin alternativas:** "Recorded Music Boxes" (75 variantes de caja musical grabable) no tiene un set cerrado de opciones — queda como `categoryHint` sin ítems asociados (en `ingredient_categories.json` figura con lista vacía). La UI debe mostrar el nombre del grupo sin poder enlazar a un ítem concreto.

### Derivado (no almacenado): "Usado para" (RF10)
No es un campo de datos, se calcula recorriendo todas las `Recipe` y filtrando aquellas donde el `id` del ítem aparece dentro de `ingredients[]`. Se resuelve en runtime (ej: útil como índice inverso construido una vez al cargar la app).

### Idioma y traducción

**v1: todo en inglés** (decidido el 2026-10-19). La interfaz y los nombres de ítems salen de los datos: el nombre es `name` en `items.json`, no hace falta diccionario de traducción.

```
items.json                  → { id (number), name, category, subcategory, imageUrl, rarity, damage, damageType, defense, sellValue }
recipes.json                → { id, resultItemId (number), resultQuantity, ingredients[], station, requiredCondition, resultName, resultImageUrl }
ingredient_categories.json  → { "Any Iron Bar": [22, 704], ... }  (grupo → ids de ítems)
```

Recomendación de implementación: obtener los nombres siempre a través de la capa de acceso a datos (ej. `getItemName(id)`), para que agregar idiomas en v2 no obligue a tocar componentes.

**v2 (español, no comprometido):** diccionario plano separado por idioma, `i18n/es.json` → `{ "1": "Piqueta de Hierro", ... }`. La clave debe ser el `id` numérico (como string en JS), no un slug legible. Motivo: separar estructura de contenido textual permite corregir/ampliar traducciones sin tocar el modelo, detectar traducciones faltantes con un script de comparación de claves y escalar a otros idiomas sin duplicar datos. La fuente de los nombres en español está por definir (p. ej. cruce con Terraria Wiki ES por id interno).

### Validación contra requisitos funcionales

| Requisito | Soportado por |
|---|---|
| RF01-02 Buscar por nombre | `name` en Item |
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

**Estado actual, verificado directamente (re-extracción del 2026-10-15, repo clonado desde GitHub):**
- `items.json`: 6141 ítems
- `recipes.json`: 3942 recetas
- `ingredient_categories.json`: 37 grupos de ingredientes intercambiables
- Suite de tests de calidad de datos: **36 passed, 0 failed** (con 3 warnings esperados por cambios dentro de lo tolerado)
- Recetas huérfanas: 46 recetas / 45 ítems. 43 tienen `resultImageUrl`; 2 quedaron sin imagen ("Trusty Chillet" y "Trusty Chillet Ignis"), pendientes de investigar en el repo de datos
- Licencia documentada en `ATTRIBUTION.md`: datos bajo CC BY-NC-SA 4.0 (contenido de texto/estructura), imágenes con licencia variable por archivo (a confirmar puntualmente antes de publicación destacada), código del pipeline bajo MIT

**Idioma:** v1 íntegramente en inglés (decidido el 2026-10-19). La traducción al español queda para v2.

**Imágenes (decidido el 2026-10-20):** los íconos se **enlazan directo desde la wiki** usando `imageUrl` / `resultImageUrl`; **no se copian al repositorio**. Motivo: la wiki indica que los materiales de Terraria son propiedad de Re-Logic y que la licencia de gráficos se define por archivo; los archivos con arte del juego que se revisaron figuran como "In Copyright" (usados por la wiki con permiso), y ese permiso no se transfiere a terceros, así que no se redistribuyen. Reglas de implementación:
- Todas las imágenes salen de una sola función (`getItemImageUrl(item)`), para poder cambiar el origen sin tocar componentes.
- Imagen de respaldo genérica si una URL falla (ya hay casos reales: "Trusty Chillet" y "Trusty Chillet Ignis" dan 404).
- Carga diferida (`loading="lazy"`) y paginación del listado, para no pedirle miles de imágenes de golpe a un servidor ajeno.
- No hacer commit de imágenes al repositorio.
- Atribución visible en el pie de la app, en inglés. Texto sugerido: *"Item data from the Official Terraria Wiki (CC BY-NC-SA 4.0). Item icons are loaded from the wiki and belong to Re-Logic. Terraria is © Re-Logic. Unofficial fan project, non-commercial."*

Sin confirmar todavía: la licencia exacta de un ícono de ítem puntual, la existencia de una política de Re-Logic para proyectos de fans, y que wiki.gg no bloquee ni limite el enlace directo (se comprueba al construir la pantalla de Detalle, cargando los íconos desde `localhost` y desde el dominio publicado).

## 9. Próximos pasos

- [x] Revisar repo de GitHub con datos de items/recetas — descartados por desactualizados, se optó por extracción propia
- [x] Extraer datos reales desde Terraria Wiki (Cargo Export) — 6141 items y 3942 recetas (re-extracción del 2026-10-15), con tests de calidad en verde
- [x] Re-correr `process.py` para que las 67 recetas huérfanas incluyan `resultImageUrl` — verificado en su momento (67/67); tras la re-extracción del 2026-10-15 son 43 de 45 ítems huérfanos (2 pendientes, ver sección 8)
- [x] Decidir tratamiento de los 45 ítems con `rarity: "quest"` — se deja sin forzar a número, codificado como test de regresión
- [x] Decidir categoría de respaldo para los 7 ítems crafteables con `category: null` — misma lógica, test de regresión propio
- [x] Repo de datos publicado en GitHub, con README/LICENSE/ATTRIBUTION.md y 36 tests en verde (verificado corriendo la suite real)
- [x] Decidir idioma de v1: todo en inglés (2026-10-19)
- [x] Decidir plataformas de v1: responsive, móvil y desktop (2026-10-21)
- [ ] (v2) Definir estrategia concreta para nombres en español (cruce con Terraria Wiki ES por id interno)
- [x] Crear el repo de la app en GitHub: https://github.com/Ren-reno/CrafTerraria
- [x] Inicializar el proyecto React (con React Router) y copiar `items.json`, `recipes.json` e `ingredient_categories.json` del repo de datos a `src/data/`, registrando el commit de origen (2026-10-21)
- [x] Capa de acceso a datos (`src/services/dataService.js`) con pruebas, y pantallas provisorias de Home, Detalle y Categoría (2026-10-21)
- [ ] Pantalla de Detalle definitiva (RF03, RF04, RF07, RF08, RF09, RF10), ya sobre la capa de datos y responsive (móvil y desktop)
- [x] Etapa de Diseño — Wireframes de baja fidelidad:
  - [x] Wireframe Home/Listado (mobile, vertical): buscador, categorías tipo chip, grid 2 columnas, paginación
  - [x] Wireframe Detalle de ítem (mobile, vertical): imagen, nombre, descripción, Crafting Recipe, Crafted At (estación), Used In
  - [x] Validado contra RF01-RF10: cubiertos en su totalidad
  - [ ] Diseñar estado alternativo de RF08 (ítem sin receta) como variante de la pantalla de Detalle
- [ ] Wireframes de baja fidelidad de Home/Listado y Detalle en desktop (desde 960 px), reutilizando la estructura validada contra RF01-RF10
- [ ] Decidir qué muestra el Detalle en lugar de la "descripción" del wireframe: ningún requisito la pide y los datos no tienen ese campo. Propuesta: un bloque con los datos que sí existen (category, rarity, damage y damageType, defense, sellValue); el texto descriptivo quedaría para v2 si se extiende el pipeline
- [ ] Retomar mockup de alta fidelidad del Home en Figma (en pausa), agregando controles de RF11/RF12 (orden por rareza/daño), y en dos anchos (móvil y desktop)
  - **Estado exacto al 2026-08-17:** Frame 1 (Home) en Figma ya tiene, con estilo real aplicado (no placeholder): buscador, categorías tipo chip, grid 2 columnas (ícono real de espada pixel-art de prueba, se repite en todas las cards — falta conectar íconos reales por ítem), paginación con estados activo/inactivo.
  - Falta agregar a ese mismo Frame: barra superior con el nombre "CrafTerraria" (solo texto, sin ícono) y la fila "Ordenar por: Rareza / Daño" (chip "Daño" debe distinguirse visualmente como condicional).
  - Último prompt de referencia entregado (para generar imagen guía y replicar en Figma) ya incluye: header CrafTerraria, buscador, categorías, ordenar por, grid, paginación con patrón `< 1 2 3 ... 15 >` — pendiente que el usuario lo genere y replique.
  - Frame 2 (Detalle de ítem) existe solo como wireframe de baja fidelidad (estructura validada contra RF01-RF10), sin estilo real aplicado todavía.
- [ ] Pasar a inglés los textos de los diseños (ej. "Ordenar por: Rareza / Daño" → "Sort by: Rarity / Damage"), ahora que la v1 es íntegramente en inglés
- [ ] Mockup de alta fidelidad de Detalle de ítem (móvil y desktop), heredando el mismo lenguaje visual
- [x] Decidir origen de las imágenes: enlazar directo desde la wiki (2026-10-20), ver sección 8
- [x] Implementar `getItemImageUrl()`, imagen de respaldo genérica, carga diferida y atribución en el pie de la app (2026-10-21)
- [ ] Comprobar que los íconos cargan desde `localhost` y desde el dominio publicado (sin bloqueo de la wiki)
- [ ] Antes de publicar: abrir la ficha de un archivo de ícono en la wiki (ej. `File:Iron Pickaxe.png`) y confirmar su plantilla de licencia
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
| 2026-10-19 | **v1 completa en inglés** (interfaz y nombres de ítems); el español pasa a v2. `items.json` ya incluye `name`, así que el diccionario `i18n/es.json` deja de ser necesario en v1 (el diseño se conserva para v2). Reemplaza las decisiones del 2026-07-30 sobre el diccionario de traducción |
| 2026-10-19 | Las rutas de ítem usan el `id`, no un slug: hay 7 nombres repetidos entre ítems distintos |
| 2026-10-19 | Datos re-extraídos el 2026-10-15: 6141 ítems, 3942 recetas, 36 tests. `items.json` suma `name`, `damageType` y `defense`; el `id` de receta pasa a ser estable (`{resultItemId}-{n}`); `ingredient_categories.json` es parte de los datos que consume la app |
| 2026-10-19 | Repo de la app creado: https://github.com/Ren-reno/CrafTerraria (código bajo MIT; datos bajo CC BY-NC-SA 4.0 con atribución al repo de datos) |
| 2026-10-20 | **Imágenes: se enlazan directo desde la wiki** (`imageUrl`), sin copiarlas al repo, con imagen de respaldo, carga diferida y atribución visible. Motivo: el arte del juego es propiedad de Re-Logic (los archivos revisados figuran "In Copyright" en la wiki) y no se redistribuye. Pendiente confirmar la licencia de un ícono puntual y que la wiki no bloquee el enlace directo |
| 2026-10-21 | **Proyecto base creado**: Vite 7, React 19, React Router 7 y Vitest 3, con los datos copiados a `src/data/` (commit `81be0be` del repo de datos). Capa de datos con 30 pruebas y pantallas provisorias con 13. Rango de Node soportado: 20.19+, 22.12+ y 24. Se usan Vitest 3 y jsdom 27 a propósito: Vitest 5 y jsdom 30 exigen Node 22.22+, y Vitest 4 no se instala con npm 10 |
| 2026-10-21 | Decisiones de la capa de datos: (1) los resultados huérfanos se convierten en ítems mínimos (`isOrphan`) para poder buscarlos y abrirlos como cualquier otro; (2) "Usado en" incluye las recetas que aceptan el ítem mediante un grupo ("Any Iron Bar") e indica cuál; (3) los ítems sin categoría se listan en "Other"; (4) los ids de la URL solo se aceptan en formato canónico (`/item/1`, no `/item/01` ni `/item/1e0`) |
| 2026-10-21 | **v1 responsive: móvil y desktop** (decisión del autor). Reemplaza las decisiones del 2026-08-04 y del 2026-08-17 que dejaban desktop para v2. Se mantiene mobile-first: base móvil y tablet/desktop con media queries, un solo árbol de componentes y las mismas rutas. Un panel de detalle junto al listado (sin cambiar de pantalla) queda para v2. Implica diseñar y probar dos anchos |
| 2026-10-21 | Detectado: el wireframe del Detalle incluye una "descripción", pero ningún requisito la pide ni existe ese campo en los datos. Queda como pendiente de decisión (sección 9) |
