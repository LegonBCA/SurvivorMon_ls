const fs = require('fs');

// Mock del navegador y localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  get length() { return Object.keys(storage).length; },
  key: (i) => Object.keys(storage)[i]
};

global.window = global;
global.document = {
  getElementById: (id) => ({ id, classList: { add: () => {}, remove: () => {} }, querySelectorAll: () => [] }),
  createElement: (tag) => {
    return {
      tagName: tag,
      setAttribute: (k, v) => {},
      appendChild: () => {},
      remove: () => {},
      click: () => {}
    };
  },
  body: {
    appendChild: () => {}
  },
  addEventListener: () => {}
};
global.navigator = { onLine: true };
global.location = { protocol: 'http:', search: '' };
global.$ = global.document.getElementById;

// Mock FileReader
global.FileReader = class {
  readAsText(blob) {
    setTimeout(() => {
      this.onload({ target: { result: blob.content } });
    }, 10);
  }
};

global.G = {
  FIREBASE_CONFIG: null,
  DEX: [],
  DEX_BY: {},
  UI: {
    toast: (msg) => console.log('[UI TOAST]:', msg),
    refreshCoins: () => console.log('[UI]: refreshCoins')
  },
  MenuUI: {
    open: () => console.log('[MenuUI]: open')
  }
};

// Cargar db.js
const dbCode = fs.readFileSync('js/core/db.js', 'utf8');
eval(dbCode);

async function runTest() {
  console.log('1. Iniciando G.DB.ready()...');
  const restored = await G.DB.ready();
  console.log('G.DB.ready devolvió:', restored);
  if (!restored) throw new Error('ready() debería haber devuelto true');
  if (!G.DB.save) throw new Error('save no inicializado');

  console.log('2. Comprobando partida creada en modo local:');
  console.log('Nombre:', G.DB.save.name);
  console.log('Monedas iniciales:', G.DB.save.coins);
  console.log('Modo:', G.DB.mode);

  console.log('3. Modificando partida y guardando con commit()...');
  G.DB.save.coins = 12345;
  G.DB.save.partner = 150;
  G.DB.commit(true);

  console.log('Valor en localStorage (ps.save.local):', typeof storage['ps.save.local']);
  if (!storage['ps.save.local']) throw new Error('No se guardó en ps.save.local');

  console.log('4. Probando exportSaveFile()...');
  const expOk = G.DB.exportSaveFile();
  console.log('exportSaveFile ok:', expOk);

  console.log('5. Probando importSaveFile()...');
  const backupData = JSON.parse(storage['ps.save.local']);
  backupData.coins = 999999;
  backupData.name = 'Maestro Pokémon';

  const mockBlob = { content: JSON.stringify(backupData) };
  const impResult = await G.DB.importSaveFile(mockBlob);
  console.log('importSaveFile resultado:', impResult);

  if (G.DB.save.coins !== 999999 || G.DB.save.name !== 'Maestro Pokémon') {
    throw new Error('La importación no actualizó correctamente los datos');
  }
  console.log('Monedas tras importación:', G.DB.save.coins);
  console.log('Nombre tras importación:', G.DB.save.name);

  console.log('6. Probando resetSave()...');
  G.DB.resetSave();
  console.log('Monedas tras reinicio:', G.DB.save.coins);
  console.log('Nombre tras reinicio:', G.DB.save.name);
  if (G.DB.save.coins !== 500) throw new Error('Monedas no se reiniciaron al valor inicial');

  console.log('✅ TODOS LOS TESTS DEL SISTEMA DE SAVE DATA PASARON CON ÉXITO');
}

runTest().catch(err => {
  console.error('ERROR EN TEST:', err);
  process.exit(1);
});
