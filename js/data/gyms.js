/* ============ gyms.js — Desafío de Gimnasios (datos) ============
 * Por región: 8 gimnasios y la Liga (Alto Mando de 4 + Campeón).
 *   gimnasio  [líder, tipo, Pokémon estrella, [2 ayudantes], medalla]
 *   alto mando [nombre, tipo, Pokémon estrella]
 *   campeón   [nombre, null (todos los tipos de la región), Pokémon estrella]
 * Los enemigos de cada combate son Pokémon de ESE tipo y de ESA región (ver
 * systems/gym.js; si hay pocos, se completa con las generaciones vecinas).
 * Juego de fans: los líderes y sus Pokémon son los de los juegos originales.
 */
G.GymData = (() => {
  const REGIONS = [
    { id: 'kanto', name: 'Kanto', gen: 1,
      gyms: [
        ['Brock', 'rock', 95, [74, 138], 'Roca'], ['Misty', 'water', 121, [120, 54], 'Cascada'],
        ['Teniente Surge', 'electric', 26, [100, 81], 'Trueno'], ['Erika', 'grass', 45, [114, 71], 'Arcoíris'],
        ['Koga', 'poison', 110, [109, 89], 'Alma'], ['Sabrina', 'psychic', 65, [122, 64], 'Pantano'],
        ['Blaine', 'fire', 59, [78, 126], 'Volcán'], ['Giovanni', 'ground', 112, [34, 31], 'Tierra']],
      elite: [['Lorelei', 'ice', 131], ['Bruno', 'fighting', 68], ['Agatha', 'ghost', 94], ['Lance', 'dragon', 149]],
      champion: ['Azul', null, 9] },
    { id: 'johto', name: 'Johto', gen: 2,
      gyms: [
        ['Pegaso', 'flying', 17, [16, 163], 'Céfiro'], ['Antón', 'bug', 123, [165, 167], 'Colmena'],
        ['Blanca', 'normal', 241, [35, 216], 'Planicie'], ['Morti', 'ghost', 94, [92, 200], 'Niebla'],
        ['Aníbal', 'fighting', 62, [57, 237], 'Tormenta'], ['Yasmina', 'steel', 208, [81, 227], 'Mineral'],
        ['Fredo', 'ice', 221, [86, 220], 'Glaciar'], ['Débora', 'dragon', 230, [148, 147], 'Dragón']],
      elite: [['Mento', 'psychic', 178], ['Koga', 'poison', 169], ['Bruno', 'fighting', 68], ['Karen', 'dark', 229]],
      champion: ['Lance', null, 149] },
    { id: 'hoenn', name: 'Hoenn', gen: 3,
      gyms: [
        ['Petra', 'rock', 299, [74, 345], 'Piedra'], ['Marcial', 'fighting', 297, [296, 307], 'Puño'],
        ['Erico', 'electric', 310, [309, 82], 'Dinamo'], ['Candela', 'fire', 324, [322, 218], 'Calor'],
        ['Norman', 'normal', 289, [288, 264], 'Equilibrio'], ['Alana', 'flying', 334, [277, 279], 'Pluma'],
        ['Vito y Leti', 'psychic', 338, [337, 344], 'Mente'], ['Plubio', 'water', 350, [340, 364], 'Lluvia']],
      elite: [['Sixto', 'dark', 359], ['Fátima', 'ghost', 356], ['Nívea', 'ice', 365], ['Dracón', 'dragon', 373]],
      champion: ['Máximo', null, 376] },
    { id: 'sinnoh', name: 'Sinnoh', gen: 4,
      gyms: [
        ['Roco', 'rock', 408, [74, 95], 'Lignito'], ['Gardenia', 'grass', 407, [420, 387], 'Bosque'],
        ['Brega', 'fighting', 448, [307, 447], 'Adoquín'], ['Mananti', 'water', 419, [418, 423], 'Ciénaga'],
        ['Fantina', 'ghost', 429, [425, 426], 'Reliquia'], ['Acerón', 'steel', 411, [410, 436], 'Mina'],
        ['Inverna', 'ice', 460, [459, 461], 'Carámbano'], ['Lectro', 'electric', 466, [405, 404], 'Faro']],
      elite: [['Alecrán', 'bug', 452], ['Gaia', 'ground', 450], ['Fausto', 'fire', 392], ['Delos', 'psychic', 475]],
      champion: ['Cintia', null, 445] },
    { id: 'teselia', name: 'Teselia', gen: 5,
      gyms: [
        ['Millo', 'grass', 512, [511, 495], 'Trío'], ['Aloe', 'normal', 505, [504, 506], 'Base'],
        ['Camus', 'bug', 542, [540, 557], 'Élitro'], ['Camila', 'electric', 604, [587, 595], 'Voltio'],
        ['Yakón', 'ground', 530, [529, 552], 'Temblor'], ['Gerania', 'flying', 581, [528, 521], 'Jet'],
        ['Junco', 'ice', 614, [583, 615], 'Iceberg'], ['Lirio', 'dragon', 612, [611, 621], 'Leyenda']],
      elite: [['Anís', 'ghost', 609], ['Lotto', 'fighting', 534], ['Aza', 'dark', 625], ['Catleya', 'psychic', 576]],
      champion: ['Mirto', null, 637] },
    { id: 'kalos', name: 'Kalos', gen: 6,
      gyms: [
        ['Violeta', 'bug', 666, [664, 665], 'Insecto'], ['Lino', 'rock', 697, [696, 698], 'Muro'],
        ['Corelia', 'fighting', 448, [701, 674], 'Lucha'], ['Amaro', 'grass', 673, [672, 709], 'Hoja'],
        ['Lem', 'electric', 695, [694, 702], 'Voltio'], ['Valeria', 'fairy', 700, [682, 669], 'Hada'],
        ['Ástrid', 'psychic', 678, [677, 686], 'Psique'], ['Édel', 'ice', 713, [712, 87], 'Iceberg']],
      elite: [['Malva', 'fire', 663], ['Narciso', 'water', 689], ['Tileo', 'steel', 681], ['Drácena', 'dragon', 715]],
      champion: ['Dianta', null, 282] },
    { id: 'alola', name: 'Alola', gen: 7,
      gyms: [
        ['Liam', 'normal', 760, [734, 759], 'Sello Normal'], ['Nereida', 'water', 752, [751, 746], 'Sello Agua'],
        ['Kiawe', 'fire', 758, [757, 776], 'Sello Fuego'], ['Lulú', 'grass', 763, [761, 754], 'Sello Planta'],
        ['Chris', 'electric', 738, [737, 777], 'Sello Eléctrico'], ['Nanu', 'dark', 53, [215, 302], 'Sello Siniestro'],
        ['Mina', 'fairy', 743, [742, 764], 'Sello Hada'], ['Hapu', 'ground', 750, [749, 769], 'Sello Tierra']],
      elite: [['Kaudan', 'fighting', 740], ['Mayla', 'rock', 745], ['Zarala', 'ghost', 770], ['Kahili', 'flying', 741]],
      champion: ['Kukui', null, 727] },
    { id: 'galar', name: 'Galar', gen: 8,
      gyms: [
        ['Percy', 'grass', 830, [829, 810], 'Planta'], ['Cathy', 'water', 834, [833, 846], 'Agua'],
        ['Naboru', 'fire', 851, [850, 814], 'Fuego'], ['Judith', 'fighting', 68, [853, 852], 'Lucha'],
        ['Sally', 'fairy', 869, [868, 858], 'Hada'], ['Morris', 'rock', 874, [111, 744], 'Roca'],
        ['Nerio', 'dark', 862, [861, 859], 'Siniestro'], ['Roy', 'dragon', 884, [887, 842], 'Dragón']],
      elite: [['Roxy', 'dark', 861], ['Berto', 'fairy', 858], ['Paul', 'normal', 832], ['Avery', 'psychic', 876]],
      champion: ['Lionel', null, 6] },
    { id: 'paldea', name: 'Paldea', gen: 9,
      gyms: [
        ['Araceli', 'bug', 920, [919, 917], 'Bicho'], ['Brais', 'grass', 930, [928, 951], 'Planta'],
        ['e-Nigma', 'electric', 939, [938, 941], 'Eléctrico'], ['Fuco', 'water', 976, [961, 960], 'Agua'],
        ['Laureano', 'normal', 982, [924, 925], 'Normal'], ['Lima', 'ghost', 972, [971, 93], 'Fantasma'],
        ['Tuli', 'psychic', 282, [955, 671], 'Psíquico'], ['Grusha', 'ice', 975, [974, 996], 'Hielo']],
      elite: [['Cayena', 'ground', 980], ['Pola', 'steel', 959], ['Laureano', 'flying', 334], ['Hassel', 'dragon', 998]],
      champion: ['Ságita', null, 970] }
  ];
  const BY = {};
  for (const r of REGIONS) BY[r.id] = r;
  return { REGIONS, BY };
})();
