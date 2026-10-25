# CrafTerraria

[![CI](https://github.com/Ren-reno/CrafTerraria/actions/workflows/ci.yml/badge.svg)](https://github.com/Ren-reno/CrafTerraria/actions/workflows/ci.yml)

App web para consultar recetas de crafteo de Terraria. Proyecto de portafolio.

> **Estado:** en diseño. La definición, los requisitos y la arquitectura están en [`docs/01-definicion-y-requisitos.md`](./docs/01-definicion-y-requisitos.md). La v1 será íntegramente en inglés (interfaz y nombres de ítems).

## Desarrollo

Requisitos: **Node 20.19 o superior** (o 22.12+, o 24) y npm.

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # pruebas (capa de datos y páginas)
npm run build    # build de producción en dist/
```

Estructura:

```
src/data/        copias de items.json, recipes.json e ingredient_categories.json (ver src/data/README.md)
src/services/    dataService.js: único punto de acceso a los datos (búsqueda, recetas, "usado en", categorías, imágenes)
src/components/  ItemImage (imagen enlazada desde la wiki, con respaldo y carga diferida), ItemCard, ItemSlot, ItemName, RarityBadge, SearchBox, Pagination
src/lib/         rarity.js (tier de rareza a nombre y color), format.js (precios en monedas) y paginate.js (paginación)
src/styles/      tokens.css (paleta y colores de rareza, ver docs/01, "Sistema visual")
src/pages/       Home (listado con búsqueda, categorías, orden y paginación), ItemDetail, CategoryView (redirección), NotFound
```

## Publicación

Es un sitio estático: `npm run build` genera la carpeta `dist/`, con los datos incluidos en el JavaScript (no necesita servidor propio). Se publica en [Vercel](https://vercel.com):

1. En Vercel, **Add New → Project** e importa este repositorio. Detecta Vite sola: comando `npm run build` y carpeta `dist`.
2. **Deploy.** Después, cada push a `main` publica una versión nueva, y cada pull request recibe su propia dirección de prueba.

`vercel.json` hace que los enlaces directos (por ejemplo `/item/1`) abran la app en vez de dar un error 404. Mientras tanto, GitHub Actions corre las pruebas y la compilación en cada push (insignia de arriba).

Este proyecto es **no comercial**: los datos son CC BY-NC-SA 4.0 y Terraria es de Re-Logic, así que el sitio publicado no debe llevar publicidad, donaciones ni cobros, y debe mantener la atribución del pie de página.

## Datos

Los datos (`items.json` y `recipes.json`) los genera un pipeline propio, que vive en un repositorio aparte: [terraria-crafting-data-pipeline](https://github.com/Ren-reno/terraria-crafting-data-pipeline).

## Atribución

Los datos provienen de la [Official Terraria Wiki](https://terraria.wiki.gg/) y se distribuyen bajo CC BY-NC-SA 4.0, según se detalla en el [`ATTRIBUTION.md`](https://github.com/Ren-reno/terraria-crafting-data-pipeline/blob/main/ATTRIBUTION.md) del repositorio de datos. Los íconos de ítems se cargan directamente desde la wiki y no se almacenan en este repositorio. Terraria es propiedad de Re-Logic; este es un proyecto no oficial, hecho por fans y sin fines comerciales.

## Licencia

El código se distribuye bajo licencia MIT (ver [`LICENSE`](./LICENSE)). Los datos y las imágenes tienen sus propias licencias, descritas en la sección de atribución.
