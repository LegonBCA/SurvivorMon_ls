/* ============ maps.js — catálogo de mapas y biomas ============
 * Cada mapa ofrece una experiencia visual y ambiental única, con su propia
 * terna de 3 biomas que rotan cada 4 minutos durante la run.
 *
 * Todas las mecánicas (enemigos, rifts, subida de nivel, Arceus al min 30)
 * se mantienen 100% idénticas e independientes del mapa elegido.
 */
G.Maps = (() => {
  const KEY = 'ps.map';

  const LIST = [
    {
      id: 'classic',
      name: 'Valle Clásico',
      tag: 'Original',
      desc: 'El valle misterioso de siempre. Atraviesa el bosque umbrío, la cueva cristalina y el volcán de ceniza.',
      icon: '🌱',
      accent: '#5cb85c',
      biomes: [
        { idx: 0, name: 'Bosque Umbrío', color: '#44813d' },
        { idx: 1, name: 'Cueva Cristal', color: '#535e81' },
        { idx: 2, name: 'Volcán Ceniza', color: '#e45a1f' }
      ]
    },
    {
      id: 'tundra',
      name: 'Picos Glaciares',
      tag: 'Nieve y Altura',
      desc: 'Tierras heladas y ventiscas alpinas. Nieve blanca perpetua, agujas de hielo cristalino y cumbres celestes.',
      icon: '❄️',
      accent: '#7fe0e0',
      weather: 'snow',
      biomes: [
        { idx: 8, name: 'Glaciar Eterno', color: '#b8cfe0' },
        { idx: 1, name: 'Cueva Cristal', color: '#535e81' },
        { idx: 12, name: 'Pico Celeste', color: '#9fb8d8' }
      ]
    },
    {
      id: 'shadow',
      name: 'Tierras Malditas',
      tag: 'Niebla y Sombras',
      desc: 'Páramo espectral cubierto de bruma. Cruza el cementerio sombrío, la ciénaga tóxica y el santuario dracónico.',
      icon: '👻',
      accent: '#9a4fc0',
      weather: 'fog',
      biomes: [
        { idx: 16, name: 'Cementerio Sombrío', color: '#383447' },
        { idx: 10, name: 'Ciénaga Tóxica', color: '#9a4fc0' },
        { idx: 17, name: 'Santuario Dragón', color: '#7b5cff' }
      ]
    },
    {
      id: 'desert',
      name: 'Desierto Ancestral',
      tag: 'Arena y Acero',
      desc: 'Ruinas antiguas bajo tormentas de arena. Dunas ardientes, canteras milenarias y fortalezas de acero.',
      icon: '🏜️',
      accent: '#d6b25c',
      weather: 'sand',
      biomes: [
        { idx: 11, name: 'Desierto Rojo', color: '#b08a52' },
        { idx: 15, name: 'Cantera Antigua', color: '#7a6a58' },
        { idx: 19, name: 'Fortaleza de Acero', color: '#6d7888' }
      ]
    }
  ];

  const BY_ID = Object.fromEntries(LIST.map(m => [m.id, m]));

  let selected = 'classic';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && BY_ID[saved]) selected = saved;
  } catch (e) { /* local */ }

  function get(id) {
    return BY_ID[id] || BY_ID.classic;
  }

  function setSelected(id) {
    if (!BY_ID[id]) id = 'classic';
    selected = id;
    try { localStorage.setItem(KEY, id); } catch (e) { /* local */ }
  }

  /**
   * Obtiene el índice de bioma de G.Tiles.BIOMES para la fase actual (0, 1 o 2).
   */
  function getBiomeIndex(mapId, stage = 0) {
    const map = get(mapId);
    const s = ((stage % 3) + 3) % 3;
    return map.biomes[s].idx;
  }

  /**
   * Nombre limpio del bioma para los anuncios en pantalla.
   */
  function getBiomeName(mapId, stage = 0) {
    const map = get(mapId);
    const s = ((stage % 3) + 3) % 3;
    return map.biomes[s].name;
  }

  return {
    LIST,
    BY_ID,
    get,
    get selected() { return selected; },
    setSelected,
    getBiomeIndex,
    getBiomeName
  };
})();
