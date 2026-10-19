/* ============ megas-test.js — prueba de las habilidades de las 45 Megas ============
 * Juega unos segundos con cada Mega SIN movimientos (sólo la habilidad) y con
 * enemigos alrededor, y comprueba que no hay errores y que la habilidad hace
 * daño o su efecto. Mismos requisitos que tools/smoke.js.
 *   node tools/megas-test.js [http://127.0.0.1:8000/]
 */
const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8000/';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.G && G.DB && G.DB.save, { timeout: 20000 });
  await sleep(500);

  const ids = await page.evaluate(() => G.Megas.LIST.map(m => m.id));
  // Habilidades que sólo se notan en ciertas situaciones (golpear, ser golpeado, derrotar...).
  const PASSIVE = new Set(['mega_slowbro', 'mega_kangaskhan', 'mega_sableye', 'mega_mawile', 'mega_medicham', 'mega_scrafty', 'mega_drampa', 'mega_skarmory']);
  let fails = 0;
  for (const id of ids) {
    const before = errors.length;
    const r = await page.evaluate(async id => {
      const m = G.Megas.BY_ID[id], s = G.DB.save;
      G.DB.grant(m.dex, 'test'); s.partner = m.dex;
      s.megas[id] = { at: 1, from: 'test' }; s.partnerMega = true; s.partnerMegaId = id;
      G.UI.hideAll();
      G.Game.startRun(null, 'classic');
      const pl = G.Game.player;
      pl.moves = []; pl.slots = [[]]; pl.invuln = 9999;      // sin ataques propios y sin morir
      G.Game.debugSpeed(3);
      for (let w = 0; w < 3; w++) {
        G.Spawner.burst(10);
        for (const e of G.EnemyMgr.all()) { const a = Math.random() * 6.28, d = 40 + Math.random() * 90; e.x = pl.x + Math.cos(a) * d; e.y = pl.y + Math.sin(a) * d; }
        await new Promise(res => setTimeout(res, 1300));
      }
      const out = { skill: !!pl.skill, mega: pl.mega && pl.mega.id, dmg: Math.round(pl.dmgDealt), reduce: pl.dmgReduce, atkMul: +pl.atkMul.toFixed(2) };
      G.Game.debugSpeed(1);
      G.Game.quit();
      await new Promise(res => setTimeout(res, 300));
      const b = document.getElementById('btn-again'); if (b) b.click();
      return out;
    }, id);
    const newErr = errors.slice(before);
    const okDmg = r.dmg > 0 || PASSIVE.has(id);
    const good = r.skill && r.mega === id && okDmg && !newErr.length;
    if (!good) fails++;
    console.log(`${good ? 'OK   ' : 'FALLO'} ${id.padEnd(18)} daño de la habilidad: ${String(r.dmg).padStart(5)}  reducción: ${r.reduce.toFixed(2)}  ataque×${r.atkMul}${newErr.length ? '  ERRORES: ' + newErr.join(' | ') : ''}`);
  }
  await browser.close();
  console.log(fails ? `\n${fails} Mega(s) con problemas` : '\nLas ' + ids.length + ' Megas funcionan');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('La prueba se rompió:', e); process.exit(2); });
