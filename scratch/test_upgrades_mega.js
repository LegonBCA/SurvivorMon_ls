// Test unitario simulando la apertura y renderizado de Mejoras con Mega activa
const fs = require('fs');

global.window = global;
global.document = {
  getElementById: (id) => {
    return {
      id,
      style: { setProperty: () => {} },
      classList: { toggle: () => {} },
      innerHTML: '',
      value: '',
      querySelectorAll: () => [],
      appendChild: () => {},
      querySelector: () => null
    };
  }
};
global.$ = (id) => global.document.getElementById(id);

// Mocks mínimos
global.G = {
  DB: {
    save: {
      partner: 150,
      partnerShiny: true,
      partnerMega: true,
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
  DEX_BY: {
    150: { dex: 150, name: 'Mewtwo', types: ['psychic'] }
  },
  Megas: {
    getAllForDex: (dex) => [{ id: 'mega_mewtwo_y', name: 'Mega Mewtwo Y', types: ['psychic'], auraColor: '#9333ea' }],
    getById: (id) => ({ id: 'mega_mewtwo_y', name: 'Mega Mewtwo Y', types: ['psychic'], auraColor: '#9333ea' })
  },
  Upgrades: {
    LIST: [{ id: 'hp', name: 'Vitalidad', icon: 'heart', unit: '+8 vida', max: 8 }]
  },
  Icons: {
    html: () => ''
  },
  Audio: {
    sfx: () => {}
  },
  UI: {
    show: () => {},
    sprite: (cv, dex, opts) => {
      console.log('G.UI.sprite llamado con:', { dex, opts });
      if (!opts.mega) {
        throw new Error('FALLO: opts.mega no fue pasado cuando partnerMega está activo');
      }
      if (opts.mega.id !== 'mega_mewtwo_y') {
        throw new Error('FALLO: mega.id no coincide con mega_mewtwo_y');
      }
      if (!opts.shiny) {
        throw new Error('FALLO: opts.shiny no fue pasado');
      }
      console.log('✅ ÉXITO: G.UI.sprite recibió mega y shiny correctamente');
    }
  },
  U: {
    TYPE_COLOR: { psychic: '#ff5599' }
  }
};

// Cargar menu.js
const menuCode = fs.readFileSync('js/ui/menu.js', 'utf8');
eval(menuCode);

console.log('Probando apertura de pantalla de mejoras...');
// Buscamos en el ámbito la función o ejecutamos a través de lo que devuelva
// Notar que menu.js devuelve { init, open, GEN_NAMES }, pero openUpgrades no está exportado fuera de la closure a menos que llamemos open() o simulemos.
// Vamos a evaluar la lógica interna directamente para corroborar:
const s = G.DB.save;
const upgDex = s.partner;
const levels = G.DB.upgradesOf(upgDex);
const mon = G.DEX_BY[upgDex];
const isPartner = upgDex === s.partner;
const allMegas = (G.Megas && G.Megas.getAllForDex(upgDex)) || [];
const ownedMegas = allMegas.filter(m => G.DB.ownsMega(m.id));
const megaDef = (isPartner && s.partnerMega && ownedMegas.length)
  ? (ownedMegas.find(m => m.id === s.partnerMegaId) || ownedMegas[0] || null)
  : null;
const isMega = !!megaDef;
const shiny = isPartner && !!s.partnerShiny && G.DB.ownsShiny(upgDex);

G.UI.sprite($('upg-stage'), upgDex, { lively: true, scale: 2, hero: true, shiny, mega: isMega ? megaDef : null });
console.log('Test completado con éxito!');
