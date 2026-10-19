# PokéSurvivor — Guía Maestra y Análisis Integral para Rediseño de UI
## Transformación Visual hacia una Experiencia Pokémon Ambiciosa y Premium

> **Destinatario:** Claude / Desarrollador Frontend & Diseñador UI/UX  
> **Objetivo:** Remodelar por completo el diseño visual y la experiencia de usuario (UI/UX) de PokéSurvivor para llevarlo a un estándar moderno, ambicioso y auténticamente Pokémon, **sin alterar en absoluto la lógica del juego, APIs, IDs o mecánicas existentes.**

---

## 1. Reglas de Oro e Inmutabilidad (Lectura Obligatoria)

Para garantizar que el juego siga funcionando al 100% sin generar errores ni romper partidas de los usuarios:

1. **PROHIBIDO MODIFICAR LÓGICA DE JUEGO:**
   - No toques `js/game.js`, `js/systems/*`, `js/entities/*`, `js/world/world.js`, `js/core/db.js`, `js/net/*`, `js/data/*`.
   - Los archivos de edición autorizados son:
     - `css/style.css` (estilos principales del juego)
     - `dev.html` (estructura HTML de la interfaz; **NUNCA** edites directamente `index.html`)
     - Opcionalmente ajustes cosméticos de color/fuente en `js/ui/hud.js` si se requiere alinear el HUD dibujado en canvas.

2. **PROHIBIDO ALTERAR O BORRAR IDs Y ATRIBUTOS `data-*`:**
   - Todo el código JavaScript selecciona elementos mediante `document.getElementById('...')` o selectores como `[data-go]`, `[data-tab]`, `[data-v]`, `[data-back]`, `[data-sfx]`, `[data-t]`, `[data-k]`.
   - Si cambias o eliminas un `id` o un atributo `data-*`, una pantalla se quedará congelada o una función dejará de responder.
   - **Sí puedes:** Añadir nuevas clases CSS, envolver elementos en contenedores decorativos adicionales (siempre que los eventos e IDs se preserven), reestructurar layouts mediante Flexbox y CSS Grid, y añadir efectos visuales modernos.

3. **CICLO DE COMPILACIÓN OBLIGATORIO:**
   - Al realizar cambios en `dev.html` o en los scripts, **siempre** debes compilar ejecutando:
     ```bash
     node tools/build.js --expose
     ```
   - Esto regenera `index.html` e inyecta la huella de caché correspondiente.

---

## 2. Arquitectura del Proyecto

```
pokesurvivor-main/
├── dev.html                  # FUENTE MAESTRA del HTML (Aquí se edita la UI)
├── index.html                # GENERADO por tools/build.js (No editar a mano)
├── css/
│   ├── style.css             # ESTILOS MAESTROS de toda la interfaz del juego
│   └── pages.css             # Estilos de páginas estáticas complementarias (guía, pokedex)
├── js/
│   ├── core/                 # Motores base: audio, input, sprites, settings, db, updater
│   ├── data/                 # Datos estáticos: pokedex, moves, upgrades, megas, music, maps
│   ├── entities/             # Jugador, enemigos, proyectiles, pickups, vfx
│   ├── systems/              # Combate, spawner, levelup, gacha, rifts, clima, eventos
│   ├── world/                # Generador procedural de terreno (tiles, biomas)
│   ├── net/                  # Multijugador P2P, salas, amigos, ranking
│   └── ui/                   # Controladores DOM de cada pantalla
│       ├── hud.js            # HUD dibujado dentro del <canvas id="game">
│       ├── menu.js           # Menú principal, selector shiny/mega, mini-player BGM
│       ├── run-ui.js         # Cartas de subida de nivel, vínculos, objetos, pausa, fin de run
│       ├── gacha-ui.js       # Banners, animación de Poké Ball y resultados
│       ├── maps-ui.js        # Selector de mapa / mazmorra
│       ├── settings-ui.js    # Ajustes de audio, gráficos, controles, exportar/importar partida
│       ├── goals-ui.js       # Misiones y logros
│       ├── ranking-ui.js     # Tablas de clasificación
│       ├── social-ui.js      # Amigos y salas multijugador
│       ├── test.js           # Test de personalidad de inicio (Mundo Misterioso)
│       ├── icons.js          # Iconografía pixel art en SVG/Canvas
│       └── ui.js             # Gestor de pantallas (show/hide), barra superior y sonidos
```

### La Dualidad Visual: Canvas vs. DOM
- **Capa Canvas (`#game`)**: Ocupa el 100% de la pantalla (`width: 100vw; height: 100vh`). Renderiza el mapa procedural, Pokémon del jugador, hordas enemigas, partículas, ataques y el HUD de batalla (`js/ui/hud.js`).
- **Capa DOM (Overlay UI)**: Elementos HTML absolutos (`.scr`, `#topbar`, `.box`, `.cards`) superpuestos por encima del canvas (`z-index: 20` a `z-index: 60`). Aquí reside el 90% de la experiencia visual de menús, colección, gacha, subida de nivel y ajustes.

---

## 3. Filosofía del Rediseño: "Estilo Pokémon Ambicioso"

Actualmente el juego utiliza una paleta básica de cajas azules inspiradas en el Mundo Misterioso de GBA/DS (`--box1: #2c519f`, `--box2: #1a3170`, borde blanco plano de 3px). Aunque nostálgico, luce plano y no transmite la ambición de un juego contemporáneo.

### El Nuevo Concepto: *Cyber-Dex meets Mystery Dungeon DX*
Inspirado en la dirección artística de **Pokémon Mystery Dungeon DX (Switch)**, **Pokémon HOME**, la interfaz holográfica del **Rotom Phone / Holo-Caster**, y los roguelites bullet-heaven de mayor éxito visual:

1. **Glassmorphism Tecnológico con Acentos Elementales:**
   - Cajas y modales con fondos oscuros multicapa: degradados `radial-gradient` y `linear-gradient` con desenfoque de fondo (`backdrop-filter: blur(16px)`).
   - Biseles de luz perimetral finos y elegantes en vez de bordes sólidos gruesos (por ejemplo, `border: 1px solid rgba(255,255,255,0.15)` con reflejo interior `inset 0 1px 0 rgba(255,255,255,0.3)`).
   - Sombras volumétricas coloreadas según el elemento o contexto (`box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,229,255,0.15)`).

2. **Cartas Coleccionables Pokémon (TCG Style) para Subida de Nivel:**
   - Las cartas de recompensas en `#scr-levelup`, `#scr-bond` y `#scr-item` deben sentirse como **abrir un sobre de cartas Pokémon**:
     - Marco con gradiente del tipo elemental del ataque (Fuego, Agua, Dragón, etc.).
     - Resplandor exterior (glow) suave que respira al pasar el cursor.
     - Indicador de nivel/tipo en una insignia metálica con relieve.
     - Botón de atajo de teclado (`1`, `2`, `3`, `R`) con estética de botón retroiluminado.

3. **Menú Principal de Alto Impacto:**
   - **Showcase del Compañero (`.partner-card`):** Debe lucir como un pedestal de holograma o arena de combate con iluminación dinámica de fondo, halo según si es Shiny (arcoíris estelar) o Mega/Gigamax (aura cian y amatista con partículas).
   - **Botón de Jugar ("Entrar a la mazmorra"):** Debe ser el centro de atención indiscutible; tamaño dominante, gradiente oro/ámbar pulido o gradiente elemental activo, con animación sutil de pulso o resplandor.
   - **Lista de Menú:** Íconos con marcos luminosos y tipografía con buen contraste y espaciado moderno.

4. **Topbar y Pastillas de Recursos (Pills):**
   - Las pastillas de Monedas, Tickets y Mega-Tickets deben lucir como cápsulas de cristal con brillo especular, con íconos bien integrados y micro-interacciones hover (ligera elevación `translateY(-2px)` y aura suave).

5. **Paleta Elemental de Tipos Pokémon:**
   Utilizar variables CSS coherentes con los colores oficiales de Pokémon:
   - Acero: `#60a5fa` / `#94a3b8`
   - Agua: `#38bdf8` / `#0284c7`
   - Bicho: `#a3e635` / `#65a30d`
   - Dragón: `#818cf8` / `#4f46e5`
   - Eléctrico: `#fde047` / `#eab308`
   - Fantasma: `#a855f7` / `#7e22ce`
   - Fuego: `#fb923c` / `#ea580c`
   - Hada: `#f472b6` / `#db2777`
   - Hielo: `#67e8f9` / `#06b6d4`
   - Lucha: `#f87171` / `#dc2626`
   - Normal: `#cbd5e1` / `#94a3b8`
   - Planta: `#4ade80` / `#16a34a`
   - Psíquico: `#f43f5e` / `#e11d48`
   - Roca: `#d97706` / `#b45309`
   - Siniestro: `#64748b` / `#334155`
   - Tierra: `#fbbf24` / `#d97706`
   - Veneno: `#c084fc` / `#9333ea`
   - Volador: `#38bdf8` / `#818cf8`
   - **Mega / Sagrario de Arceus:** `#00e5ff` (Cian luminoso) y `#9333ea` (Amatista místico).

---

## 4. Inventario Completo de Pantallas y Elementos del DOM

Cualquier cambio de diseño debe respetar escrupulosamente los siguientes selectores e identificadores:

| ID de Pantalla | Clase Base | Función / Contenido | Elementos Clave que JS Manipula |
|---|---|---|---|
| `#boot` | `.boot` | Splash inicial de carga | `#boot p` (textos de estado) |
| `#tap-start` | `.tapstart` | Pantalla "Pulsa para empezar" (habilita audio) | `.tap-blink` |
| `#rotate` | `.hidden` | Aviso de rotación en móviles | Solo visible si la pantalla es vertical |
| `#scr-login` | `.scr` | Autenticación, invitado y modo test | `#f-user`, `#f-pass`, `#btn-auth`, `#btn-guest`, `#btn-tester`, `#btn-google`, `.tabs .tab[data-tab]` |
| `#scr-test` | `.scr.dim` | Cuestionario de personalidad | `#test-bar`, `#test-count`, `#test-q`, `#test-a`, `.answer` |
| `#scr-result` | `.scr.dim` | Resultado del test de personalidad | `#res-trait`, `#res-text`, `#res-stage` (canvas), `#res-name`, `#res-ok`, `#res-other` |
| `#scr-starters`| `.scr.dim` | Selector manual de compañero inicial | `#starter-grid`, `#starter-back`, `#starter-info`, `#starter-ok` |
| `#scr-maps` | `.scr.dim` | Selector de Mazmorra / Mapa | `#maps-list`, `#btn-map-back`, `#btn-map-start`, `.map-card` |
| `#scr-menu` | `.scr` | **Menú Principal del Juego** | `#menu-partner` (canvas), `#menu-partner-name`, `#menu-partner-info`, `#menu-shiny` (`data-v="0"`, `data-v="1"`, `data-v="mega"`), `#menu-bgm` (reproductor con `#bgm-prev`, `#bgm-next`, `#bgm-mode-btn`), `[data-go="play|dex|upgrades|gacha|goals|friends|rank|settings"]`, `#btn-menu-test`, `#menu-stats` |
| `#topbar` | `.topbar` | Barra superior de recursos y accesos | `#coins`, `#tickets-pill`, `#mega-tickets-pill`, `#user-pill`, `#btn-news`, `#btn-support`, `#btn-sound`, `#btn-full`, `#btn-settings`, `#btn-logout` |
| `#scr-dex` | `.scr.dim` | Pokédex y Colección de Pokémon | `#dex-total`, `#dex-gens` (`.gen-tab`), `#dex-filters` (`.chip`), `#dex-grid` (`.cell`), `#dex-detail` (panel con radar/barras de stats) |
| `#scr-upgrades`| `.scr.dim` | Tienda de Mejoras de Pokémon | `#upg-stage` (canvas), `#upg-mon` (select), `#upg-list` (`.upg-item`, `.pips i`) |
| `#scr-gacha` | `.scr.dim` | Invocación de Pokémon y Sagrario | `#gacha-gens` (`.gen-tab`), `#banner`, `#banner-title`, `#banner-desc`, `#gacha-owned`, `#gacha-feat` (canvas de legendarios), `#pull-1`, `#pull-10`, `#pull-10b`, `#gacha-tickets`, `#gacha-pity`, `#gacha-rates` |
| `#pull-fx` | `.hidden` | Animación y resultado del Gacha | `#slot` (canvas ruleta), `#pull-results` (`.pcard`), `#pull-close` |
| `#scr-goals` | `.scr.dim` | Misiones, Logros y Perfil | `#goals-tabs` (`.tab[data-tab="missions|ach|profile"]`), `#goals-body` |
| `#scr-friends`| `.scr.dim` | Lista de amigos y solicitudes | `#fr-room`, `#fr-me`, `#fr-add`, `#fr-name`, `#fr-msg`, `#fr-list` |
| `#scr-lobby` | `.scr.dim` | Sala de partida cooperativa multijugador | `#lobby-menu`, `#lobby-leave`, `#lobby-sub`, `#lobby-members`, `#lobby-invite`, `#lobby-start`, `#lobby-note` |
| `#scr-rank` | `.scr.dim` | Tabla de clasificación mundial | `#rk-mode`, `#rk-period`, `#rk-scope`, `#rk-poke`, `#rk-clear`, `#rk-list`, `#rk-me` |
| `#scr-settings`| `.scr.dim` | Ajustes de sonido, gráficos y cuenta | `#set-tabs` (`.gen-tab[data-t]`), `#set-body`, `#import-save-input` |
| `#scr-levelup`| `.scr.dim` | **Cartas de Subida de Nivel (In-Run)** | `#lvl-num`, `#cards` (`.card`, `.card.evo`), `#lvl-reroll`, `#lvl-rr-n`, `#lvl-wait` |
| `#scr-bond` | `.scr.dim` | Fusión de ataques por Vínculo Sagrado | `.bond-title`, `#bond-sub`, `#bond-cards`, `#bond-back` |
| `#scr-item` | `.scr.dim` | Selección de Objeto Pasivo | `#item-cards` (`.card`) |
| `#scr-pause` | `.scr.dim` | Menú de Pausa en partida | `#btn-resume`, `#btn-pause-settings`, `#btn-quit`, `#pause-sound` |
| `#scr-over` | `.scr.dim` | Fin de Partida (Derrota / Victoria) | `#over-title`, `#over-stats` (`.stats`), `#btn-again` |

---

## 5. El HUD en Canvas (`js/ui/hud.js`)

A diferencia de los menús, el HUD durante el combate se dibuja en coordenadas 2D de pantalla sobre el canvas del juego. Si Claude desea elevar la estética del HUD, las áreas principales son:
- **Barra de Experiencia Superior (`xpF`):** Actualmente es un rectángulo azul-violeta de 7px. Puede modernizarse con un sutil resplandor, borde luminoso o separadores de progreso.
- **Placa de Vida y Nivel del Jugador:** Nombre en fuente nítida, nivel con distintivo dorado y barra de HP con gradiente de vida (`#10b981` verde esmeralda en alta, `#f59e0b` ámbar en media, `#ef4444` carmesí en crítico).
- **Insignias de Buffs Activos:** Las píldoras de ATK, VEL, DEF y REG pueden enriquecerse con fondos oscurecidos translúcidos y bordes de color neón.
- **Widget Central de Reloj y Bioma:** Tipografía digital limpia con sombra suave para máxima legibilidad contra cualquier fondo de terreno.
- **Widget de Clima:** Esquina superior derecha con ícono dinámico y barra de tiempo restante.

---

## 6. Plan de Implementación Paso a Paso para Claude

### Fase 1: Redefinición de Tokens y Base Global en `css/style.css`
1. Actualizar las variables de `:root`:
   - Conservar la tipografía `'Pixelify'` y añadir tokens semánticos modernos: `--surface-1`, `--surface-2`, `--border-light`, `--border-glow`, `--accent-gold`, `--accent-cyan`, `--accent-mega`.
2. Rediseñar `.box`:
   - Reemplazar el borde plano por un efecto multicapa con relieve fino y sombra de desenfoque profundo (`backdrop-filter: blur(14px)`).
3. Rediseñar `.btn`:
   - Crear botones con profundidad 3D suave, brillo sutil en el borde superior, estados `:hover` con elevación y resplandor, y `:active` táctil con retroalimentación sonora natural.

### Fase 2: Rediseño del Menú Principal (`#scr-menu`) y Topbar (`#topbar`)
1. **Logo:** Mejorar el logotipo tipográfico con efectos de relieve dorado y reflejos metálicos.
2. **Tarjeta de Compañero (`.partner-card`):**
   - Enmarcar el canvas `#menu-partner` en una cápsula holográfica con gradiente dinámico.
   - Mejorar el interruptor Normal / Shiny / Mega (`#menu-shiny`) con aspecto de conmutador de tecnología Pokédex.
3. **Mini-Reproductor BGM (`#menu-bgm`):**
   - Pulir como una pastilla elegante con visualizador de nota musical animada, información legible de la pista y botones de control circulares.
4. **Columna de Botones (`.menu-list`):**
   - Convertir cada botón en una tarjeta interactiva con ícono estilizado, texto principal nítido y subtítulo descriptivo con jerarquía clara.
   - El botón `.menu-item.play` ("Jugar") debe sobresalir visualmente como el CTA principal.
5. **Barra Superior (`#topbar`):**
   - Convertir las pastillas (`#coins`, `#tickets-pill`, `#mega-tickets-pill`, `#user-pill`) en indicadores de cristal translúcido con brillo de estado.

### Fase 3: Cartas de Subida de Nivel y Recompensas (`#scr-levelup`, `#cards`)
1. Reemplazar las filas oscuras planas de `.card` por tarjetas con sensación de cartas coleccionables:
   - Resplandor perimetral acorde al color del tipo o evolución (`c.color`).
   - Insignia de tipo estilizada (`.tag-chip`) con tipografía moderna.
   - Contenedor de ícono con relieve y brillo de fondo.
   - Tecla de atajo rápida (`.key`) diseñada como una tecla de gamepad retro-iluminada.
   - Animación de entrada fluida y efecto hover con desplazamiento y resplandor pronunciado.

### Fase 4: Pokédex (`#scr-dex`), Gacha (`#scr-gacha`) y Tienda de Mejoras (`#scr-upgrades`)
1. **Pokédex:** Celdas de la cuadrícula (`.cell`) con fondo de cristal sutil, marco de selección dorado, e insignias de Poké Ball acordes a la rareza. Panel de detalles (`#dex-detail`) con barras de estadísticas estilo Pokédex oficial.
2. **Gacha:** Banners con arte estilizado, animación de apertura de Poké Ball con destello de partículas y cartas de resultados (`.pcard`) con halos legendarios y míticos deslumbrantes.
3. **Mejoras:** Lista de mejoras con barras de progreso de nivel ("pips") en forma de cristales de energía luminosos.

### Fase 5: Modales Secundarios y Responsividad Móvil
1. Pulir los modales de Ajustes (`#scr-settings`), Misiones (`#scr-goals`), Ranking (`#scr-rank`) y Fin de Run (`#scr-over`).
2. Comprobar que en pantallas móviles horizontales (`height <= 520px`) los menús se compacten limpiamente sin solaparse y que los contenedores scrollables respeten `overscroll-behavior: contain`.

### Fase 6: Validación, Compilación y Verificación
1. Ejecutar el build del proyecto:
   ```bash
   node tools/build.js --expose
   ```
2. Verificar en el navegador (`http://localhost:8000`) que:
   - La música y el reproductor sigan funcionando perfectamente.
   - Todos los clics y atajos de teclado abran y cierren sus pantallas correspondientes.
   - El selector Normal / Shiny / Mega cambie correctamente las formas y sprites.
   - Ninguna función de guardado ni de combate presente errores en la consola (F12).

---

## 7. Resumen de Compromiso para el Desarrollador

> "El objetivo es que cuando el jugador abra PokéSurvivor, diga: **'¡Esto parece un juego oficial de Pokémon de última generación!'**, manteniendo intacta la ligereza, fluidez y código base que hacen que el juego funcione sin fallos."
