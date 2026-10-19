/* ============ settings-ui.js — pantalla de Ajustes (PC y móvil) ============
 * Se abre por encima de lo que haya (menú o pausa) y al cerrar vuelve ahí.
 * Pestañas: Sonido · Gráficos · Controles · Cuenta · Acerca de.
 * Los ajustes son de este dispositivo (G.Settings / G.Audio en el navegador).
 */
G.SettingsUI = (() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VERSION = '1.3 · 2026-10-18';
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

  function renderBgmSelector(box) {
    if (!box) return;
    const curTrack = G.Audio.track || G.Audio.settings.currentTrack || 'pallet';
    const mode = G.Audio.bgmMode || 'random';
    const allTracks = G.MUSIC_TRACKS || [];
    const info = G.Audio.currentTrackInfo || { name: 'Pueblo Paleta', game: 'Kanto (Gen 1)' };

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

      <div class="bgm-grid">
    `;

    allTracks.forEach(t => {
      const isPlaying = curTrack === t.id;
      const isPinned = mode === t.id;
      const statusBadge = isPinned ? '<span class="bgm-chip-pinned">🔁 Fijada</span>'
        : isPlaying ? '<span class="bgm-chip-playing">▶ Sonando</span>'
        : '<button class="bgm-card-play" type="button" title="Poner esta canción">▶</button>';

      html += `
        <div class="bgm-card ${isPlaying ? 'playing' : ''} ${isPinned ? 'pinned' : ''}" data-track="${esc(t.id)}">
          <span class="bgm-card-icon">${t.icon || '🎵'}</span>
          <div class="bgm-card-info">
            <div class="bgm-card-title">${esc(t.name)}</div>
            <div class="bgm-card-sub">${esc(t.game)}</div>
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

    box.querySelectorAll('.bgm-card').forEach(card => {
      card.onclick = () => {
        const tid = card.dataset.track;
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
        + section('Música de fondo', 'Elige un tema para el menú o déjalo en rotación. Toda la música la toca el propio juego.')
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
        + toggle('parade', 'Fondo animado en el menú', 'Un desfile de Pokémon pasa por detrás del menú principal.')
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
        + section('Con mando')
        + `<div class="keys">
             <div>Stick izquierdo o cruceta</div><span>moverse · en los menús, elegir</span>
             <div>A · B · X · Y</div><span>ataques 1-4 · en los menús, A pulsa y B vuelve</span>
             <div>LB / RB</div><span>ataque anterior / siguiente</span>
             <div>Start</div><span>pausa</span>
             <div>Select</div><span>cambiar las cartas al subir de nivel</span>
           </div>`
        + toggle('vibrate', 'Vibración', 'El mando (o el móvil) vibra al recibir un golpe fuerte y al subir de nivel.')
        + section('Ayuda')
        + `<div class="set-row"><div class="grow"><b>Tutorial</b><small>Los consejos de la primera partida vuelven a salir en la próxima.</small></div>
             <button class="btn small" id="set-tutorial">${G.Tutorial.active ? 'Activado' : 'Volver a verlo'}</button></div>
           <div class="set-row"><div class="grow"><b>Guía del juego</b><small>Qué es cada cosa: grietas, vínculos, climas, tipos, megas...</small></div>
             <button class="btn small" id="set-guide">Abrir</button></div>`
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
      box.innerHTML = `<div class="about-logo">SurvivorMon</div><p class="sub center">Versión ${esc(VERSION)} · basado en PokéSurvivor</p>`
        + `<p class="sub">Juego de fans <b>gratuito y sin ánimo de lucro</b>: sin anuncios ni compras. Pokémon y sus personajes son propiedad de Nintendo, Creatures y GAME FREAK; este proyecto no está afiliado a ellos.</p>`
        + section('Créditos')
        + `<ul class="credits">
             <li><b>Sprites y retratos:</b> PMD SpriteCollab y sus artistas (CC BY-NC 4.0).</li>
             <li><b>Datos de los Pokémon:</b> PokéAPI.</li>
             <li><b>Música y sonidos:</b> originales, generados por el propio juego.</li>
             <li><b>Fuente:</b> Pixelify Sans (OFL).</li>
           </ul>`
        + `<div class="row wrap" style="justify-content:center;gap:8px">
             ${window.PS_PAGES ? `<a class="btn small" href="${G.I18n.lang === 'en' ? 'en/guide/' : 'guia/'}" target="_blank">Guía y preguntas</a>
             <a class="btn small" href="${G.I18n.lang === 'en' ? 'en/pokedex/' : 'pokedex/'}" target="_blank">Pokédex</a>` : ''}
             <button class="btn small" data-legal>Aviso legal y privacidad</button>
             <a class="btn small" href="contacto/" target="_blank" rel="noopener">Contacto</a>
             <a class="btn small" href="${REPO}" target="_blank" rel="noopener">PokéSurvivor original (GitHub)</a>
           </div>`;
    }
    wire(box);
  }

  // ---------------- partida y copias de seguridad ----------------
  const DAY = 86400000;
  const fmtDate = t => new Date(t).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const daysAgo = t => Math.floor((Date.now() - t) / DAY);
  const agoText = t => { const d = daysAgo(t); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };
  const infoText = i => `${i.mons} Pokémon · ${i.shinies} shiny · ${i.megas} megas · ${i.coins.toLocaleString('es')} monedas · ${i.runs} partidas`;
  const WHY = { auto: 'Automática', import: 'Antes de cargar un archivo', restore: 'Antes de restaurar', reset: 'Antes de reiniciar' };
  const REMIND_DAYS = 7;

  /** Tras cargar, restaurar o reiniciar: se cierra Ajustes y se vuelve al menú (o al test, si no hay compañero). */
  function afterLoad(msg) {
    close();
    G.UI.toast(msg, 3200);
    G.Flow.afterLogin();
  }

  function renderAccount(box) {
    const s = G.DB.save;
    const nick = (s && s.name) || G.DB.user || 'Entrenador';
    const cur = s ? G.DB.summarize(s) : null;
    const last = G.DB.lastExport;
    const late = !last || daysAgo(last) >= REMIND_DAYS;
    // Cargar, restaurar o reiniciar en plena partida la dejaría a medias.
    const inRun = G.Game.state !== 'ui';
    const lock = inRun ? 'disabled title="Termina la partida primero"' : '';
    const baks = G.DB.backups();

    box.innerHTML = section('Partida', 'Tu progreso se guarda automáticamente en este navegador. Si borras los datos del navegador se pierde: descarga tu partida de vez en cuando para tener una copia.')
      + `<div class="set-row"><div class="grow"><b>Entrenador</b></div><span class="gold" translate="no">${esc(nick)}</span></div>`
      + (cur ? `<div class="set-row"><div class="grow"><b>Progreso</b></div><span>${infoText(cur)}</span></div>` : '')
      + section('Copia en archivo')
      + `<div class="set-row"><div class="grow"><b>Última descarga</b><small>${late ? `Descárgala ahora: es la única forma de no perderla si el navegador borra sus datos.` : 'Tu copia está al día.'}</small></div>
           <span class="${late ? 'bad' : 'gold'}">${last ? agoText(last) : 'nunca'}</span></div>`
      + `<div class="row wrap" style="gap:10px;margin-top:8px">
           <button class="btn gold grow" id="btn-export-save">📥 Descargar partida (.json)</button>
           <button class="btn grow" id="btn-import-save" ${lock}>📤 Cargar partida (.json)</button>
         </div>`
      + section('Copias automáticas', 'El juego guarda solo tus 3 últimas copias en este navegador (y siempre una antes de cargar un archivo o reiniciar). Si algo sale mal, vuelve atrás desde aquí.')
      + (baks.length ? baks.map((b, i) => `<div class="set-row"><div class="grow"><b>${esc(fmtDate(b.at))}</b><small>${esc(WHY[b.why] || 'Copia')} · ${infoText(b)}</small></div>
           <button class="btn small" data-bak="${i}" ${lock}>Restaurar</button></div>`).join('')
         : '<p class="sub">Todavía no hay copias: se hará la primera al guardar.</p>')
      + section('Zona de peligro')
      + `<div class="set-row"><div class="grow"><b>Reiniciar todo el progreso</b><small>Empiezas desde cero. Tu partida actual queda en las copias automáticas.</small></div>
           <button class="btn danger small" id="btn-reset-save" ${lock}>Reiniciar partida</button>
         </div>
         <p class="note" id="set-msg">${inRun ? 'Para cargar, restaurar o reiniciar, termina antes la partida en curso.' : ''}</p>`;

    box.querySelector('#btn-export-save').onclick = () => { G.DB.exportSaveFile(); render(); };

    box.querySelector('#btn-import-save').onclick = () => {
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
        const r = await G.DB.readSaveFile(file);
        if (!r.ok) { $('set-msg').textContent = r.error || 'Error al cargar partida.'; return; }
        const i = r.info;
        if (!confirm(`¿Cargar esta partida?\n\n${i.name}\n${infoText(i)}${i.updated ? '\nGuardada el ' + fmtDate(i.updated) : ''}\n\nSustituye a la que tienes ahora (queda en las copias automáticas).`)) return;
        G.DB.loadSave(r.save);
        afterLoad('¡Partida cargada!');
      };
      input.click();
    };

    box.querySelectorAll('[data-bak]').forEach(b => {
      b.onclick = () => {
        const i = +b.dataset.bak, k = baks[i];
        if (!k || !confirm(`¿Volver a la copia del ${fmtDate(k.at)}?\n\n${infoText(k)}\n\nTu partida actual queda en las copias automáticas.`)) return;
        if (G.DB.restoreBackup(i)) afterLoad('Copia restaurada');
      };
    });

    box.querySelector('#btn-reset-save').onclick = () => {
      if (!confirm('¿Reiniciar tu partida y empezar desde cero?\n\nTu partida actual queda en las copias automáticas por si te arrepientes.')) return;
      G.DB.resetSave();
      afterLoad('Partida reiniciada');
    };
  }

  /** Al volver al menú: si hace una semana que no descarga la partida, se lo recuerda (una vez por sesión). */
  let reminded = false;
  function remindBackup() {
    const s = G.DB.save;
    if (reminded || !s || G.DB.guest || (s.stats && s.stats.runs) < 3) return;
    const last = G.DB.lastExport;
    if (last && daysAgo(last) < REMIND_DAYS) return;
    reminded = true;
    G.UI.toast(last ? `💾 Hace ${daysAgo(last)} días que no descargas tu partida: Ajustes > Partida.`
      : '💾 Descarga tu partida para no perderla: Ajustes > Partida.', 6000);
  }

  function wire(box) {
    box.querySelectorAll('.switch[data-k]').forEach(b => {
      b.onclick = () => {
        G.Settings.set(b.dataset.k, !G.Settings.get(b.dataset.k));
        if (b.dataset.k === 'parade' && G.MenuParade) { if (G.Settings.get('parade')) G.MenuParade.start(); else G.MenuParade.stop(); }
        render();
      };
    });
    box.querySelectorAll('.chip[data-k]').forEach(b => {
      b.onclick = () => { const v = b.dataset.v; G.Settings.set(b.dataset.k, isNaN(+v) ? v : +v); render(); };
    });
    const full = $('set-full'); if (full) full.onclick = toggleFull;
    const lay = $('set-layout'); if (lay) lay.onclick = () => G.LayoutUI.open();
    const tut = $('set-tutorial'); if (tut) tut.onclick = () => { G.Tutorial.replay(); G.UI.toast('El tutorial saldrá en tu próxima partida'); render(); };
    const gd = $('set-guide'); if (gd) gd.onclick = () => { close(); G.GuideUI.open(); };
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

  return { init, open, close, remindBackup, get isOpen() { return isOpen(); } };
})();
