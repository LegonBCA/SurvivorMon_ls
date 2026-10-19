/* ============ goals-ui.js — misiones, logros y perfil ============
 * Una pantalla con tres pestañas:
 *   Misiones  3 diarias + 2 semanales, con barra, premio y botón de recoger
 *   Logros    medallas por categoría; los legendarios, uno a uno con su sprite
 *   Perfil    tus 3 favoritos y tu título; vista previa del perfil público
 * y la ventana del perfil público de cualquier jugador (G.ProfileUI.show).
 */
(() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = t => (t >= 3600 ? Math.floor(t / 3600) + ':' + G.U.mmss(t % 3600).padStart(5, '0') : G.U.mmss(t));

  // ======================= PANTALLA =======================

  G.GoalsUI = (() => {
    let tab = 'missions', cat = 'coleccion';

    function init() {
      document.querySelectorAll('#goals-tabs .tab').forEach(t => {
        t.onclick = () => { tab = t.dataset.tab; render(); };
      });
    }

    function open(t) {
      if (t) tab = t;
      G.UI.show('scr-goals', true);
      G.Progress.ensure(G.DB.save);
      G.Progress.checkAch();
      render();
    }

    function render() {
      document.querySelectorAll('#goals-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tab));
      const box = $('goals-body');
      box.innerHTML = '';
      if (tab === 'missions') missions(box);
      else if (tab === 'ach') achievements(box);
      else if (tab === 'records') records(box);
      else profile(box);
    }

    // ---------------- récords ----------------

    const hours = t => t >= 3600 ? Math.floor(t / 3600) + ' h ' + Math.floor(t % 3600 / 60) + ' min' : Math.floor(t / 60) + ' min';

    function records(box) {
      const s = G.DB.save, S = s.stats, R = s.records || {};
      const RM = R.map || {}, RP = R.mon || {};
      const num = v => (v || 0).toLocaleString('es');
      box.insertAdjacentHTML('beforeend', `<h3>Tu entrenador</h3>
        <div class="prof-marks rec-marks">
          <div><span>Tiempo jugado</span><b>${hours(S.playTime || 0)}</b></div>
          <div><span>Partidas</span><b>${num(S.runs)}</b></div>
          <div><span>Mejor tiempo</span><b>${fmt(S.bestTime || 0)}</b></div>
          <div><span>Nivel máximo</span><b>${S.bestLevel || 0}</b></div>
          <div><span>Derrotados</span><b>${num(S.totalKills)}</b></div>
          <div><span>Jefes</span><b>${num(S.bossesTotal)}</b></div>
          <div><span>Legendarios</span><b>${Object.keys(s.legends || {}).length}</b></div>
          <div><span>Shinies</span><b>${Object.keys(s.shiny || {}).length}</b></div>
          <div><span>Tiradas</span><b>${num(S.pulls)}</b></div>
          <div><span>Monedas ganadas</span><b>${num(S.coinsEarned)}</b></div>
          <div><span>Ante Arceus</span><b>${S.judgeTime ? fmt(S.judgeTime) + ' · ' + (S.judgeBosses || 0) + ' leg.' : '—'}</b></div>
          <div><span>Grietas ganadas</span><b>${num(S.riftWins)}</b></div>
        </div>`);

      // Por mapa
      box.insertAdjacentHTML('beforeend', '<h3>Por mapa</h3>');
      const ml = document.createElement('div');
      ml.className = 'rec-list';
      for (const m of (G.Maps ? G.Maps.LIST : [])) {
        const r = RM[m.id];
        const row = document.createElement('div');
        row.className = 'rec-row' + (r ? '' : ' empty');
        row.innerHTML = `<span class="rec-ico">${m.icon}</span>
          <div class="grow"><b>${esc(m.name)}</b><small>${r ? `${num(r.runs)} ${r.runs === 1 ? 'partida' : 'partidas'}` : 'Sin jugar todavía'}</small></div>
          ${r ? `<div class="rec-best"><b>${fmt(r.t)}</b><small>Nv. ${r.lv} · ${num(r.k)} derrotados</small></div>` : ''}`;
        if (r && G.DEX_BY[r.dex]) row.prepend(G.UI.spriteCanvas(r.dex, 48, 40, { scale: 1 }));
        ml.appendChild(row);
      }
      box.appendChild(ml);

      // Por rango de dificultad
      const RR = R.rank || {}, open = G.Ranks.unlocked();
      box.insertAdjacentHTML('beforeend', `<h3>Por rango</h3><p class="sub">Rango más alto desbloqueado: <b style="color:${G.Ranks.get(open).color}">${G.Ranks.get(open).name}</b></p>`);
      const rl = document.createElement('div');
      rl.className = 'rec-list';
      for (const rk of G.Ranks.LIST.filter(r => r.id <= open)) {
        const r = RR[rk.id];
        const row = document.createElement('div');
        row.className = 'rec-row' + (r ? '' : ' empty');
        row.innerHTML = `<span class="rec-pos" style="color:${rk.color}">★</span>
          <div class="grow"><b style="color:${rk.color}">${rk.name}</b><small>${r ? `${num(r.runs)} ${r.runs === 1 ? 'partida' : 'partidas'}` : 'Sin jugar todavía'}</small></div>
          ${r ? `<div class="rec-best"><b>${fmt(r.t)}</b><small>Nv. ${r.lv} · ${num(r.k)} derrotados</small></div>` : ''}`;
        rl.appendChild(row);
      }
      box.appendChild(rl);

      // Por Pokémon
      const mons = Object.keys(RP).map(Number).filter(d => G.DEX_BY[d]);
      const fav = mons.slice().sort((a, b) => (RP[b].runs || 0) - (RP[a].runs || 0))[0];
      box.insertAdjacentHTML('beforeend', `<h3>Tus mejores Pokémon</h3>
        ${fav ? `<p class="sub">El que más usas: <b>${esc(G.DEX_BY[fav].name)}</b> (${num(RP[fav].runs)} ${RP[fav].runs === 1 ? 'partida' : 'partidas'}).</p>` : ''}`);
      const pl = document.createElement('div');
      pl.className = 'rec-list';
      const top = mons.sort((a, b) => RP[b].t - RP[a].t || (RP[b].k || 0) - (RP[a].k || 0)).slice(0, 10);
      top.forEach((d, i) => {
        const r = RP[d];
        const row = document.createElement('div');
        row.className = 'rec-row';
        row.innerHTML = `<span class="rec-pos">${i + 1}</span>
          <div class="grow"><b>${esc(G.DEX_BY[d].name)}</b><small>${num(r.runs)} ${r.runs === 1 ? 'partida' : 'partidas'}</small></div>
          <div class="rec-best"><b>${fmt(r.t)}</b><small>Nv. ${r.lv} · ${num(r.k)} derrotados</small></div>`;
        row.children[0].after(G.UI.spriteCanvas(d, 48, 40, { scale: 1 }));
        pl.appendChild(row);
      });
      if (!top.length) pl.innerHTML = '<p class="sub">Juega una partida para ver aquí tus marcas.</p>';
      box.appendChild(pl);
    }

    // ---------------- misiones ----------------

    function untilText(kind) {
      const now = new Date();
      // Medianoche (diarias) o lunes (semanales), hora de España aproximada por la del navegador.
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      if (kind === 'w') { const add = (8 - (now.getDay() || 7)) % 7; end.setDate(end.getDate() + add); }
      const mins = Math.max(1, Math.round((end - now) / 60000));
      return mins >= 1440 ? Math.floor(mins / 1440) + ' d ' + Math.floor(mins % 1440 / 60) + ' h'
                          : Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min';
    }

    function missions(box) {
      const M = G.DB.save.missions;
      const section = (title, list, weekly) => {
        box.insertAdjacentHTML('beforeend', `<div class="row between goals-h"><h3>${title}</h3>
          <span class="sub">Se renuevan en ${untilText(weekly ? 'w' : 'd')}</span></div>`);
        list.forEach((m, i) => {
          const d = G.MissionDefs.BY[m.id];
          const done = G.Progress.done(m);
          const el = document.createElement('div');
          el.className = 'mission' + (m.claimed ? ' claimed' : done ? ' ready' : '');
          const pct = Math.min(100, m.prog / m.goal * 100);
          el.innerHTML = `
            <div class="m-txt"><b>${esc(G.Progress.text(m))}</b>
              <div class="bar"><i style="width:${pct}%"></i></div>
              <small>${Math.min(m.prog, m.goal).toLocaleString('es')} / ${m.goal.toLocaleString('es')}</small></div>
            <div class="m-rw">${G.Progress.rewardText(d.reward)}</div>`;
          const btn = document.createElement('button');
          if (m.claimed) { btn.className = 'btn small'; btn.disabled = true; btn.textContent = 'Recogido'; }
          else if (done) {
            btn.className = 'btn small gold'; btn.textContent = 'Recoger'; btn.dataset.sfx = 'none';
            btn.onclick = () => { if (G.Progress.claim(m, weekly)) { G.Audio.sfx('buy'); G.UI.toast('¡Premio recogido!'); render(); } };
          } else if (!weekly && !M.rerolled) {
            btn.className = 'btn small ghost'; btn.textContent = 'Cambiar';
            btn.title = 'Cambia esta misión por otra (una vez al día)';
            btn.onclick = () => { if (G.Progress.reroll(i)) render(); };
          } else { btn.className = 'btn small ghost'; btn.disabled = true; btn.textContent = 'En curso'; }
          el.appendChild(btn);
          box.appendChild(el);
        });
      };
      section('Diarias', M.daily, false);
      section('Semanales', M.weekly, true);
    }

    // ---------------- logros ----------------

    function achievements(box) {
      const s = G.DB.save;
      const all = G.AchDefs.LIST;
      const got = all.filter(a => s.ach && s.ach[a.id]).length;
      const chips = document.createElement('div');
      chips.className = 'filters';
      for (const [k, label] of G.AchDefs.CATS) {
        const list = all.filter(a => a.cat === k);
        const n = list.filter(a => s.ach && s.ach[a.id]).length;
        const b = document.createElement('button');
        b.className = 'chip' + (k === cat ? ' on' : '');
        b.textContent = `${label} ${n}/${list.length}`;
        b.onclick = () => { cat = k; render(); };
        chips.appendChild(b);
      }
      box.insertAdjacentHTML('beforeend', `<p class="sub">${got} de ${all.length} logros · títulos: ${G.Progress.titles().length}</p>`);
      box.appendChild(chips);

      const list = all.filter(a => a.cat === cat && !a.dex);
      const grid = document.createElement('div');
      grid.className = 'ach-grid';
      for (const a of list) grid.appendChild(achCard(a, s));
      box.appendChild(grid);

      // Legendarios: uno a uno, con su sprite (en sombra si aún no le has vencido).
      if (cat === 'legendarios') {
        const legs = all.filter(a => a.dex);
        const beaten = legs.filter(a => s.legends && s.legends[a.dex]).length;
        box.insertAdjacentHTML('beforeend', `<h3 style="margin:14px 0 6px">Legendarios vencidos ${beaten} / ${legs.length}</h3>`);
        const lg = document.createElement('div');
        lg.className = 'leg-grid';
        for (const a of legs) {
          const ok = !!(s.legends && s.legends[a.dex]);
          const c = document.createElement('div');
          c.className = 'leg-cell' + (ok ? ' ok' : '');
          c.title = a.name + (ok ? ' · ¡vencido!' : '');
          c.appendChild(G.UI.spriteCanvas(a.dex, 64, 56, { scale: 1, silhouette: !ok, shadow: ok }));
          c.insertAdjacentHTML('beforeend', `<small>${ok ? esc(G.DEX_BY[a.dex].name) : '???'}</small>`);
          lg.appendChild(c);
        }
        box.appendChild(lg);
      }
    }

    function achCard(a, s) {
      const ok = !!(s.ach && s.ach[a.id]);
      const v = Math.min(a.goal, a.value(s));
      const el = document.createElement('div');
      el.className = 'ach' + (ok ? ' ok' : '');
      el.innerHTML = `${G.Icons.html(ok ? 'medal' + a.tier : 'medalOff', 36)}
        <div class="a-txt"><b>${esc(a.name)}</b><small>${esc(a.desc)}</small>
          ${ok ? '' : `<div class="bar"><i style="width:${v / a.goal * 100}%"></i></div>`}
          <div class="a-rw">${ok ? '¡Conseguido!' : v.toLocaleString('es') + ' / ' + a.goal.toLocaleString('es')} · ${G.Progress.rewardText(a.reward)}
          ${a.title ? ` · <span class="gold">Título: ${esc(a.title)}</span>` : ''}</div></div>`;
      return el;
    }

    // ---------------- perfil (editar) ----------------

    function profile(box) {
      const s = G.DB.save;
      s.profile = s.profile || { favs: [], title: '' };
      const P = s.profile;
      box.insertAdjacentHTML('beforeend', `<p class="sub">${G.DB.online ? 'Así te ven los demás jugadores (desde el ranking y la lista de amigos).'
        : 'Tu tarjeta de entrenador: tus favoritos, tu título, tus marcas y tus medallas.'}</p>
        <h3>Tus 3 Pokémon favoritos</h3>`);
      const favs = document.createElement('div');
      favs.className = 'fav-slots';
      for (let i = 0; i < 3; i++) {
        const f = P.favs[i];
        const slot = document.createElement('div');
        slot.className = 'fav-slot';
        if (f && G.DEX_BY[f.dex]) {
          slot.appendChild(G.UI.spriteCanvas(f.dex, 120, 100, { scale: 2, lively: true, shiny: !!f.shiny }));
          slot.insertAdjacentHTML('beforeend', `<b>${f.shiny ? G.Icons.html('shiny', 12) + ' ' : ''}${esc(G.DEX_BY[f.dex].name)}</b>`);
        } else slot.innerHTML = '<span>Elegir</span>';
        slot.onclick = () => pickFav(i);
        favs.appendChild(slot);
      }
      box.appendChild(favs);

      const titles = G.Progress.titles();
      box.insertAdjacentHTML('beforeend', `<h3 style="margin-top:14px">Título</h3>`);
      const sel = document.createElement('select');
      sel.className = 'field';
      sel.style.maxWidth = '320px';
      sel.innerHTML = `<option value="">(sin título)</option>` + titles.map(t => `<option ${t === P.title ? 'selected' : ''}>${esc(t)}</option>`).join('');
      sel.onchange = () => { P.title = sel.value; save(); };
      box.appendChild(sel);
      if (!titles.length) box.insertAdjacentHTML('beforeend', '<p class="note">Consigue logros para desbloquear títulos.</p>');

      const prev = document.createElement('button');
      prev.className = 'btn gold'; prev.style.marginTop = '16px';
      prev.textContent = 'Ver mi perfil público';
      prev.onclick = () => G.ProfileUI.showData(G.Social.profileData());
      box.appendChild(prev);
    }

    function pickFav(i) {
      const s = G.DB.save;
      const box = $('goals-body');
      box.innerHTML = `<div class="row between"><h3>Elige el favorito ${i + 1}</h3>
        <button class="btn small ghost" id="fav-back">Volver</button></div>
        <input class="field" id="fav-q" placeholder="Buscar por nombre" style="max-width:320px;margin:6px 0 10px">
        <div class="grid" id="fav-grid"></div>`;
      $('fav-back').onclick = () => { tab = 'profile'; render(); };
      const fill = q => {
        const g = $('fav-grid');
        g.innerHTML = '';
        const mons = Object.keys(s.owned).map(Number).filter(d => G.DEX_BY[d] && (!q || G.DEX_BY[d].name.toLowerCase().includes(q)));
        for (const d of mons.slice(0, 120)) {
          for (const shiny of G.DB.ownsShiny(d) ? [false, true] : [false]) {
            const c = document.createElement('div');
            c.className = 'cell';
            c.appendChild(G.UI.spriteCanvas(d, 92, 80, { scale: 2, shiny }));
            c.insertAdjacentHTML('beforeend', `<b>${shiny ? G.Icons.html('shiny', 12) + ' ' : ''}${esc(G.DEX_BY[d].name)}</b>`);
            c.onclick = () => {
              s.profile.favs = (s.profile.favs || []).slice();
              s.profile.favs[i] = { dex: d, shiny };
              s.profile.favs = s.profile.favs.filter(Boolean).slice(0, 3);
              save(); tab = 'profile'; render();
            };
            g.appendChild(c);
          }
        }
      };
      $('fav-q').oninput = () => fill($('fav-q').value.trim().toLowerCase());
      fill('');
    }

    function save() {
      G.DB.commit();
      if (G.Social.me) G.Social.publishProfile(true);
      G.Audio.sfx('confirm');
    }

    return { init, open, render };
  })();

  // ======================= PERFIL PÚBLICO =======================

  G.ProfileUI = (() => {
    function init() {
      $('prof-close').onclick = close;
      $('scr-profile').onclick = e => { if (e.target.id === 'scr-profile') close(); };
    }
    function close() { $('scr-profile').classList.add('hidden'); }

    /** Abre el perfil de otro jugador por su uid. */
    async function show(uid) {
      if (!uid) return;
      if (uid === G.Social.uid) { showData(G.Social.profileData()); return; }
      $('prof-body').innerHTML = '<p class="sub">Cargando…</p>';
      $('scr-profile').classList.remove('hidden');
      const d = await G.Social.getProfile(uid);
      if (!d) { $('prof-body').innerHTML = '<p class="sub">Este jugador aún no tiene perfil.</p>'; return; }
      showData(d);
    }

    function showData(d) {
      const b = d.best || {};
      const body = $('prof-body');
      body.innerHTML = `
        <div class="prof-head"><h2 translate="no">${esc(d.name || '???')}</h2>${d.title ? `<span class="prof-title">${esc(d.title)}</span>` : ''}</div>
        <div class="fav-slots view" id="prof-favs"></div>
        <div class="prof-marks">
          <div><span>Mejor tiempo</span><b>${fmt(b.solo || 0)}</b></div>
          <div><span>En grupo</span><b>${fmt(b.group || 0)}</b></div>
          <div><span>Nivel máximo</span><b>${b.level || 0}</b></div>
          <div><span>Jefes</span><b>${(b.bosses || 0).toLocaleString('es')}</b></div>
          <div><span>Legendarios</span><b>${b.legends || 0}</b></div>
          <div><span>Derrotados</span><b>${(b.kills || 0).toLocaleString('es')}</b></div>
        </div>
        <h3>Medallas <span class="sub">${b.medals || 0}</span></h3>
        <div class="prof-medals" id="prof-medals"></div>`;
      const favs = $('prof-favs');
      for (const f of (d.favs || []).slice(0, 3)) {
        if (!G.DEX_BY[f.dex]) continue;
        const slot = document.createElement('div');
        slot.className = 'fav-slot';
        slot.appendChild(G.UI.spriteCanvas(f.dex, 120, 100, { scale: 2, lively: true, shiny: !!f.shiny }));
        slot.insertAdjacentHTML('beforeend', `<b>${f.shiny ? G.Icons.html('shiny', 12) + ' ' : ''}${esc(G.DEX_BY[f.dex].name)}</b>`);
        favs.appendChild(slot);
      }
      if (!favs.children.length) favs.innerHTML = '<p class="sub">Sin favoritos todavía.</p>';
      const med = $('prof-medals');
      for (const id of d.medals || []) {
        const a = G.AchDefs.BY[id];
        if (!a) continue;
        const m = document.createElement('div');
        m.className = 'pm';
        m.title = a.name;
        if (a.dex) m.appendChild(G.UI.spriteCanvas(a.dex, 48, 40, { scale: 1 }));
        else m.innerHTML = G.Icons.html('medal' + a.tier, 36);
        m.insertAdjacentHTML('beforeend', `<small>${esc(a.name)}</small>`);
        med.appendChild(m);
      }
      if (!med.children.length) med.innerHTML = '<p class="sub">Aún sin medallas.</p>';
      $('scr-profile').classList.remove('hidden');
    }

    return { init, show, showData };
  })();
})();
