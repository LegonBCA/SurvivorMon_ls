/* ============ menu.js — menú principal, colección y mejoras ============ */
G.MenuUI = (() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const GEN_NAMES = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Teselia', 'Kalos', 'Alola', 'Galar', 'Paldea'];
  let dexFilter = 'all', dexGen = 1, dexSel = null;

  function init() {
    const ICON = { play: 'ball', gyms: 'trophy', dex: 'book', upgrades: 'up', gacha: 'ball4', goals: 'medal3', friends: 'friends', rank: 'trophy', settings: 'gear' };
    document.querySelectorAll('#scr-menu [data-go]').forEach(b => {
      b.insertAdjacentHTML('afterbegin', `<span class="mi-ico">${G.Icons.html(ICON[b.dataset.go], 26)}</span>`);
      b.dataset.sfx = b.dataset.go === 'play' ? 'confirm' : 'click';
      b.onclick = () => {
        const go = b.dataset.go;
        if (go === 'play') { if (G.Social.room) G.LobbyUI.open(); else (G.MapsUI ? G.MapsUI.open() : G.Flow.play()); }
        else if (go === 'gyms') G.GymsUI.open();
        else if (go === 'dex') openDex();
        else if (go === 'upgrades') openUpgrades();
        else if (go === 'gacha') G.GachaUI.open();
        else if (go === 'goals') G.GoalsUI.open();
        else if (go === 'friends') G.FriendsUI.open();
        else if (go === 'rank') G.RankingUI.open();
        else if (go === 'settings') G.SettingsUI.open();
      };
    });
    document.querySelectorAll('[data-back]').forEach(b => { b.onclick = open; });
    const btnMenuTest = $('btn-menu-test');
    if (btnMenuTest && G.DEV) {
      btnMenuTest.classList.remove('hidden');
      btnMenuTest.insertAdjacentHTML('afterbegin', `<span class="mi-ico">${G.Icons.html('ticketMega', 26)}</span>`);
      btnMenuTest.onclick = () => {
        G.DB.unlockAllForTesting();
        G.UI.toast('🧪 ¡Todo desbloqueado y 99.999 de cada ticket!');
      };
    }
    G.Social.on(() => { if (G.UI.isOpen('scr-menu')) socialLine(); });
    $('btn-logout').onclick = () => {
      if (G.DB.guest && !confirm('Eres invitado: se perderá todo el progreso. ¿Salir?')) return;
      G.Audio.music(null);
      G.DB.logout().then(() => G.Flow.toLogin());
    };
    initBgmWidget();
  }

  // ---------------- mini reproductor de música ----------------
  function updateBgmWidget(info) {
    const el = $('menu-bgm');
    if (!el) return;
    info = info || (G.Audio && G.Audio.currentTrackInfo) || { name: 'Pueblo Paleta', game: 'Kanto (Gen 1)' };
    const titleEl = $('bgm-title');
    const gameEl = $('bgm-game');
    const badgeEl = $('bgm-mode-badge');
    if (titleEl) titleEl.textContent = info.name || 'Pueblo Paleta';
    if (gameEl) gameEl.textContent = info.game || 'PokéSurvivor';
    if (badgeEl) {
      const mode = G.Audio ? G.Audio.bgmMode : 'random';
      badgeEl.textContent = mode === 'random' ? '🔀' : '🔁';
      badgeEl.title = mode === 'random' ? 'Modo: Rotación aleatoria' : 'Modo: Tema fijado';
    }
  }

  function initBgmWidget() {
    const el = $('menu-bgm');
    if (!el) return;

    if (G.Audio && G.Audio.onTrackChange) {
      G.Audio.onTrackChange(updateBgmWidget);
    }

    const nextBtn = $('bgm-next');
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        if (G.Audio && G.Audio.nextTrack) {
          const info = G.Audio.nextTrack();
          G.Audio.sfx('select');
          updateBgmWidget(info);
        }
      };
    }

    const prevBtn = $('bgm-prev');
    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        if (G.Audio && G.Audio.prevTrack) {
          const info = G.Audio.prevTrack();
          G.Audio.sfx('select');
          updateBgmWidget(info);
        }
      };
    }

    const modeBtn = $('bgm-mode-btn');
    if (modeBtn) {
      modeBtn.onclick = (e) => {
        e.stopPropagation();
        if (!G.Audio) return;
        const curMode = G.Audio.bgmMode;
        if (curMode === 'random') {
          const curId = (G.Audio.track || G.Audio.settings.currentTrack || 'pallet');
          G.Audio.setBgmMode(curId);
          G.Audio.sfx('confirm');
          G.UI.toast(`🔁 Tema fijado: ${G.Audio.currentTrackInfo.name}`);
        } else {
          G.Audio.setBgmMode('random');
          G.Audio.sfx('confirm');
          G.UI.toast(`🔀 Rotación aleatoria activada`);
        }
        updateBgmWidget();
      };
    }

    el.onclick = () => {
      if (G.SettingsUI) G.SettingsUI.open('sound');
    };
  }

  // ---------------- menú principal ----------------

  function open() {
    updateBgmWidget();
    const s = G.DB.save;
    const mon = G.DEX_BY[s.partner];
    const allMegas = (G.Megas && G.Megas.getAllForDex(mon.dex)) || [];
    const ownedMegas = allMegas.filter(m => G.DB.ownsMega(m.id));
    let megaDef = ownedMegas.find(m => m.id === s.partnerMegaId) || ownedMegas[0] || null;
    const isMega = !!s.partnerMega && !!megaDef;
    const shiny = !!s.partnerShiny && G.DB.ownsShiny(mon.dex);

    G.UI.chrome(true);
    G.UI.show('scr-menu');
    if (G.MenuParade) G.MenuParade.start();      // desfile retro de fondo (ui/menu-parade.js)

    const spriteScale = 4;
    G.UI.sprite($('menu-partner'), mon.dex, { lively: true, scale: spriteScale, hero: true, shiny, mega: isMega ? megaDef : null });
    $('menu-partner').style.setProperty('--stage-c', isMega ? (megaDef.auraColor || '#00e5ff') : (shiny ? '#9ae6ff' : G.U.TYPE_COLOR[mon.types[0]]));
    $('menu-partner').classList.toggle('shiny', shiny || isMega);

    const face = G.UI.portrait(mon.dex, 'Happy', 40, 'name-face');
    if (isMega) {
      $('menu-partner-name').innerHTML = face + `🧬 ${megaDef.name}` + (shiny ? ' ' + G.Icons.html('shiny', 24) : '');
      $('menu-partner-info').innerHTML = G.UI.typeChips(megaDef.types || mon.types) + ' ' + G.UI.stars(6, 12) +
        ` <span class="tag" style="background:linear-gradient(90deg,#00e5ff,#9333ea);color:#fff;font-weight:bold;padding:1px 6px;border-radius:4px;font-size:11px">MEGA</span>` +
        `<div style="font-size:11px;color:#a5f3fc;margin-top:6px;max-width:320px;line-height:1.2"><b>${megaDef.passive}</b>: ${megaDef.passiveDesc}</div>`;
    } else {
      $('menu-partner-name').innerHTML = face + mon.name + (shiny ? ' ' + G.Icons.html('shiny', 24) : '');
      $('menu-partner-info').innerHTML = G.UI.typeChips(mon.types) + ' ' + G.UI.stars(mon.rarity);
    }

    // Normal / shiny / mega selector
    const seg = $('menu-shiny');
    const hasShiny = G.DB.ownsShiny(mon.dex);
    seg.classList.toggle('hidden', !hasShiny && !ownedMegas.length);

    const btnNormal = seg.querySelector('[data-v="0"]');
    const btnShiny = seg.querySelector('[data-v="1"]');
    const btnMega = seg.querySelector('[data-v="mega"]');

    if (btnShiny) {
      btnShiny.classList.toggle('hidden', !hasShiny);
      btnShiny.innerHTML = G.Icons.html('shiny', 12) + ' Shiny';
    }
    if (btnMega) {
      btnMega.classList.toggle('hidden', !ownedMegas.length);
      const multi = ownedMegas.length > 1 ? ` (${ownedMegas.indexOf(megaDef) + 1}/${ownedMegas.length})` : '';
      btnMega.innerHTML = megaDef ? ('🧬 Mega' + multi) : '🧬 Mega';
    }

    if (btnNormal) {
      btnNormal.classList.toggle('on', !isMega && !s.partnerShiny);
      btnNormal.onclick = () => {
        if (!isMega && !s.partnerShiny) return;
        s.partnerMega = false;
        s.partnerShiny = false;
        G.DB.commit();
        G.Audio.sfx('confirm');
        open();
      };
    }
    if (btnShiny) {
      btnShiny.classList.toggle('on', !isMega && !!s.partnerShiny);
      btnShiny.onclick = () => {
        if (!isMega && !!s.partnerShiny) return;
        s.partnerMega = false;
        s.partnerShiny = true;
        G.DB.commit();
        G.Audio.sfx('confirm');
        open();
      };
    }
    if (btnMega) {
      btnMega.classList.toggle('on', isMega);
      btnMega.onclick = () => {
        if (!isMega) {
          s.partnerMega = true;
          s.partnerMegaId = (megaDef && megaDef.id) || ownedMegas[0].id;
        } else if (ownedMegas.length > 1) {
          const curIdx = Math.max(0, ownedMegas.findIndex(m => m.id === s.partnerMegaId));
          const next = ownedMegas[(curIdx + 1) % ownedMegas.length];
          s.partnerMegaId = next.id;
        }
        G.DB.commit();
        G.Audio.sfx('confirm');
        open();
      };
    }

    const owned = Object.keys(s.owned).filter(d => G.DEX_BY[d]).length;
    const shinies = Object.keys(s.shiny || {}).length;
    $('menu-dex-count').textContent = `${owned} / ${G.DEX.length}` + (shinies ? ` · ${shinies} shiny` : '');

    const st = s.stats;
    $('menu-stats').innerHTML =
      `Runs <b style="color:#fff">${st.runs}</b> · Mejor tiempo <b style="color:#fff">${G.U.mmss(st.bestTime)}</b><br>` +
      `Mejor nivel <b style="color:#fff">${st.bestLevel}</b> · Derrotados <b style="color:#fff">${st.totalKills.toLocaleString('es')}</b>` +
      (G.DB.guest ? '<br><span style="color:#ffb0b8">Modo invitado: no se guarda</span>' : '');

    socialLine();
    // Premios de misiones por recoger.
    G.Progress.checkAch();
    const pend = G.Progress.pending();
    $('menu-goals-sub').textContent = pend ? pend + (pend === 1 ? ' premio por recoger' : ' premios por recoger') : 'Misiones, logros, récords y perfil';
    $('menu-goals-sub').classList.toggle('gold', pend > 0);
  }

  /** Texto bajo "Amigos" y "Jugar": quién está en línea, solicitudes, sala. */
  function socialLine() {
    const room = G.Social.room;
    const play = document.querySelector('#scr-menu [data-go=play] small');
    if (play) play.textContent = room ? 'Volver a tu sala (' + room.members.length + '/' + G.Social.MAX_PLAYERS + ')' : 'Entra en la mazmorra';
    const fr = G.Social.friends;
    const on = fr.filter(f => f.status === 'ok' && f.online).length;
    const req = fr.filter(f => f.status === 'in').length;
    const parts = [];
    if (on) parts.push(on + ' en línea');
    if (req) parts.push(req + (req === 1 ? ' solicitud' : ' solicitudes'));
    $('menu-friends-sub').textContent = parts.length ? parts.join(' · ') : 'Juega en grupo, hasta 4';
    $('menu-friends-sub').classList.toggle('gold', req > 0);
  }

  // ---------------- colección ----------------

  function openDex() {
    G.UI.show('scr-dex', true);
    const s = G.DB.save;
    if (dexSel == null) { dexSel = s.partner; dexGen = G.DEX_BY[s.partner].gen; }
    const owned = Object.keys(s.owned).filter(d => G.DEX_BY[d]).length;
    $('dex-total').textContent = `${owned} / ${G.DEX.length}`;

    // Pestañas de generación, con cuántos tienes de cada una.
    const tabs = $('dex-gens');
    tabs.innerHTML = '';
    GEN_NAMES.forEach((name, i) => {
      const g = i + 1;
      const total = G.DEX.filter(p => p.gen === g).length;
      const have = G.DEX.filter(p => p.gen === g && s.owned[p.dex]).length;
      const b = document.createElement('button');
      b.className = 'gen-tab' + (g === dexGen ? ' on' : '');
      b.innerHTML = `<b>${name}</b><small>${have}/${total}</small>`;
      b.onclick = () => { dexGen = g; openDex(); };
      tabs.appendChild(b);
    });

    const F = [['all', 'Todos'], ['own', 'Tengo'], ['miss', 'Me faltan'], ['shiny', 'Shiny'],
               ['5', 5], ['4', 4], ['3', 3], ['2', 2], ['1', 1]];
    const fb = $('dex-filters');
    fb.innerHTML = '';
    for (const [k, label] of F) {
      const c = document.createElement('button');
      c.className = 'chip' + (k === dexFilter ? ' on' : '');
      c.innerHTML = k === 'shiny' ? G.Icons.html('shiny', 12) + ' Shiny'
                  : typeof label === 'number' ? G.Icons.rarity(label, 12) + ' ' + G.Gacha.RARITY_NAME[label] : label;
      c.onclick = () => { dexFilter = k; openDex(); };
      fb.appendChild(c);
    }
    renderGrid();
    showDetail(dexSel);
  }

  function renderGrid() {
    const s = G.DB.save;
    const grid = $('dex-grid');
    grid.innerHTML = '';
    for (const p of G.DEX) {
      if (p.gen !== dexGen) continue;
      const own = !!s.owned[p.dex], sh = !!(s.shiny && s.shiny[p.dex]);
      if (dexFilter === 'own' && !own) continue;
      if (dexFilter === 'miss' && own) continue;
      if (dexFilter === 'shiny' && !sh) continue;
      if (/^\d$/.test(dexFilter) && p.rarity !== +dexFilter) continue;

      const isPartner = p.dex === s.partner;
      const allM = (G.Megas && G.Megas.getAllForDex(p.dex)) || [];
      const ownedM = allM.filter(m => G.DB.ownsMega(m.id));
      const hasMega = ownedM.length > 0;
      const activeMega = (isPartner && s.partnerMega && ownedM.length)
        ? (ownedM.find(m => m.id === s.partnerMegaId) || ownedM[0] || null)
        : null;
      const useShiny = sh && isPartner && s.partnerShiny;

      const cell = document.createElement('div');
      cell.className = 'cell' + (own ? '' : ' locked') + (p.dex === dexSel ? ' on' : '');
      cell.insertAdjacentHTML('beforeend', `<span class="no">${String(p.dex).padStart(3, '0')}</span>`);
      if (isPartner) cell.insertAdjacentHTML('beforeend', `<span class="badge-r" title="Compañero">${G.Icons.html('crown', 14)}</span>`);
      else if (hasMega) cell.insertAdjacentHTML('beforeend', `<span class="badge-r" title="Tienes su Mega" style="font-size:12px">🧬</span>`);
      else if (sh) cell.insertAdjacentHTML('beforeend', `<span class="badge-r" title="Tienes su shiny">${G.Icons.html('shiny', 12)}</span>`);
      cell.appendChild(G.UI.spriteCanvas(p.dex, 92, 80, { scale: 2, silhouette: !own, shadow: own, shiny: useShiny, mega: activeMega }));
      cell.insertAdjacentHTML('beforeend', `<b>${own ? p.name : '???'}</b>${G.UI.stars(p.rarity, 9)}`);
      cell.onclick = () => {
        dexSel = p.dex;
        grid.querySelectorAll('.cell').forEach(c => c.classList.remove('on'));
        cell.classList.add('on');
        showDetail(p.dex);
      };
      grid.appendChild(cell);
    }
    if (!grid.children.length) grid.innerHTML = '<p class="sub" style="grid-column:1/-1">Ninguno con este filtro.</p>';
  }

  // ---------------- textos de la Pokédex ----------------
  // js/data/dex-text.json (tools/fetch_dex_text.py): categoría, descripción, altura y
  // peso. Se carga la primera vez que se abre una ficha (no hace falta para jugar).
  let dexText = null, dexTextP = null;
  function loadDexText() {
    if (dexTextP) return dexTextP;
    dexTextP = fetch('js/data/dex-text.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}))
      .then(j => { dexText = j || {}; if (G.UI.isOpen('scr-dex') && dexSel != null) showDetail(dexSel); });
    return dexTextP;
  }

  /** Dónde se consigue o aparece cada Pokémon (según cómo funciona el juego de verdad). */
  function whereText(p) {
    const out = [];
    const mm = t => G.U.mmss(t);
    if (p.leg) out.push('Legendario: lucha contra él en las grietas.');
    else {
      const tiers = G.Enemies.TIERS.filter(t => p.rarity < 5 && p.bst >= t.bst[0] && p.bst <= t.bst[1]);
      if (tiers.length) out.push(`Puede salir como salvaje desde el minuto ${mm(tiers[0].from)} (cada partida trae Pokémon distintos).`);
      const boss = G.Enemies.BOSS_SLOTS.find(s => p.bst >= s.bst[0] && p.bst <= s.bst[1]);
      if (boss) out.push(`Puede salir como jefe (minuto ${mm(boss.at)}).`);
    }
    const users = [];
    for (const r of (G.GymData ? G.GymData.REGIONS : [])) {
      for (const [who, , ace, team] of r.gyms) if (ace === p.dex || team.includes(p.dex)) users.push(`${who} (${r.name})`);
      for (const [who, , ace] of r.elite) if (ace === p.dex) users.push(`${who}, Alto Mando de ${r.name}`);
      if (r.champion[2] === p.dex) users.push(`${r.champion[0]}, Campeón de ${r.name}`);
    }
    if (users.length) out.push('Lo usa en el Desafío de Gimnasios: ' + users.join(' · ') + '.');
    out.push(`En el banner del gacha de ${GEN_NAMES[p.gen - 1]}.`);
    return out;
  }

  // Variante que se está viendo en la ficha (normal, shiny o mega).
  let viewShiny = false;
  let viewMega = false;
  let viewMegaId = null;

  function showDetail(dex) {
    const s = G.DB.save;
    const p = G.DEX_BY[dex];
    const own = !!s.owned[dex];
    const hasSh = G.DB.ownsShiny(dex);
    const isPartner = dex === s.partner;

    const allMegas = (G.Megas && G.Megas.getAllForDex(dex)) || [];
    const ownedMegas = allMegas.filter(m => G.DB.ownsMega(m.id));

    if (dex !== showDetail.last) {
      if (isPartner) {
        viewMega = !!s.partnerMega && ownedMegas.length > 0;
        viewMegaId = s.partnerMegaId || (ownedMegas[0] && ownedMegas[0].id) || null;
        viewShiny = hasSh && !!s.partnerShiny;
      } else {
        viewMega = false;
        viewMegaId = (ownedMegas[0] && ownedMegas[0].id) || null;
        viewShiny = false;
      }
      showDetail.last = dex;
    }

    if (!hasSh && !viewMega) viewShiny = false;
    if (!ownedMegas.length) viewMega = false;
    if (viewMega && (!viewMegaId || !ownedMegas.some(m => m.id === viewMegaId))) {
      viewMegaId = ownedMegas[0] ? ownedMegas[0].id : null;
    }

    const currentMega = ownedMegas.find(m => m.id === viewMegaId) || ownedMegas[0] || null;
    const isMega = viewMega && !!currentMega;
    const megaDef = isMega ? currentMega : null;
    const useShiny = own && hasSh && viewShiny;

    const max = { hp: 183, atk: 1.55, spd: 137 };
    // Con Mega: sus multiplicadores de verdad (los mismos que usa Player en la partida).
    const sm = (isMega && megaDef.statMult) || {};
    const hpV = Math.round(p.hp * (sm.hp || 1)), atkV = +(p.atk * (sm.atk || 1)).toFixed(2), spdV = Math.round(p.spd * (sm.spd || 1));
    if (!dexText) loadDexText();
    const tx = dexText && dexText[dex];
    const en = G.I18n.lang === 'en';
    // (Los Pokémon más nuevos no tienen texto en español en PokeAPI: se enseña el inglés.)
    const desc = tx ? (en ? tx.de : tx.d || tx.de) : '', onlyEn = !!tx && !en && !tx.d && !!tx.de;
    const info = tx ? `<div class="dex-info" translate="no">
        <div class="dex-meta">${esc((en ? tx.ge : tx.g || tx.ge) || '')}${tx.h ? ` · ${(tx.h / 10).toLocaleString(en ? 'en' : 'es')} m · ${(tx.w / 10).toLocaleString(en ? 'en' : 'es')} kg` : ''}</div>
        ${own && desc ? `<p class="dex-desc">${esc(desc)}${onlyEn ? ' <small>(texto sólo en inglés)</small>' : ''}</p>` : ''}</div>` : '';
    const where = `<div class="dex-where"><b>Dónde aparece</b><ul>${whereText(p).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
    const bar = (label, v, m, txt) =>
      `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${Math.min(100, v / m * 100)}%"></i></div><span>${txt}</span></div>`;

    const usingThis = isPartner && (
      isMega ? (!!s.partnerMega && s.partnerMegaId === megaDef.id && (hasSh ? (!!s.partnerShiny === useShiny) : true))
             : (!s.partnerMega && (hasSh ? (!!s.partnerShiny === useShiny) : true))
    );

    const hasVariants = hasSh || allMegas.length > 0;

    const box = $('dex-detail');
    box.innerHTML = `
      <canvas id="dex-big" class="stage" width="220" height="190"></canvas>
      ${(own && hasVariants) ? `
        <div class="seg" style="margin:6px 0 10px;justify-content:center">
          <button class="${(!isMega && !useShiny) ? 'on' : ''}" data-v="0">Normal</button>
          ${hasSh ? `<button class="${(!isMega && useShiny) ? 'on' : ''}" data-v="1">${G.Icons.html('shiny', 12)} Shiny</button>` : ''}
          ${ownedMegas.length > 0 ? (() => {
            const multi = ownedMegas.length > 1 ? ` (${ownedMegas.indexOf(currentMega) + 1}/${ownedMegas.length})` : '';
            return `<button class="${isMega ? 'on' : ''}" data-v="mega">🧬 Mega${multi}</button>`;
          })() : (allMegas.length > 0 ? `<button class="locked" data-v="locked" title="Desbloquea su Megapiedra en el Gacha de Megas" style="opacity:0.45">🔒 Mega</button>` : '')}
        </div>` : ''}
      <div class="center">
        <div style="color:var(--muted);font-size:13px">Nº ${String(p.dex).padStart(3, '0')} · ${GEN_NAMES[p.gen - 1]}</div>
        <h3>${own ? G.UI.portrait(dex, 'Normal', 40, 'name-face') + (isMega ? `🧬 ${megaDef.name}` : p.name) + (useShiny ? ' ' + G.Icons.html('shiny', 20) : '') : '???'}</h3>
        <div style="color:${isMega ? '#00e5ff' : G.Gacha.RARITY_COLOR[p.rarity]}">
          ${isMega
            ? `${G.UI.stars(6, 18)} <span class="tag" style="background:linear-gradient(90deg,#00e5ff,#9333ea);color:#fff;font-weight:bold;padding:1px 6px;border-radius:4px;font-size:11px">FORMA MEGA</span>`
            : `${G.UI.stars(p.rarity, 24)} ${G.Gacha.RARITY_NAME[p.rarity]}`}
        </div>
        <div style="margin:6px 0">${own ? G.UI.typeChips(isMega ? (megaDef.types || p.types) : p.types) : ''}</div>
        ${info}
      </div>
      ${own ? `
        ${isMega ? `
          <div class="panel" style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.25);border-radius:8px;padding:8px 10px;margin:8px 0;text-align:left">
            <div style="color:#00e5ff;font-weight:bold;font-size:13px">🧬 Habilidad Mega: ${megaDef.passive}</div>
            <div style="color:#a5f3fc;font-size:12px;margin-top:3px;line-height:1.3">${megaDef.passiveDesc}</div>
          </div>
        ` : ''}
        ${bar('Vida', hpV, max.hp, hpV)}
        ${bar('Ataque', atkV, max.atk, '×' + atkV.toFixed(2))}
        ${bar('Velocidad', spdV, max.spd, spdV)}
        <p style="font-size:14px;margin:10px 0 4px">Empieza con <b class="gold">${G.Moves.BY_ID[G.startMoveOf(dex)].name}</b></p>
        <p class="move-icons" title="Movimientos que puede aprender">
          ${G.Moves.poolFor(p).map(id => `<span title="${G.Moves.BY_ID[id].name}">${G.Icons.html('move:' + id, 16)}</span>`).join('')}</p>
        ${usingThis
          ? '<button class="btn grow" disabled style="width:100%">Es tu compañero</button>'
          : `<button id="dex-pick" class="btn gold" data-sfx="confirm" style="width:100%">${isPartner ? `Activar ${isMega ? megaDef.name : (useShiny ? p.name + ' shiny' : 'forma normal')}` : `Elegir de compañero${isMega ? ` (${megaDef.name})` : (useShiny ? ' (shiny)' : '')}`}</button>`}
        ${where}
      ` : `<p class="center" style="color:var(--muted)">Aún no lo tienes.<br>Consíguelo en el banner de <b class="gold">${GEN_NAMES[p.gen - 1]}</b>
            o derrotándolo cuando salga shiny.</p>${where}`}
    `;

    $('dex-big').style.setProperty('--stage-c', !own ? '#5b83d6' : isMega ? (megaDef.auraColor || '#00e5ff') : useShiny ? '#9ae6ff' : G.U.TYPE_COLOR[p.types[0]]);
    $('dex-big').classList.toggle('shiny', own && (useShiny || isMega));
    G.UI.sprite($('dex-big'), dex, { lively: own, spin: own, silhouette: !own, scale: 3, hero: true, shiny: useShiny, mega: isMega ? megaDef : null });

    box.querySelectorAll('.seg button').forEach(b => {
      b.onclick = () => {
        const v = b.dataset.v;
        if (v === 'locked') {
          G.Audio.sfx('hit');
          G.UI.toast(`¡Consigue la Megapiedra de ${p.name} en el Gacha de Megas!`);
          return;
        }
        if (v === '0') {
          viewMega = false;
          viewShiny = false;
        } else if (v === '1') {
          viewMega = false;
          viewShiny = true;
        } else if (v === 'mega') {
          if (!viewMega) {
            viewMega = true;
          } else if (ownedMegas.length > 1) {
            const curIdx = Math.max(0, ownedMegas.findIndex(m => m.id === currentMega.id));
            const next = ownedMegas[(curIdx + 1) % ownedMegas.length];
            viewMegaId = next.id;
          } else if (hasSh) {
            viewShiny = !viewShiny;
          }
        }
        G.Audio.sfx('select');
        showDetail(dex);
      };
    });

    const pick = $('dex-pick');
    if (pick) pick.onclick = () => {
      s.partner = dex;
      s.partnerShiny = hasSh && useShiny;
      if (isMega) {
        s.partnerMega = true;
        s.partnerMegaId = megaDef.id;
      } else {
        s.partnerMega = false;
      }
      G.DB.commit();
      const formName = isMega ? megaDef.name : p.name;
      G.UI.toast(formName + (s.partnerShiny ? ' shiny' : '') + ' es ahora tu compañero');
      renderGrid();
      showDetail(dex);
    };
  }

  // ---------------- mejoras ----------------

  let upgDex = null;

  function openUpgrades() {
    G.UI.show('scr-upgrades', true);
    const s = G.DB.save;
    if (!upgDex || !s.owned[upgDex]) upgDex = s.partner;
    // Selector con tus Pokémon: el compañero primero, luego los que ya tienen mejoras.
    const sel = $('upg-mon');
    const lv = d => Object.values(s.pupg[d] || {}).reduce((a, b) => a + b, 0);
    const mons = Object.keys(s.owned).map(Number).filter(d => G.DEX_BY[d])
      .sort((a, b) => (b === s.partner) - (a === s.partner) || lv(b) - lv(a) || a - b);
    sel.innerHTML = mons.map(d => {
      const isPartner = d === s.partner;
      const allM = (G.Megas && G.Megas.getAllForDex(d)) || [];
      const ownedM = allM.filter(m => G.DB.ownsMega(m.id));
      const activeMega = (isPartner && s.partnerMega && ownedM.length)
        ? (ownedM.find(m => m.id === s.partnerMegaId) || ownedM[0] || null)
        : null;
      const name = activeMega ? `🧬 ${activeMega.name}` : G.DEX_BY[d].name;
      return `<option value="${d}">${name}${isPartner ? ' (compañero)' : ''}${lv(d) ? ' · ' + lv(d) + ' niveles' : ''}</option>`;
    }).join('');
    sel.value = upgDex;
    sel.onchange = () => { upgDex = +sel.value; G.Audio.sfx('select'); renderUpgrades(); };
    renderUpgrades();
  }

  function renderUpgrades() {
    const s = G.DB.save;
    const levels = G.DB.upgradesOf(upgDex);
    const mon = G.DEX_BY[upgDex];
    const isPartner = upgDex === s.partner;
    const allMegas = (G.Megas && G.Megas.getAllForDex(upgDex)) || [];
    const ownedMegas = allMegas.filter(m => G.DB.ownsMega(m.id));
    const megaDef = (isPartner && s.partnerMega && ownedMegas.length)
      ? (ownedMegas.find(m => m.id === s.partnerMegaId) || ownedMegas[0] || null)
      : null;
    const isMega = !!megaDef;
    const shiny = isPartner && !!s.partnerShiny && G.DB.ownsShiny(upgDex);

    G.UI.sprite($('upg-stage'), upgDex, { lively: true, scale: 2, hero: true, shiny, mega: isMega ? megaDef : null });
    $('upg-stage').style.setProperty('--stage-c', isMega ? (megaDef.auraColor || '#00e5ff') : (shiny ? '#9ae6ff' : G.U.TYPE_COLOR[mon.types[0]]));
    $('upg-stage').classList.toggle('shiny', shiny || isMega);

    const box = $('upg-list');
    box.innerHTML = '';
    for (const u of G.Upgrades.LIST) {
      const lvl = levels[u.id] || 0;
      const maxed = lvl >= u.max;
      const cost = maxed ? 0 : G.Upgrades.cost(u.id, lvl);
      const el = document.createElement('div');
      el.className = 'panel upg-item';
      el.innerHTML = `
        <div class="ic">${G.Icons.html(u.icon, 32)}</div>
        <div>
          <b>${u.name}</b> <span style="color:var(--muted);font-size:13px">${u.unit}</span>
          <div class="pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>
        </div>
        <div class="upg-btns">
          ${u.id === 'ban' && lvl > 0 ? `<button class="btn small" data-ban>Elegir (${banList().length}/${lvl})</button>` : ''}
          <button class="btn small ${maxed ? '' : 'gold'}" data-buy data-sfx="none" ${maxed || s.coins < cost ? 'disabled' : ''}>
          ${maxed ? 'Máx.' : `<span class="coin"></span> ${cost}`}</button></div>`;
      if (u.id === 'ban' && lvl > 0) el.querySelector('[data-ban]').onclick = () => { banOpen = !banOpen; renderUpgrades(); };
      el.querySelector('[data-buy]').onclick = () => {
        // Se vuelve a leer todo al pulsar (la partida puede haber cambiado desde que se dibujó).
        const sv = G.DB.save, lv = G.DB.upgradesOf(upgDex), now = lv[u.id] || 0;
        if (now >= u.max) { renderUpgrades(); return; }
        const price = G.Upgrades.cost(u.id, now);
        if (sv.coins < price) { renderUpgrades(); return; }
        sv.coins -= price;
        lv[u.id] = now + 1;
        G.DB.commit(true);
        G.Audio.sfx('buy');
        G.UI.refreshCoins();
        const displayName = (isMega && megaDef) ? megaDef.name : mon.name;
        G.UI.toast(`${displayName} · ${u.name}: nivel ${now + 1}`);
        renderUpgrades();
      };
      box.appendChild(el);
      if (u.id === 'ban' && lvl > 0 && banOpen) box.appendChild(banPicker(lvl));
    }
    box.appendChild(bindPanel());
  }

  // ---------------- atajos: hueco fijo para cada movimiento ----------------
  // save.pbind[dex] = [movimiento del hueco 1, del 2, del 3, del 4] (o null).
  function bindPanel() {
    const s = G.DB.save;
    s.pbind = s.pbind || {};
    const list = s.pbind[upgDex] || [null, null, null, null];
    const mon = G.DEX_BY[upgDex];
    const ids = G.Moves.poolFor(mon).concat([G.startMoveOf(upgDex)]).filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => G.Moves.BY_ID[a].name.localeCompare(G.Moves.BY_ID[b].name, 'es'));
    const el = document.createElement('div');
    el.className = 'panel bind-panel';
    el.innerHTML = `<b>Atajos de movimientos</b>
      <p class="sub" style="margin:2px 0 8px">Elige qué movimiento va siempre en cada hueco (teclas 1-4 o los iconos de abajo), para la memoria muscular. Si aún no tienes tantos movimientos, va al hueco más cercano.</p>
      <div class="bind-slots">${[0, 1, 2, 3].map(i => `<label class="bind-slot"><span>${i + 1}</span>
        <select class="field" data-slot="${i}"><option value="">Libre</option>${ids.map(id =>
          `<option value="${id}" ${list[i] === id ? 'selected' : ''}>${G.Moves.BY_ID[id].name}</option>`).join('')}</select></label>`).join('')}</div>`;
    el.querySelectorAll('select[data-slot]').forEach(sel => {
      sel.onchange = () => {
        const l = (s.pbind[upgDex] || [null, null, null, null]).slice(0, 4);
        while (l.length < 4) l.push(null);
        const i = +sel.dataset.slot, id = sel.value || null;
        // Un movimiento sólo puede estar en un hueco.
        for (let j = 0; j < 4; j++) if (id && l[j] === id) l[j] = null;
        l[i] = id;
        s.pbind[upgDex] = l;
        G.DB.commit();
        G.Audio.sfx('select');
        renderUpgrades();
      };
    });
    return el;
  }

  // ---------------- veto: movimientos bloqueados ----------------
  // Lista por Pokémon en save.pban[dex]; con N niveles de Veto, N movimientos.
  let banOpen = false;
  function banList() {
    const s = G.DB.save;
    s.pban = s.pban || {};
    return s.pban[upgDex] || (s.pban[upgDex] = []);
  }
  function banPicker(max) {
    const mon = G.DEX_BY[upgDex];
    const start = G.startMoveOf(upgDex);
    const ids = G.Moves.poolFor(mon).filter(id => id !== start)
      .sort((a, b) => G.Moves.BY_ID[a].name.localeCompare(G.Moves.BY_ID[b].name, 'es'));
    const list = banList();
    const el = document.createElement('div');
    el.className = 'panel ban-picker';
    el.innerHTML = `<p class="sub" style="margin:0 0 8px">Toca los movimientos que no quieres que te salgan en las cartas (${list.length}/${max}). El movimiento de inicio no se puede vetar.</p>
      <div class="ban-moves">${ids.map(id => { const d = G.Moves.BY_ID[id]; const on = list.includes(id);
        return `<button class="chip ${on ? 'on ban' : ''}" data-id="${id}">${G.Icons.html('move:' + id, 16)} ${d.name}${on ? ' ' + G.Icons.html('ban', 14) : ''}</button>`; }).join('')}</div>`;
    el.querySelectorAll('[data-id]').forEach(b => {
      b.onclick = () => {
        const l = banList(), id = b.dataset.id, i = l.indexOf(id);
        if (i >= 0) l.splice(i, 1);
        else if (l.length >= max) { G.UI.toast('Ya tienes ' + max + ' vetados: quita uno primero'); return; }
        else l.push(id);
        G.DB.commit();
        G.Audio.sfx('select');
        renderUpgrades();
      };
    });
    return el;
  }

  return { init, open, GEN_NAMES };
})();
