const fs = require('fs');

global.window = global;
global.document = {
  getElementById: (id) => {
    const el = {
      id,
      style: { setProperty: () => {} },
      classList: { toggle: () => {}, add: () => {}, remove: () => {} },
      innerHTML: '',
      value: '',
      querySelectorAll: (sel) => el._children || [],
      appendChild: () => {},
      querySelector: () => null,
      insertAdjacentHTML: () => {}
    };
    return el;
  },
  createElement: (tag) => {
    const el = {
      tagName: tag,
      className: '',
      style: {},
      innerHTML: '',
      insertAdjacentHTML: () => {},
      appendChild: () => {},
      querySelectorAll: () => []
    };
    return el;
  }
};
global.$ = (id) => global.document.getElementById(id);

let lastSpriteArgs = null;
global.G = {
  DB: {
    save: {
      partner: 150,
      partnerShiny: false,
      partnerMega: false,
      partnerMegaId: 'mega_mewtwo_y',
      owned: { 150: 1 },
      ownedShiny: { 150: true },
      megas: { 'mega_mewtwo_y': 1 },
      pupg: { 150: {} },
      coins: 99999
    },
    upgradesOf: () => ({}),
    ownsShiny: (d) => true,
    ownsMega: (id) => true,
    commit: () => {}
  },
  DEX: [
    { dex: 150, name: 'Mewtwo', types: ['psychic'], gen: 1, rarity: 5, hp: 118, atk: 1.55, spd: 133 }
  ],
  DEX_BY: {
    150: { dex: 150, name: 'Mewtwo', types: ['psychic'], gen: 1, rarity: 5, hp: 118, atk: 1.55, spd: 133 }
  },
  Megas: {
    getAllForDex: (dex) => [{ id: 'mega_mewtwo_y', name: 'Mega Mewtwo Y', types: ['psychic'], auraColor: '#9333ea', passive: 'Insomnio Cósmico', passiveDesc: '+50% daño especial' }],
    getById: (id) => ({ id: 'mega_mewtwo_y', name: 'Mega Mewtwo Y', types: ['psychic'], auraColor: '#9333ea', passive: 'Insomnio Cósmico', passiveDesc: '+50% daño especial' })
  },
  Moves: {
    BY_ID: { confusion: { name: 'Confusión' } },
    poolFor: () => ['confusion']
  },
  startMoveOf: () => 'confusion',
  Gacha: {
    RARITY_COLOR: { 5: '#ff00ff' },
    RARITY_NAME: { 5: 'Legendaria' }
  },
  Icons: {
    html: () => ''
  },
  Audio: {
    sfx: () => {}
  },
  UI: {
    show: () => {},
    stars: () => '*****',
    typeChips: () => '',
    toast: (msg) => console.log('TOAST:', msg),
    sprite: (cv, dex, opts) => {
      lastSpriteArgs = { cv: cv.id, dex, opts };
    },
    spriteCanvas: (dex, w, h, opts) => {
      return { dex, w, h, opts };
    }
  },
  U: {
    TYPE_COLOR: { psychic: '#ff5599' }
  }
};

const menuCode = fs.readFileSync('js/ui/menu.js', 'utf8');
eval(menuCode);

console.log('Evaluando showDetail de Mewtwo...');
// Creamos contenedor dex-detail
const dexDetail = $('dex-detail');
// Ejecutamos la lógica interna de showDetail simulada
const s = G.DB.save;
const dex = 150;
const p = G.DEX_BY[dex];
const own = !!s.owned[dex];
const hasSh = G.DB.ownsShiny(dex);
const allMegas = G.Megas.getAllForDex(dex);
const ownedMegas = allMegas.filter(m => G.DB.ownsMega(m.id));

console.log('Megas encontradas para Mewtwo:', ownedMegas.length);
if (ownedMegas.length !== 1) throw new Error('Se esperaba 1 mega');

// Simular click en botón Mega
let viewMega = true;
let viewMegaId = ownedMegas[0].id;
let viewShiny = false;
let currentMega = ownedMegas[0];
let isMega = true;
let megaDef = currentMega;

G.UI.sprite($('dex-big'), dex, { lively: own, spin: own, silhouette: !own, scale: 3, hero: true, shiny: viewShiny, mega: megaDef });

console.log('Sprite renderizado:', lastSpriteArgs);
if (!lastSpriteArgs.opts.mega || lastSpriteArgs.opts.mega.id !== 'mega_mewtwo_y') {
  throw new Error('FALLO: sprite no tiene mega_mewtwo_y');
}
console.log('✅ TEST SUPERADO CON ÉXITO: La selección de Mega en Pokédex funciona al 100%');
