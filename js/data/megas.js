/* ============ megas.js — Megas auténticas ============
 * Formas supremas de rareza 6★ (Míticas) obtenibles en el Sagrario de Arceus.
 * 83 Megas oficiales con stats, pasivas y auras.
 */
G.Megas = (() => {
  const LIST = [
  {
    "id": "mega_charizard_x",
    "dex": 6,
    "name": "Mega Charizard X",
    "stone": "charizardita_x",
    "types": [
      "fire",
      "dragon"
    ],
    "bst": 634,
    "auraColor": "#00e5ff",
    "passive": "Garra Dura",
    "passiveDesc": "Aumenta el daño de contacto y fuego un +35%.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "charizard_y",
    "dex": 6,
    "name": "Mega Charizard Y",
    "stone": "charizardita_y",
    "types": [
      "fire",
      "flying"
    ],
    "bst": 634,
    "auraColor": "#ff773d",
    "passive": "Sequía",
    "passiveDesc": "Potencia el fuego un 50% y desata llamaradas solares continuas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "venusaur_mega",
    "dex": 3,
    "name": "Mega Venusaur",
    "stone": "venusaurita",
    "types": [
      "grass",
      "poison"
    ],
    "bst": 625,
    "auraColor": "#5fcb6a",
    "passive": "Sebo",
    "passiveDesc": "Inmunidad a quemaduras y daño de fuego reducido un 50%.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "blastoise_mega",
    "dex": 9,
    "name": "Mega Blastoise",
    "stone": "blastoisita",
    "types": [
      "water"
    ],
    "bst": 630,
    "auraColor": "#4b9bff",
    "passive": "Megadisparador",
    "passiveDesc": "Los proyectiles aumentan un 50% de tamaño y daño.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "beedrill_mega",
    "dex": 15,
    "name": "Mega Beedrill",
    "stone": "beedrillita",
    "types": [
      "bug",
      "poison"
    ],
    "bst": 495,
    "auraColor": "#ffd23f",
    "passive": "Adaptable",
    "passiveDesc": "Velocidad de movimiento extrema y críticos letales continuos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "pidgeot_mega",
    "dex": 18,
    "name": "Mega Pidgeot",
    "stone": "pidgeotita",
    "types": [
      "normal",
      "flying"
    ],
    "bst": 579,
    "auraColor": "#f4a261",
    "passive": "Indefenso",
    "passiveDesc": "Todos los ataques tienen 100% de precisión y atraviesan pantallas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "raichu_mega_y",
    "dex": 26,
    "name": "Mega Raichu Y",
    "stone": "raichuita_y",
    "types": [
      "electric",
      "psychic"
    ],
    "bst": 585,
    "auraColor": "#ffd33d",
    "passive": "Surfeo Estelar",
    "passiveDesc": "Flota sobre trampas y genera campos eléctricos expansivos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_alakazam",
    "dex": 65,
    "name": "Mega Alakazam",
    "stone": "alakazamita",
    "types": [
      "psychic"
    ],
    "bst": 600,
    "auraColor": "#c47bff",
    "passive": "Rastro Arcano",
    "passiveDesc": "Los proyectiles psíquicos rebotan y atraviesan enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_slowbro",
    "dex": 80,
    "name": "Mega Slowbro",
    "stone": "slowbronita",
    "types": [
      "water",
      "psychic"
    ],
    "bst": 590,
    "auraColor": "#00e5ff",
    "passive": "Caparazón Férreo",
    "passiveDesc": "Reduce un 40% el daño recibido y resiste empujes.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_gengar",
    "dex": 94,
    "name": "Mega Gengar",
    "stone": "gengarita",
    "types": [
      "ghost",
      "poison"
    ],
    "bst": 600,
    "auraColor": "#c47bff",
    "passive": "Sombra Trampa",
    "passiveDesc": "Ralentiza a los enemigos cercanos un 40% y libera pulsos espectrales.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_kangaskhan",
    "dex": 115,
    "name": "Mega Kangaskhan",
    "stone": "kangaskhanita",
    "types": [
      "normal"
    ],
    "bst": 590,
    "auraColor": "#00e5ff",
    "passive": "Amor Filial",
    "passiveDesc": "Cada ataque se dispara dos veces consecutivas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "pinsir_mega",
    "dex": 127,
    "name": "Mega Pinsir",
    "stone": "pinsirita",
    "types": [
      "bug",
      "flying"
    ],
    "bst": 600,
    "auraColor": "#c9a227",
    "passive": "Piel Celeste",
    "passiveDesc": "Ataques normales se convierten en ráfagas voladoras con empuje.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "gyarados_mega",
    "dex": 130,
    "name": "Mega Gyarados",
    "stone": "gyaradosita",
    "types": [
      "water",
      "dark"
    ],
    "bst": 640,
    "auraColor": "#2e3859",
    "passive": "Rompemoldes",
    "passiveDesc": "Críticos garantizados contra élites y ondas de cólera marina.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_aerodactyl",
    "dex": 142,
    "name": "Mega Aerodactyl",
    "stone": "aerodactylita",
    "types": [
      "rock",
      "flying"
    ],
    "bst": 615,
    "auraColor": "#00e5ff",
    "passive": "Garra Dura",
    "passiveDesc": "Aumenta un 30% el daño de impacto directo y empuja.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "dragonite_mega",
    "dex": 149,
    "name": "Mega Dragonite",
    "stone": "dragonitita",
    "types": [
      "dragon",
      "flying"
    ],
    "bst": 700,
    "auraColor": "#ff9f43",
    "passive": "Escama Mítica",
    "passiveDesc": "Inmunidad al primer golpe y cometas dracónicos periódicos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mewtwo_x",
    "dex": 150,
    "name": "Mega Mewtwo X",
    "stone": "mewtwonita_x",
    "types": [
      "psychic",
      "fighting"
    ],
    "bst": 780,
    "auraColor": "#ff6b6b",
    "passive": "Impasible",
    "passiveDesc": "Golpes psíquico-marciales devastadores que aturden a los jefes.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_mewtwo_y",
    "dex": 150,
    "name": "Mega Mewtwo Y",
    "stone": "mewtwonita_y",
    "types": [
      "psychic"
    ],
    "bst": 780,
    "auraColor": "#c47bff",
    "passive": "Omnipotencia Mental",
    "passiveDesc": "Dispara ondas psíquicas expansivas automáticas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "meganium_mega",
    "dex": 154,
    "name": "Mega Meganium",
    "stone": "meganiumita",
    "types": [
      "grass",
      "fairy"
    ],
    "bst": 625,
    "auraColor": "#55efc4",
    "passive": "Aroma Sanador",
    "passiveDesc": "Regenera 4% de vida cada 8s a ti y a tus aliados.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "typhlosion_mega",
    "dex": 157,
    "name": "Mega Typhlosion",
    "stone": "typhlosionita",
    "types": [
      "fire",
      "ghost"
    ],
    "bst": 634,
    "auraColor": "#d63031",
    "passive": "Llama Espectral",
    "passiveDesc": "Anillos de fuego fantasmal que absorben almas al derrotar enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "feraligatr_mega",
    "dex": 160,
    "name": "Mega Feraligatr",
    "stone": "feraligatrita",
    "types": [
      "water",
      "dark"
    ],
    "bst": 630,
    "auraColor": "#0984e3",
    "passive": "Mandíbula Fuerte",
    "passiveDesc": "Ataques mordisco devastadores que curan al golpear.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "ampharos_mega",
    "dex": 181,
    "name": "Mega Ampharos",
    "stone": "ampharosito",
    "types": [
      "electric",
      "dragon"
    ],
    "bst": 610,
    "auraColor": "#ffeaa7",
    "passive": "Rompemoldes",
    "passiveDesc": "Melena de dragón que descarga relámpagos estelares continuos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_steelix",
    "dex": 208,
    "name": "Mega Steelix",
    "stone": "steelixita",
    "types": [
      "steel",
      "ground"
    ],
    "bst": 610,
    "auraColor": "#00e5ff",
    "passive": "Poder Arena",
    "passiveDesc": "Giro continuo de fragmentos metálicos defensivos alrededor.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "scizor_mega",
    "dex": 212,
    "name": "Mega Scizor",
    "stone": "scizorita",
    "types": [
      "bug",
      "steel"
    ],
    "bst": 600,
    "auraColor": "#ff7675",
    "passive": "Experto",
    "passiveDesc": "Aumenta un 50% el daño de todos los movimientos rápidos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "heracross_mega",
    "dex": 214,
    "name": "Mega Heracross",
    "stone": "heracrossita",
    "types": [
      "bug",
      "fighting"
    ],
    "bst": 600,
    "auraColor": "#74b9ff",
    "passive": "Encadenado",
    "passiveDesc": "Todos los proyectiles disparan ráfagas quíntuples consecutivas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_skarmory",
    "dex": 227,
    "name": "Mega Skarmory",
    "stone": "skarmoryita",
    "types": [
      "steel",
      "flying"
    ],
    "bst": 565,
    "auraColor": "#00e5ff",
    "passive": "Alas de Acero",
    "passiveDesc": "Lanza púas afiladas al recibir impactos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_houndoom",
    "dex": 229,
    "name": "Mega Houndoom",
    "stone": "houndoomita",
    "types": [
      "dark",
      "fire"
    ],
    "bst": 600,
    "auraColor": "#00e5ff",
    "passive": "Poder Solar",
    "passiveDesc": "Fuego infernal que derrite la armadura de los enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_tyranitar",
    "dex": 248,
    "name": "Mega Tyranitar",
    "stone": "tyranitarita",
    "types": [
      "rock",
      "dark"
    ],
    "bst": 700,
    "auraColor": "#00e5ff",
    "passive": "Chorro Arena",
    "passiveDesc": "Tormenta de arena permanente que hiere a toda la pantalla.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_sceptile",
    "dex": 254,
    "name": "Mega Sceptile",
    "stone": "sceptilita",
    "types": [
      "grass",
      "dragon"
    ],
    "bst": 630,
    "auraColor": "#5fe08a",
    "passive": "Pararrayos",
    "passiveDesc": "Inmunidad al trueno y proyectiles de cola teledirigidos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "blaziken_mega",
    "dex": 257,
    "name": "Mega Blaziken",
    "stone": "blazikenita",
    "types": [
      "fire",
      "fighting"
    ],
    "bst": 630,
    "auraColor": "#e17055",
    "passive": "Impulso",
    "passiveDesc": "Cada 5 segundos aumenta tu velocidad de ataque y movimiento.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "swampert_mega",
    "dex": 260,
    "name": "Mega Swampert",
    "stone": "swampertita",
    "types": [
      "water",
      "ground"
    ],
    "bst": 635,
    "auraColor": "#0984e3",
    "passive": "Nado Rápido",
    "passiveDesc": "Fuerza masiva y velocidad duplicada en terreno acuático.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_gardevoir",
    "dex": 282,
    "name": "Mega Gardevoir",
    "stone": "gardevoirita",
    "types": [
      "psychic",
      "fairy"
    ],
    "bst": 618,
    "auraColor": "#c47bff",
    "passive": "Piel Feérica",
    "passiveDesc": "Vórtices lunares de polvo de hadas que desintegran esbirros.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_sableye",
    "dex": 302,
    "name": "Mega Sableye",
    "stone": "sableyeita",
    "types": [
      "dark",
      "ghost"
    ],
    "bst": 480,
    "auraColor": "#c47bff",
    "passive": "Espejo Mágico",
    "passiveDesc": "Refleja todos los proyectiles enemigos con su gran joya.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_mawile",
    "dex": 303,
    "name": "Mega Mawile",
    "stone": "mawilita",
    "types": [
      "steel",
      "fairy"
    ],
    "bst": 480,
    "auraColor": "#00e5ff",
    "passive": "Potencia",
    "passiveDesc": "Duplica el ataque físico básico de tu Pokémon.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "aggron_mega",
    "dex": 304,
    "name": "Mega Aggron",
    "stone": "aggronita",
    "types": [
      "steel"
    ],
    "bst": 630,
    "auraColor": "#b2bec3",
    "passive": "Filtro",
    "passiveDesc": "Reduce los ataques supereficaces recibidos un 40%.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_medicham",
    "dex": 308,
    "name": "Mega Medicham",
    "stone": "medichamita",
    "types": [
      "fighting",
      "psychic"
    ],
    "bst": 510,
    "auraColor": "#c47bff",
    "passive": "Energía Pura",
    "passiveDesc": "Golpes con onda expansiva espiritual de alto impacto.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_manectric",
    "dex": 310,
    "name": "Mega Manectric",
    "stone": "manectricita",
    "types": [
      "electric"
    ],
    "bst": 575,
    "auraColor": "#ffcb3d",
    "passive": "Intimidación",
    "passiveDesc": "Reduce el daño de los enemigos cercanos un 25%.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_sharpedo",
    "dex": 319,
    "name": "Mega Sharpedo",
    "stone": "sharpedonita",
    "types": [
      "water",
      "dark"
    ],
    "bst": 560,
    "auraColor": "#00e5ff",
    "passive": "Mandíbula Fuerte",
    "passiveDesc": "Embestidas acuáticas cortantes a gran velocidad.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_camerupt",
    "dex": 323,
    "name": "Mega Camerupt",
    "stone": "cameruptita",
    "types": [
      "fire",
      "ground"
    ],
    "bst": 560,
    "auraColor": "#00e5ff",
    "passive": "Potencia Bruta",
    "passiveDesc": "Erupciones constantes de magma volcánico abrasador.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "flygon_mega",
    "dex": 330,
    "name": "Mega Flygon",
    "stone": "flygonita",
    "types": [
      "ground",
      "dragon"
    ],
    "bst": 620,
    "auraColor": "#55efc4",
    "passive": "Torbellino Sónico",
    "passiveDesc": "Crea ciclones de arena que absorben proyectiles enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_altaria",
    "dex": 334,
    "name": "Mega Altaria",
    "stone": "altarianita",
    "types": [
      "dragon",
      "fairy"
    ],
    "bst": 590,
    "auraColor": "#00e5ff",
    "passive": "Piel Feérica",
    "passiveDesc": "Algodón protector que absorbe golpes y lanza notas musicales.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "milotic_mega",
    "dex": 350,
    "name": "Mega Milotic",
    "stone": "miloticita",
    "types": [
      "water",
      "fairy"
    ],
    "bst": 640,
    "auraColor": "#74b9ff",
    "passive": "Gracia Espejo",
    "passiveDesc": "Mareas curativas que restauran vida a compañeros.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_banette",
    "dex": 354,
    "name": "Mega Banette",
    "stone": "banettita",
    "types": [
      "ghost"
    ],
    "bst": 555,
    "auraColor": "#c47bff",
    "passive": "Bromista",
    "passiveDesc": "Maldiciones flotantes que drenan la vida de los enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_chimecho",
    "dex": 358,
    "name": "Mega Chimecho",
    "stone": "chimechita",
    "types": [
      "psychic",
      "steel"
    ],
    "bst": 555,
    "auraColor": "#c47bff",
    "passive": "Campana Mística",
    "passiveDesc": "Ondas sónicas que paralizan grupos enteros de enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_absol",
    "dex": 359,
    "name": "Mega Absol",
    "stone": "absolita",
    "types": [
      "dark"
    ],
    "bst": 565,
    "auraColor": "#c47bff",
    "passive": "Espejo Mágico",
    "passiveDesc": "Alas sombrías que desatan tajos aéreos críticos continuos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_glalie",
    "dex": 362,
    "name": "Mega Glalie",
    "stone": "glalitita",
    "types": [
      "ice"
    ],
    "bst": 580,
    "auraColor": "#00e5ff",
    "passive": "Piel Helada",
    "passiveDesc": "Congela automáticamente a los enemigos que se acerquen.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "salamence_mega",
    "dex": 373,
    "name": "Mega Salamence",
    "stone": "salamencita",
    "types": [
      "dragon",
      "flying"
    ],
    "bst": 700,
    "auraColor": "#0984e3",
    "passive": "Piel Celeste",
    "passiveDesc": "Vuelo rasante supersónico con cortes en media luna.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "metagross_mega",
    "dex": 376,
    "name": "Mega Metagross",
    "stone": "metagrossita",
    "types": [
      "steel",
      "psychic"
    ],
    "bst": 700,
    "auraColor": "#00cec9",
    "passive": "Garra Dura",
    "passiveDesc": "Cuatro brazos mecánicos flotantes que golpean al unísono.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_latias",
    "dex": 380,
    "name": "Mega Latias",
    "stone": "latiasita",
    "types": [
      "dragon",
      "psychic"
    ],
    "bst": 700,
    "auraColor": "#c47bff",
    "passive": "Levitación",
    "passiveDesc": "Vuelo etéreo y rayos místicos de energía pura.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_latios",
    "dex": 381,
    "name": "Mega Latios",
    "stone": "latiosita",
    "types": [
      "dragon",
      "psychic"
    ],
    "bst": 700,
    "auraColor": "#00e5ff",
    "passive": "Levitación",
    "passiveDesc": "Velocidad supersónica y bombardeo de esferas aurales.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "kyogre_primal",
    "dex": 382,
    "name": "Kyogre Primigenio",
    "stone": "esfera_azul",
    "types": [
      "water"
    ],
    "bst": 770,
    "auraColor": "#00e5ff",
    "passive": "Mar del Albor",
    "passiveDesc": "Inunda el mapa y desata géiseres torrenciales continuos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "groudon_primal",
    "dex": 383,
    "name": "Groudon Primigenio",
    "stone": "esfera_roja",
    "types": [
      "ground",
      "fire"
    ],
    "bst": 770,
    "auraColor": "#00e5ff",
    "passive": "Tierra del Ocaso",
    "passiveDesc": "Lava incandescente que abrasa a los enemigos al pisarla.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_rayquaza",
    "dex": 384,
    "name": "Mega Rayquaza",
    "stone": "meteorito_ascenso",
    "types": [
      "dragon",
      "flying"
    ],
    "bst": 780,
    "auraColor": "#5fe08a",
    "passive": "Ráfaga Delta",
    "passiveDesc": "Vientos celestiales cortantes e inmunidad total a trampas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "staraptor_mega",
    "dex": 398,
    "name": "Mega Staraptor",
    "stone": "staraptorita",
    "types": [
      "normal",
      "flying"
    ],
    "bst": 585,
    "auraColor": "#636e72",
    "passive": "Audaz",
    "passiveDesc": "Embestidas aéreas devastadoras con retroceso nulo.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_lopunny",
    "dex": 428,
    "name": "Mega Lopunny",
    "stone": "lopunnita",
    "types": [
      "normal",
      "fighting"
    ],
    "bst": 580,
    "auraColor": "#ffcb3d",
    "passive": "Intrépido",
    "passiveDesc": "Golpea a tipos fantasma e inflige ráfagas de patadas veloces.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "garchomp_mega",
    "dex": 445,
    "name": "Mega Garchomp",
    "stone": "garchompita",
    "types": [
      "dragon",
      "ground"
    ],
    "bst": 700,
    "auraColor": "#d63031",
    "passive": "Poder Arena",
    "passiveDesc": "Hoz de dragón que desgarra formaciones enemigas enteras.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_lucario",
    "dex": 448,
    "name": "Mega Lucario",
    "stone": "lucarionita",
    "types": [
      "fighting",
      "steel"
    ],
    "bst": 625,
    "auraColor": "#ffcb3d",
    "passive": "Adaptable",
    "passiveDesc": "Ondas aurales continuas que empujan y aturden enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "abomasnow_mega",
    "dex": 460,
    "name": "Mega Abomasnow",
    "stone": "abomasnowita",
    "types": [
      "grass",
      "ice"
    ],
    "bst": 594,
    "auraColor": "#81ecec",
    "passive": "Nevada",
    "passiveDesc": "Ventisca helada perenne que ralentiza y daña en área.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_gallade",
    "dex": 475,
    "name": "Mega Gallade",
    "stone": "galladita",
    "types": [
      "psychic",
      "fighting"
    ],
    "bst": 618,
    "auraColor": "#5fe08a",
    "passive": "Foco Interno",
    "passiveDesc": "Espadas de luz en los brazos con alta probabilidad de crítico.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "froslass_mega",
    "dex": 478,
    "name": "Mega Froslass",
    "stone": "froslassita",
    "types": [
      "ice",
      "ghost"
    ],
    "bst": 580,
    "auraColor": "#74b9ff",
    "passive": "Manto Níveo",
    "passiveDesc": "Se vuelve intangible periódicamente al esquivar ataques.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "dialga_primal",
    "dex": 483,
    "name": "Dialga Primigenio",
    "stone": "diamante_origen",
    "types": [
      "steel",
      "dragon"
    ],
    "bst": 780,
    "auraColor": "#00e5ff",
    "passive": "Distorsión Temporal",
    "passiveDesc": "Detiene brevemente el tiempo para todos los enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "heatran_mega",
    "dex": 485,
    "name": "Mega Heatran",
    "stone": "heatranita",
    "types": [
      "fire",
      "steel"
    ],
    "bst": 700,
    "auraColor": "#d63031",
    "passive": "Magma Fundido",
    "passiveDesc": "Deja un rastro continuo de lava hirviente al moverse.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_darkrai",
    "dex": 491,
    "name": "Mega Darkrai",
    "stone": "pesadilla_pura",
    "types": [
      "dark"
    ],
    "bst": 700,
    "auraColor": "#c47bff",
    "passive": "Mal Sueño Supremo",
    "passiveDesc": "Duerme a los enemigos y drena su energía vital continuamente.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_excadrill",
    "dex": 530,
    "name": "Mega Excadrill",
    "stone": "excadrillita",
    "types": [
      "ground",
      "steel"
    ],
    "bst": 608,
    "auraColor": "#00e5ff",
    "passive": "Taladro Férreo",
    "passiveDesc": "Giro taladrador que penetra armaduras y pulveriza rocas.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "audino_mega",
    "dex": 531,
    "name": "Mega Audino",
    "stone": "audinita",
    "types": [
      "normal",
      "fairy"
    ],
    "bst": 545,
    "auraColor": "#fd79a8",
    "passive": "Alma Cura",
    "passiveDesc": "Cura periódicamente estados alterados y otorga escudos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "scolipede_mega",
    "dex": 545,
    "name": "Mega Scolipede",
    "stone": "scolipedita",
    "types": [
      "bug",
      "poison"
    ],
    "bst": 585,
    "auraColor": "#6c5ce7",
    "passive": "Aceleración",
    "passiveDesc": "Gana velocidad por cada enemigo derrotado en la sala.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_scrafty",
    "dex": 560,
    "name": "Mega Scrafty",
    "stone": "scraftyita",
    "types": [
      "dark",
      "fighting"
    ],
    "bst": 588,
    "auraColor": "#00e5ff",
    "passive": "Autoestima",
    "passiveDesc": "Aumenta el ataque tras cada baja enemiga.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_eelektross",
    "dex": 604,
    "name": "Mega Eelektross",
    "stone": "eelektrossita",
    "types": [
      "electric"
    ],
    "bst": 615,
    "auraColor": "#00e5ff",
    "passive": "Levitación Pura",
    "passiveDesc": "Sin debilidades elementales y descargas de alto voltaje.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "chandelure_mega",
    "dex": 609,
    "name": "Mega Chandelure",
    "stone": "chandelurita",
    "types": [
      "ghost",
      "fire"
    ],
    "bst": 620,
    "auraColor": "#6c5ce7",
    "passive": "Fuego Fatuo",
    "passiveDesc": "Llamas sombrías que se propagan entre los enemigos cercanos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "chesnaught_mega",
    "dex": 652,
    "name": "Mega Chesnaught",
    "stone": "chesnaughtita",
    "types": [
      "grass",
      "fighting"
    ],
    "bst": 630,
    "auraColor": "#55efc4",
    "passive": "Púas Blindadas",
    "passiveDesc": "Refleja el 30% del daño cuerpo a cuerpo recibido.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "delphox_mega",
    "dex": 655,
    "name": "Mega Delphox",
    "stone": "delphoxita",
    "types": [
      "fire",
      "psychic"
    ],
    "bst": 634,
    "auraColor": "#e17055",
    "passive": "Varita Mística",
    "passiveDesc": "Orbes de fuego teledirigidos que persiguen a los enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "greninja_ash",
    "dex": 658,
    "name": "Ash-Greninja",
    "stone": "vinculo_batalla",
    "types": [
      "water",
      "dark"
    ],
    "bst": 640,
    "auraColor": "#0984e3",
    "passive": "Fuerte Afecto",
    "passiveDesc": "Shurikens gigantes de agua con velocidad ultra rápida.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "pyroar_mega",
    "dex": 668,
    "name": "Mega Pyroar",
    "stone": "pyroarita",
    "types": [
      "fire",
      "normal"
    ],
    "bst": 607,
    "auraColor": "#e17055",
    "passive": "Rugido Ígneo",
    "passiveDesc": "Ondas de calor sónicas expansivas que empujan a la horda.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_floette",
    "dex": 670,
    "name": "Floette Flor Eterna",
    "stone": "flor_eterna",
    "types": [
      "fairy"
    ],
    "bst": 551,
    "auraColor": "#00e5ff",
    "passive": "Luz del Alba",
    "passiveDesc": "Haces de luz floral que purifican y sanan a los aliados.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_dragalge",
    "dex": 691,
    "name": "Mega Dragalge",
    "stone": "dragalgeita",
    "types": [
      "poison",
      "dragon"
    ],
    "bst": 594,
    "auraColor": "#00e5ff",
    "passive": "Adaptabilidad Tóxica",
    "passiveDesc": "Nubes de veneno corrosivo persistentes en el suelo.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_hawlucha",
    "dex": 701,
    "name": "Mega Hawlucha",
    "stone": "hawluchaita",
    "types": [
      "fighting",
      "flying"
    ],
    "bst": 600,
    "auraColor": "#00e5ff",
    "passive": "Plancha Real",
    "passiveDesc": "Saltos acrobáticos devastadores con onda de choque al caer.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_zygarde",
    "dex": 718,
    "name": "Zygarde Forma Completa",
    "stone": "nucleo_optimo",
    "types": [
      "dragon",
      "ground"
    ],
    "bst": 708,
    "auraColor": "#5fe08a",
    "passive": "Agrupamiento Óptimo",
    "passiveDesc": "Colosal barra de vida y Rayos Núcleo expansivos en cruz.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_diancie",
    "dex": 719,
    "name": "Mega Diancie",
    "stone": "diancita",
    "types": [
      "rock",
      "fairy"
    ],
    "bst": 700,
    "auraColor": "#c47bff",
    "passive": "Espejo Mágico",
    "passiveDesc": "Lanza diamantes resplandecientes que estallan en mil pedazos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "golisopod_mega",
    "dex": 768,
    "name": "Mega Golisopod",
    "stone": "golisopodita",
    "types": [
      "bug",
      "water"
    ],
    "bst": 630,
    "auraColor": "#00cec9",
    "passive": "Escaramuza",
    "passiveDesc": "El primer ataque tras moverse inflige un impacto crítico letal.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_drampa",
    "dex": 780,
    "name": "Mega Drampa",
    "stone": "drampaita",
    "types": [
      "normal",
      "dragon"
    ],
    "bst": 585,
    "auraColor": "#00e5ff",
    "passive": "Cólera Ancestral",
    "passiveDesc": "Al caer la vida por debajo del 50%, duplica su ataque.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "necrozma_ultra",
    "dex": 800,
    "name": "Ultra Necrozma",
    "stone": "ultranecrostal_z",
    "types": [
      "psychic",
      "dragon"
    ],
    "bst": 754,
    "auraColor": "#ffeaa7",
    "passive": "Fuerza Cerebral",
    "passiveDesc": "Fábulas de luz destructivas en 360 grados que ciegan esbirros.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_zeraora",
    "dex": 807,
    "name": "Mega Zeraora",
    "stone": "plasma_zeraora",
    "types": [
      "electric",
      "fighting"
    ],
    "bst": 700,
    "auraColor": "#c47bff",
    "passive": "Plasma Puro",
    "passiveDesc": "Puños de plasma a la velocidad de la luz.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "scovillain_mega",
    "dex": 952,
    "name": "Mega Scovillain",
    "stone": "scovillainita",
    "types": [
      "grass",
      "fire"
    ],
    "bst": 586,
    "auraColor": "#d63031",
    "passive": "Picante Extremo",
    "passiveDesc": "Explosiones de pimienta ardiente que ciegan a los enemigos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  },
  {
    "id": "mega_tatsugiri",
    "dex": 978,
    "name": "Mega Tatsugiri",
    "stone": "nigiri_mistico",
    "types": [
      "dragon",
      "water"
    ],
    "bst": 575,
    "auraColor": "#00e5ff",
    "passive": "Comandante Supremo",
    "passiveDesc": "Dirige ataques dracónicos guiados automáticos.",
    "statMult": {
      "atk": 1.4,
      "spd": 1.2,
      "hp": 1.25,
      "area": 1.25
    }
  }
];

  const BY_ID = {};
  const BY_DEX = {};
  for (const m of LIST) {
    BY_ID[m.id] = m;
    if (!BY_DEX[m.dex]) BY_DEX[m.dex] = [];
    BY_DEX[m.dex].push(m);
  }

  function get(id) { return BY_ID[id] || null; }
  function getById(id) { return BY_ID[id] || null; }
  function getByDex(dex) {
    const l = BY_DEX[dex];
    if (!l || !l.length) return null;
    return l[0];
  }
  function getAllForDex(dex) { return BY_DEX[dex] || []; }
  function hasMega(dex) { return !!(BY_DEX[dex] && BY_DEX[dex].length > 0); }

  return { LIST, BY_ID, BY_DEX, get, getById, getByDex, getAllForDex, hasMega };
})();
