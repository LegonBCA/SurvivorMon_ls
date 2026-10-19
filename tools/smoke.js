/* ============ smoke.js — prueba automática en Chrome (sin ventana) ============
 * Abre el juego, recorre menús, juega una partida, prueba copias/reinicio,
 * ?dev y el inglés, y falla si hay errores en la consola.
 *   1) npm install --no-save puppeteer      (una vez; no toca package.json)
 *   2) node tools/build.js --expose && python -m http.server 8000
 *   3) node tools/smoke.js [http://127.0.0.1:8000/]
 * Las capturas quedan en tools/cache/ (no se suben).
 */
const puppeteer = require('puppeteer');
const SHOTS = require('path').join(__dirname, 'cache');
require('fs').mkdirSync(SHOTS, { recursive: true });
const URL = process.argv[2] || 'http://127.0.0.1:8000/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'OK    ' : 'FALLO ') + m); if (!c) fails++; };

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'] });
  const errors = [];
  async function open(url) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));
    page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => window.G && G.DB && G.DB.save, { timeout: 20000 });
    await sleep(800);
    // "Pulsa para empezar"
    await page.evaluate(() => { const t = document.getElementById('tap-start'); if (t && !t.classList.contains('hidden')) t.click(); });
    await sleep(800);
    return page;
  }

  // ---------- 1. Primera vez: menú, botones escondidos ----------
  const page = await open(URL);
  await page.evaluate(() => {
    // Saltar el test de personalidad: compañero Riolu/Lucario con su mega.
    const s = G.DB.save;
    G.DB.grant(448, 'starter'); s.partner = 448; s.starter = 448;
    s.megas.mega_lucario = { at: Date.now(), from: 'gacha' }; s.partnerMega = true; s.partnerMegaId = 'mega_lucario';
    G.DB.commit();
    G.UI.hideAll(); G.Flow.goMenu();
  });
  await sleep(600);
  const vis = await page.evaluate(() => {
    const shown = sel => { const e = document.querySelector(sel); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; };
    return {
      menu: shown('#scr-menu'), friends: shown('[data-go=friends]'), rank: shown('[data-go=rank]'),
      test: shown('#btn-menu-test'), logout: shown('#btn-logout'), support: shown('#btn-support'),
      unlockAll: typeof window.unlockAll, partner: document.getElementById('menu-partner-name').textContent
    };
  });
  ok(vis.menu, 'menú abierto');
  ok(!vis.friends && !vis.rank, 'Amigos y Ranking escondidos');
  ok(!vis.test && vis.unlockAll === 'undefined', 'modo test escondido y sin unlockAll()');
  ok(!vis.logout && !vis.support, 'sin botón Salir ni Apoyar');
  ok(/Mega Lucario/.test(vis.partner), 'compañero mega en el menú: ' + vis.partner.trim());
  await page.screenshot({ path: SHOTS + '/menu.png' });

  // ---------- 2. Ajustes > Partida ----------
  const acc = await page.evaluate(() => {
    G.SettingsUI.open('acc');
    const b = document.getElementById('set-body');
    return { text: b.innerText, baks: b.querySelectorAll('[data-bak]').length, importDisabled: document.getElementById('btn-import-save').disabled };
  });
  ok(/Última descarga/.test(acc.text) && /nunca/.test(acc.text), 'Ajustes > Partida enseña "Última descarga: nunca"');
  ok(acc.baks >= 1, 'lista de copias automáticas (' + acc.baks + ')');
  ok(!acc.importDisabled, 'cargar partida disponible fuera de partida');
  await page.screenshot({ path: SHOTS + '/partida.png' });
  const music = await page.evaluate(() => { G.SettingsUI.open('sound'); return { cards: document.querySelectorAll('.bgm-card').length, mp3: /MP3/.test(document.getElementById('set-body').innerText) }; });
  ok(music.cards > 5 && !music.mp3, 'selector de música sin MP3 (' + music.cards + ' temas)');
  await page.evaluate(() => G.SettingsUI.close());

  // ---------- 3. Partida con la mega (habilidad de Lucario) ----------
  await page.evaluate(() => { G.Game.startRun(null, 'classic'); });
  await sleep(500);
  const run1 = await page.evaluate(() => ({ state: G.Game.state, mega: G.Game.player.mega && G.Game.player.mega.id }));
  ok(run1.state === 'playing' && run1.mega === 'mega_lucario', 'partida empezada con ' + run1.mega);
  // Tutorial (fase 6): primera partida → consejos que avanzan al hacer lo que piden.
  const tipText = () => page.evaluate(() => { const t = document.getElementById('tut-tip'); return t && !t.classList.contains('hidden') ? t.innerText : ''; });
  await sleep(500);
  ok(/Muévete/.test(await tipText()), 'tutorial: primer consejo (moverse)');
  await page.keyboard.down('KeyD'); await sleep(1700); await page.keyboard.up('KeyD'); await sleep(500);
  ok(/ataca solo/.test(await tipText()), 'tutorial: al moverse pasa al siguiente consejo');
  // Enemigos alrededor para que la habilidad pegue.
  await page.evaluate(() => { for (let i = 0; i < 12; i++) G.Spawner.update && 0; });
  await sleep(9000);
  await page.screenshot({ path: SHOTS + '/run.png' });
  const run2 = await page.evaluate(() => ({ state: G.Game.state, t: G.Game.st.time, kills: G.Game.player.kills, megaTick: G.Game.player.megaTick }));
  ok(run2.t > 5, 'el reloj avanza (' + run2.t.toFixed(1) + ' s, ' + run2.kills + ' derrotados)');
  const accRun = await page.evaluate(() => { G.Game.togglePause(); G.SettingsUI.open('acc'); const d = document.getElementById('btn-import-save').disabled && document.getElementById('btn-reset-save').disabled; G.SettingsUI.close(); G.Game.togglePause(); return d; });
  ok(accRun, 'en partida: cargar y reiniciar bloqueados');
  await page.evaluate(() => G.Game.quit());
  await sleep(1500);
  const over = await page.evaluate(() => ({ state: G.Game.state, runs: G.DB.save.stats.runs, over: !document.getElementById('scr-over').classList.contains('hidden') }));
  ok(over.state === 'over' && over.over && over.runs === 1, 'resumen de la partida y partida guardada');
  ok(await page.evaluate(() => G.DB.save.tutDone === true), 'tutorial marcado como visto al acabar la primera partida');
  await page.evaluate(() => document.getElementById('btn-again') && document.getElementById('btn-again').click());
  await sleep(800);

  // ---------- 3b. Récords (fase 4) ----------
  await page.evaluate(() => { G.Game.startRun(null, 'tundra'); });
  await sleep(4000);
  await page.evaluate(() => G.Game.quit());
  await sleep(1200);
  await page.evaluate(() => document.getElementById('btn-again').click());
  await sleep(600);
  const rec = await page.evaluate(async () => {
    const R = G.DB.save.records;
    G.GoalsUI.open('records');
    await new Promise(r => setTimeout(r, 400));
    return { classic: R.map.classic, tundra: R.map.tundra, mon: R.mon[448], play: G.DB.save.stats.playTime,
             text: document.getElementById('goals-body').innerText };
  });
  ok(rec.classic && rec.classic.t > 5 && rec.tundra && rec.tundra.t >= 2, 'récords por mapa (Valle ' + (rec.classic && rec.classic.t) + ' s, Picos ' + (rec.tundra && rec.tundra.t) + ' s)');
  ok(rec.mon && rec.mon.runs === 2, 'récord de Lucario con 2 partidas');
  ok(rec.play >= 10, 'tiempo jugado sumado (' + rec.play + ' s)');
  ok(/Por mapa/.test(rec.text) && /Picos Glaciares/.test(rec.text) && /Tus mejores Pokémon/.test(rec.text), 'pestaña Récords con mapas y Pokémon');
  await page.screenshot({ path: SHOTS + '/records.png' });
  await page.evaluate(() => G.MenuUI.open());

  // ---------- 3b2. Tienda Kecleon (fase 8) ----------
  await page.evaluate(() => { G.Game.startRun(null, 'classic'); G.Shop.debugSpawn(); });
  await sleep(1200);
  const k1 = await page.evaluate(() => G.Shop._dbg());
  ok(!!k1, 'Kecleon llega a la partida');
  const shop = await page.evaluate(async () => {
    const pl = G.Game.player, k = G.Shop._dbg();
    pl.coins = 500; pl.x = k.x + 10; pl.y = k.y + 8;
    await new Promise(r => setTimeout(r, 400));
    const opened = G.Shop.isOpen, paused = G.Game.state === 'choice';
    const btn = document.querySelector('#shop-offers .shop-offer button:not([disabled])');
    const before = pl.coins; if (btn) btn.click();
    const spent = before - pl.coins;
    const n = document.querySelectorAll('#shop-offers .shop-offer').length;
    document.getElementById('shop-close').click();
    await new Promise(r => setTimeout(r, 300));
    return { opened, paused, n, spent, after: G.Game.state, gone: !G.Shop.here };
  });
  ok(shop.opened && shop.paused && shop.n === 3, 'tienda abierta al acercarse, partida en pausa, 3 ofertas');
  ok(shop.spent > 0, 'comprar gasta monedas de la partida (' + shop.spent + ')');
  ok((shop.after === 'playing' || shop.after === 'choice') && shop.gone, 'salir: la partida sigue y Kecleon se va');
  await page.evaluate(() => { G.UI.hideAll(); G.Game.quit(); });
  await sleep(1200);
  await page.evaluate(() => { const b = document.getElementById('btn-again'); if (b) b.click(); });
  await sleep(500);

  // ---------- 3b3. Rangos de dificultad (fase 9) ----------
  const rk1 = await page.evaluate(async () => {
    G.MenuUI.open(); G.MapsUI.open();
    await new Promise(r => setTimeout(r, 300));
    const chips = [...document.querySelectorAll('#maps-ranks .rank-chip')];
    return { n: chips.length, locked: chips.filter(c => c.classList.contains('locked')).length };
  });
  ok(rk1.n === 6 && rk1.locked === 5, 'rangos: 6 en la pantalla de mapas, sólo Normal abierto al principio');
  const rk2 = await page.evaluate(async () => {
    G.DB.save.ranks.unlocked = 2; G.MapsUI.open();
    await new Promise(r => setTimeout(r, 200));
    document.querySelector('#maps-ranks [data-rank="2"]').click();
    document.getElementById('btn-map-start').click();
    await new Promise(r => setTimeout(r, 600));
    const cfg = G.Game.runCfg, rk = G.Ranks.current();
    G.Game.debugTime(1801);              // como si hubiera llegado a la Sentencia de Arceus
    await new Promise(r => setTimeout(r, 200));
    G.Game.quit();
    await new Promise(r => setTimeout(r, 1200));
    const over = document.getElementById('over-stats').innerText;
    document.getElementById('btn-again').click();
    return { rank: cfg.rank, hp: rk.hp, unlocked: G.DB.save.ranks.unlocked, over, rec: !!G.DB.save.records.rank[2] };
  });
  ok(rk2.rank === 2 && rk2.hp === 1.5, 'partida en rango Plata (enemigos ×1,5 de vida)');
  ok(/Plata/.test(rk2.over) && /desbloqueado el rango Oro/.test(rk2.over), 'resumen: premio del rango y rango Oro desbloqueado');
  ok(rk2.unlocked === 3 && rk2.rec, 'rango Oro guardado y récord del rango Plata');
  await sleep(500);

  // ---------- 3b4. Desafío de Gimnasios (fase 10) ----------
  const gy1 = await page.evaluate(async () => {
    G.MenuUI.open(); document.querySelector('#scr-menu [data-go=gyms]').click();
    await new Promise(r => setTimeout(r, 400));
    return { open: !document.getElementById('scr-gyms').classList.contains('hidden'),
             cards: document.querySelectorAll('#gyms-grid .gym-card').length,
             leagueLocked: document.querySelector('#gyms-league button').disabled };
  });
  ok(gy1.open && gy1.cards === 8 && gy1.leagueLocked, 'pantalla de gimnasios: 8 gimnasios y la Liga cerrada');
  await page.screenshot({ path: SHOTS + '/gyms.png' });
  const killBosses = () => page.evaluate(() => { for (const e of G.EnemyMgr.all()) if (e.boss) e.hurt(1e9, '#fff'); });
  const gy2 = await page.evaluate(async () => {
    document.querySelector('#gyms-grid .gym-card button').click();          // Brock
    await new Promise(r => setTimeout(r, 700));
    G.Spawner.burst(8);
    await new Promise(r => setTimeout(r, 300));
    const types = G.EnemyMgr.all().filter(e => !e.boss).map(e => (G.DEX_BY[e.dex] || {}).types || []);
    return { mode: G.Game.runCfg.mode, active: G.Gym.active, biome: G.World.biome === G.Tiles.arenaBiome('rock'),
             allRock: types.length > 0 && types.every(t => t.includes('rock')), n: types.length };
  });
  ok(gy2.mode === 'gym' && gy2.active && gy2.biome, 'gimnasio de Brock: modo gimnasio y arena de tipo Roca');
  ok(await page.evaluate(() => [...document.querySelectorAll('.scr')].every(s => s.classList.contains('hidden'))), 'en la partida del gimnasio no queda ninguna pantalla abierta encima');
  ok(gy2.allRock, 'sólo salen Pokémon de tipo Roca (' + gy2.n + ')');
  await page.evaluate(() => G.Gym.debugSkip(421)); await sleep(500);
  ok(await page.evaluate(() => G.EnemyMgr.all().some(e => e.boss && e.dex === 95)), 'Brock saca a su Pokémon estrella (Onix)');
  await killBosses(); await sleep(3600);
  const gy3 = await page.evaluate(() => ({ over: document.getElementById('over-stats').innerText, medal: !!(G.DB.save.gyms.kanto && G.DB.save.gyms.kanto.medals[1]) }));
  ok(/Medalla Roca/.test(gy3.over) && gy3.medal, 'victoria: Medalla Roca guardada y premio en el resumen');
  await page.evaluate(() => document.getElementById('btn-again').click()); await sleep(500);
  ok(await page.evaluate(() => !document.getElementById('scr-gyms').classList.contains('hidden')), 'al volver, se abre la pantalla de gimnasios');
  // La Liga de Kanto: 5 combates seguidos
  await page.evaluate(() => { const m = G.DB.save.gyms.kanto.medals; for (let i = 1; i <= 8; i++) m[i] = m[i] || 1; G.GymsUI.render(); document.querySelector('#gyms-league button').click(); });
  await sleep(700);
  for (let i = 0; i < 5; i++) { await page.evaluate(() => G.Gym.debugSkip(151)); await sleep(400); await killBosses(); await sleep(500); }
  await sleep(3200);
  const gy4 = await page.evaluate(() => ({ over: document.getElementById('over-stats').innerText, champ: !!G.DB.save.gyms.kanto.champ, title: G.Progress.titles().includes('Campeón de Kanto') }));
  ok(/Campeón de Kanto/.test(gy4.over) && gy4.champ && gy4.title, 'Liga de Kanto ganada: Campeón y título "Campeón de Kanto"');
  await page.evaluate(() => { document.getElementById('btn-again').click(); }); await sleep(400);
  await page.evaluate(() => G.MenuUI.open());

  // ---------- 3b5. Pokédex completa (fase 11) ----------
  const dx = await page.evaluate(async () => {
    G.MenuUI.open(); document.querySelector('#scr-menu [data-go=dex]').click();
    await new Promise(r => setTimeout(r, 1500));               // carga de js/data/dex-text.json
    const t = document.getElementById('dex-detail').innerText;
    const atk = [...document.querySelectorAll('#dex-detail .stat')].map(s => s.innerText).find(x => /Ataque/.test(x)) || '';
    return { t, atk, base: G.DEX_BY[448].atk };
  });
  ok(/Pokémon Aura/.test(dx.t) && /Dónde aparece/.test(dx.t) && /banner del gacha de Sinnoh/.test(dx.t), 'ficha de la Pokédex: categoría, descripción y "Dónde aparece"');
  ok(dx.atk.includes('×' + (dx.base * 1.4).toFixed(2)), 'ficha de la Mega con su ataque real (' + dx.atk.replace(/\s+/g, ' ') + ')');
  await page.evaluate(() => G.MenuUI.open());

  // ---------- 3b6. Mando (fase 12): un mando simulado ----------
  await page.evaluate(() => {
    const pad = { connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    window.__pad = pad;
    navigator.getGamepads = () => [pad];
    window.__press = async (i, ms = 120) => { pad.buttons[i].pressed = true; await new Promise(r => setTimeout(r, ms)); pad.buttons[i].pressed = false; await new Promise(r => setTimeout(r, 120)); };
  });
  const pd = await page.evaluate(async () => {
    G.MenuUI.open();
    await new Promise(r => setTimeout(r, 200));
    await window.__press(13);                     // cruceta abajo: primer foco
    await window.__press(13);                     // otra vez: baja
    const focused = document.querySelector('.pad-focus');
    const label = focused ? focused.dataset.go || focused.id || focused.textContent.trim().slice(0, 12) : '';
    await window.__press(0);                      // A: pulsa
    await new Promise(r => setTimeout(r, 300));
    const opened = [...document.querySelectorAll('.scr')].filter(s => !s.classList.contains('hidden')).map(s => s.id);
    await window.__press(1);                      // B: vuelve
    await new Promise(r => setTimeout(r, 300));
    const back = !document.getElementById('scr-menu').classList.contains('hidden');
    // En partida: stick a la derecha y Start
    G.UI.hideAll(); G.Game.startRun(null, 'classic');
    await new Promise(r => setTimeout(r, 300));
    const pl = G.Game.player, x0 = pl.x;
    window.__pad.axes[0] = 1; await new Promise(r => setTimeout(r, 600)); window.__pad.axes[0] = 0;
    const moved = pl.x - x0;
    await window.__press(9);                      // Start: pausa
    const paused = G.Game.state === 'paused';
    await window.__press(9);                      // Start otra vez: sigue
    const resumed = G.Game.state === 'playing';
    G.Game.quit();
    await new Promise(r => setTimeout(r, 1200));
    document.getElementById('btn-again').click();
    navigator.getGamepads = () => [];
    return { label, opened, back, moved, paused, resumed };
  });
  ok(!!pd.label && pd.opened.length > 0 && pd.back, 'mando en el menú: la cruceta mueve el foco (' + pd.label + '), A abre y B vuelve');
  ok(pd.moved > 20 && pd.paused && pd.resumed, 'mando en partida: el stick mueve (' + Math.round(pd.moved) + ') y Start pausa y sigue');

  // ---------- 3c. Guía (fase 6) ----------
  await page.evaluate(() => document.getElementById('btn-guide').click());
  await sleep(400);
  const guide = await page.evaluate(() => ({ open: !document.getElementById('scr-guide').classList.contains('hidden'), rows: document.querySelectorAll('#guide-body .guide-row').length }));
  ok(guide.open && guide.rows >= 15, 'guía abierta desde el botón ? (' + guide.rows + ' apartados)');
  await page.screenshot({ path: SHOTS + '/guide.png' });
  await page.keyboard.press('Escape'); await sleep(300);
  ok(await page.evaluate(() => document.getElementById('scr-guide').classList.contains('hidden')), 'Esc cierra la guía');

  // ---------- 4. Reiniciar y restaurar ----------
  const rr = await page.evaluate(async () => {
    window.confirm = () => true;
    G.SettingsUI.open('acc');
    document.getElementById('btn-reset-save').click();
    await new Promise(r => setTimeout(r, 600));
    const afterReset = { partner: G.DB.save.partner, test: !document.getElementById('scr-test').classList.contains('hidden'), coins: G.DB.save.coins };
    G.SettingsUI.open('acc');
    document.querySelector('[data-bak="0"]').click();
    await new Promise(r => setTimeout(r, 600));
    return { afterReset, restored: { partner: G.DB.save.partner, runs: G.DB.save.stats.runs, menu: !document.getElementById('scr-menu').classList.contains('hidden') } };
  });
  ok(rr.afterReset.partner === null && rr.afterReset.test, 'reiniciar: partida nueva y test de personalidad');
  ok(rr.restored.partner === 448 && rr.restored.runs >= 1 && rr.restored.menu, 'restaurar la copia: vuelve todo y abre el menú');

  // ---------- 5. Recarga: la partida sigue ----------
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.G && G.DB && G.DB.save, { timeout: 20000 });
  const persisted = await page.evaluate(() => ({ partner: G.DB.save.partner, runs: G.DB.save.stats.runs }));
  ok(persisted.partner === 448 && persisted.runs >= 1, 'tras recargar, la partida sigue ahí');
  await page.close();

  // ---------- 6. Con ?dev sale el modo test ----------
  const dev = await open(URL + '?dev');
  const dv = await dev.evaluate(() => { G.UI.hideAll(); G.Flow.goMenu(); const b = document.getElementById('btn-menu-test'); return { shown: !b.classList.contains('hidden'), fn: typeof window.unlockAll }; });
  ok(dv.shown && dv.fn === 'function', 'con ?dev: modo test visible y unlockAll()');
  await dev.close();

  // ---------- 7. En inglés ----------
  const en = await browser.newPage();
  en.on('pageerror', e => errors.push('pageerror(en): ' + e.message));
  await en.evaluateOnNewDocument(() => localStorage.setItem('ps.lang', 'en'));
  await en.goto(URL, { waitUntil: 'networkidle2' });
  await en.waitForFunction(() => window.G && G.DB && G.DB.save, { timeout: 20000 });
  await sleep(800);
  const enText = await en.evaluate(async () => {
    G.UI.hideAll(); G.Flow.goMenu(); G.MapsUI.open(); await new Promise(r => setTimeout(r, 300));
    const maps = document.getElementById('scr-maps').innerText;
    G.UI.hideAll(); G.SettingsUI.open('acc'); await new Promise(r => setTimeout(r, 300));
    return { maps, acc: document.getElementById('set-body').innerText };
  });
  ok(/Choose the map/.test(enText.maps) && /Glacier Peaks/.test(enText.maps), 'mapas en inglés');
  ok(/Automatic backups/.test(enText.acc) && /Last download/.test(enText.acc), 'Ajustes > Partida en inglés');
  await en.close();

  await browser.close();
  console.log('\nErrores de consola/red:', errors.length ? '\n  ' + [...new Set(errors)].join('\n  ') : 'ninguno');
  console.log(fails ? `\n${fails} prueba(s) fallida(s)` : '\nTodo bien');
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error('La prueba se rompió:', e); process.exit(2); });
