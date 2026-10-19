/* ============ settings-ui.js — pantalla de Ajustes (PC y móvil) ============
 * Se abre por encima de lo que haya (menú o pausa) y al cerrar vuelve ahí.
 * Pestañas: Sonido · Gráficos · Controles · Cuenta · Acerca de.
 * Los ajustes son de este dispositivo (G.Settings / G.Audio en el navegador).
 */
G.SettingsUI = (() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VERSION = '1.2 · 2026-10-09';
  const REPO = 'https://github.com/JPTER78/pokesurvivor';
  let tab = 'sound';

  function init() {
    document.querySelectorAll('#set-tabs .gen-tab').forEach(b => { b.onclick = () => { tab = b.dataset.t; render(); }; });
    $('set-close').onclick = close;
    $('btn-settings').innerHTML = G.Icons.html('gear', 20);
    $('btn-settings').onclick = () => open();
    $('btn-pause-settings').onclick = () => open('sound');
    // Pantalla completa (si el navegador la permite; en iPhone, cómo conseguirla).
    if (canFull() || iosTip()) {
      $('btn-full').classList.remove('hidden');
      $('btn-full').innerHTML = G.Icons.html('full', 20);
      $('btn-full').onclick = toggleFull;
    }
  }

  function open(t) {
    if (t) tab = t;
    $('scr-settings').classList.remove('hidden');
    render();
  }
  function close() { $('scr-settings').classList.add('hidden'); }
  const isOpen = () => !$('scr-settings').classList.contains('hidden');

  // ---------------- pantalla completa ----------------
  function canFull() { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); }
  function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  // iPhone: Safari no deja poner una web a pantalla completa (por eso a veces
  // no salía la opción). Sí se puede abriéndola desde la pantalla de inicio.
  const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => !!navigator.standalone || (window.matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  function iosTip() { return IOS && !canFull() && !standalone(); }
  const IOS_TIP = 'En iPhone, Safari no deja poner las webs a pantalla completa. Pulsa Compartir y luego "Añadir a pantalla de inicio": abriendo el juego desde ese icono se juega a pantalla completa.';
  function toggleFull() {
    if (!canFull()) { if (iosTip()) G.UI.toast(IOS_TIP, 9000); return; }
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const el = document.documentElement;
      const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      // En móvil, además se intenta fijar la pantalla en horizontal.
      if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* nada */ } }).catch(() => {});
    }
    setTimeout(() => { if (isOpen()) render(); }, 300);
  }

  // ---------------- piezas ----------------
  function section(title, sub) { return `<h3 class="set-h">${esc(title)}</h3>${sub ? `<p class="sub">${sub}</p>` : ''}`; }
  function toggle(key, label, desc) {
    const on = !!G.Settings.get(key);
    return `<div class="set-row"><div class="grow"><b>${esc(label)}</b><small>${esc(desc)}</small></div>
      <button class="btn small switch ${on ? 'gold' : ''}" data-k="${key}">${on ? 'Sí' : 'No'}</button></div>`;
  }
  function choice(key, opts) {
    const cur = G.Settings.get(key);
    return `<div class="chips set-chips">${opts.map(([v, l]) => `<button class="chip ${v === cur ? 'on' : ''}" data-k="${key}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  }

  let bgmFilter = 'all';

  function renderBgmSelector(box) {
    if (!box) return;
    const curTrack = G.Audio.track || G.Audio.settings.currentTrack || 'pallet';
    const mode = G.Audio.bgmMode || 'random';
    const allTracks = G.MUSIC_TRACKS || [];
    const info = G.Audio.currentTrackInfo || { name: 'Pueblo Paleta', game: 'Kanto (Gen 1)' };

    const mp3Count = allTracks.filter(t => t.isExternal || t.file || t.url).length;
    const synthCount = allTracks.length - mp3Count;

    const filteredTracks = allTracks.filter(t => {
      const isExt = !!(t.isExternal || t.file || t.url);
      if (bgmFilter === 'mp3') return isExt;
      if (bgmFilter === 'synth') return !isExt;
      return true;
    });

    let html = `
      <div class="bgm-jukebox-header">
        <div class="bgm-now-playing">
          <span class="bgm-now-icon">🎵</span>
          <div class="bgm-now-meta">
            <div class="bgm-now-label">${mode === 'random' ? 'Modo de música: <b>🔀 Rotación aleatoria</b>' : 'Tema fijado:'}</div>
            <div class="bgm-now-track"><b>${esc(info.name)}</b> <small>(${esc(info.game)})</small></div>
          </div>
        </div>
        <button class="btn small ${mode === 'random' ? 'gold' : ''}" id="btn-set-bgm-random">
          ${mode === 'random' ? '✓ Rotación aleatoria activa' : '🔀 Activar rotación aleatoria'}
        </button>
      </div>

      <div class="bgm-toolbar">
        <button class="bgm-filter-btn ${bgmFilter === 'all' ? 'active' : ''}" data-filter="all">Todas (${allTracks.length})</button>
        <button class="bgm-filter-btn ${bgmFilter === 'mp3' ? 'active' : ''}" data-filter="mp3">Canciones MP3 (${mp3Count})</button>
        <button class="bgm-filter-btn ${bgmFilter === 'synth' ? 'active' : ''}" data-filter="synth">Sintetizadas (${synthCount})</button>
        <button class="btn small" id="btn-bgm-upload" style="margin-left:auto;padding:3px 8px;font-size:11px" title="Cargar cualquier canción MP3 de tu ordenador">📁 Cargar archivo MP3...</button>
        <button class="btn small ghost" id="btn-bgm-refresh" style="padding:3px 8px;font-size:11px" title="Recargar lista de assets/music/">🔄 Recargar</button>
        <button class="btn small ghost" id="btn-bgm-folder" style="padding:3px 8px;font-size:11px" title="Ayuda sobre la carpeta assets/music/">ℹ️ Carpeta music</button>
        <input type="file" id="bgm-upload-input" accept="audio/*" style="display:none">
      </div>

      <div class="bgm-grid">
    `;

    filteredTracks.forEach(t => {
      const isPlaying = curTrack === t.id;
      const isPinned = mode === t.id;
      const isExt = !!(t.isExternal || t.file || t.url);
      const tag = isExt ? '<span class="bgm-tag-mp3">MP3</span>' : '<span class="bgm-tag-synth">RETRO</span>';
      const statusBadge = isPinned ? '<span class="bgm-chip-pinned">🔁 Fijada</span>'
        : isPlaying ? '<span class="bgm-chip-playing">▶ Sonando</span>'
        : (isExt && t.installed === false) ? '<span class="bgm-chip-missing">Falta archivo</span>'
        : (isExt && t.installed === true) ? '<span class="bgm-chip-installed">✓ Disponible</span><button class="bgm-card-play" type="button" title="Poner esta canción">▶</button>'
        : '<button class="bgm-card-play" type="button" title="Poner esta canción">▶</button>';

      html += `
        <div class="bgm-card ${isPlaying ? 'playing' : ''} ${isPinned ? 'pinned' : ''}" data-track="${esc(t.id)}">
          <span class="bgm-card-icon">${t.icon || '🎵'}</span>
          <div class="bgm-card-info">
            <div class="bgm-card-title">${esc(t.name)} ${tag}</div>
            <div class="bgm-card-sub">${esc(t.game)}${t.file ? ` · <span style="opacity:0.6">${esc(t.file)}</span>` : ''}</div>
          </div>
          <div class="bgm-card-status">
            ${statusBadge}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    box.innerHTML = html;

    const btnRandom = box.querySelector('#btn-set-bgm-random');
    if (btnRandom) {
      btnRandom.onclick = () => {
        G.Audio.setBgmMode('random');
        G.Audio.sfx('confirm');
        render();
      };
    }

    box.querySelectorAll('.bgm-filter-btn').forEach(btn => {
      btn.onclick = () => {
        bgmFilter = btn.dataset.filter;
        render();
      };
    });

    const uploadInput = box.querySelector('#bgm-upload-input');
    const btnUpload = box.querySelector('#btn-bgm-upload');
    if (btnUpload && uploadInput) {
      btnUpload.onclick = () => uploadInput.click();
      uploadInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const newTrack = G.addCustomTrack(file);
          if (newTrack) {
            newTrack.installed = true;
            G.Audio.setBgmMode(newTrack.id);
            G.Audio.sfx('confirm');
            if (G.UI && G.UI.toast) {
              G.UI.toast(`🎵 Reproduciendo: ${newTrack.name}`);
            }
            render();
          }
        }
      };
    }

    const btnRefresh = box.querySelector('#btn-bgm-refresh');
    if (btnRefresh) {
      btnRefresh.onclick = () => {
        if (G.loadExternalPlaylist) {
          G.loadExternalPlaylist().then(() => {
            if (G.UI && G.UI.toast) G.UI.toast('🔄 Lista de música actualizada');
            render();
          });
        }
      };
    }

    const btnFolder = box.querySelector('#btn-bgm-folder');
    if (btnFolder) {
      btnFolder.onclick = () => {
        alert('Para poner todas las canciones oficiales de Pokémon en el juego de forma permanente para Vercel:\n\n1. Abre la carpeta del juego: assets/music/\n2. Copia tus archivos .mp3 o .ogg ahí.\n3. Si usas nombres como cynthia_battle.mp3, driftveil_city.mp3, lavender_town.mp3, etc., se reconocerán automáticamente.\n4. Al subir tu proyecto a GitHub/Vercel, ¡toda la música quedará permanente y sonará para siempre!');
      };
    }

    box.querySelectorAll('.bgm-card').forEach(card => {
      card.onclick = () => {
        const tid = card.dataset.track;
        const trackObj = allTracks.find(t => t.id === tid);
        if (trackObj && trackObj.isExternal && trackObj.installed === false) {
          if (G.UI && G.UI.toast) {
            G.UI.toast(`⚠️ Coloca "${trackObj.file}" en assets/music/ para poder escucharlo`, 4000);
          }
          return;
        }
        G.Audio.setBgmMode(tid);
        G.Audio.sfx('select');
        render();
      };
    });
  }

  function render() {
    document.querySelectorAll('#set-tabs .gen-tab').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    const box = $('set-body');
    box.scrollTop = 0;
    if (tab === 'sound') {
      box.innerHTML = section('Sonido') + '<div id="set-sound" class="sound-inline"></div>'
        + section('Música de fondo', 'Elige tus canciones favoritas de Pokémon o déjalo en rotación continua.')
        + '<div id="set-bgm"></div>';
      G.UI.soundControls($('set-sound'));
      renderBgmSelector($('set-bgm'));
    } else if (tab === 'gfx') {
      const auto = ['baja', 'media', 'alta'][G.Settings.autoLevel];
      box.innerHTML = section('Idioma', 'El juego se recarga al cambiarlo.')
        + `<div class="chips set-chips" translate="no">${[['es', 'Español'], ['en', 'English']].map(([v, l]) =>
             `<button class="chip ${G.I18n.lang === v ? 'on' : ''}" data-lang="${v}">${l}</button>`).join('')}</div>`
        + section('Calidad', 'Cuántos efectos y partículas se dibujan. <b>Auto</b> la baja sola si el juego va a tirones (ahora: ' + auto + ').')
        + choice('quality', [['auto', 'Auto'], ['high', 'Alta'], ['mid', 'Media'], ['low', 'Baja']])
        + section('Pantalla')
        + toggle('dmgNumbers', 'Números de daño', 'Los números que salen al golpear y al recibir daño.')
        + toggle('calm', 'Menos sacudidas y destellos', 'La cámara tiembla menos y los fogonazos son suaves.')
        + toggle('fps', 'Mostrar FPS', 'Fotogramas por segundo, en la esquina de abajo.')
        + (canFull() ? `<div class="set-row"><div class="grow"><b>Pantalla completa</b><small>Sin barras del navegador.</small></div>
             <button class="btn small" id="set-full">${isFull() ? 'Salir' : 'Activar'}</button></div>`
           : iosTip() ? `<div class="set-row"><div class="grow"><b>Pantalla completa</b><small>${esc(IOS_TIP)}</small></div></div>` : '');
    } else if (tab === 'ctl') {
      box.innerHTML = section('En móvil o tablet')
        + `<p class="sub">Pon el dedo en cualquier parte y arrastra para moverte: el joystick aparece donde tocas. Toca un ataque de abajo para cambiarlo y el botón de arriba a la derecha para pausar. Se juega en horizontal.</p>`
        + `<div class="set-row"><div class="grow"><b>Tamaño del joystick</b><small>Cuánto hay que arrastrar el dedo.</small></div></div>`
        + choice('stick', [[0.8, 'Pequeño'], [1, 'Normal'], [1.25, 'Grande']])
        + `<div class="set-row"><div class="grow"><b>Colocar los botones</b><small>Pon los ataques, la pausa y el joystick (fijo, si quieres) donde quieras de la pantalla.</small></div>
             <button class="btn small" id="set-layout">Colocar</button></div>`
        + section('En PC')
        + `<div class="keys">
             <div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas</div><span>moverse</span>
             <div><kbd>1</kbd>–<kbd>4</kbd> o clic en el icono</div><span>elegir ataque</span>
             <div><kbd>Q</kbd> / <kbd>E</kbd></div><span>ataque anterior / siguiente</span>
             <div><kbd>Esc</kbd> o <kbd>P</kbd></div><span>pausa</span>
             <div><kbd>1</kbd>–<kbd>3</kbd></div><span>elegir carta al subir de nivel</span>
           </div>`;
    } else if (tab === 'acc') {
      renderAccount(box);
    } else {
      box.innerHTML = `<div class="about-logo">PokéSurvivor</div><p class="sub center">Versión ${esc(VERSION)}</p>`
        + `<p class="sub">Juego de fans <b>gratuito y sin ánimo de lucro</b>: sin anuncios ni compras. Pokémon y sus personajes son propiedad de Nintendo, Creatures y GAME FREAK; este proyecto no está afiliado a ellos.</p>`
        + section('Créditos')
        + `<ul class="credits">
             <li><b>Sprites:</b> PMD SpriteCollab y sus artistas (CC BY-NC 4.0).</li>
             <li><b>Datos de los Pokémon:</b> PokéAPI.</li>
             <li><b>Música y sonidos:</b> originales, generados por el propio juego.</li>
             <li><b>Fuente:</b> Pixelify Sans (OFL).</li>
           </ul>`
        + `<div class="row wrap" style="justify-content:center;gap:8px">
             ${window.PS_PAGES ? `<a class="btn small" href="${G.I18n.lang === 'en' ? 'en/guide/' : 'guia/'}" target="_blank">Guía y preguntas</a>
             <a class="btn small" href="${G.I18n.lang === 'en' ? 'en/pokedex/' : 'pokedex/'}" target="_blank">Pokédex</a>` : ''}
             <button class="btn small" data-legal>Aviso legal y privacidad</button>
             <a class="btn small" href="contacto/" target="_blank" rel="noopener">Contacto</a>
             <a class="btn small" href="${REPO}" target="_blank" rel="noopener">Código (GitHub)</a>
           </div>`;
    }
    wire(box);
  }

  function renderAccount(box) {
    const s = G.DB.save;
    const nick = (s && s.name) || G.DB.user || 'Entrenador';
    const totalMons = s && s.owned ? Object.keys(s.owned).length : 0;
    const totalShinies = s && s.shiny ? Object.keys(s.shiny).length : 0;
    const totalMegas = s && s.megas ? Object.keys(s.megas).length : 0;
    const coins = s && s.coins != null ? s.coins.toLocaleString('es') : 0;

    box.innerHTML = section('Partida', 'Tu progreso se guarda automáticamente en este navegador. Puedes exportar tu partida como un archivo para hacer copias de seguridad o pasarla a otro dispositivo.')
      + `<div class="set-row"><div class="grow"><b>Entrenador</b></div><span class="gold" translate="no">${esc(nick)}</span></div>`
      + `<div class="set-row"><div class="grow"><b>Progreso</b></div><span>${totalMons} Pokémon · ${totalShinies} Shiny · ${totalMegas} Megas</span></div>`
      + `<div class="set-row"><div class="grow"><b>Pokémonedas</b></div><span class="gold">${coins}</span></div>`
      + section('Copias de seguridad')
      + `<div class="row wrap" style="gap:10px;margin-top:8px">
           <button class="btn gold grow" id="btn-export-save">📥 Descargar partida (.json)</button>
           <button class="btn grow" id="btn-import-save">📤 Cargar partida (.json)</button>
         </div>`
      + section('Zona de peligro')
      + `<div class="set-row"><div class="grow"><b>Reiniciar todo el progreso</b><small>Borra tu partida actual para empezar desde cero.</small></div>
           <button class="btn danger small" id="btn-reset-save">Reiniciar partida</button>
         </div>
         <p class="note" id="set-msg"></p>`;

    const expBtn = box.querySelector('#btn-export-save');
    if (expBtn) expBtn.onclick = () => G.DB.exportSaveFile();

    const impBtn = box.querySelector('#btn-import-save');
    if (impBtn) {
      impBtn.onclick = () => {
        let input = document.getElementById('import-save-input');
        if (!input) {
          input = document.createElement('input');
          input.type = 'file';
          input.id = 'import-save-input';
          input.accept = '.json,application/json';
          input.style.display = 'none';
          document.body.appendChild(input);
        }
        input.value = '';
        input.onchange = async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const r = await G.DB.importSaveFile(file);
          if (r.ok) {
            render();
          } else {
            $('set-msg').textContent = r.error || 'Error al cargar partida.';
          }
        };
        input.click();
      };
    }

    const rstBtn = box.querySelector('#btn-reset-save');
    if (rstBtn) {
      rstBtn.onclick = async () => {
        if (!confirm('¿Estás seguro de que deseas reiniciar tu partida? Se borrará todo tu progreso local.')) return;
        G.DB.resetSave();
        render();
      };
    }
  }

  function wire(box) {
    box.querySelectorAll('.switch[data-k]').forEach(b => { b.onclick = () => { G.Settings.set(b.dataset.k, !G.Settings.get(b.dataset.k)); render(); }; });
    box.querySelectorAll('.chip[data-k]').forEach(b => {
      b.onclick = () => { const v = b.dataset.v; G.Settings.set(b.dataset.k, isNaN(+v) ? v : +v); render(); };
    });
    const full = $('set-full'); if (full) full.onclick = toggleFull;
    const lay = $('set-layout'); if (lay) lay.onclick = () => G.LayoutUI.open();
    box.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => { if (b.dataset.lang !== G.I18n.lang) G.I18n.set(b.dataset.lang); }; });
    const lo = $('set-login'); if (lo) lo.onclick = () => { close(); leave(); };
    const out = $('set-logout'); if (out) out.onclick = () => { close(); leave(); };
    const del = $('set-delete');
    if (del) del.onclick = async () => {
      const ok = await G.UI.confirmDelete();
      if (!ok) return;
      del.disabled = true;
      const r = await G.DB.deleteAccount(ok.pass);
      if (!r.ok) { $('set-msg').textContent = r.error; del.disabled = false; return; }
      close();
      G.UI.toast('Cuenta borrada');
      G.Audio.music(null);
      G.Flow.toLogin();
    };
  }

  /** Cerrar sesión (si estás en una partida, se abandona). */
  function leave() {
    if (G.DB.guest && !confirm('Eres invitado: se perderá todo el progreso. ¿Salir?')) return;
    if (G.Game.state !== 'ui') G.Game.quit && G.Game.quit();
    G.Audio.music(null);
    G.DB.logout().then(() => G.Flow.toLogin());
  }

  return { init, open, close, get isOpen() { return isOpen(); } };
})();
