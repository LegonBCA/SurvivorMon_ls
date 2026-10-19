/* ============ music.js — partituras de los temas del juego ============
 * Compuestas para el juego (no son temas de Nintendo). Las toca el
 * sintetizador de core/audio.js.
 *
 * melody: compases como "A4:4 C5:2 -:2" — nota:duración en semicorcheas
 *         (16 por compás), "-" = silencio.
 * parts:  generadas desde `chords` con un patrón de 16 caracteres por compás:
 *           R raíz (bajo del acorde con useBass) · F quinta · O octava · T tercera
 *           0-5 notas del acorde (0 raíz, 1 tercera, 2 quinta, 3 octava...)
 *           C acorde entero · "-" alarga la nota anterior · "." silencio
 * drums:  X fuerte · x medio · o suave · . nada
 */
G.MUSIC = {
  // ---------------- Menú: una aldea tranquila ----------------
  village: {
    bpm: 100, swing: 0.18,
    chords: ['F', 'C/E', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C',
             'Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F', 'F'],
    melody: [{ inst: 'flute', vel: 1, bars: [
      'A4:4 C5:2 A4:2 G4:4 F4:4', 'G4:6 A4:2 C5:4 -:4', 'D5:4 C5:2 A4:2 F4:4 A4:4', 'G4:12 -:4',
      'A4:4 C5:2 F5:2 E5:4 D5:4', 'C5:6 A4:2 G4:4 E4:4', 'F4:4 G4:2 A4:2 D5:4 C5:4', 'C5:12 -:4',
      'D5:2 D5:2 F5:4 D5:4 Bb4:4', 'C5:2 C5:2 E5:4 G5:4 E5:4', 'A5:6 G5:2 E5:4 C5:4', 'D5:8 C5:4 A4:4',
      'Bb4:4 D5:4 G5:4 F5:2 D5:2', 'E5:4 G5:2 E5:2 C5:4 Bb4:4', 'A4:4 C5:4 F5:6 E5:2', 'F5:12 -:4'] }],
    parts: [
      { inst: 'bass', octave: 2, useBass: true, vel: 0.9, pattern: 'R--F--O-R--F--T-' },
      { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.1.2.1.3.2.1.2.' },
      { inst: 'pad', octave: 3, vel: 0.9, pattern: 'C---------------' }
    ],
    drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: 'o.x.o.x.o.x.o.x.' }
  },

  // ---------------- Run: Bosque Umbrío ----------------
  forest: {
    bpm: 122,
    chords: ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb', 'A',
             'Bb', 'C', 'Dm', 'Dm', 'Bb', 'C', 'A', 'A'],
    melody: [{ inst: 'flute', vel: 1, bars: [
      'D5:3 E5:1 F5:4 A5:4 G5:2 F5:2', 'E5:6 D5:2 C5:4 E5:4', 'F5:4 D5:4 Bb4:4 D5:4', 'C#5:8 E5:4 A4:4',
      'D5:2 F5:2 A5:4 D6:4 C6:2 A5:2', 'G5:4 E5:4 C5:4 E5:4', 'F5:3 G5:1 F5:4 D5:4 Bb4:4', 'A4:4 C#5:4 E5:4 A5:4',
      'D5:8 F5:8', 'E5:8 G5:8', 'A5:12 F5:4', 'D5:16',
      'F5:4 E5:4 D5:4 C5:4', 'E5:4 D5:4 C5:4 G4:4', 'A4:8 C#5:8', 'E5:16'] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R.R.R.R.F.F.O.F.' },
      { inst: 'pluck', octave: 4, vel: 0.6, pattern: '0.2.1.2.3.2.1.2.' },
      { inst: 'pad', octave: 3, vel: 0.6, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X.....x.X.......', snare: '....X.......X...', hat: 'x.o.x.o.x.o.x.o.' }
  },

  // ---------------- Run: Cueva Cristal ----------------
  cave: {
    bpm: 92, swing: 0.1,
    chords: ['Am', 'F', 'G', 'Em', 'Am', 'F', 'Dm', 'E',
             'F', 'G', 'Em', 'Am', 'Dm', 'Em', 'F', 'E'],
    melody: [{ inst: 'flute', vel: 0.85, bars: [
      'E5:6 A5:2 G5:4 E5:4', 'F5:8 C5:4 A4:4', 'D5:6 G5:2 F5:4 D5:4', 'E5:12 -:4',
      'C6:4 B5:2 A5:2 E5:4 C5:4', 'A5:6 G5:2 F5:4 C5:4', 'D5:4 F5:4 A5:4 G5:2 F5:2', 'E5:4 G#5:4 B5:8',
      'A5:4 C6:4 A5:4 F5:4', 'B5:4 D6:4 B5:4 G5:4', 'G5:6 E5:2 B4:8', 'C5:4 E5:4 A5:8',
      'F5:4 A5:4 D6:4 C6:4', 'B5:6 G5:2 E5:8', 'A5:4 G5:4 F5:4 E5:4', 'E5:8 -:8'] }],
    parts: [
      { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.2.4.2.3.2.4.2.' },
      { inst: 'bass', octave: 2, vel: 0.8, pattern: 'R-------F-------' },
      { inst: 'pad', octave: 3, vel: 1, pattern: 'C---------------' }
    ],
    drums: { kick: 'o.......o.......', hat: '..o...o...o...o.' }
  },

  // ---------------- Run: Volcán Ceniza ----------------
  volcano: {
    bpm: 132,
    chords: ['Em', 'F', 'Em', 'D', 'Em', 'F', 'G', 'F'],
    melody: [{ inst: 'lead', vel: 0.9, bars: [
      'E5:2 -:2 E5:2 F5:2 G5:4 F5:2 E5:2', 'F5:2 -:2 F5:2 G5:2 A5:4 G5:2 F5:2',
      'G5:4 B5:4 A5:2 G5:2 F5:2 E5:2', 'D5:8 F#5:4 A5:4',
      'B5:4 A5:2 G5:2 E5:4 G5:4', 'C6:4 B5:2 A5:2 F5:4 A5:4',
      'B5:2 D6:2 B5:2 G5:2 D5:4 G5:4', 'A5:4 G5:4 F5:4 E5:4'] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.R.R.R.R.R.F.O.' },
      { inst: 'pluck', octave: 3, vel: 0.5, pattern: '0.0.1.0.2.0.1.0.' },
      { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C-------C-------' }
    ],
    drums: { kick: 'X..x..X.X..x..X.', snare: '....X.......X..x', hat: 'xoxoxoxoxoxoxoxo' }
  },

  // ---------------- Combate contra jefe ----------------
  boss: {
    bpm: 150,
    chords: ['Em', 'C', 'D', 'B', 'Em', 'C', 'D', 'B'],
    melody: [{ inst: 'lead', vel: 1, bars: [
      'E5:2 E5:2 G5:2 E5:2 B5:4 A5:2 G5:2', 'E5:2 E5:2 G5:2 E5:2 C6:4 B5:2 A5:2',
      'F#5:4 A5:4 D6:4 C6:2 B5:2', 'D#5:8 F#5:4 B5:4',
      'G5:2 F#5:2 E5:2 F#5:2 G5:4 B5:4', 'A5:2 G5:2 E5:2 G5:2 A5:4 C6:4',
      'B5:4 A5:4 F#5:4 D5:4', 'D#5:4 F#5:4 A5:4 B5:4'] }],
    parts: [
      { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RR.RR.R.RR.RF.' },
      { inst: 'pluck', octave: 4, vel: 0.5, pattern: '0.1.2.1.0.1.2.3.' }
    ],
    drums: { kick: 'X.x.X.x.X.x.X.x.', snare: '....X.......X.X.', hat: 'oooooooooooooooo' }
  }
};

// Se añade fuera del objeto para no tocar los demás temas.
/* ---------------- Grieta: duelo contra el legendario ----------------
 * Más rápido y más tenso que el de jefe: La menor, bajo galopando y la
 * melodía subiendo a la octava alta en la segunda mitad. */
G.MUSIC.rift = {
  bpm: 164,
  chords: ['Am', 'F', 'G', 'E', 'Am', 'F', 'Dm', 'E',
           'F', 'G', 'Am', 'Am', 'Dm', 'E', 'Am', 'E'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'A5:2 C6:2 E6:4 D6:2 C6:2 B5:4', 'A5:2 F5:2 A5:4 C6:4 F6:4',
    'G5:2 B5:2 D6:4 C6:2 B5:2 G5:4', 'G#5:8 B5:4 E6:4',
    'A5:2 A5:2 C6:2 A5:2 E6:4 D6:2 C6:2', 'F6:4 E6:2 D6:2 C6:4 A5:4',
    'D6:4 C6:2 A5:2 F5:4 A5:4', 'G#5:4 B5:4 D6:4 E6:4',
    'F6:2 E6:2 C6:4 A5:4 C6:4', 'G6:2 F6:2 D6:4 B5:4 D6:4',
    'E6:4 C6:2 A5:2 E6:4 A6:4', 'A6:12 -:4',
    'F6:4 D6:2 A5:2 F6:4 E6:2 D6:2', 'E6:2 G#6:2 B6:4 G#6:4 E6:4',
    'A6:4 E6:2 C6:2 A5:4 C6:4', 'B5:4 G#5:4 E5:4 -:4'] }],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RRR.RRF.FFO.OF' },
    { inst: 'pluck', octave: 4, vel: 0.5, pattern: '0.2.3.2.1.2.3.4.' },
    { inst: 'pad', octave: 3, vel: 0.55, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.x.X.x.X.x.X.xx', snare: '....X.......X..X', hat: 'xoxoxoxoxoxoxoxo' }
};

// ---------------- La Sentencia de Arceus (minuto 30) ----------------
G.MUSIC.judgment = {
  bpm: 140,
  chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Eb', 'C', 'A',
           'Bb', 'C', 'Dm', 'Dm', 'Gm', 'A', 'Dm', 'A'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'D5:4 F5:4 A5:6 G5:2', 'F5:4 D5:4 Bb4:8',
    'G5:4 Bb5:4 D6:4 C6:2 Bb5:2', 'A5:8 C#6:4 E6:4',
    'D6:6 C6:2 A5:4 F5:4', 'G5:4 Eb5:4 G5:4 Bb5:4',
    'C6:4 E5:2 G5:2 C6:4 E6:4', 'C#6:12 -:4',
    'D6:2 D6:2 F6:4 D6:4 Bb5:4', 'C6:2 C6:2 E6:4 C6:4 G5:4',
    'A5:4 D6:4 F6:4 E6:2 D6:2', 'D6:12 -:4',
    'Bb5:4 D6:4 G6:4 F6:2 D6:2', 'E6:4 C#6:4 A5:4 E6:4',
    'F6:4 E6:2 D6:2 A5:4 F5:4', 'E5:4 A5:4 C#6:4 E6:4'] }],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RRR.RRR.RRF.OF' },
    { inst: 'bell', octave: 4, vel: 0.6, pattern: '0.......2.......' },
    { inst: 'pad', octave: 3, vel: 0.8, pattern: 'C---------------' }
  ],
  drums: { kick: 'X..xX..xX..xX.xx', snare: '....X.......X..X', hat: 'x.x.x.x.x.x.x.x.' }
};

/* ============ Canciones emblemáticas de Pokémon ============ */

// 1. Pueblo Paleta (Kanto - Gen 1)
G.MUSIC.pallet = {
  bpm: 104, swing: 0.12,
  chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G',
           'C', 'G', 'Am', 'Em', 'F', 'G', 'C', 'C'],
  melody: [{ inst: 'flute', vel: 1, bars: [
    'G4:4 E5:4 D5:2 C5:2 B4:4', 'C5:4 D5:4 G4:8',
    'E5:4 G5:4 F5:2 E5:2 D5:4', 'C5:8 D5:4 G4:4',
    'A4:4 C5:4 E5:4 D5:2 C5:2', 'G5:6 E5:2 C5:8',
    'F5:4 E5:4 D5:4 C5:4', 'D5:12 -:4',
    'G4:4 E5:4 D5:2 C5:2 B4:4', 'C5:4 D5:4 G4:8',
    'E5:4 G5:4 F5:2 E5:2 D5:4', 'C5:8 D5:4 G4:4',
    'A4:4 C5:4 F5:4 E5:4', 'D5:4 G5:4 E5:4 C5:4',
    'D5:4 E5:4 C5:8', 'C5:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, useBass: true, vel: 0.85, pattern: 'R--F--O-R--F--T-' },
    { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.1.2.1.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.85, pattern: 'C---------------' }
  ],
  drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: 'o.x.o.x.o.x.o.x.' }
};

// 2. Centro Pokémon (Clásico en todas las generaciones)
G.MUSIC.center = {
  bpm: 116,
  chords: ['C', 'F', 'G', 'C', 'C', 'F', 'G', 'C',
           'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'],
  melody: [{ inst: 'pluck', vel: 0.95, bars: [
    'C5:2 E5:2 G5:4 C6:4 B5:2 A5:2', 'G5:8 E5:8',
    'F5:2 G5:2 A5:4 G5:4 F5:4', 'E5:12 -:4',
    'C5:2 E5:2 G5:4 C6:4 B5:2 A5:2', 'G5:8 E5:8',
    'D5:2 E5:2 F5:4 E5:4 D5:4', 'C5:12 -:4',
    'A5:4 C6:4 B5:2 A5:2 G5:4', 'E5:8 C5:8',
    'F5:2 G5:2 A5:4 G5:4 F5:4', 'E5:12 -:4',
    'D5:2 E5:2 F5:4 A5:4 D6:4', 'C6:4 B5:4 G5:4 B5:4',
    'C6:8 G5:8', 'C5:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.85, pattern: 'R.R.F.F.R.R.O.F.' },
    { inst: 'bell', octave: 4, vel: 0.55, pattern: '0.2.1.2.0.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.6, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'o.o.o.o.o.o.o.o.' }
};

// 3. Ruta 1 (Kanto - Gen 1)
G.MUSIC.route1 = {
  bpm: 128,
  chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'C', 'G',
           'C', 'G', 'Am', 'F', 'Dm', 'G', 'C', 'C'],
  melody: [{ inst: 'flute', vel: 1, bars: [
    'C5:2 D5:2 E5:4 G5:4 E5:2 D5:2', 'C5:4 E5:4 D5:8',
    'D5:2 E5:2 F5:4 A5:4 G5:2 F5:2', 'E5:8 G5:8',
    'C5:2 D5:2 E5:4 G5:4 E5:2 D5:2', 'C5:4 E5:4 D5:8',
    'F5:4 E5:4 D5:4 C5:4', 'C5:12 -:4',
    'A5:4 C6:4 B5:2 A5:2 G5:4', 'E5:8 G5:8',
    'F5:4 A5:4 G5:2 F5:2 E5:4', 'D5:12 -:4',
    'D5:2 E5:2 F5:4 A5:4 C6:4', 'B5:4 G5:4 E5:4 G5:4',
    'A5:4 G5:4 F5:4 E5:4', 'C5:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R.R.R.R.F.F.O.F.' },
    { inst: 'pluck', octave: 4, vel: 0.55, pattern: '0.1.2.1.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.65, pattern: 'C---------------' }
  ],
  drums: { kick: 'X.....x.X.......', snare: '....X.......X...', hat: 'x.o.x.o.x.o.x.o.' }
};

// 4. Pueblo Primavera (New Bark Town - Johto Gen 2)
G.MUSIC.newbark = {
  bpm: 96, swing: 0.16,
  chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'F', 'C',
           'Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F', 'F'],
  melody: [{ inst: 'flute', vel: 0.95, bars: [
    'F5:4 E5:2 D5:2 C5:4 A4:4', 'Bb4:4 D5:4 C5:8',
    'D5:4 F5:4 A5:4 G5:2 F5:2', 'G5:12 -:4',
    'A5:4 C6:2 A5:2 G5:4 F5:4', 'D5:4 F5:4 C5:8',
    'Bb4:4 D5:4 C5:4 G4:4', 'F4:12 -:4',
    'D5:4 F5:4 E5:2 D5:2 C5:4', 'E5:4 G5:4 F5:8',
    'C5:4 E5:4 D5:2 C5:2 A4:4', 'F5:8 D5:8',
    'G5:4 Bb5:4 A5:4 G5:4', 'C5:4 E5:4 G5:8',
    'A5:4 C6:4 F5:6 E5:2', 'F5:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.85, pattern: 'R--F--O-R--F--T-' },
    { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.2.1.2.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.85, pattern: 'C---------------' }
  ],
  drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: 'o.x.o.x.o.x.o.x.' }
};

// 5. Villa Raíz (Littleroot Town - Hoenn Gen 3)
G.MUSIC.littleroot = {
  bpm: 106, swing: 0.1,
  chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G',
           'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'],
  melody: [{ inst: 'flute', vel: 1, bars: [
    'E5:4 G5:2 A5:2 G5:4 E5:4', 'D5:4 C5:4 D5:8',
    'E5:4 G5:2 A5:2 C6:4 B5:2 A5:2', 'G5:12 -:4',
    'A5:4 C6:2 D6:2 C6:4 A5:4', 'G5:4 E5:4 C5:8',
    'D5:4 F5:4 E5:4 D5:4', 'G5:12 -:4',
    'A5:4 C6:4 B5:2 A5:2 G5:4', 'E5:4 G5:4 C6:8',
    'B5:4 A5:2 G5:2 E5:4 G5:4', 'A5:12 -:4',
    'F5:4 A5:4 D6:4 C6:4', 'B5:4 G5:4 D5:4 G5:4',
    'E5:4 G5:4 C6:8', 'C6:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R.R.F.R.R.F.O.F.' },
    { inst: 'pluck', octave: 4, vel: 0.55, pattern: '0.1.2.1.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.7, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.......X.......', snare: '....X.......X...', hat: 'o.x.o.x.o.x.o.x.' }
};

// 6. Pueblo Hojaverde (Twinleaf Town - Sinnoh Gen 4)
G.MUSIC.twinleaf = {
  bpm: 90, swing: 0.14,
  chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A',
           'G', 'A', 'F#m', 'Bm', 'Em', 'A', 'D', 'D'],
  melody: [{ inst: 'flute', vel: 0.9, bars: [
    'F#5:4 A5:4 D6:4 C#6:2 B5:2', 'A5:8 F#5:8',
    'G5:4 B5:4 A5:2 G5:2 F#5:4', 'E5:12 -:4',
    'F#5:4 A5:4 D6:4 E6:4', 'F#6:6 E6:2 D6:8',
    'B5:4 D6:4 C#6:4 A5:4', 'B5:12 -:4',
    'G5:4 B5:4 A5:4 F#5:4', 'E5:4 G5:4 F#5:8',
    'F#5:4 A5:4 D6:4 B5:4', 'A5:12 -:4',
    'G5:4 B5:4 E6:4 D6:4', 'C#6:6 A5:2 E5:8',
    'F#5:4 A5:4 D6:8', 'D6:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.8, pattern: 'R-------F-------' },
    { inst: 'bell', octave: 4, vel: 0.6, pattern: '0.2.1.2.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.85, pattern: 'C---------------' }
  ],
  drums: { kick: 'o.......o.......', hat: '..o...o...o...o.' }
};

// 7. Plaza Pokémon (Mundo Misterioso / Rescue Team)
G.MUSIC.pmd_square = {
  bpm: 114, swing: 0.12,
  chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D',
           'C', 'D', 'Bm', 'Em', 'Am', 'D', 'G', 'G'],
  melody: [{ inst: 'flute', vel: 0.95, bars: [
    'B4:4 D5:2 G5:2 F#5:4 E5:4', 'D5:6 B4:2 A4:4 D5:4',
    'E5:4 G5:4 B5:4 A5:2 G5:2', 'A5:12 -:4',
    'B5:4 D6:2 B5:2 A5:4 G5:4', 'E5:6 G5:2 D5:8',
    'C5:4 E5:4 G5:4 A5:4', 'G5:12 -:4',
    'E5:4 G5:4 F#5:2 E5:2 D5:4', 'B4:4 D5:4 G5:8',
    'D5:4 F#5:4 E5:2 D5:2 B4:4', 'E5:12 -:4',
    'C5:4 E5:4 A5:4 G5:4', 'F#5:4 A5:4 D6:8',
    'B5:4 D6:4 G5:8', 'G5:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.85, pattern: 'R--F--O-R--F--T-' },
    { inst: 'bell', octave: 4, vel: 0.55, pattern: '0.1.2.1.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.8, pattern: 'C---------------' }
  ],
  drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: 'o.x.o.x.o.x.o.x.' }
};

// 8. Batalla contra Entrenador (Trainer Battle - Clásico)
G.MUSIC.trainer_battle = {
  bpm: 154,
  chords: ['Em', 'D', 'C', 'B', 'Em', 'D', 'C', 'B',
           'C', 'D', 'Em', 'Em', 'C', 'D', 'B', 'B'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'E5:2 E5:2 G5:2 E5:2 B5:4 A5:2 G5:2', 'F#5:4 A5:4 D6:4 C6:2 B5:2',
    'G5:2 F#5:2 E5:2 F#5:2 G5:4 B5:4', 'D#5:8 F#5:4 B5:4',
    'E5:2 E5:2 G5:2 B5:2 E6:4 D6:2 C6:2', 'B5:4 A5:2 G5:2 F#5:4 D#5:4',
    'E5:4 G5:4 A5:4 C6:4', 'B5:12 -:4',
    'C6:4 B5:2 A5:2 G5:4 E5:4', 'D6:4 C6:2 B5:2 A5:4 F#5:4',
    'E6:6 D6:2 B5:4 G5:4', 'E5:12 -:4',
    'C6:4 E6:4 D6:2 C6:2 B5:4', 'A5:4 C6:4 B5:2 A5:2 G5:4',
    'F#5:4 A5:4 B5:4 D#6:4', 'E6:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RR.RR.R.RR.RF.' },
    { inst: 'pluck', octave: 4, vel: 0.55, pattern: '0.1.2.1.0.1.2.3.' },
    { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.x.X.x.X.x.X.x.', snare: '....X.......X.X.', hat: 'oooooooooooooooo' }
};

// Tienda Kecleon (compuesto para el juego): alegre y saltarín, suena mientras compras.
G.MUSIC.shop = {
  bpm: 128, swing: 0.2,
  chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'D', 'G'],
  melody: [{ inst: 'flute', vel: 1, bars: [
    'B4:2 D5:2 G5:4 F#5:2 E5:2 D5:4', 'E5:2 G5:2 B5:4 A5:2 G5:2 E5:4',
    'C5:2 E5:2 G5:2 E5:2 A5:4 G5:4', 'F#5:4 A5:4 D5:8',
    'B4:2 D5:2 G5:4 A5:2 B5:2 C6:4', 'B5:2 A5:2 G5:4 E5:4 G5:4',
    'A5:2 G5:2 E5:2 C5:2 F#5:4 A5:4', 'G5:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R.F.O.F.R.F.O.F.' },
    { inst: 'bell', octave: 4, vel: 0.5, pattern: '0.2.1.2.3.2.1.2.' },
    { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'x.......x.......', snare: '....o.......o...', shaker: 'o.x.o.x.o.x.o.x.' }
};

// Combate de gimnasio (compuesto para el juego): enérgico, suena en el Desafío de Gimnasios.
G.MUSIC.gym = {
  bpm: 150,
  chords: ['Em', 'C', 'D', 'B', 'Em', 'C', 'Am', 'B'],
  melody: [{ inst: 'lead', vel: 1, bars: [
    'E5:2 G5:2 B5:4 A5:2 G5:2 F#5:4', 'E5:2 G5:2 C6:4 B5:2 A5:2 G5:4',
    'F#5:2 A5:2 D6:4 C6:2 B5:2 A5:4', 'B5:4 D#5:4 F#5:4 B5:4',
    'E5:2 E5:2 G5:2 B5:2 E6:4 D6:4', 'C6:4 B5:2 A5:2 G5:4 E5:4',
    'A5:4 C6:4 B5:2 A5:2 G5:4', 'F#5:8 D#5:4 B4:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 1, pattern: 'R.RR.RR.R.RR.RF.' },
    { inst: 'pluck', octave: 4, vel: 0.55, pattern: '0.1.2.1.0.1.2.3.' },
    { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.x.X.x.X.x.X.x.', snare: '....X.......X.X.', hat: 'oooooooooooooooo' }
};

// Temas de los mapas (compuestos para el juego, ver data/maps.js).
// Picos Glaciares: campanas frías y una flauta que sube.
G.MUSIC.tundra = {
  bpm: 108,
  chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'],
  melody: [{ inst: 'flute', vel: 1, bars: [
    'E5:4 A5:4 B5:2 C6:2 B5:4', 'A5:4 F5:4 E5:2 D5:2 C5:4',
    'E5:4 G5:4 C6:6 B5:2', 'B5:8 G5:4 D5:4',
    'E5:2 A5:2 C6:4 B5:2 A5:2 E5:4', 'F5:4 A5:4 C6:4 A5:4',
    'G5:4 B5:4 D6:4 B5:4', 'G#5:8 E5:4 B4:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.8, pattern: 'R-------F-------' },
    { inst: 'bell', octave: 5, vel: 0.45, pattern: '0...2...1...2...' },
    { inst: 'pad', octave: 3, vel: 0.8, pattern: 'C---------------' }
  ],
  drums: { kick: 'x.......x.......', shaker: '..o...o...o...o.' }
};

// Tierras Malditas: lento y misterioso, en re menor.
G.MUSIC.shadow = {
  bpm: 96,
  chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A'],
  melody: [{ inst: 'flute', vel: 0.9, bars: [
    'D5:6 F5:2 A5:4 G#5:4', 'F5:6 D5:2 Bb4:8',
    'G4:4 Bb4:4 D5:4 F5:4', 'E5:8 C#5:8',
    'D5:2 F5:2 A5:4 D6:4 C#6:4', 'Bb5:4 A5:4 F5:4 D5:4',
    'G5:4 F5:2 E5:2 D5:4 Bb4:4', 'A4:12 -:4'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.85, pattern: 'R---R---F---R---' },
    { inst: 'pluck', octave: 4, vel: 0.4, pattern: '0.1.2...0.1.2...' },
    { inst: 'pad', octave: 3, vel: 0.9, pattern: 'C---------------' }
  ],
  drums: { kick: 'x.......x.......', snare: '........o.......' }
};

// Desierto Ancestral: aire antiguo (modo frigio sobre mi), con un poco de swing.
G.MUSIC.desert = {
  bpm: 116, swing: 0.1,
  chords: ['Em', 'F', 'Em', 'D', 'Em', 'F', 'G', 'F'],
  melody: [{ inst: 'lead', vel: 0.9, bars: [
    'E5:2 F5:2 G#5:4 F5:2 E5:2 D5:4', 'F5:2 G5:2 A5:4 G5:2 F5:2 E5:4',
    'E5:4 B5:4 A5:2 G#5:2 F5:4', 'D5:8 F#5:4 A5:4',
    'E5:2 G#5:2 B5:4 C6:4 B5:4', 'A5:2 G5:2 F5:4 E5:4 F5:4',
    'G5:4 B5:4 D6:4 B5:4', 'F5:8 E5:8'
  ]}],
  parts: [
    { inst: 'bass', octave: 2, vel: 0.9, pattern: 'R..R..F.R..R..O.' },
    { inst: 'pluck', octave: 4, vel: 0.5, pattern: '0.2.1.2.0.2.3.2.' },
    { inst: 'pad', octave: 3, vel: 0.5, pattern: 'C-------C-------' }
  ],
  drums: { kick: 'X.....x.X.......', snare: '....x.......x.o.', shaker: 'o.o.o.o.o.o.o.o.' }
};

/* ============ Catálogo público de pistas disponibles ============ */
// Toda la música la toca el sintetizador (js/core/audio.js): sin archivos de audio.
G.MUSIC_TRACKS = [
  { id: 'pallet', name: 'Pueblo Paleta (Chiptune)', game: 'Kanto (Gen 1)', icon: '🎵', category: 'pokemon' },
  { id: 'center', name: 'Centro Pokémon', game: 'Clásico', icon: '❤️', category: 'pokemon' },
  { id: 'route1', name: 'Ruta 1', game: 'Kanto (Gen 1)', icon: '🌿', category: 'pokemon' },
  { id: 'newbark', name: 'Pueblo Primavera', game: 'Johto (Gen 2)', icon: '🍃', category: 'pokemon' },
  { id: 'littleroot', name: 'Villa Raíz', game: 'Hoenn (Gen 3)', icon: '🌊', category: 'pokemon' },
  { id: 'twinleaf', name: 'Pueblo Hojaverde', game: 'Sinnoh (Gen 4)', icon: '❄️', category: 'pokemon' },
  { id: 'pmd_square', name: 'Plaza Pokémon', game: 'Mundo Misterioso', icon: '⛺', category: 'pokemon' },
  { id: 'trainer_battle', name: 'Batalla de Entrenador', game: 'Combate Clásico', icon: '⚔️', category: 'pokemon' },
  { id: 'village', name: 'Aldea Tranquila', game: 'PokéSurvivor', icon: '🏡', category: 'original' },
  { id: 'forest', name: 'Bosque Umbrío', game: 'PokéSurvivor', icon: '🌲', category: 'original' },
  { id: 'cave', name: 'Cueva Cristal', game: 'PokéSurvivor', icon: '💎', category: 'original' },
  { id: 'volcano', name: 'Volcán Ceniza', game: 'PokéSurvivor', icon: '🌋', category: 'original' },
  { id: 'rift', name: 'Duelo contra Legendario', game: 'PokéSurvivor', icon: '⚡', category: 'original' },
  { id: 'judgment', name: 'Sentencia de Arceus', game: 'PokéSurvivor', icon: '👑', category: 'original' },
  { id: 'shop', name: 'Tienda Kecleon', game: 'SurvivorMon', icon: '🛒', category: 'original' },
  { id: 'gym', name: 'Combate de Gimnasio', game: 'SurvivorMon', icon: '🏅', category: 'original' },
  { id: 'tundra', name: 'Picos Glaciares', game: 'SurvivorMon', icon: '❄️', category: 'original' },
  { id: 'shadow', name: 'Tierras Malditas', game: 'SurvivorMon', icon: '👻', category: 'original' },
  { id: 'desert', name: 'Desierto Ancestral', game: 'SurvivorMon', icon: '🏜️', category: 'original' }
];

/** Temas que rotan en el menú (modo aleatorio). */
G.DEFAULT_MENU_TRACKS = ['pallet', 'center', 'route1', 'newbark', 'littleroot', 'twinleaf', 'pmd_square', 'village'];

/** Tema de cada bioma durante la run. */
G.BIOME_MUSIC = ['forest', 'cave', 'volcano'];

