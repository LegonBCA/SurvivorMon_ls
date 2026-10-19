/* ============ maps-ui.js — selector de mapas previo a la partida ============
 * Ventana modal estilo Mundo Misterioso que permite al jugador elegir el entorno
 * antes de adentrarse en la mazmorra.
 */
G.MapsUI = (() => {
  let bound = false;

  function renderCards() {
    const cont = document.getElementById('maps-list');
    if (!cont) return;

    const current = G.Maps.selected;
    cont.innerHTML = G.Maps.LIST.map(m => {
      const isSel = m.id === current;
      const biomesHtml = m.biomes.map((b, i) => `
        <div class="map-biome-step">
          <span class="map-biome-dot" style="background:${b.color}"></span>
          <span class="map-biome-time">${i * 4}-${(i + 1) * 4}m</span>
          <span class="map-biome-name">${b.name}</span>
        </div>
      `).join('<div class="map-biome-arrow">→</div>');

      return `
        <div class="map-card ${isSel ? 'selected' : ''}" data-map="${m.id}">
          <div class="map-card-head">
            <span class="map-card-icon">${m.icon}</span>
            <div class="map-card-titlebox">
              <div class="map-card-name">${m.name}</div>
              <span class="map-card-tag" style="border-color:${m.accent};color:${m.accent}">${m.tag}</span>
            </div>
            <div class="map-card-radio">${isSel ? '●' : '○'}</div>
          </div>
          <p class="map-card-desc">${m.desc}</p>
          <div class="map-biomes-row">
            ${biomesHtml}
          </div>
        </div>
      `;
    }).join('');

    cont.querySelectorAll('.map-card').forEach(card => {
      card.onclick = () => {
        const id = card.getAttribute('data-map');
        G.Maps.setSelected(id);
        renderCards();
        if (G.Audio && G.Audio.sfx) G.Audio.sfx('click');
      };
    });
  }

  function bindEvents() {
    if (bound) return;
    bound = true;

    const btnPlay = document.getElementById('btn-map-start');
    if (btnPlay) {
      btnPlay.onclick = () => {
        if (G.Audio && G.Audio.sfx) G.Audio.sfx('start');
        G.UI.hideAll();
        G.Game.startRun(null, G.Maps.selected);
      };
    }

    const btnBack = document.getElementById('btn-map-back');
    if (btnBack) {
      btnBack.onclick = () => {
        if (G.Audio && G.Audio.sfx) G.Audio.sfx('click');
        G.UI.hideAll();
        G.Flow.goMenu();
      };
    }
  }

  function open() {
    bindEvents();
    renderCards();
    G.UI.show('scr-maps');
  }

  return { open, renderCards };
})();
