/* ============ menu-parade.js — fondo animado del menú ============
 * Un desfile retro de Pokémon detrás del menú principal: caminan por carriles
 * con profundidad (los de atrás, más pequeños, lentos y tenues; cada carril en
 * un sentido) y, arriba, algunos voladores flotando. Cuando uno sale de la
 * pantalla, llega otro al azar. Sólo aspecto: no toca nada del juego.
 * Se quita en Ajustes > Gráficos ("Fondo animado en el menú"); en calidad baja
 * salen menos. (Con "reducir movimiento" del sistema sólo se para el suelo:
 * si no, quien tiene las animaciones de Windows apagadas no lo vería nunca.)
 */
G.MenuParade = (() => {
  //  y: altura en la pantalla · scale: píxel del sprite [pantalla baja, alta] (entero:
  //  así sigue nítido) · w/h: tamaño del lienzo · dur: segundos en cruzar
  const LANES = [
    { y: 0.84, scale: [2, 3], w: [112, 160], h: [92, 136], dur: [15, 19], dir: 'r', n: 4, op: 1 },
    { y: 0.66, scale: [2, 2], w: [104, 112], h: [86, 92], dur: [21, 26], dir: 'l', n: 3, op: 0.75 },
    { y: 0.48, scale: [1, 2], w: [64, 104], h: [56, 86], dur: [30, 36], dir: 'r', n: 4, op: 0.45 },
    { y: 0.14, scale: [1, 2], w: [72, 112], h: [64, 96], dur: [24, 30], dir: 'l', n: 2, op: 0.6, fly: true }
  ];
  const big = () => innerHeight >= 600 ? 1 : 0;
  const FACE = { r: 2, l: 6 };          // fila del sprite: 2 = derecha, 6 = izquierda
  let root = null, pools = null;

  /** Pokémon para el desfile: de suelo o voladores (los que flotan en su sprite). */
  function pool(fly) {
    if (!pools) {
      const ok = G.DEX.filter(p => G.SPRITE_META[p.dex]);
      pools = { ground: ok.filter(p => !G.Sprites.hovers(p.dex)).map(p => p.dex), fly: ok.filter(p => G.Sprites.hovers(p.dex)).map(p => p.dex) };
      if (!pools.fly.length) pools.fly = pools.ground;
    }
    return fly ? pools.fly : pools.ground;
  }

  function spawn(lane, delay) {
    const dex = G.U.pick(pool(lane.fly));
    const el = document.createElement('div');
    el.className = 'parade-walker' + (lane.fly ? ' fly' : '');
    const dur = G.U.rand(lane.dur[0], lane.dur[1]), b = big();
    el.style.cssText = `top:calc(${lane.y * 100}% - ${lane.h[b]}px);opacity:${lane.op};` +
      `animation:parade-${lane.dir} ${dur}s linear ${delay}s both;`;
    const cv = G.UI.spriteCanvas(dex, lane.w[b], lane.h[b], { anim: 'Walk', dir: FACE[lane.dir], scale: lane.scale[b], shiny: Math.random() < 0.04 });
    el.appendChild(cv);
    el.addEventListener('animationend', e => {
      if (e.target !== el) return;
      el.remove();
      if (root && root.isConnected) spawn(lane, G.U.rand(0, 3));
    });
    root.appendChild(el);
  }

  /** Arranca el desfile (una vez; luego sigue solo). */
  function start() {
    root = document.getElementById('menu-parade');
    if (!root) return;
    const want = G.Settings.get('parade') !== false;
    root.classList.toggle('off', !want);
    if (!want || root.dataset.on) return;
    root.dataset.on = '1';
    const few = G.Settings && G.Settings.fx === 0;
    for (const lane of LANES) {
      const n = few ? Math.ceil(lane.n / 2) : lane.n;
      // Retrasos negativos: al abrir, el desfile ya está en marcha por toda la pantalla.
      for (let i = 0; i < n; i++) spawn(lane, -((i + Math.random() * 0.8) / n) * lane.dur[1]);
    }
  }

  /** Ajustes: quitar el desfile (y que vuelva al reactivarlo). */
  function stop() {
    if (!root) return;
    root.querySelectorAll('.parade-walker').forEach(el => el.remove());
    delete root.dataset.on;
    root.classList.add('off');
  }

  return { start, stop };
})();
