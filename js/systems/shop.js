/* ============ shop.js — la Tienda Kecleon (a mitad de partida) ============
 * Una vez por partida, entre los minutos 6 y 24 (nunca con un jefe vivo, en la
 * grieta ni ante Arceus), llega Kecleon y se queda 25 s. Si te acercas, abre
 * su tienda: la partida se para y eliges entre 3 ofertas al azar.
 *
 * Se paga con las MONEDAS DE ESTA PARTIDA (pl.coins): lo que gastas aquí no
 * te lo llevas al acabar, así que la tienda no infla la economía.
 * Sólo en solitario (en grupo no sale).
 */
G.Shop = (() => {
  const $ = id => document.getElementById(id);
  const DEX = 352, STAY = 25, WINDOW = [360, 1440];

  // Ofertas: precio base (sube con el minuto de la partida) y qué hacen.
  const OFFERS = [
    { id: 'heal', ico: '🍊', name: 'Baya Aranja grande', desc: 'Recuperas la mitad de tu vida.', price: 30,
      can: pl => pl.hp < pl.maxHp, buy: pl => { pl.heal(pl.maxHp * 0.5); } },
    { id: 'regen', ico: '🍋', name: 'Baya Zidra', desc: 'Regeneras vida durante 30 segundos.', price: 40,
      buy: pl => { pl.addBuff('regen', Math.max(1, pl.maxHp * 0.02), 30, 1); } },
    { id: 'reroll', ico: '🔄', name: 'Tarjeta Cambio', desc: 'Un cambio de cartas más al subir de nivel.', price: 25,
      buy: pl => { pl.rerollBonus = (pl.rerollBonus || 0) + 1; } },
    { id: 'atk', ico: '💪', name: 'Proteína', desc: '+6% de ataque el resto de la partida.', price: 60,
      buy: pl => { pl.atkMul *= 1.06; } },
    { id: 'item', ico: '🎒', name: 'Objeto sorpresa', desc: 'Un objeto equipable al azar (eliges si te lo pones).', price: 70,
      buy: (pl, o) => { later = o.item; } }
  ];

  let kec = null;        // { x, y, t, anim, r, open }
  let when = 0, done = false, offers = [], bought = new Set(), resume = null, later = null, prevMusic = null;

  function reset() {
    kec = null; done = false; offers = []; bought = new Set(); resume = null; later = null;
    when = G.U.rand(WINDOW[0], WINDOW[1]);
    close(true);
  }

  const priceOf = (o, t) => Math.round(o.price * (1 + t / 900));

  function update(dt, pl, time) {
    if (!pl || G.Coop.active) return;
    if (kec) {
      kec.anim.update(dt);
      kec.anim.loop('Idle');
      kec.t -= dt;
      if (kec.t <= 0) { leave('Kecleon se ha ido a otra mazmorra…'); return; }
      if (!pl.dead && G.U.dist2(pl.x, pl.y, kec.x, kec.y) < (pl.r + kec.r + 22) ** 2) open(pl, time);
      return;
    }
    if (done || time < when || G.Rift.inArena || G.Judgment.active || G.EnemyMgr.bossAlive()) return;
    spawn(pl);
  }

  function spawn(pl) {
    if (!G.SPRITE_META[DEX]) { done = true; return; }
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * 6.2832, d = G.U.rand(160, 230);
      const x = pl.x + Math.cos(a) * d, y = pl.y + Math.sin(a) * d * 0.8;
      if (!G.World.isFree(x, y, 18)) continue;
      G.Sprites.preload([DEX]);
      kec = { x, y, t: STAY, anim: new G.Sprites.Animator(DEX, 1), r: G.Sprites.bodyRadius(DEX) };
      done = true;
      G.FX.ring(x, y, 4, 44, '#7ee0a0', 0.5, 3);
      G.Spawner.say('¡Ha llegado Kecleon con su tienda! Acércate para comprar', 3.4, true);
      G.Audio.sfx('shiny');
      return;
    }
  }

  function leave(msg) {
    if (!kec) return;
    G.FX.burst(kec.x, kec.y - 10, '#7ee0a0', 14, 120);
    if (msg) G.Spawner.say(msg, 2.6, true);
    kec = null;
  }

  // ---------------- la tienda ----------------

  function open(pl, time) {
    if (kec.open) return;
    resume = G.Game.hold();
    if (!resume) return;                         // sólo con la partida en marcha
    kec.open = true;
    const pool = OFFERS.filter(o => !o.can || o.can(pl));
    offers = G.U.pickN(pool, 3).map(o => Object.assign({}, o, { cost: priceOf(o, time), item: o.id === 'item' ? G.Items.roll(pl.item) : null }));
    prevMusic = G.Audio.track;
    G.Audio.music('shop');
    G.Audio.sfx('confirm');
    render(pl);
    $('scr-shop').classList.remove('hidden');
  }

  function render(pl) {
    $('shop-face').innerHTML = G.UI.portrait(DEX, 'Happy', 56);
    $('shop-coins').innerHTML = `<span class="coin"></span> ${pl.coins}`;
    const box = $('shop-offers');
    box.innerHTML = '';
    offers.forEach((o, i) => {
      const own = bought.has(i), poor = pl.coins < o.cost;
      const c = document.createElement('div');
      c.className = 'card shop-offer' + (own ? ' sold' : poor ? ' poor' : '');
      const extra = o.item ? `<small class="gold">${G.Items.BY[o.item].name}: ${G.Items.BY[o.item].desc}</small>` : '';
      c.innerHTML = `<div class="shop-ico">${o.ico}</div>
        <div class="txt"><div class="nm">${o.name}</div><div class="ds">${o.desc}</div>${extra}</div>
        <button class="btn small ${own || poor ? '' : 'gold'}" ${own || poor ? 'disabled' : ''}>${own ? 'Comprado' : `<span class="coin"></span> ${o.cost}`}</button>`;
      c.querySelector('button').onclick = e => { e.stopPropagation(); buy(pl, i); };
      box.appendChild(c);
    });
  }

  function buy(pl, i) {
    const o = offers[i];
    if (!o || bought.has(i) || pl.coins < o.cost) return;
    pl.coins -= o.cost;
    bought.add(i);
    o.buy(pl, o);
    G.Audio.sfx('buy');
    G.FX.ring(pl.x, pl.y, 6, 60, '#ffd23f', 0.4, 3);
    render(pl);
  }

  /** Cierra la tienda (Salir o al acabar la partida). */
  function close(silent = false) {
    const el = $('scr-shop');
    if (el) el.classList.add('hidden');
    if (silent) return;
    if (kec) { kec.open = false; leave('¡Gracias por tu compra! ¡Vuelve pronto!'); }
    if (resume) { resume(); resume = null; }
    if (prevMusic) G.Audio.music(prevMusic);
    prevMusic = null;
    if (later) { const id = later; later = null; G.Game.offerItem(id); }
  }

  const isOpen = () => { const el = $('scr-shop'); return !!el && !el.classList.contains('hidden'); };

  // ---------------- dibujo ----------------

  function drawables() {
    if (!kec) return [];
    const K = kec, now = performance.now() / 1000;
    return [{
      y: K.y,
      draw(ctx) {
        // Alfombra de la tienda bajo Kecleon.
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#2f8f5b';
        ctx.beginPath(); ctx.ellipse(K.x, K.y + 2, 34, 15, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(K.x, K.y + 2, 34, 15, 0, 0, 6.2832); ctx.stroke();
        ctx.restore();
        G.Sprites.drawShadow(ctx, DEX, K.x, K.y, 1);
        K.anim.draw(ctx, K.x, K.y);
        const h = G.Sprites.bodyHeight(DEX, 1);
        const by = K.y - h - 2 - Math.abs(Math.sin(now * 4)) * 4;
        ctx.save();
        ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('🛒', K.x, by);
        ctx.restore();
      }
    }];
  }

  /** Flecha en el borde hacia Kecleon (con los segundos que le quedan). */
  function drawHud(ctx, w, h, pl, F, edgeArrow) {
    if (kec && !kec.open) edgeArrow(ctx, w, h, G.Camera, kec.x, kec.y - 10, '#7ee0a0', 'Kecleon · ' + Math.ceil(kec.t) + ' s', F);
  }

  function init() {
    $('shop-close').onclick = () => close();
  }

  return { init, reset, update, drawables, drawHud, close, get isOpen() { return isOpen(); }, get here() { return !!kec; },
           /** Para pruebas: que llegue ya. */ debugSpawn() { done = false; when = 0; },
           _dbg() { return kec && { x: kec.x, y: kec.y, t: kec.t, open: !!kec.open }; } };
})();
