/* ============ gym.js — Desafío de Gimnasios (la partida) ============
 * Una partida en modo 'gym' (G.Game.runCfg.mode) contra un gimnasio o la Liga
 * de una región (data/gyms.js):
 *   gimnasio  ~7 min: sólo salen Pokémon del tipo del líder y de su región; a
 *             los 2:30 y a los 5:00 saca a sus ayudantes y a los 7:00 a su
 *             Pokémon estrella. Si lo derrotas, ganas la medalla.
 *   Liga      5 combates seguidos (Alto Mando + Campeón): cada rival saca a su
 *             Pokémon estrella a los 2:30; al derrotarlo, el siguiente (y
 *             recuperas el 40% de la vida).
 * Sin grietas, Sentencia de Arceus, eventos, tienda ni clima al azar: el suelo
 * es la arena del tipo y el clima, el suyo (Fuego → sol...).
 * Dificultad: gimnasio 1 ×0,75 … gimnasio 8 ×1,45; Liga ×1,2 … ×1,5 y el Campeón ×1,7.
 * Premios sólo la primera vez (la medalla no da poder): ver grant().
 */
G.Gym = (() => {
  // Liga: cada rival saca a su estrella a los 2:30 de su combate (antes 1:20: el
  // primero llegaba con ~12.000 PS cuando tu Pokémon apenas había subido de nivel).
  const LT = [150, 300], ACE = 420, LEAGUE_ACE = 150, END_DELAY = 2.6;
  const WEATHER = { fire: 'sun', water: 'rain', ice: 'snow', rock: 'sand', ground: 'sand', ghost: 'fog', psychic: 'fog' };
  let st = null;

  /** Pokémon del tipo y la región (si hay pocos, también de las generaciones vecinas). */
  function poolFor(type, gen) {
    const ok = p => p.rarity < 5 && !p.leg && G.SPRITE_META[p.dex] && (!type || p.types.includes(type));
    let list = G.DEX.filter(p => ok(p) && p.gen === gen);
    for (let d = 1; list.length < 6 && d < 9; d++) list = G.DEX.filter(p => ok(p) && Math.abs(p.gen - gen) <= d);
    return G.U.pickN(list, Math.min(14, list.length)).map(p => p.dex);
  }

  function stagesOf(R, idx) {
    if (idx < 8) {
      const [who, type, ace, team, medal] = R.gyms[idx];
      return [{ who, type, ace, medal, events: [{ at: LT[0], dex: team[0], kind: 'lt' }, { at: LT[1], dex: team[1], kind: 'lt' }, { at: ACE, dex: ace, kind: 'ace' }] }];
    }
    return R.elite.map(([who, type, ace]) => ({ who, type, ace }))
      .concat([{ who: R.champion[0], type: null, ace: R.champion[2], champ: true }])
      .map(s => Object.assign(s, { events: [{ at: LEAGUE_ACE, dex: s.ace, kind: 'ace' }] }));
  }

  /** Empieza el desafío (desde Game.startRun). cfg = { region, idx } (idx 8 = Liga) */
  function start(cfg) {
    const R = cfg && G.GymData.BY[cfg.region];
    if (!R) { st = null; return; }
    st = { cfg, R, stages: stagesOf(R, cfg.idx), i: 0, t: 0, pool: [], ace: null, won: false, endT: 0, league: cfg.idx >= 8 };
    beginStage();
  }
  function stop() { st = null; }

  const stage = () => st && st.stages[st.i];
  const typeOf = S => S.type || (G.DEX_BY[S.ace] || { types: ['normal'] }).types[0];
  // Gimnasio 1 ×0,75 … 8 ×1,45 · Liga: rival 1 ×1,2 … 4 ×1,5 y el Campeón ×1,7.
  function k() {
    if (!st) return 1;
    return st.league ? (stage().champ ? 1.7 : 1.2 + 0.1 * st.i) : 0.75 + 0.1 * st.cfg.idx;
  }

  function beginStage() {
    const S = stage();
    st.t = 0; st.ace = null;
    S.events.forEach(e => { e.spawned = false; });
    st.pool = poolFor(S.type, st.R.gen);
    G.Sprites.preload(st.pool.concat(S.events.map(e => e.dex)));
    const type = typeOf(S);
    G.World.setBiome(G.Tiles.arenaBiome(type), true);
    G.Weather.reset();
    if (WEATHER[type]) G.Weather.force(WEATHER[type], 9999);
    const title = st.league ? (S.champ ? '¡Combate final contra ' + S.who + ', Campeón de ' + st.R.name + '!' : 'Alto Mando: ¡' + S.who + '!')
                            : '¡Gimnasio de ' + S.who + '! Tipo ' + G.U.TYPE_NAME[S.type];
    G.Spawner.say(title, 3.4, true);
  }

  /** Jefe del desafío: ayudante (franja 1, menos vida) o Pokémon estrella. */
  function spawnBoss(ev, S) {
    const p = G.DEX_BY[ev.dex];
    if (!p) return;
    const slots = G.Enemies.BOSS_SLOTS;
    // Franja de jefe: gimnasios 1-2 la 2.ª, 3-5 la 3.ª, 6-8 la 3.ª con más ×k; Liga: rivales
    // 1-2 la 1.ª, 3-4 la 2.ª y el Campeón la 3.ª (el reloj de la partida ya los hace crecer).
    const slot = ev.kind === 'lt' ? slots[0]
               : st.league ? slots[S.champ ? 2 : st.i < 2 ? 0 : 1]
               : slots[Math.min(2, Math.floor(st.cfg.idx / 3) + 1)];
    const def = G.Enemies.bossDef(p, slot, ev.kind === 'lt' ? 0.6 : st.league ? 1 : 0.9);
    const kk = k();
    def.hp = Math.round(def.hp * kk); def.dmg = Math.round(def.dmg * kk); def.shotDmg = Math.round(def.shotDmg * kk);
    const e = G.Spawner.spawnBossDef(def);
    if (!e) return;
    if (ev.kind === 'ace') st.ace = e;
    G.Spawner.say(ev.kind === 'ace' ? '¡' + S.who + ' saca a su Pokémon estrella: ' + p.name + '!' : '¡' + S.who + ' saca a ' + p.name + '!', 3.2, true);
  }

  function update(dt) {
    if (!st) return;
    if (st.endT > 0) { if ((st.endT -= dt) <= 0) G.Game.finishGym(); return; }
    st.t += dt;
    const S = stage();
    for (const ev of S.events) if (!ev.spawned && st.t >= ev.at) { ev.spawned = true; spawnBoss(ev, S); }
    if (st.ace && st.ace.dead) clear();
  }

  /** Has derrotado al Pokémon estrella: medalla / siguiente rival / Campeón. */
  function clear() {
    const S = stage(), pl = G.Game.player;
    st.ace = null;
    G.Audio.sfx('legend');
    G.Game.flash('#ffe08a', 0.6);
    if (st.i < st.stages.length - 1) {
      st.i++;
      if (pl && !pl.dead) pl.heal(pl.maxHp * 0.4);
      G.EnemyMgr.clear();
      beginStage();
      return;
    }
    st.won = true;
    st.endT = END_DELAY;
    G.EnemyMgr.clear();
    G.Spawner.say(st.league ? '¡Eres el Campeón de ' + st.R.name + '!' : '¡Has ganado la Medalla ' + S.medal + '!', END_DELAY, true);
    if (pl) G.UI.speech(pl.dex, 'Happy', st.league ? '¡Lo hemos conseguido!' : '¡Una medalla más!', 2600);
  }

  /** Enemigos normales del desafío (los usa G.Enemies.bagAt). */
  function bag(t) { return st && st.pool.length ? G.Enemies.poolDefs(st.pool, t) : null; }

  /** Cómo ha ido (al acabar la partida). */
  function result() {
    if (!st) return null;
    const S = st.stages[st.stages.length - 1];
    return { won: st.won, region: st.cfg.region, idx: st.cfg.idx, league: st.league, medal: S.medal, who: S.who,
             regionName: st.R.name, reached: st.i + 1, total: st.stages.length };
  }

  /** Premios de la PRIMERA victoria (medalla o Liga). → { first, reward } */
  function grant(res) {
    const s = G.DB.save;
    if (!s || !res || !res.won) return { first: false };
    s.gyms = s.gyms || {};
    const g = s.gyms[res.region] = s.gyms[res.region] || { medals: {}, champ: 0 };
    g.medals = g.medals || {};
    let first, reward;
    if (res.league) { first = !g.champ; if (first) g.champ = Date.now(); reward = { coins: 2000, t10: 3 }; }
    else { first = !g.medals[res.idx + 1]; if (first) g.medals[res.idx + 1] = Date.now(); reward = { coins: 300 + 100 * res.idx, t1: 2, t10: res.idx === 7 ? 1 : 0 }; }
    if (first) G.Progress.grant(reward);
    G.Progress.checkAch();
    return { first, reward: first ? reward : null };
  }

  /** Medallas de una región (1-8 → fecha) y si es Campeón. */
  function progress(region) {
    const g = (G.DB.save && G.DB.save.gyms && G.DB.save.gyms[region]) || {};
    const medals = g.medals || {};
    return { medals, count: Object.keys(medals).filter(n => medals[n]).length, champ: !!g.champ };
  }

  /** Lo que se ve arriba: el gimnasio y cuándo sale el Pokémon estrella. */
  function drawHud(ctx, w, h, pl, F) {
    if (!st || st.endT > 0) return;
    const S = stage();
    const ace = S.events.find(e => e.kind === 'ace');
    const left = ace && !ace.spawned ? Math.max(0, Math.ceil(ace.at - st.t)) : 0;
    const txt = (st.league ? (S.champ ? 'CAMPEÓN ' : 'ALTO MANDO ') + S.who.toUpperCase() + ' · ' + (st.i + 1) + '/' + st.stages.length
                           : 'GIMNASIO DE ' + S.who.toUpperCase()) + (left ? ' · ESTRELLA EN ' + G.U.mmss(left) : '');
    ctx.save();
    ctx.font = F(800, 12); ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.8)';
    ctx.strokeText(txt, w / 2, 112);
    ctx.fillStyle = G.U.TYPE_COLOR[typeOf(S)] || '#ffd23f';
    ctx.fillText(txt, w / 2, 112);
    ctx.restore();
  }

  return { start, stop, update, bag, result, grant, progress, drawHud, poolFor,
           get active() { return !!st; }, get k() { return k(); }, get won() { return !!(st && st.won); },
           get music() { return st && st.ace && !st.ace.dead ? 'boss' : 'gym'; },
           /** Para pruebas: salta el reloj del combate. */ debugSkip(t) { if (st) st.t = t; } };
})();
