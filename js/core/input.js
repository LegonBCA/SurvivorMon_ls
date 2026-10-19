/* ============ input.js — teclado, ratón y mando (el táctil está en touch.js) ============
 * Mando (Gamepad API, cualquier mando estándar: Xbox, PlayStation, Switch Pro...):
 *   En partida  stick izquierdo / cruceta = moverse · A/B/X/Y = ataques 1-4 ·
 *               LB / RB = ataque anterior / siguiente · Start = pausa · Select = cambiar cartas
 *   En menús    cruceta o stick = mover el foco entre los botones de la pantalla
 *               abierta · A = pulsar · B = volver (como Esc) · Start = pausa / seguir
 * Se traduce a las mismas "teclas" que el teclado (digit1, escape...), así el
 * resto del juego no tiene que saber si juegas con mando.
 */
G.Input = (() => {
  const down = new Set();
  const pressed = new Set();   // se limpia cada frame
  let mx = 0, my = 0, mdown = false;

  const MOVE_KEYS = {
    up: ['keyw', 'arrowup'], down: ['keys', 'arrowdown'],
    left: ['keya', 'arrowleft'], right: ['keyd', 'arrowright']
  };

  function code(e) { return (e.code || e.key).toLowerCase(); }

  addEventListener('keydown', e => {
    const c = code(e);
    if (!down.has(c)) pressed.add(c);
    down.add(c);
    // Evita que el navegador haga scroll con flechas/espacio durante el juego.
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space', 'tab'].includes(c)) e.preventDefault();
  });
  addEventListener('keyup', e => down.delete(code(e)));
  addEventListener('blur', () => { down.clear(); });
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  addEventListener('mousedown', () => { mdown = true; clearFocus(); });
  addEventListener('mouseup', () => mdown = false);

  // ---------------- mando ----------------
  const DEAD = 0.28;
  const BTN = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, select: 8, start: 9, up: 12, down: 13, left: 14, right: 15 };
  let padPrev = {}, padAxis = [0, 0], padOn = false, navT = 0, focusEl = null;

  function readPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) return p;
    return null;
  }

  /** ¿Hay una pantalla (menú, cartas, pausa...) por encima de la partida? → su elemento o null. */
  function overlay() {
    const open = [...document.querySelectorAll('.scr, #pull-fx')].filter(el => !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none');
    if (!open.length) return null;
    // La de más arriba (z-index), y entre iguales la última del documento.
    return open.reduce((a, b) => ((+getComputedStyle(b).zIndex || 0) >= (+getComputedStyle(a).zIndex || 0) ? b : a));
  }

  const FOCUSABLE = 'button:not([disabled]), .menu-item, .card, .cell, .chip, .tab, .gen-tab, .rank-chip, .map-card, .bgm-card, .answer, a.btn, input, select';
  function candidates(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter(el => {
      if (el.closest('.hidden')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight;
    });
  }
  function setFocus(el) {
    if (focusEl) focusEl.classList.remove('pad-focus');
    focusEl = el;
    if (el) { el.classList.add('pad-focus'); el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  function clearFocus() { setFocus(null); }

  /** Mueve el foco al botón más cercano en esa dirección. */
  function nav(dx, dy, root) {
    const list = candidates(root);
    if (!list.length) return;
    // Primer foco: lo principal de la pantalla (Jugar, la primera carta, el botón dorado).
    if (!focusEl || !list.includes(focusEl)) { setFocus(list.find(el => el.matches('.menu-item.play, .card, .btn.gold')) || list[0]); return; }
    const r0 = focusEl.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    let best = null, bestD = Infinity;
    for (const el of list) {
      if (el === focusEl) continue;
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2 - cx, y = r.top + r.height / 2 - cy;
      const along = x * dx + y * dy;               // hacia donde se pide
      if (along <= 4) continue;
      const across = Math.abs(x * dy - y * dx);    // desvío lateral (pesa más)
      const d = along + across * 2.2;
      if (d < bestD) { bestD = d; best = el; }
    }
    if (best) setFocus(best);
  }

  /** Un fotograma de mando: botones → "teclas"; en menús, foco y pulsar. */
  function poll(dt = 1 / 60) {
    const pad = readPad();
    if (!pad) { padAxis = [0, 0]; return; }
    const b = i => !!(pad.buttons[i] && pad.buttons[i].pressed);
    const now = {};
    for (const k in BTN) now[k] = b(BTN[k]);
    const tap = k => now[k] && !padPrev[k];
    let ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    if (Math.hypot(ax, ay) < DEAD) { ax = 0; ay = 0; }
    if (now.left) ax = -1; if (now.right) ax = 1; if (now.up) ay = -1; if (now.down) ay = 1;
    padOn = padOn || Object.values(now).some(Boolean) || ax !== 0 || ay !== 0;

    const ov = overlay();
    const playing = G.Game && G.Game.state === 'playing' && !ov;
    if (playing) {
      padAxis = G.U.norm(ax, ay);
      if (tap('a')) pressed.add('digit1');
      if (tap('b')) pressed.add('digit2');
      if (tap('x')) pressed.add('digit3');
      if (tap('y')) pressed.add('digit4');
      if (tap('lb')) pressed.add('keyq');
      if (tap('rb')) pressed.add('keye');
      if (tap('start')) pressed.add('escape');
      clearFocus();
    } else {
      padAxis = [0, 0];
      if (ov) {
        // Cruceta / stick: foco (con repetición al mantener).
        navT -= dt;
        const dirX = Math.abs(ax) > 0.5 ? Math.sign(ax) : 0, dirY = Math.abs(ay) > 0.5 ? Math.sign(ay) : 0;
        if ((dirX || dirY) && navT <= 0) { nav(dirX, dirX ? 0 : dirY, ov); navT = navT < -0.5 ? 0.12 : 0.28; }
        if (!dirX && !dirY) navT = 0;
        if (tap('a')) { if (focusEl && document.contains(focusEl)) focusEl.click(); else nav(0, 1, ov); }
        if (tap('b')) { const back = ov.querySelector('[data-back], #set-close, #guide-close, #shop-close, #pull-close:not(.hidden), #btn-resume'); if (back) back.click(); else pressed.add('escape'); }
        if (tap('start')) pressed.add('escape');
        if (tap('select')) pressed.add('keyr');
      }
    }
    padPrev = now;
  }

  /** Vibración (mando y móvil): al recibir un golpe fuerte, al subir de nivel... */
  function rumble(ms = 120, strong = 0.6) {
    if (G.Settings && G.Settings.get('vibrate') === false) return;
    const pad = readPad();
    try {
      if (pad && pad.vibrationActuator && pad.vibrationActuator.playEffect) {
        pad.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: strong * 0.6 });
        return;
      }
    } catch (e) { /* mando sin vibración */ }
    if (G.Touch && G.Touch.active && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* nada */ } }
  }

  return {
    /** Vector de movimiento del jugador (táctil, mando o teclado). */
    axis() {
      const t = G.Touch && G.Touch.vector();
      if (t && (t[0] || t[1])) return t;
      if (padAxis[0] || padAxis[1]) return padAxis;
      let x = 0, y = 0;
      if (MOVE_KEYS.left.some(k => down.has(k))) x -= 1;
      if (MOVE_KEYS.right.some(k => down.has(k))) x += 1;
      if (MOVE_KEYS.up.some(k => down.has(k))) y -= 1;
      if (MOVE_KEYS.down.some(k => down.has(k))) y += 1;
      return G.U.norm(x, y);
    },
    held(c) { return down.has(c); },
    /** true sólo en el frame en que se pulsó. */
    tap(c) { return pressed.has(c); },
    mouse() { return { x: mx, y: my, down: mdown }; },
    endFrame() { pressed.clear(); },
    poll, rumble, clearFocus,
    /** ¿Se está usando un mando? */
    get pad() { return padOn && !!readPad(); }
  };
})();
