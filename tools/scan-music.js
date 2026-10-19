/* ============ scan-music.js — Escáner automático de música para Vercel ============
 * Escanea la carpeta assets/music/ y actualiza assets/music/playlist.json
 * con todos los archivos de audio (.mp3, .ogg, .wav, .m4a) presentes.
 *
 * Se ejecuta solo al compilar (tools/build.js) o manualmente:
 *   node tools/scan-music.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MUSIC_DIR = path.join(ROOT, 'assets', 'music');
const PLAYLIST_FILE = path.join(MUSIC_DIR, 'playlist.json');

const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.aac']);

// Diccionario de pistas conocidas con sus metadatos oficiales
const KNOWN_TRACKS = {
  'cynthia_battle.mp3': { name: 'Batalla contra Cintia', game: 'Sinnoh (Gen 4)', icon: '🎹' },
  'driftveil_city.mp3': { name: 'Ciudad Fayenza (Driftveil)', game: 'Teselia (Gen 5)', icon: '🕺' },
  'lavender_town.mp3': { name: 'Pueblo Lavanda', game: 'Kanto (Gen 1)', icon: '👻' },
  'goldenrod_city.mp3': { name: 'Ciudad Trigal', game: 'Johto (Gen 2)', icon: '📻' },
  'red_battle.mp3': { name: 'Batalla contra Rojo / Lance', game: 'Johto (Gen 2)', icon: '⚡' },
  'gym_leader.mp3': { name: 'Líder de Gimnasio', game: 'Kanto / Johto', icon: '🏟️' },
  'gym_leader_hoenn.mp3': { name: 'Líder de Gimnasio Hoenn', game: 'Hoenn (Gen 3)', icon: '🎺' },
  'accumula_town.mp3': { name: 'Pueblo Terracota (Furret)', game: 'Teselia (Gen 5)', icon: '🦝' },
  'area_zero.mp3': { name: 'Área Cero', game: 'Paldea (Gen 9)', icon: '💎' },
  'primal_dialga.mp3': { name: 'Dialga Primigenio', game: 'Mundo Misterioso', icon: '⏳' },
  'bicycle.mp3': { name: 'Tema de la Bicicleta', game: 'Kanto (Gen 1)', icon: '🚲' },
  'deoxys_battle.mp3': { name: 'Batalla contra Deoxys', game: 'Hoenn (Gen 3)', icon: '👽' },
  'champion_steven.mp3': { name: 'Campeón Máximo Peñas', game: 'Hoenn (Gen 3)', icon: '🏆' },
  'champion_blue.mp3': { name: 'Batalla contra Campeón Azul', game: 'Kanto (Gen 1)', icon: '⚔️' },
  'pokemon_tower.mp3': { name: 'Torre Pokémon', game: 'Kanto (Gen 1)', icon: '🕯️' },
  'national_park.mp3': { name: 'Parque Nacional', game: 'Johto (Gen 2)', icon: '🌳' },
  'route209.mp3': { name: 'Ruta 209', game: 'Sinnoh (Gen 4)', icon: '🌿' },
  'route10.mp3': { name: 'Ruta 10', game: 'Teselia (Gen 5)', icon: '🛤️' },
  'pallet town fire red.mp3': { name: 'Pueblo Paleta (Rojo Fuego)', game: 'Kanto (FireRed)', icon: '🏡' },
  'title screen fire red.mp3': { name: 'Pantalla de Inicio (Rojo Fuego)', game: 'Kanto (FireRed)', icon: '🎮' }
};

function formatTitle(filename) {
  const base = filename.replace(/\.[^/.]+$/, '');
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function guessIcon(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('battle') || lower.includes('fight') || lower.includes('vs')) return '⚔️';
  if (lower.includes('gym') || lower.includes('stadium')) return '🏟️';
  if (lower.includes('champion') || lower.includes('elite')) return '🏆';
  if (lower.includes('town') || lower.includes('village')) return '🏡';
  if (lower.includes('city')) return '🏙️';
  if (lower.includes('route')) return '🌿';
  if (lower.includes('cave') || lower.includes('dungeon')) return '💎';
  if (lower.includes('legend') || lower.includes('boss')) return '⚡';
  return '🎧';
}

function scanMusic() {
  if (!fs.existsSync(MUSIC_DIR)) {
    fs.mkdirSync(MUSIC_DIR, { recursive: true });
  }

  // Leer playlist existente si la hay
  let existing = [];
  try {
    if (fs.existsSync(PLAYLIST_FILE)) {
      existing = JSON.parse(fs.readFileSync(PLAYLIST_FILE, 'utf8'));
    }
  } catch (e) {
    existing = [];
  }

  const existingMap = new Map();
  existing.forEach(t => {
    if (t.file) existingMap.set(t.file.toLowerCase(), t);
  });

  // Leer archivos reales presentes en la carpeta
  const filesOnDisk = fs.readdirSync(MUSIC_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return AUDIO_EXTS.has(ext);
  });

  const playlist = [];
  const processedFiles = new Set();

  // 1. Archivos reales que están físicamente en la carpeta
  filesOnDisk.forEach(filename => {
    const lower = filename.toLowerCase();
    processedFiles.add(lower);
    const prev = existingMap.get(lower);
    const known = KNOWN_TRACKS[lower];

    const id = prev ? prev.id : (filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
    const name = (known && known.name) || (prev && prev.name) || formatTitle(filename);
    const game = (known && known.game) || (prev && prev.game) || 'Pokémon (MP3)';
    const icon = (known && known.icon) || (prev && prev.icon) || guessIcon(filename);

    playlist.push({
      id,
      name,
      game,
      file: filename,
      icon,
      category: 'pokemon',
      installed: true
    });
  });

  // 2. Si no hay archivos o hay pocos, incluir los presets conocidos que aún no están instalados
  // para que el jugador sepa qué nombres puede poner
  Object.keys(KNOWN_TRACKS).forEach(file => {
    if (!processedFiles.has(file.toLowerCase())) {
      const known = KNOWN_TRACKS[file];
      const prev = existingMap.get(file.toLowerCase());
      playlist.push({
        id: prev ? prev.id : file.replace(/\.[^/.]+$/, ''),
        name: (prev && prev.name) || known.name,
        game: (prev && prev.game) || known.game,
        file: file,
        icon: (prev && prev.icon) || known.icon,
        category: 'pokemon',
        installed: false
      });
    }
  });

  fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlist, null, 2) + '\n', 'utf8');
  console.log(`[scan-music] OK: ${filesOnDisk.length} archivo(s) de audio instalados en assets/music/ (${playlist.length} registrados en playlist.json)`);
  return playlist;
}

if (require.main === module) {
  scanMusic();
}

module.exports = { scanMusic };
