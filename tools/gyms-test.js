/* ============ gyms-test.js — arranca los 81 desafíos de gimnasio ============
 * Para cada región: los 8 gimnasios y la Liga. Comprueba que empiezan sin
 * errores, que sólo salen Pokémon del tipo del líder y que el Pokémon estrella
 * aparece a su hora. Mismos requisitos que tools/smoke.js.
 *   node tools/gyms-test.js [http://127.0.0.1:8000/]
 */
const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8000/';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.G && G.DB && G.DB.save, { timeout: 20000 });
  await page.evaluate(() => { const s = G.DB.save; G.DB.grant(25, 'x'); s.partner = 25; s.tutDone = true; });
  const regions = await page.evaluate(() => G.GymData.REGIONS.map(r => r.id));
  let fails = 0;
  for (const region of regions) {
    const row = [];
    for (let idx = 0; idx <= 8; idx++) {
      const before = errors.length;
      const r = await page.evaluate(async (region, idx) => {
        G.UI.hideAll();
        G.Game.startRun(null, 'classic', { mode: 'gym', gym: { region, idx } });
        G.Game.player.invuln = 9999;
        const R = G.GymData.BY[region];
        const type = idx < 8 ? R.gyms[idx][1] : R.elite[0][1];
        const ace = idx < 8 ? R.gyms[idx][2] : R.elite[0][2];
        G.Spawner.burst(6);
        await new Promise(res => setTimeout(res, 150));
        const types = G.EnemyMgr.all().filter(e => !e.boss).map(e => (G.DEX_BY[e.dex] || {}).types || []);
        G.Gym.debugSkip(idx < 8 ? 421 : 151);
        // (Hasta 2 s: mientras se cargan los sprites nuevos, los fotogramas van más lentos.)
        let aceOut = false;
        for (let w = 0; w < 20 && !aceOut; w++) {
          await new Promise(res => setTimeout(res, 100));
          aceOut = G.EnemyMgr.all().some(e => e.boss && e.dex === ace);
        }
        const diag = aceOut ? '' : `estado=${G.Game.state} jefes=[${G.EnemyMgr.all().filter(e => e.boss).map(e => e.dex + (e.dead ? '†' : ''))}]`;
        G.Game.quit();
        await new Promise(res => setTimeout(res, 150));
        const b = document.getElementById('btn-again'); if (b) b.click();
        return { okType: types.every(t => t.includes(type)), n: types.length, aceOut, diag };
      }, region, idx);
      const good = r.okType && r.aceOut && errors.length === before;
      if (!good) { fails++; if (r.diag) console.log(`  ${region} ${idx + 1}: ${r.diag}`); }
      row.push((idx < 8 ? idx + 1 : 'L') + (good ? '✓' : '✗' + (r.okType ? '' : 'tipo') + (r.aceOut ? '' : 'estrella') + (errors.length > before ? 'err' : '')));
    }
    console.log(region.padEnd(8), row.join(' '));
  }
  await browser.close();
  if (errors.length) console.log('Errores:\n  ' + [...new Set(errors)].join('\n  '));
  console.log(fails ? `\n${fails} desafío(s) con problemas` : '\nLos 81 desafíos funcionan');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('La prueba se rompió:', e); process.exit(2); });
