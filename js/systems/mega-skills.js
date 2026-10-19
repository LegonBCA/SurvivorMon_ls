/* ============ mega-skills.js — habilidades de las Megas ============
 * Cada Mega tiene una habilidad pasiva hecha de "familias" reutilizables
 * (una o dos por Mega, con sus números). Lo que dice su descripción
 * (data/megas.js) es lo que hace aquí.
 *
 *   pulse     onda alrededor cada `cd` s (daño; puede ralentizar, quemar, envenenar, empujar)
 *   snipe     golpea directamente a los `n` enemigos más cercanos cada `cd` s
 *   shots     dispara `n` proyectiles a los más cercanos cada `cd` s (pueden atravesar)
 *   erupt     estallidos bajo `n` enemigos cercanos cada `cd` s
 *   pools     charcos que dañan a lo que los pisa (bajo tus pies o bajo un enemigo)
 *   shards    fragmentos que giran a tu alrededor y golpean al tocar
 *   storm     daño pequeño a todos los enemigos de la pantalla cada `cd` s
 *   cross     cuatro rayos en cruz cada `cd` s
 *   field     ralentiza siempre a los enemigos cercanos
 *   drain     daña a los cercanos y te cura una parte
 *   heal      te cura un % de la vida cada `cd` s
 *   stop      detiene (casi) a todos los enemigos de la pantalla un momento
 *   echo      cada golpe tuyo vuelve a golpear con un % de su fuerza
 *   splash    a veces un golpe tuyo estalla alrededor del enemigo
 *   thorns    al recibir daño lanzas púas alrededor
 *   reflect   a veces devuelves los disparos enemigos
 *   rage      con poca vida, más ataque
 *   moxie     cada enemigo derrotado sube el ataque un rato
 * Estáticas (al empezar): guard (menos daño recibido), atk, crit, spd,
 * levitate (inmune a líquidos y trampas), noWeak (sin debilidades), immune [tipos].
 *
 * Daño: base = (8 + nivel × 1,1) × ataque del Pokémon, por el `k` de cada
 * habilidad. Así crece con la partida como un movimiento, sin pasar de ser un
 * apoyo (≈ 0,2-0,4 × base por segundo en área, ≈ 0,7 sobre blancos sueltos).
 */
G.MegaSkills = (() => {
  const S = {
    // ---- las cinco primeras (ahora con daño que crece con la partida) ----
    mega_charizard_x: { pulse: { cd: 1.2, r: 85, k: 0.45, burn: 1 } },
    mega_gengar:      { field: { r: 110, slow: 0.4 }, pulse: { cd: 1.5, r: 110, k: 0.5 } },
    mega_lucario:     { pulse: { cd: 2.8, r: 130, k: 0.6, knock: 140, slow: 0.6, slowDur: 1.2, crit: true } },
    mega_mewtwo_y:    { snipe: { cd: 2.0, n: 5, r: 140, k: 0.55 } },
    mega_rayquaza:    { levitate: true, pulse: { cd: 3.0, r: 110, k: 0.5 } },
    // ---- las demás ----
    mega_alakazam:    { shots: { cd: 1.8, n: 3, k: 0.4, pierce: 2 } },
    mega_slowbro:     { guard: 0.3 },
    mega_kangaskhan:  { echo: { chance: 1, k: 0.3 } },
    mega_aerodactyl:  { pulse: { cd: 2.0, r: 100, k: 0.5, knock: 170 } },
    mega_steelix:     { shards: { n: 3, r: 70, k: 0.25, every: 0.5 } },
    mega_skarmory:    { guard: 0.1, thorns: { n: 8, k: 0.9 } },
    mega_houndoom:    { pulse: { cd: 1.5, r: 110, k: 0.4, burn: 2 } },
    mega_tyranitar:   { storm: { cd: 2.5, k: 0.22 } },
    mega_sceptile:    { immune: ['electric'], shots: { cd: 1.8, n: 2, k: 0.6 } },
    mega_gardevoir:   { pulse: { cd: 2.2, r: 120, k: 0.55 } },
    mega_sableye:     { reflect: { chance: 0.6, k: 1.0 } },
    mega_mawile:      { atk: 1.35 },
    mega_medicham:    { splash: { chance: 0.2, r: 55, k: 0.5 } },
    mega_manectric:   { guard: 0.2, pulse: { cd: 3.0, r: 90, k: 0.3, slow: 0.3, slowDur: 1 } },
    mega_sharpedo:    { snipe: { cd: 2.0, n: 1, r: 200, k: 1.6 } },
    mega_camerupt:    { erupt: { cd: 3.0, n: 3, r: 55, k: 0.7, burn: 1 } },
    mega_altaria:     { guard: 0.15, shots: { cd: 2.0, n: 2, k: 0.4 } },
    mega_banette:     { drain: { cd: 2.0, n: 3, r: 160, k: 0.45, heal: 0.15 } },
    mega_chimecho:    { pulse: { cd: 3.0, r: 140, k: 0.3, slow: 0.8, slowDur: 1.5 } },
    mega_absol:       { snipe: { cd: 1.6, n: 2, r: 170, k: 0.6, crit: true } },
    mega_glalie:      { field: { r: 70, slow: 0.85 }, pulse: { cd: 2.0, r: 70, k: 0.35 } },
    mega_latias:      { levitate: true, snipe: { cd: 1.8, n: 1, r: 220, k: 1.0, beam: true } },
    mega_latios:      { levitate: true, spd: 1.1, shots: { cd: 2.0, n: 3, k: 0.4 } },
    kyogre_primal:    { erupt: { cd: 3.0, n: 3, r: 60, k: 0.65 } },
    groudon_primal:   { pools: { cd: 2.5, at: 'self', r: 50, dur: 4, k: 0.25, burn: 1 } },
    mega_lopunny:     { snipe: { cd: 1.4, n: 3, r: 150, k: 0.35 } },
    mega_gallade:     { crit: 0.15, pulse: { cd: 2.0, r: 80, k: 0.5, crit: true } },
    dialga_primal:    { stop: { cd: 12, dur: 2, k: 0.3 } },
    mega_darkrai:     { drain: { cd: 3.0, n: 6, r: 150, k: 0.35, heal: 0.1, slow: 0.7, slowDur: 2 } },
    mega_excadrill:   { pulse: { cd: 1.4, r: 75, k: 0.6 } },
    mega_scrafty:     { moxie: { per: 0.02, max: 0.3, dur: 8 } },
    mega_eelektross:  { noWeak: true, snipe: { cd: 1.8, n: 2, r: 170, k: 0.6, beam: true } },
    mega_floette:     { heal: { cd: 8, pct: 0.04 }, pulse: { cd: 2.5, r: 120, k: 0.45 } },
    mega_dragalge:    { pools: { cd: 2.2, at: 'enemy', r: 55, dur: 5, k: 0.2, poison: 1 } },
    mega_hawlucha:    { pulse: { cd: 3.0, r: 120, k: 0.75, knock: 180, leap: true } },
    mega_zygarde:     { cross: { cd: 3.5, len: 260, w: 22, k: 0.7 } },
    mega_diancie:     { erupt: { cd: 3.0, n: 3, r: 50, k: 0.6 } },
    mega_drampa:      { rage: { below: 0.5, atk: 1.6 } },
    mega_zeraora:     { snipe: { cd: 1.4, n: 2, r: 160, k: 0.5 } },
    mega_tatsugiri:   { shots: { cd: 1.8, n: 3, k: 0.45 } }
  };

  let pools = [];
  function reset() { pools = []; }

  const power = pl => (8 + pl.level * 1.1) * pl.atk;
  const typeOf = pl => (pl.mega.types && pl.mega.types[0]) || pl.mon.types[0];
  const colOf = pl => pl.mega.auraColor || G.U.TYPE_COLOR[typeOf(pl)] || '#00e5ff';
  const alive = e => !e.dead && e.behavior !== 'thief';
  const near = (pl, r) => G.EnemyMgr.queryCircle(pl.x, pl.y, r).filter(alive);
  const closest = (pl, r, n) => near(pl, r).sort((a, b) => G.U.dist2(a.x, a.y, pl.x, pl.y) - G.U.dist2(b.x, b.y, pl.x, pl.y)).slice(0, n);

  /** Golpe de una habilidad a un enemigo (con estados). */
  function strike(pl, e, k, o = {}, col = colOf(pl)) {
    const d = power(pl) * k;
    e.hurt(d, col, e.x - pl.x, e.y - pl.y, o.knock || 0, o.crit ? 'crit' : null);
    pl.dmgDealt += d;
    if (o.slow) e.applySlow(o.slow, o.slowDur || 1.2);
    if (o.burn) e.applyBurn(o.burn);
    if (o.poison) e.applyPoison(o.poison);
  }

  /** Prepara la habilidad al empezar la partida (lo estático). → el estado de la habilidad. */
  function setup(pl, mega) {
    const d = S[mega.id];
    if (!d) return null;
    if (d.guard) pl.dmgReduce += d.guard;
    if (d.atk) pl.atkMul *= d.atk;
    if (d.spd) pl.spdMul *= d.spd;
    if (d.crit) pl.critChance += d.crit;
    // (Las de recarga larga se estrenan a los 3 s, no al final de la primera espera.)
    const t = {};
    for (const k of Object.keys(d)) if (d[k] && d[k].cd > 3) t[k] = d[k].cd - 3;
    return { def: d, t, moxie: 0, moxieT: 0, shardA: 0 };
  }

  const ready = (st, key, cd, dt) => { st.t[key] = (st.t[key] || 0) + dt; if (st.t[key] < cd) return false; st.t[key] = 0; return true; };

  /** Cada fotograma (desde Player.update). */
  function tick(pl, dt) {
    const st = pl.skill;
    if (!st) return;
    const d = st.def, col = colOf(pl), pal = typeOf(pl);
    pl.skillAtk = 1;

    if (d.field) for (const e of near(pl, d.field.r)) e.applySlow(d.field.slow, 0.5);

    if (d.pulse && ready(st, 'pulse', d.pulse.cd, dt)) {
      const p = d.pulse;
      if (p.leap) pl.anim.play('Attack', { speed: 1.3 });
      G.FX.ring(pl.x, pl.y, 6, p.r, col, 0.4, 3);
      for (const e of near(pl, p.r)) strike(pl, e, p.k, p, col);
    }

    if (d.snipe && ready(st, 'snipe', d.snipe.cd, dt)) {
      for (const e of closest(pl, d.snipe.r, d.snipe.n)) {
        if (d.snipe.beam) G.FX.beam(pl.x, pl.y - G.LIFT, Math.atan2(e.y - pl.y, e.x - pl.x), Math.hypot(e.x - pl.x, e.y - pl.y), 8, col, G.VFX.forType(pal));
        else G.FX.sp('impact', pal, e.x, e.y - e.bodyH * 0.5, { life: 0.2, scale: 1.4 });
        strike(pl, e, d.snipe.k, d.snipe, col);
      }
    }

    if (d.shots && ready(st, 'shots', d.shots.cd, dt)) {
      const tg = closest(pl, 420, d.shots.n);
      tg.forEach((e, i) => {
        const a = Math.atan2(e.y - pl.y, e.x - pl.x) + (tg.length === 1 ? 0 : (i - (tg.length - 1) / 2) * 0.12);
        G.Projectiles.spawn({ x: pl.x, y: pl.y, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, dmg: power(pl) * d.shots.k,
          r: 7, life: 1.6, pierce: d.shots.pierce || 0, hits: new Set(), color: col, mtype: pal, vis: G.VFX.forType(pal) });
      });
    }

    if (d.erupt && ready(st, 'erupt', d.erupt.cd, dt)) {
      for (const tg of closest(pl, 300, d.erupt.n)) {
        const x = tg.x, y = tg.y;
        G.FX.ring(x, y, 4, d.erupt.r, col, 0.35, 3);
        G.FX.burst(x, y - 6, col, 10, 110);
        for (const e of G.EnemyMgr.queryCircle(x, y, d.erupt.r).filter(alive)) strike(pl, e, d.erupt.k, d.erupt, col);
      }
    }

    if (d.pools && ready(st, 'pools', d.pools.cd, dt)) {
      const at = d.pools.at === 'self' ? pl : closest(pl, 260, 1)[0];
      if (at) pools.push({ x: at.x, y: at.y, r: d.pools.r, t: d.pools.dur, tick: 0, k: d.pools.k, o: d.pools, col, pl });
    }

    if (d.shards) {
      st.shardA += dt * 3.2;
      const sh = d.shards, hit = ready(st, 'shards', sh.every, dt);
      for (let i = 0; i < sh.n; i++) {
        const a = st.shardA + i * 6.2832 / sh.n, x = pl.x + Math.cos(a) * sh.r, y = pl.y + Math.sin(a) * sh.r * 0.7;
        if (Math.random() < dt * 20) G.FX.sp('shard', pal, x, y - G.LIFT, { life: 0.12, scale: 1 });
        if (hit) for (const e of G.EnemyMgr.queryCircle(x, y, 22).filter(alive)) strike(pl, e, sh.k, {}, col);
      }
    }

    if (d.storm && ready(st, 'storm', d.storm.cd, dt)) {
      for (const e of G.EnemyMgr.all()) if (alive(e) && G.Camera.sees(e.x, e.y, 0)) {
        strike(pl, e, d.storm.k, {}, col);
        if (Math.random() < 0.3) G.FX.burst(e.x, e.y - 8, col, 3, 60);
      }
    }

    if (d.cross && ready(st, 'cross', d.cross.cd, dt)) {
      const c = d.cross;
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        G.FX.beam(pl.x, pl.y - G.LIFT, a, c.len, c.w, col, G.VFX.forType(pal));
        const ex = pl.x + Math.cos(a) * c.len, ey = pl.y + Math.sin(a) * c.len;
        for (const e of G.EnemyMgr.queryCircle((pl.x + ex) / 2, (pl.y + ey) / 2, c.len / 2 + c.w).filter(alive)) {
          if (segDist2(pl.x, pl.y, ex, ey, e.x, e.y) <= (c.w + e.r) * (c.w + e.r)) strike(pl, e, c.k, {}, col);
        }
      }
    }

    if (d.drain && ready(st, 'drain', d.drain.cd, dt)) {
      let got = 0;
      for (const e of closest(pl, d.drain.r, d.drain.n)) {
        strike(pl, e, d.drain.k, d.drain, col);
        got += power(pl) * d.drain.k;
        G.FX.burst(e.x, e.y - 8, col, 4, 70);
      }
      if (got) pl.heal(Math.min(pl.maxHp * 0.03, got * d.drain.heal));
    }

    if (d.heal && ready(st, 'heal', d.heal.cd, dt) && pl.hp < pl.maxHp) {
      pl.heal(pl.maxHp * d.heal.pct);
      G.FX.ring(pl.x, pl.y, 6, 60, '#5fe08a', 0.5, 3);
    }

    if (d.stop && ready(st, 'stop', d.stop.cd, dt)) {
      G.Game.flash('#b8c4ff', 0.35);
      for (const e of G.EnemyMgr.all()) if (alive(e) && G.Camera.sees(e.x, e.y, 0)) {
        e.applySlow(0.95, d.stop.dur);
        strike(pl, e, d.stop.k, {}, col);
      }
    }

    if (d.rage && pl.hp < pl.maxHp * d.rage.below) {
      pl.skillAtk *= d.rage.atk;
      if (Math.random() < dt * 6) G.FX.burst(pl.x, pl.y - pl.bodyH * 0.5, '#ff5f3d', 2, 60);
    }

    if (d.moxie && st.moxie > 0) {
      if ((st.moxieT -= dt) <= 0) st.moxie = 0;
      pl.skillAtk *= 1 + st.moxie;
    }

    if (d.levitate) pl.slowT = 0;
  }

  /** Charcos (cada fotograma, también fuera de Player.update para que se acaben). */
  function update(dt) {
    for (let i = pools.length - 1; i >= 0; i--) {
      const p = pools[i];
      p.t -= dt; p.tick -= dt;
      if (p.t <= 0) { pools.splice(i, 1); continue; }
      if (p.tick <= 0) {
        p.tick = 0.5;
        for (const e of G.EnemyMgr.queryCircle(p.x, p.y, p.r).filter(alive)) strike(p.pl, e, p.k, p.o, p.col);
      }
    }
  }

  function draw(ctx) {
    for (const p of pools) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.t) * 0.38;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.55, 0, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    }
  }

  function segDist2(ax, ay, bx, by, cx, cy) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? ((cx - ax) * dx + (cy - ay) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = ax + dx * t - cx, qy = ay + dy * t - cy;
    return qx * qx + qy * qy;
  }

  // ---------------- ganchos ----------------

  /** Daño que vas a recibir (inmunidades). → el daño final. */
  function incoming(pl, amount, type) {
    const d = pl.skill && pl.skill.def;
    if (d && d.immune && type && d.immune.includes(type)) return 0;
    return amount;
  }
  /** ¿Sin debilidades? (Player.hurt limita la tabla de tipos a ×1). */
  const noWeak = pl => !!(pl.skill && pl.skill.def.noWeak);
  const levitates = pl => !!(pl.skill && pl.skill.def.levitate);

  /** Has recibido un golpe (y sigues en pie). */
  function hurt(pl) {
    const th = pl.skill && pl.skill.def.thorns;
    if (!th) return;
    const col = colOf(pl), pal = typeOf(pl);
    for (let i = 0; i < th.n; i++) {
      const a = i * 6.2832 / th.n;
      G.Projectiles.spawn({ x: pl.x, y: pl.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, dmg: power(pl) * th.k,
        r: 6, life: 0.7, hits: new Set(), color: col, mtype: pal, vis: { proj: 'needle', pal } });
    }
  }

  /** Has golpeado a un enemigo con un movimiento. */
  function hit(pl, e, dmg) {
    const d = pl.skill && pl.skill.def;
    if (!d || e.dead) return;
    if (d.echo && Math.random() < d.echo.chance) {
      e.hurt(dmg * d.echo.k, colOf(pl), 0, 0, 0, null);
      pl.dmgDealt += dmg * d.echo.k;
    }
    if (d.splash && Math.random() < d.splash.chance) {
      G.FX.ring(e.x, e.y, 4, d.splash.r, colOf(pl), 0.3, 3);
      for (const o of G.EnemyMgr.queryCircle(e.x, e.y, d.splash.r).filter(alive)) if (o !== e) strike(pl, o, d.splash.k);
    }
  }

  /** Has derrotado a un enemigo. */
  function kill(pl) {
    const d = pl.skill && pl.skill.def;
    if (!d || !d.moxie) return;
    pl.skill.moxie = Math.min(d.moxie.max, pl.skill.moxie + d.moxie.per);
    pl.skill.moxieT = d.moxie.dur;
  }

  /** Un disparo enemigo te alcanza: ¿lo devuelves? (true = no te daña). */
  function reflect(pl, p) {
    const r = pl.skill && pl.skill.def.reflect;
    if (!r || Math.random() >= r.chance) return false;
    const pal = typeOf(pl);
    G.Projectiles.spawn({ x: p.x, y: p.y, vx: -p.vx * 1.4, vy: -p.vy * 1.4, dmg: power(pl) * r.k,
      r: p.r, life: 1.2, hits: new Set(), color: colOf(pl), mtype: pal, vis: G.VFX.forType(pal) });
    G.FX.ring(p.x, p.y, 3, 22, colOf(pl), 0.25, 2);
    return true;
  }

  return { SKILLS: S, setup, tick, update, draw, reset, incoming, noWeak, levitates, hurt, hit, kill, reflect, power };
})();
