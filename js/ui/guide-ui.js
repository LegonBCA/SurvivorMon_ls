/* ============ guide-ui.js — glosario y tutorial de la primera partida ============
 *   G.GuideUI   ventana "Guía" (botón ? arriba y en la pausa): qué es cada cosa
 *   G.Tutorial  bocadillos en la primera partida (moverse, atacar, cartas...);
 *               no paran el juego, se pueden saltar y se repiten desde Ajustes.
 *               save.tutDone = true cuando se termina o se salta.
 */
G.GuideUI = (() => {
  const $ = G.UI.$;
  // [icono, título es, texto es, título en, texto en] (cada texto ya en su idioma: translate="no")
  const ENTRIES = [
    ['🎮', 'Moverse y atacar', 'Te mueves con WASD o las flechas (en móvil, arrastrando el dedo). Tu Pokémon ataca solo al enemigo más cercano con su movimiento <b>activo</b>: cámbialo con 1-4, Q/E o tocando su icono abajo. Tienes hasta 4 huecos.',
      'Moving and attacking', 'Move with WASD or the arrow keys (on mobile, drag your finger). Your Pokémon attacks the closest enemy by itself with its <b>active</b> move: switch it with 1-4, Q/E or by tapping its icon at the bottom. You have up to 4 slots.'],
    ['⭐', 'Subir de nivel', 'Los enemigos sueltan cristales de experiencia. Al subir de nivel eliges una de 3 cartas: un movimiento nuevo o mejorar uno. Con R cambias las cartas (pocas veces por partida). Al nivel máximo, algunos movimientos <b>evolucionan</b>.',
      'Leveling up', 'Enemies drop experience crystals. When you level up you pick one of 3 cards: a new move or an upgrade. Press R to reroll the cards (a few times per run). At max level, some moves <b>evolve</b>.'],
    ['🎒', 'Objetos', 'Llevas un objeto a la vez (Restos, Cinta Elección...). Los sueltan los jefes y los cofres con candado. Si encuentras otro, eliges con cuál te quedas.',
      'Items', 'You hold one item at a time (Leftovers, Choice Band...). Bosses and locked chests drop them. If you find another, you choose which one to keep.'],
    ['👑', 'Jefes', 'Cada 3 minutos aparece un Pokémon jefe muy fuerte. Mientras vive salen menos enemigos, para que puedas centrarte en él.',
      'Bosses', 'Every 3 minutes a very strong boss Pokémon appears. While it lives fewer enemies spawn, so you can focus on it.'],
    ['🌀', 'Grietas', 'A veces se abre una grieta: si entras, luchas contra un <b>legendario</b> en una arena aparte. Si ganas, tickets, monedas y un <b>vínculo</b>; si pierdes, vuelves sin premio y la partida sigue.',
      'Rifts', 'Sometimes a rift opens: step in to fight a <b>legendary</b> in a separate arena. Win and you get tickets, coins and a <b>bond</b>; lose and you come back with no prize, and the run goes on.'],
    ['🔗', 'Vínculos', 'Cada legendario vencido te da un vínculo: fusiona movimientos para lanzarlos a la vez desde un solo hueco (hasta 4).',
      'Bonds', 'Every legendary you defeat gives you a bond: fuse moves to cast them together from a single slot (up to 4).'],
    ['🗺️', 'Biomas y mapas', 'Cada 4 minutos cambia el bioma. Cada mapa tiene sus 3 biomas y su clima propio; los enemigos y las reglas son los mismos.',
      'Biomes and maps', 'The biome changes every 4 minutes. Each map has its own 3 biomes and weather; enemies and rules are the same.'],
    ['⛅', 'Climas', 'Sol: Fuego ×1,5 y Agua ×0,5 · Lluvia: Agua ×1,5, Eléctrico ×1,2 y Fuego ×0,5 · Arena: Roca, Tierra y Acero ×1,3 · Nieve: Hielo ×1,5 · Niebla: Fantasma, Hada y Psíquico ×1,3. Afecta a ti y a los enemigos.',
      'Weather', 'Sun: Fire ×1.5 and Water ×0.5 · Rain: Water ×1.5, Electric ×1.2 and Fire ×0.5 · Sand: Rock, Ground and Steel ×1.3 · Snow: Ice ×1.5 · Fog: Ghost, Fairy and Psychic ×1.3. It affects you and the enemies.'],
    ['⚔️', 'Tabla de tipos', 'Como en los juegos: un ataque de Agua le quita más a un Pokémon de Fuego ("¡Es muy eficaz!") y menos a uno de Planta.',
      'Type chart', 'Just like the games: a Water attack hurts a Fire Pokémon more ("It\'s super effective!") and a Grass one less.'],
    ['🗿', 'Objetos del mapa', 'Las rocas, la hierba alta y los cofres se rompen. Los <b>altares</b> dan un poder 25 s, los <b>manantiales</b> curan, los <b>cofres con candado</b> se abren quedándote a su lado y las <b>trampas</b> dañan también a los enemigos. El agua frena y la lava quema.',
      'Map objects', 'Rocks, tall grass and chests break. <b>Altars</b> give a 25 s power, <b>springs</b> heal, <b>locked chests</b> open if you stay next to them and <b>traps</b> hurt enemies too. Water slows you down and lava burns.'],
    ['🎉', 'Eventos', 'Cada pocos minutos: <b>horda</b> de un tipo, <b>hora dorada</b> (doble experiencia) o un <b>Pokémon perdido</b> que hay que llevar a la marca. A veces pasa un Meowth o un Gholdengo cargado de premios: ¡atrápalo antes de que huya!',
      'Events', 'Every few minutes: a <b>horde</b> of one type, a <b>golden hour</b> (double experience) or a <b>lost Pokémon</b> to bring to the marker. Sometimes a Meowth or a Gholdengo full of prizes runs by: catch it before it escapes!'],
    ['✨', 'Shinies', 'Cada enemigo tiene 1 entre 4.096 de ser shiny: brilla y una flecha te dice dónde está. Si lo derrotas, es tuyo. En el gacha sale shiny 1 de cada 100 tiradas.',
      'Shinies', 'Every enemy has a 1 in 4,096 chance of being shiny: it sparkles and an arrow shows where it is. Defeat it and it\'s yours. In the gacha, 1 in 100 pulls is shiny.'],
    ['⚡', 'La Sentencia de Arceus', 'En el minuto 30, Arceus te lleva a las Ruinas del Juicio: es invencible y cada 5 s llega un legendario más fuerte. Lo que aguantes allí te da <b>Mega-Tickets</b>.',
      'The Judgment of Arceus', 'At minute 30, Arceus takes you to the Ruins of Judgment: it is invincible and a stronger legendary arrives every 5 s. How long you last there earns you <b>Mega Tickets</b>.'],
    ['🎟️', 'Tickets y gacha', 'Los tickets ×1 y ×10 se ganan jugando y se gastan en el gacha de cada región. Los Mega-Tickets, en el Sagrario Mega.',
      'Tickets and gacha', '×1 and ×10 tickets are earned by playing and spent in each region\'s gacha. Mega Tickets go to the Mega Sanctuary.'],
    ['🧬', 'Megas', 'Consigue la Megapiedra en el Sagrario Mega y elige la forma Mega de tu compañero en el menú. Cada Mega tiene más fuerza y una habilidad propia.',
      'Megas', 'Get the Mega Stone in the Mega Sanctuary and pick your partner\'s Mega form in the menu. Each Mega is stronger and has its own ability.'],
    ['📈', 'Mejoras', 'Con las Pokémonedas compras mejoras permanentes para cada Pokémon (vida, ataque, recarga...). Son de ese Pokémon, no de la cuenta.',
      'Upgrades', 'With PokéCoins you buy permanent upgrades for each Pokémon (HP, attack, cooldown...). They belong to that Pokémon, not to your account.'],
    ['🏅', 'Misiones, logros y récords', '3 misiones diarias y 2 semanales dan tickets y monedas. Los logros dan medallas y títulos. En Récords ves tus mejores marcas por mapa y por Pokémon.',
      'Missions, achievements and records', '3 daily and 2 weekly missions give tickets and coins. Achievements give medals and titles. Records shows your best marks by map and by Pokémon.'],
    ['💾', 'Tu partida', 'Se guarda sola en este navegador. Descárgala de vez en cuando en Ajustes > Partida: si el navegador borra sus datos, es tu copia.',
      'Your save', 'It saves by itself in this browser. Download it now and then in Settings > Save: if the browser clears its data, that is your copy.']
  ];

  function init() {
    $('btn-guide').innerHTML = '?';
    $('btn-guide').onclick = open;
    $('btn-pause-guide').onclick = open;
    $('guide-close').onclick = close;
  }

  function open() {
    const en = G.I18n.lang === 'en';
    $('guide-body').innerHTML = ENTRIES.map(([ico, t, d, te, de]) =>
      `<div class="guide-row" translate="no"><span class="guide-ico">${ico}</span><div><b>${en ? te : t}</b><p>${en ? de : d}</p></div></div>`).join('');
    $('guide-body').scrollTop = 0;
    $('scr-guide').classList.remove('hidden');
  }
  function close() { $('scr-guide').classList.add('hidden'); }
  const isOpen = () => !$('scr-guide').classList.contains('hidden');

  return { init, open, close, get isOpen() { return isOpen(); } };
})();

G.Tutorial = (() => {
  let el = null, step = 0, shownT = 0, moved = 0, startActive = 0, armed = false, cardsSeen = false, riftTold = false, last = 0;

  const STEPS = [
    { text: () => G.Touch.active ? 'Arrastra el dedo por la pantalla para moverte.' : 'Muévete con WASD o las flechas.',
      done: () => moved > 1.2 },
    { text: () => 'Tu Pokémon ataca solo al enemigo más cercano. ¡Acércate y derrota a uno!',
      done: pl => pl.kills >= 1 },
    { text: () => 'Recoge los cristales que sueltan los enemigos: con ellos subes de nivel.',
      done: pl => pl.level >= 2 },
    { text: () => 'Elige una carta: un movimiento nuevo o mejorar uno que ya tienes.', cards: true,
      done: () => cardsSeen && G.Game.state !== 'levelup' },
    { text: () => 'Sólo ataca el movimiento activo. ' + (G.Touch.active ? 'Cámbialo tocando su icono abajo.' : 'Cámbialo con 1-4, Q/E o haciendo clic en su icono abajo.'),
      wait: pl => pl.moves.length >= 2, done: (pl, t) => pl.active !== startActive || t > 9 },
    { text: () => 'Rompe rocas y hierba alta: a veces sueltan cosas. Los cofres con candado se abren quedándote a su lado.',
      done: (pl, t) => t > 8 },
    { text: () => 'Cada 3 minutos llega un jefe y cada 4 cambia el bioma. ¡Aguanta hasta el minuto 30! (Tienes la guía en el botón ?)',
      done: (pl, t) => t > 9 }
  ];

  const save = () => G.DB.save;
  const active = () => { const s = save(); return !!s && !G.DB.guest && !s.tutDone; };

  function show(text, top) {
    if (!el) {
      el = document.createElement('div');
      el.id = 'tut-tip';
      el.className = 'box tut-tip';
      el.innerHTML = '<span class="tut-txt"></span><button class="btn small ghost" type="button">Saltar tutorial</button>';
      el.querySelector('button').onclick = finish;
      document.body.appendChild(el);
    }
    el.querySelector('.tut-txt').textContent = text;
    el.classList.toggle('top', !!top);
    el.classList.remove('hidden');
  }
  function hide() { if (el) el.classList.add('hidden'); }

  /** Termina (o se salta): no vuelve a salir. */
  function finish() {
    hide();
    const s = save();
    if (s && !s.tutDone) { s.tutDone = true; G.DB.commit(); }
  }

  /** Al empezar una partida. */
  function start() {
    step = 0; shownT = 0; moved = 0; cardsSeen = false; riftTold = false; armed = false; last = performance.now();
    if (!active()) hide();
  }

  function tick() {
    const now = performance.now(), dt = Math.min(0.5, (now - last) / 1000);
    last = now;
    const st = G.Game.state, pl = G.Game.player;
    if (!active() || !pl || st === 'ui') { hide(); return; }
    if (st === 'over') { finish(); return; }
    // Grieta: aviso aparte (una vez), en cuanto aparece.
    if (!riftTold && st === 'playing' && G.Rift.drawable() && !G.Rift.inArena) {
      riftTold = true;
      G.Spawner.say('¡Una grieta! Entra para luchar contra un legendario', 4, true);
    }
    const S = STEPS[step];
    if (!S) { finish(); return; }
    if (st === 'levelup') cardsSeen = true;
    const showNow = S.cards ? st === 'levelup' : st === 'playing';
    if (S.wait && !S.wait(pl)) { hide(); armed = false; return; }
    // (El ataque activo de referencia se toma cuando se cumple la espera, no antes.)
    if (S.wait && !armed) { armed = true; startActive = pl.active; shownT = 0; }
    if (st === 'playing') {
      const [ax, ay] = G.Input.axis();
      if (ax || ay) moved += dt;
    }
    // Los pasos de cartas esperan a que salgan; los demás avanzan aunque no se vean.
    if (S.cards && !cardsSeen) { hide(); return; }
    if (showNow) { show(S.text(), S.cards); shownT += dt; } else hide();
    if (S.done(pl, shownT)) { step++; shownT = 0; armed = false; }
  }

  /** Ajustes > "Volver a ver el tutorial": sale en la próxima partida. */
  function replay() { const s = save(); if (s) { s.tutDone = false; G.DB.commit(); } }

  setInterval(tick, 200);

  return { start, finish, replay, get active() { return active(); } };
})();
