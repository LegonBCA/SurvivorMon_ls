# SurvivorMon — cómo se trabaja y se publica

Normas fijas del dueño del proyecto. Se aplican SIEMPRE.

## Qué es
Copia de PokéSurvivor que se juega **sólo en local**: el progreso vive en el
navegador (localStorage) y se descarga / carga como `.json` desde Ajustes.
**Sin base de datos, sin cuentas en la nube y sin multijugador**: no proponer ni
añadir nada de eso (Firebase, ranking online, amigos, cooperativo).
`G.FIREBASE_CONFIG = null` en `js/core/firebase-config.js` a propósito.

## Plan de trabajo
La hoja de ruta acordada está en [`docs/PLAN.md`](docs/PLAN.md): se sigue en
orden y se marcan las tareas al terminarlas.

## Publicar una versión
1. Se edita `dev.html` (nunca `index.html`, que se genera).
2. `node tools/build.js --expose` genera `index.html`, `js/app.min.js` y
   **`version.json`** (la huella de esta versión). Probar en `http://localhost:8000`.
3. Se sube al repositorio de GitHub (`LegonBCA/SurvivorMon_ls`, rama `main`) y
   Vercel lo publica solo (`vercel.json`: `outputDirectory: "."`; el build de
   Vercel ejecuta `npm run build`). Commits sin "Co-Authored-By" ni firma de IA.

## Actualización automática de los jugadores
`js/core/updater.js` mira `version.json` cada 5 min:
- **Fuera de partida**: aviso de 5 s y la página se recarga (espera si está en el
  gacha, la tienda de mejoras, los ajustes o escribiendo en un campo).
- **En partida**: no se toca; al volver al menú, se recarga.
No quitar `updater.js` ni la escritura de `version.json` en `tools/build.js`.

## Novedades (changelog)
Cada cambio de juego o arreglo de fallos va también en `js/data/changelog.js`
(español e inglés, en `new` / `chg` / `fix` de la fecha de hoy).

## Rediseño de Interfaz UI (Estilo Pokémon Ambicioso)
- **Documento maestro de diseño:** [`docs/UI_REDESIGN_POKEMON.md`](docs/UI_REDESIGN_POKEMON.md).
- **Regla estricta:** en el rediseño NO cambiar lógica de juego, mecánicas,
  fórmulas de daño, scripts de guardado ni IDs/atributos `data-*` del DOM.
- **Ámbito del rediseño:** `css/style.css`, maquetación/clases en `dev.html` y
  cosmética en `js/ui/hud.js`.
- **Aspecto propio de SurvivorMon:** `css/theme.css` (se carga después de
  `style.css`): colores Pokémon, paneles Pokédex, logo, botones con relieve,
  cartas de nivel. Los cambios de aspecto van ahí.
