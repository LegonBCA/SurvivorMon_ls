/* ============ gyms-ui.js — pantalla del Desafío de Gimnasios ============
 * Pestañas por región, los 8 gimnasios (medalla, líder, tipo, Pokémon estrella
 * y contra qué tipos es débil) y la Liga, que se abre con las 8 medallas.
 * Se juega con tu compañero de siempre (y su forma shiny o Mega).
 */
G.GymsUI = (() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'ps.gymRegion';
  let region = 'kanto';
  try { const r = localStorage.getItem(KEY); if (r && G.GymData.BY[r]) region = r; } catch (e) { /* nada */ }

  /** Tipos que hacen "muy eficaz" a este tipo. */
  const weakTo = type => Object.keys(G.U.TYPE_NAME).filter(t => G.Types.mult(t, [type]) > 1);

  function open() {
    G.UI.show('scr-gyms', true);
    render();
  }

  function challenge(idx) {
    G.Audio.sfx('start');
    G.UI.hideAll();
    G.Game.startRun(null, 'classic', { mode: 'gym', gym: { region, idx } });
  }

  function render() {
    const R = G.GymData.BY[region];
    let total = 0, champs = 0;
    for (const r of G.GymData.REGIONS) { const p = G.Gym.progress(r.id); total += p.count; champs += p.champ ? 1 : 0; }
    $('gyms-sum').textContent = `Medallas: ${total} / 72 · Ligas ganadas: ${champs} / 9 · Juegas con tu compañero actual.`;

    // Pestañas de región
    const tabs = $('gyms-tabs');
    tabs.innerHTML = '';
    for (const r of G.GymData.REGIONS) {
      const p = G.Gym.progress(r.id);
      const b = document.createElement('button');
      b.className = 'gen-tab' + (r.id === region ? ' on' : '');
      b.innerHTML = `<b>${r.name}</b><small>${p.champ ? '🏆 ' : ''}${p.count}/8</small>`;
      b.onclick = () => { region = r.id; try { localStorage.setItem(KEY, region); } catch (e) { /* nada */ } G.Audio.sfx('click'); render(); };
      tabs.appendChild(b);
    }

    // Gimnasios
    const prog = G.Gym.progress(region);
    const grid = $('gyms-grid');
    grid.innerHTML = '';
    R.gyms.forEach(([who, type, ace, , medal], i) => {
      const got = !!prog.medals[i + 1];
      const c = document.createElement('div');
      c.className = 'gym-card' + (got ? ' won' : '');
      c.style.setProperty('--tc', G.U.TYPE_COLOR[type]);
      c.innerHTML = `<div class="gym-medal" title="Medalla ${esc(medal)}">${got ? '✓' : i + 1}</div>
        <div class="gym-ace"></div>
        <b translate="no">${esc(who)}</b>
        <small>Medalla ${esc(medal)}</small>
        <div class="gym-type">${G.UI.typeChips([type])}</div>
        <small class="gym-weak">Débil a: ${weakTo(type).map(t => `<span style="color:${G.U.TYPE_COLOR[t]}">${G.U.TYPE_NAME[t]}</span>`).join(', ')}</small>
        <button class="btn small ${got ? '' : 'gold'}">${got ? 'Revancha' : 'Desafiar'}</button>`;
      c.querySelector('.gym-ace').appendChild(G.UI.spriteCanvas(ace, 72, 60, { scale: 1.4, lively: got, silhouette: false }));
      c.querySelector('button').onclick = () => challenge(i);
      grid.appendChild(c);
    });

    // Liga
    const open8 = prog.count >= 8;
    const L = $('gyms-league');
    L.className = 'gym-league' + (open8 ? '' : ' locked') + (prog.champ ? ' won' : '');
    L.innerHTML = `<div class="grow"><b>${prog.champ ? '🏆 ' : ''}Liga Pokémon de ${esc(R.name)}</b>
        <small>Alto Mando: ${R.elite.map(([n, t]) => `<span translate="no">${esc(n)}</span> (${G.U.TYPE_NAME[t]})`).join(' · ')} · Campeón: <span translate="no">${esc(R.champion[0])}</span></small>
        <small>${open8 ? '5 combates seguidos. Al vencer a cada rival recuperas parte de la vida.' : 'Consigue las 8 medallas de ' + esc(R.name) + ' para entrar.'}</small></div>
      <button class="btn ${open8 && !prog.champ ? 'gold' : ''}" ${open8 ? '' : 'disabled'}>${prog.champ ? 'Revancha' : 'Desafiar la Liga'}</button>`;
    L.querySelector('button').onclick = () => { if (open8) challenge(8); };
  }

  return { open, render };
})();
