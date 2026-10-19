/* ============ gacha-ui.js — banners por generación y animación de tirada ============
 * La lógica (probabilidades, pity, shiny, repetidos) está en systems/gacha.js.
 */
G.GachaUI = (() => {
  const $ = G.UI.$;
  let busy = false;
  let gen = 1;

  function init() {
    $('pull-1').onclick = () => pull(1);
    $('pull-10').onclick = () => pull(10, 't1');
    $('pull-10b').onclick = () => pull(10, 't10');
    $('pull-close').onclick = close;

    const tabs = $('gacha-gens');
    G.Gacha.BANNERS.forEach(b => {
      const t = document.createElement('button');
      t.className = 'gen-tab' + (b.special ? ' gen-tab-mega' : '');
      t.dataset.gen = b.gen;
      t.innerHTML = b.special ? `<b>🧬 ${b.name}</b><small>Míticas 6★</small>` : `<b>${b.name}</b><small>Gen ${b.gen}</small>`;
      t.onclick = () => { gen = b.gen; refresh(); };
      tabs.appendChild(t);
    });
  }

  function open(targetGen = null) {
    if (targetGen) gen = targetGen;
    G.UI.show('scr-gacha', true);
    refresh();
  }

  function refresh() {
    const s = G.DB.save;
    const banner = G.Gacha.BANNERS[gen - 1];
    document.querySelectorAll('#gacha-gens .gen-tab').forEach(t => t.classList.toggle('on', +t.dataset.gen === gen));

    const isMega = gen === 10 || banner.special;
    const [c1, c2, c3] = banner.color;
    $('banner').style.background =
      `radial-gradient(circle at 80% 30%, rgba(255,210,63,.3), transparent 45%),
       radial-gradient(circle at 15% 80%, rgba(196,123,255,.3), transparent 50%),
       linear-gradient(135deg, ${c1}, ${c2} 55%, ${c3})`;

    if (isMega) {
      const megaList = (G.Megas && G.Megas.LIST) || [];
      const ownedMegas = megaList.filter(m => s.megas && s.megas[m.id]).length;
      $('banner-title').textContent = 'Sagrario del Juicio (Megaevoluciones)';
      $('banner-desc').textContent = '¡Despierta el poder definitivo! Consigue Megapiedras sagradas para trascender el límite de tus Pokémon con animación auténtica de Mundo Misterioso.';
      $('gacha-owned').innerHTML = `Tienes <b>${ownedMegas}</b> de <b>${megaList.length}</b> Megaevoluciones desbloqueadas`;

      const pity = (s.pity && s.pity[10]) || 0;
      $('gacha-pity').textContent = `Tiradas sin Mega en Sagrario: ${pity} / 35`;

      $('gacha-rates').innerHTML = '<h3>Probabilidades Sagrario</h3>' +
        `<div><span style="color:${G.Gacha.RARITY_COLOR[6]}">${G.UI.stars(6, 10)} ${G.Gacha.RARITY_NAME[6]}</span><span>5% · ${megaList.length} Megas</span></div>
         <div><span style="color:${G.Gacha.RARITY_COLOR[5]}">${G.UI.stars(5, 10)} Legendario Garantizado</span><span>95% · Todas las Gen</span></div>
         <p class="note">· Exclusivo con <b>Mega-Tickets</b> ganados en el Juicio de Arceus (30:00).<br>
         · 5% de probabilidad de Megapiedra mística con animaciones completas.<br>
         · ¡Pity garantizado a las 35 tiradas!<br>
         · Si no sale Mega, ¡obtienes un Pokémon Legendario 5★ garantizado!<br>
         · Al obtener una Mega se desbloquea su forma para equipar en el Menú de inicio.</p>`;

      const tMega = (s.tickets && s.tickets.mega) || 0;
      $('cost-1').innerHTML = `💎 15`;
      $('cost-10').innerHTML = `💎 140`;
      $('cost-10b').innerHTML = `—`;
      $('gacha-tickets').innerHTML = `Tienes 💎 <b>${tMega}</b> Mega-Tickets (ganados sobreviviendo a Arceus a los 30:00)`;
      $('pull-1').disabled = !G.Gacha.costOf(s, 1, 't1', 10);
      $('pull-10').disabled = !G.Gacha.costOf(s, 10, 't1', 10);
      $('pull-10b').disabled = true;
    } else {
      const all = G.DEX.filter(p => p.gen === gen);
      const owned = all.filter(p => s.owned[p.dex]).length;
      const shinies = all.filter(p => s.shiny && s.shiny[p.dex]).length;
      $('banner-title').textContent = banner.name + ' Misterioso';
      $('banner-desc').textContent = `Los ${all.length} Pokémon de la generación ${gen}. ¡Los legendarios esperan!`;
      $('gacha-owned').innerHTML = `Tienes ${owned} de ${all.length}` +
        (shinies ? ` · ${G.Icons.html('shiny', 12)} ${shinies} shiny` : '');

      const pity = (s.pity && s.pity[gen]) || 0;
      $('gacha-pity').textContent = `Tiradas sin legendaria en ${banner.name}: ${pity} / ${G.Gacha.PITY_5}`;

      $('gacha-rates').innerHTML = '<h3>Probabilidades</h3>' + G.Gacha.RATES.slice().reverse().map(([r, w]) => `
        <div><span style="color:${G.Gacha.RARITY_COLOR[r]}">${G.UI.stars(r, 10)} ${G.Gacha.RARITY_NAME[r]}</span>
        <span>${w}% · ${G.Gacha.pool(r, gen).length}</span></div>`).join('') +
        `<div><span>${G.Icons.html('shiny', 12)} Shiny</span><span>1%</span></div>
         <p class="note">· La tirada ×10 garantiza al menos una Épica.<br>
         · A las ${G.Gacha.PITY_5} tiradas sin Legendaria en un banner, la siguiente lo es.<br>
         · Los repetidos dan Pokémonedas. Los shiny no se repiten.<br>
         · Los tickets se consiguen jugando: algunos Pokémon los sueltan al caer, y
           los jefes y los legendarios de las grietas, a veces, tickets ×10.</p>`;

      const t = s.tickets || { t1: 0, t10: 0 };
      $('cost-1').innerHTML = `${G.Icons.html('ticket', 18)} 1`;
      $('cost-10').innerHTML = `${G.Icons.html('ticket', 18)} 10`;
      $('cost-10b').innerHTML = `${G.Icons.html('ticket10', 18)} 1`;
      $('gacha-tickets').innerHTML = `Tienes ${G.Icons.html('ticket', 18)} <b>${t.t1}</b> tickets y ${G.Icons.html('ticket10', 18)} <b>${t.t10}</b> tickets ×10` +
        (t.mega ? ` · 💎 <b>${t.mega}</b> Mega` : '');
      $('pull-1').disabled = !G.Gacha.costOf(s, 1, 't1', gen);
      $('pull-10').disabled = !G.Gacha.costOf(s, 10, 't1', gen);
      $('pull-10b').disabled = !G.Gacha.costOf(s, 10, 't10', gen);
    }

    const feat = $('gacha-feat');
    feat.innerHTML = '';
    for (const dex of G.Gacha.featured(gen)) {
      const megaDef = isMega ? G.Megas.getByDex(dex) : null;
      feat.appendChild(G.UI.spriteCanvas(dex, 170, 190, { lively: true, scale: isMega ? 2.2 : 2, dir: 1, mega: megaDef }));
    }

    G.UI.refreshCoins();
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  /** Destello de pantalla del color de la rareza (más suave con "Menos destellos"). */
  function flashFx(col) {
    const f = document.createElement('div');
    f.className = 'pull-flash';
    f.style.setProperty('--fc', col);
    if (G.Settings.get('calm')) f.style.opacity = '0.35';
    $('pull-fx').appendChild(f);
    setTimeout(() => f.remove(), 600);
  }

  async function pull(n, use = 't1') {
    if (busy) return;
    const res = G.Gacha.pull(G.DB.save, n, gen, use);
    if (!res) { G.Audio.sfx('error'); G.UI.toast('No tienes tickets suficientes: consíguelos jugando'); return; }
    G.Progress.checkAch();
    G.DB.commit(true);
    busy = true;

    const best = Math.max(...res.map(r => r.rarity));
    const fx = $('pull-fx'), slot = $('slot'), out = $('pull-results');
    out.innerHTML = '';
    $('pull-close').classList.add('hidden');
    slot.style.display = '';
    fx.classList.remove('hidden');

    // La tragaperras (ui/slots.js) y luego las cartas.
    await G.Slots.play(slot, res);
    G.Audio.sfx('burst', { rarity: best });
    slot.style.display = 'none';

    // Las cartas salen boca abajo y se giran una a una; las especiales (5★,
    // Mega, shiny) se cargan y destellan antes. Tocar las cartas las gira todas.
    let skip = false;
    out.onclick = () => { skip = true; };
    const cards = [];
    for (const r of res) {
      const mon = G.DEX_BY[r.dex];
      const c = document.createElement('div');
      const isMega = r.rarity === 6 || !!r.mega;
      c.className = 'pcard facedown r' + r.rarity + (r.shiny ? ' shiny' : '') + (isMega ? ' mega-card' : '');
      c.style.setProperty('--rc', r.shiny ? '#9ae6ff' : (isMega ? '#00e5ff' : G.Gacha.RARITY_COLOR[r.rarity]));
      c.innerHTML = `<div class="stars">${G.UI.stars(r.rarity, 24)}</div>`;
      c.appendChild(G.UI.spriteCanvas(r.dex, 132, 120, { lively: r.rarity >= 4 || r.shiny || isMega, scale: isMega && r.mega && r.mega.gigamax ? 2.3 : 2, shiny: r.shiny, mega: isMega ? r.mega : null }));
      
      let title = (r.shiny ? G.Icons.html('shiny', 12) + ' ' : '') + mon.name;
      if (isMega && r.mega) {
        title = `🧬 ${r.mega.name}`;
      }

      const tag = r.isNew
        ? `<span class="new">${isMega ? '¡FORMA DESBLOQUEADA!' : (r.shiny ? '¡SHINY NUEVO!' : '¡NUEVO!')}</span>`
        : `Repetido · <span class="coin"></span> +${r.refund}`;
      c.insertAdjacentHTML('beforeend', `<b>${title}</b><div class="tag">${tag}</div>` +
        (isMega && r.mega ? `<div class="mega-desc" style="font-size:11px;color:#a5f3fc;margin-top:4px;padding:2px 4px;background:rgba(0,229,255,0.12);border-radius:4px"><b>${r.mega.passive}</b>: ${r.mega.passiveDesc}</div>` : ''));
      out.appendChild(c);
      cards.push({ c, r, special: r.rarity >= 5 || isMega || r.shiny, isMega });
    }
    for (const { c, r, special, isMega } of cards) {
      if (!skip) await wait(n === 10 ? 170 : 260);
      if (special && !skip) {
        c.classList.add('charging');
        G.Audio.sfx('shiny');
        await wait(700);
        flashFx(r.shiny ? '#9ae6ff' : isMega ? '#00e5ff' : G.Gacha.RARITY_COLOR[r.rarity]);
      }
      c.classList.remove('facedown', 'charging');
      c.classList.add('flip');
      G.Audio.sfx('reveal', { rarity: r.rarity });
      if (isMega || r.rarity >= 5) G.Audio.sfx('legend');
    }
    out.onclick = null;
    $('pull-close').classList.remove('hidden');
    busy = false;
  }

  function close() {
    $('pull-fx').classList.add('hidden');
    refresh();
  }

  return { init, open, get open_() { return !$('pull-fx').classList.contains('hidden'); } };
})();
