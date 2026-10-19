# SurvivorMon — Plan de trabajo

Juego **sólo local**, publicado en Vercel. El progreso vive en el navegador y se
descarga/carga como `.json` desde Ajustes. Sin base de datos ni multijugador.

Cada cambio: se edita `dev.html` (nunca `index.html`), se apunta en
`js/data/changelog.js` (es/en), se compila con `node tools/build.js --expose` y
se prueba en `http://localhost:8000` antes de subir.

## Decisiones (18-10-2026)
- Modo test: **oculto**, sólo con `?dev` en la dirección.
- Código online (amigos, ranking, cooperativo): **se esconde en la Fase 2** y el
  código se quita en la Fase 10.
- Música: **sintetizador + temas propios**; fuera los MP3 con copyright.
- Eventos de temporada: después de la base (Navidad), no Halloween.

## Fases

- [ ] **0 · Preparación**
  - [ ] Trabajar en un clon git de `LegonBCA/SurvivorMon_ls` (pendiente: decisión del dueño)
  - [x] `CLAUDE.md` describe esta versión (local, Vercel)
  - [x] Borrar lo de Firebase: `firestore.rules`, `firestore.indexes.json`, `database.rules.json`, `firebase.json`, `.firebaserc`, `docs/FIREBASE.md`
  - [x] `vercel.json`: orden de cabeceras (y `version.json` sin caché)
  - [x] Nombre "SurvivorMon" en README y Ajustes > Acerca de
  - [ ] Páginas SEO (`tools/make_seo_pages.py`, `sitemap.xml`, `CNAME`): nombre y dominio (pendiente: qué dominio)

- [x] **1 · Guardado a prueba de todo**
  - [x] `navigator.storage.persist()` (que Safari no borre la partida a los 7 días)
  - [x] 3 copias automáticas en el navegador, restaurables desde Ajustes
  - [x] Recordatorio "hace X días que no descargas tu partida"
  - [x] Cargar: vista previa, confirmación y rechazo de archivos rotos sin tocar la partida
  - [x] Reiniciar: copia automática antes de borrar; `resetSave` ya no cambia el objeto de la partida
  - [x] Probado en Chrome (prueba automática); falta probar en un móvil de verdad

- [x] **2 · Quitar lo online y el modo test**
  - [x] Esconder Amigos, Ranking, Salir y Apoyar (el login ya no se ve: entra solo)
  - [x] Modo test y `unlockAll()` sólo con `?dev`; "invitado" no desbloquea todo
  - [x] Partida completa sin errores en la consola

- [ ] **3 · Arreglos de contenido**
  - [x] Pasivas de 5 megas que no se activaban (IDs viejos en `player.js`)
  - [x] Música: fuera los MP3, `playlist.json`, el escáner y la subida de archivos
  - [ ] Componer temas propios nuevos en `music.js`
  - [x] Textos en inglés de mapas, megas, música y copias de seguridad
  - [ ] Megas: 40 de 45 descripciones de habilidad prometen efectos que no existen (sólo suben stats). Programarlos o reescribirlas (→ fase 7)

Descartadas por el dueño (18-10-2026), no volver a proponerlas: evolución durante la
partida, reto diario / códigos de semilla y capturar Pokémon.

**Regla para todo el contenido nuevo:** no tocar cómo se consiguen los Pokémon (el
gacha), ni la dificultad del modo normal, ni la forma de una partida. Premios de una
sola vez o con tope moderado.

### Cómo se hace cada fase (igual para todas)
1. Programar en los archivos fuente (nunca `index.html`).
2. Textos nuevos también en inglés (`js/data/lang-en.js`).
3. Entrada en `js/data/changelog.js` (es/en) con la fecha del día.
4. `node tools/build.js --expose` y la prueba automática en Chrome (Puppeteer:
   recorre menús, juega una partida, cero errores en consola), ampliada con lo nuevo de la fase.
5. Marcar aquí las tareas hechas. Una fase no se da por terminada con fallos abiertos.

Partidas guardadas viejas: todo campo nuevo de la partida se rellena en `migrate()` y se
fusiona en `merge()` (db.js), para que nadie pierda nada al actualizar.

---

### Fase 4 · Récords y estadísticas locales  ✅ (18-10-2026)
- [x] Partida guardada: `records.map[mapa]` y `records.mon[dex]` = { t, lv, k, at, runs };
      `stats.playTime`. En `migrate`, `sanitize` y `merge`.
- [x] Se apuntan al acabar cada partida (`G.Progress.record`, desde `endRun`).
- [x] Pestaña **"Récords"** en Misiones: totales, por mapa, top 10 de tus Pokémon, el más usado.
- [x] Resumen de la partida: "¡Mejor marca en {mapa}!" / "¡Mejor marca de {Pokémon}!".
- [x] Prueba automática: dos partidas en mapas distintos → récords correctos.

### Fase 5 · Las habilidades de las 45 megas  ✅ (19-10-2026)
- [x] Módulo `js/systems/mega-skills.js`: 18 familias (pulse, snipe, shots, erupt, pools,
      shards, storm, cross, field, drain, heal, stop, echo, splash, thorns, reflect, rage,
      moxie) + estáticas (guard, atk, crit, spd, levitate, noWeak, immune).
- [x] Ganchos: `Player.hurt` (inmunidad, sin debilidades, púas), `Combat.hit`/proyectiles
      (eco, estallido), muerte de enemigo (autoestima), disparo enemigo (reflejo), líquidos (levitación).
- [x] Daño = (8 + nivel × 1,1) × ataque × k (antes usaba sólo el multiplicador de ataque y
      no hacía casi nada). Las de recarga larga se estrenan a los 3 s.
- [x] Las 45 descripciones reescritas para decir lo que hacen (es/en). Fuera "Gigamax".
- [x] Prueba `tools/megas-test.js`: las 45 juegan sin errores y su habilidad hace efecto.

### Fase 6 · Tutorial y glosario  ✅ (19-10-2026)
- [x] `js/ui/guide-ui.js` · `G.Tutorial`: 7 consejos en la primera partida que avanzan al
      hacer lo que piden (moverse, derrotar, experiencia, cartas, cambiar de ataque, objetos
      del mapa, jefes/biomas) + aviso de la primera grieta. Se puede saltar. `save.tutDone`
      (las partidas viejas con partidas jugadas lo traen visto).
- [x] `G.GuideUI`: guía con 18 apartados (es/en), botón "?" arriba y "Guía" en la pausa; Esc la cierra.
- [x] Ajustes > Controles: "Volver a ver el tutorial" y "Guía del juego".
- [x] Prueba automática: consejos que avanzan, tutorial visto al acabar, guía y Esc.

### Fase 7 · Rediseño visual  ✅ (19-10-2026) — estilo Mundo Misterioso DX (recomendado; el dueño puede pedir otro)
- [x] 7a · Capa final "Tema Mundo Misterioso DX" en `css/style.css` (cajas con marco doble,
      títulos crema, botones, filas del menú, pestañas, pastillas, cartas). Arreglado el
      icono del menú que se montaba sobre el texto en móvil. Quitado el CSS muerto del MP3.
- [x] 7b · `tools/fetch_portraits.py`: 3.946 retratos (5,9 MB) de los 966 Pokémon
      (Normal, Feliz, Decidido, Dolor, Triste) + `js/data/portraits-meta.js` + sección
      "Retratos" en `CREDITS.md` (`--credits`, 138 artistas). `G.UI.portrait` y `G.UI.speech`:
      menú, resultado del test, subir de nivel, Pokédex, resumen, y frases en partida (jefe,
      poca vida, grieta, shiny).
- [x] 7c · Impacto en cada golpe; crítico más grande con anillo dorado; "muy eficaz" con
      chispas del tipo (las estelas por material ya existían).
- [x] 7d · Gacha: se mantiene la tragaperras; cartas boca abajo (Poké Ball) que se giran,
      sin delatar la rareza; las especiales tiemblan y destellan; tocar = girar todas.
- [x] 7e · HUD: caja de vida estilo combate (nombre/Mega, Nv., PS verde/amarillo/rojo, estela).

### Fase 8 · Tienda de Kecleon  ✅ (19-10-2026)
- [x] Módulo `js/systems/shop.js` (aparte de events.js): una vez por partida entre los
      minutos 6 y 24, sin jefe, grieta ni Arceus; Kecleon se queda 25 s con flecha en el borde.
      Al acercarte se abre la tienda y la partida se para (`G.Game.hold`). Sólo en solitario.
- [x] 3 ofertas al azar de 5 (Baya Aranja 50%, Baya Zidra regeneración 30 s, Tarjeta Cambio,
      Proteína +6% ataque, objeto sorpresa) con las **monedas de la partida**; precio
      × (1 + minuto/15).
- [x] Tema propio `G.MUSIC.shop` (sintetizador), también en el selector de música. Esc o
      "Salir" cierran. Prueba automática: llega, se abre, se compra, se sale.

### Fase 9 · Rangos de dificultad  ✅ (19-10-2026)
- [x] **Configuración de partida** `G.Game.runCfg` = { mode, rank, gym } (`startRun(coop, mapa, opts)`).
- [x] `js/data/ranks.js`: Normal · Bronce · Plata · Oro · Diamante · Maestro (vida, daño,
      cantidad, jefes antes, curas, élites, premio). Selector en la pantalla de mapas;
      desbloqueo al llegar a la Sentencia de Arceus en el más alto abierto (`save.ranks`).
- [x] Spawner (enemigos y jefes), curas del suelo, premio extra al acabar (monedas, tickets,
      Mega-Tickets; tope +50%). HUD: "RANGO ORO" bajo el reloj. Resumen: premio y desbloqueo.
- [x] Récords por rango (`records.rank`) y sección "Por rango" en Récords. Prueba automática.

### Fase 10 · Desafío de Gimnasios  ✅ (19-10-2026)
- [x] `js/data/gyms.js` (`G.GymData`): 9 regiones × 8 gimnasios + Alto Mando + Campeón, con
      Pokémon que tienen sprite (validado).
- [x] `js/systems/gym.js`: modo 'gym' — arena y clima del tipo, enemigos del tipo y la región
      (generaciones vecinas si hay pocos), ayudantes 2:30 y 5:00, estrella 7:00; Liga de 5
      combates (estrella a los 2:30 de cada uno, +40% de vida entre combates). Sin grietas,
      Arceus, eventos ni tienda. Dificultad gimnasio ×0,75-1,45; Liga ×1,2-1,5, Campeón ×1,7.
- [x] Pantalla **Gimnasios** (`js/ui/gyms-ui.js`, botón en el menú): pestañas por región,
      medallas, líder, tipo, estrella, "Débil a", Liga que se abre con las 8 medallas.
- [x] Premios sólo la primera vez (`save.gyms`); logros "Primera medalla", "Ocho medallas",
      24, 72 y "Campeón de {región}" con título. Tema `G.MUSIC.gym`.
- [x] Pruebas: `tools/smoke.js` (Brock hasta la medalla y la Liga de Kanto hasta Campeón) y
      `tools/gyms-test.js` (los 81 desafíos arrancan, tipos correctos y estrella a su hora).
- [ ] Probar jugando de verdad el equilibrio (sobre todo gimnasios 7-8 y la Liga).

### Fase 11 · Pokédex completa  ✅ (19-10-2026)
- [x] `tools/fetch_dex_text.py` → `js/data/dex-text.json` (312 KB, se carga al abrir la
      Pokédex): categoría, descripción (es/en), altura y peso. 99 Pokémon nuevos no tienen
      texto en español en PokeAPI: se enseña el inglés, marcado.
- [x] "Dónde aparece": salvaje (desde qué minuto), jefe, legendario de grieta, quién lo usa en
      los gimnasios y su banner del gacha.
- [x] Logros "Pokédex de {región}" (todos los de su banner): 2 tickets ×10 + 1.000 monedas, una vez.
- [x] Arreglo: la ficha de una Mega usa sus multiplicadores reales (vida, ataque, velocidad).

### Fase 12 · Soporte de mando  ✅ (19-10-2026)
- [x] Gamepad API en `core/input.js`, traducido a las mismas "teclas" del teclado: stick o
      cruceta = moverse; A/B/X/Y = ataques 1-4; LB/RB = anterior/siguiente; Start = pausa;
      Select = cambiar cartas.
- [x] Menús: foco con la cruceta/stick entre los botones de la pantalla de más arriba (con
      repetición), A pulsa, B vuelve; el primer foco va a lo principal (Jugar, primera carta...).
- [x] Vibración (mando y móvil) con golpes fuertes, al subir de nivel y al caer; interruptor en
      Ajustes > Controles (con la tabla de botones). Prueba automática con un mando simulado.
- [x] Arreglo encontrado por la prueba: la pantalla de Gimnasios se quedaba abierta encima de
      la partida del desafío (faltaba en la lista de pantallas de `G.UI`).

### Fase 13 · Pulido final
- [x] Quitados `js/net/` (social, net, coop, ranking) y las pantallas social/ranking/moderación;
      `js/net/offline.js` deja la misma forma apagada (y las misiones siguen igual).
      El código del grupo en `game.js` se queda (protegido por `G.Coop.active`, siempre false).
      `app.min.js`: 1.187 KB → 1.140 KB.
- [x] Temas propios de los mapas: `tundra`, `shadow`, `desert` (`maps.js` → `music`).
- [ ] Carga más rápida: `sprites-meta.js` (542 KB) por generaciones — no hecho: toca el
      arranque de todos los sprites y el beneficio es pequeño; valorarlo con datos reales.
- [ ] Páginas SEO con el nombre y el dominio definitivos (pendiente: qué dominio).
- [ ] Pruebas en un móvil Android y un iPhone de verdad (las automáticas son en Chrome de PC).

- [ ] **Después:** eventos de temporada (Navidad)

### Decisiones pendientes del dueño
- Fase 7 se hizo con las recomendaciones (Mundo Misterioso DX, tragaperras + cartas, retratos);
  confirmar que le gusta o pedir cambios.
- Dominio para el SEO (fase 13) y si se trabaja con git.
