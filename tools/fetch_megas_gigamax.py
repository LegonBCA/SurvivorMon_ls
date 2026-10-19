#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tools/fetch_megas_gigamax.py — Descarga e indexación de todas las Megas y Gigamax.
Descarga los sprites pixel-art oficiales desde Pokémon Showdown y SpriteCollab,
y genera automáticamente el catálogo completo en js/data/megas.js.
"""
import os
import sys
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_FORMS = os.path.join(ROOT, 'assets', 'pokemon', 'forms')
os.makedirs(OUT_FORMS, exist_ok=True)

# ----------------- 1. DEFINICIÓN DE MEGAS OFICIALES Y COMUNITARIAS -----------------
# (dex, id, name, stone, types, showdown_name, aura, passive, passive_desc)
MEGAS = [
    # Kanto
    (3, 'venusaur_mega', 'Mega-Venusaur', 'Venusaurita', ['grass', 'poison'], 'venusaur-mega', '#5fcb6a', 'Sebo', 'Inmunidad a quemaduras y daño de fuego reducido un 50%.'),
    (6, 'charizard_x', 'Mega-Charizard X', 'Charizardita X', ['fire', 'dragon'], 'charizard-megax', '#3da4ff', 'Garra Dura', 'Llamas azules que aplican quemadura continua e ignoran resistencias.'),
    (6, 'charizard_y', 'Mega-Charizard Y', 'Charizardita Y', ['fire', 'flying'], 'charizard-megay', '#ff773d', 'Sequía', 'Potencia el fuego un 50% y desata llamaradas solares automáticas.'),
    (9, 'blastoise_mega', 'Mega-Blastoise', 'Blastoisita', ['water'], 'blastoise-mega', '#4b9bff', 'Megadisparador', 'Los proyectiles aumentan un 50% de tamaño y daño.'),
    (15, 'beedrill_mega', 'Mega-Beedrill', 'Beedrillita', ['bug', 'poison'], 'beedrill-mega', '#ffd23f', 'Adaptable', 'Velocidad de movimiento extrema y críticos letales.'),
    (18, 'pidgeot_mega', 'Mega-Pidgeot', 'Pidgeotita', ['normal', 'flying'], 'pidgeot-mega', '#f4a261', 'Indefenso', 'Todos los ataques tienen 100% de precisión y atraviesan pantallas.'),
    (26, 'raichu_mega_y', 'Mega-Raichu Y', 'Raichuita Y', ['electric', 'psychic'], 'raichu', '#ffd33d', 'Surfeo Estelar', 'Flota sobre trampas y genera campos eléctricos expansivos.'),
    (65, 'alakazam_mega', 'Mega-Alakazam', 'Alakazamita', ['psychic'], 'alakazam-mega', '#e76f51', 'Rastro', 'Copia pasivas enemigas y amplifica el área psíquica un 45%.'),
    (80, 'slowbro_mega', 'Mega-Slowbro', 'Slowbroita', ['water', 'psychic'], 'slowbro-mega', '#f4a261', 'Caparazón', 'Defensa impenetrable; reduce todo el daño recibido un 40%.'),
    (94, 'gengar_mega', 'Mega-Gengar', 'Gengarita', ['ghost', 'poison'], 'gengar-mega', '#b45ec4', 'Sombra Trampa', 'Ralentiza a los enemigos cercanos un 40% y libera pulsos espectrales.'),
    (115, 'kangaskhan_mega', 'Mega-Kangaskhan', 'Kangaskhanita', ['normal'], 'kangaskhan-mega', '#b08968', 'Amor Filial', 'Cada ataque se dispara dos veces consecutivas.'),
    (127, 'pinsir_mega', 'Mega-Pinsir', 'Pinsirita', ['bug', 'flying'], 'pinsir-mega', '#c9a227', 'Piel Celeste', 'Ataques normales se convierten en ráfagas voladoras con empuje.'),
    (130, 'gyarados_mega', 'Mega-Gyarados', 'Gyaradosita', ['water', 'dark'], 'gyarados-mega', '#2e3859', 'Rompemoldes', 'Críticos garantizados contra élites y ondas de cólera marina.'),
    (142, 'aerodactyl_mega', 'Mega-Aerodactyl', 'Aerodactylita', ['rock', 'flying'], 'aerodactyl-mega', '#a29bfe', 'Garra Dura', 'Proyectiles de roca afilada que causan sangrado.'),
    (149, 'dragonite_mega', 'Mega-Dragonite', 'Dragonitita', ['dragon', 'flying'], 'dragonite', '#ff9f43', 'Escama Mítica', 'Inmunidad al primer golpe y cometas dracónicos periódicos.'),
    (150, 'mewtwo_x', 'Mega-Mewtwo X', 'Mewtwonita X', ['psychic', 'fighting'], 'mewtwo-megax', '#ff6b6b', 'Impasible', 'Golpes psíquico-marciales que aturden a los jefes.'),
    (150, 'mewtwo_y', 'Mega-Mewtwo Y', 'Mewtwonita Y', ['psychic'], 'mewtwo-megay', '#ff5f9e', 'Insomnio', 'Proyectiles masivos con penetración ilimitada de objetivos.'),

    # Johto
    (154, 'meganium_mega', 'Mega-Meganium', 'Meganiumita', ['grass', 'fairy'], 'meganium', '#55efc4', 'Aroma Sanador', 'Regenera 4% de vida cada 8s a ti y a tus aliados.'),
    (157, 'typhlosion_mega', 'Mega-Typhlosion', 'Typhlosionita', ['fire', 'ghost'], 'typhlosion', '#d63031', 'Llama Espectral', 'Anillos de fuego fantasmal que absorben almas al derrotar enemigos.'),
    (160, 'feraligatr_mega', 'Mega-Feraligatr', 'Feraligatrita', ['water', 'dark'], 'feraligatr', '#0984e3', 'Mandíbula Fuerte', 'Ataques mordisco devastadores que curan al golpear.'),
    (181, 'ampharos_mega', 'Mega-Ampharos', 'Ampharosita', ['electric', 'dragon'], 'ampharos-mega', '#ffeaa7', 'Rompemoldes', 'Melena de dragón que descarga relámpagos estelares.'),
    (208, 'steelix_mega', 'Mega-Steelix', 'Steelixita', ['steel', 'ground'], 'steelix-mega', '#b2bec3', 'Poder Arena', 'Giro continuo de fragmentos metálicos defensivos alrededor.'),
    (212, 'scizor_mega', 'Mega-Scizor', 'Scizorita', ['bug', 'steel'], 'scizor-mega', '#ff7675', 'Experto', 'Aumenta un 50% el daño de todos los movimientos rápidos.'),
    (214, 'heracross_mega', 'Mega-Heracross', 'Heracrossita', ['bug', 'fighting'], 'heracross-mega', '#74b9ff', 'Encadenado', 'Todos los proyectiles disparan ráfagas quíntuples.'),
    (227, 'skarmory_mega', 'Mega-Skarmory', 'Skarmoryita', ['steel', 'flying'], 'skarmory', '#dfe6e9', 'Alas de Acero', 'Lanza púas afiladas al recibir impactos.'),
    (229, 'houndoom_mega', 'Mega-Houndoom', 'Houndoomita', ['dark', 'fire'], 'houndoom-mega', '#2d3436', 'Poder Solar', 'Fuego infernal que derrite la armadura de los enemigos.'),
    (248, 'tyranitar_mega', 'Mega-Tyranitar', 'Tyranitarita', ['rock', 'dark'], 'tyranitar-mega', '#636e72', 'Chorro Arena', 'Tormenta de arena permanente que hiere a toda la pantalla.'),

    # Hoenn
    (254, 'sceptile_mega', 'Mega-Sceptile', 'Sceptilita', ['grass', 'dragon'], 'sceptile-mega', '#00b894', 'Pararrayos', 'Inmunidad al trueno y proyectiles de cola teledirigidos.'),
    (257, 'blaziken_mega', 'Mega-Blaziken', 'Blazikenita', ['fire', 'fighting'], 'blaziken-mega', '#e17055', 'Impulso', 'Cada 5 segundos aumenta tu velocidad de ataque y movimiento.'),
    (260, 'swampert_mega', 'Mega-Swampert', 'Swampertita', ['water', 'ground'], 'swampert-mega', '#0984e3', 'Nado Rápido', 'Fuerza masiva y velocidad duplicada en terreno acuático.'),
    (282, 'gardevoir_mega', 'Mega-Gardevoir', 'Gardevoirita', ['psychic', 'fairy'], 'gardevoir-mega', '#fd79a8', 'Piel Feérica', 'Vórtices lunares de polvo de hadas que desintegran esbirros.'),
    (302, 'sableye_mega', 'Mega-Sableye', 'Sableyeita', ['dark', 'ghost'], 'sableye-mega', '#6c5ce7', 'Espejo Mágico', 'Refleja todos los proyectiles enemigos con su gran joya.'),
    (303, 'mawile_mega', 'Mega-Mawile', 'Mawilita', ['steel', 'fairy'], 'mawile-mega', '#fdcb6e', 'Potencia', 'Duplica el ataque físico básico de tu Pokémon.'),
    (304, 'aggron_mega', 'Mega-Aggron', 'Aggronita', ['steel'], 'aggron-mega', '#b2bec3', 'Filtro', 'Reduce los ataques supereficaces recibidos un 40%.'),
    (308, 'medicham_mega', 'Mega-Medicham', 'Medichamita', ['fighting', 'psychic'], 'medicham-mega', '#fab1a0', 'Energía Pura', 'Golpes con onda expansiva espiritual de alto impacto.'),
    (310, 'manectric_mega', 'Mega-Manectric', 'Manectricita', ['electric'], 'manectric-mega', '#ffeaa7', 'Intimidación', 'Reduce el daño de los enemigos cercanos un 25%.'),
    (319, 'sharpedo_mega', 'Mega-Sharpedo', 'Sharpedonita', ['water', 'dark'], 'sharpedo-mega', '#0984e3', 'Mandíbula Fuerte', 'Embestidas acuáticas cortantes a gran velocidad.'),
    (323, 'camerupt_mega', 'Mega-Camerupt', 'Cameruptita', ['fire', 'ground'], 'camerupt-mega', '#d63031', 'Potencia Bruta', 'Erupciones constantes de magma volcánico.'),
    (330, 'flygon_mega', 'Mega-Flygon', 'Flygonita', ['ground', 'dragon'], 'flygon', '#55efc4', 'Torbellino Sónico', 'Crea ciclones de arena que absorben proyectiles.'),
    (334, 'altaria_mega', 'Mega-Altaria', 'Altarianita', ['dragon', 'fairy'], 'altaria-mega', '#81ecec', 'Piel Feérica', 'Algodón protector que absorbe golpes y lanza notas musicales.'),
    (350, 'milotic_mega', 'Mega-Milotic', 'Miloticita', ['water', 'fairy'], 'milotic', '#74b9ff', 'Gracia Espejo', 'Mareas curativas que restauran vida a compañeros.'),
    (354, 'banette_mega', 'Mega-Banette', 'Banettita', ['ghost'], 'banette-mega', '#2d3436', 'Bromista', 'Maldiciones flotantes que drenan la vida de los enemigos.'),
    (358, 'chimecho_mega', 'Mega-Chimecho', 'Chimechita', ['psychic', 'steel'], 'chimecho', '#a29bfe', 'Campana Mística', 'Ondas sónicas que paralizan grupos enteros.'),
    (359, 'absol_mega', 'Mega-Absol', 'Absolita', ['dark'], 'absol-mega', '#dfe6e9', 'Espejo Mágico', 'Alas sombrías que desatan tajos aéreos críticos.'),
    (362, 'glalie_mega', 'Mega-Glalie', 'Glalitita', ['ice'], 'glalie-mega', '#74b9ff', 'Piel Helada', 'Congela automáticamente a los enemigos que se acerquen.'),
    (373, 'salamence_mega', 'Mega-Salamence', 'Salamencita', ['dragon', 'flying'], 'salamence-mega', '#0984e3', 'Piel Celeste', 'Vuelo rasante supersónico con cortes en media luna.'),
    (376, 'metagross_mega', 'Mega-Metagross', 'Metagrossita', ['steel', 'psychic'], 'metagross-mega', '#00cec9', 'Garra Dura', 'Cuatro brazos mecánicos flotantes que golpean al unísono.'),
    (380, 'latias_mega', 'Mega-Latias', 'Latiasita', ['dragon', 'psychic'], 'latias-mega', '#e84393', 'Levitación', 'Vuelo etéreo y rayos místicos de energía pura.'),
    (381, 'latios_mega', 'Mega-Latios', 'Latiosita', ['dragon', 'psychic'], 'latios-mega', '#0984e3', 'Levitación', 'Velocidad supersónica y bombardeo de esferas aurales.'),
    (382, 'kyogre_primal', 'Kyogre Primigenio', 'Esfera Azul', ['water'], 'kyogre-primal', '#0984e3', 'Mar del Albor', 'Diluvio torrencial que inunda la mazmorra con géiseres.'),
    (383, 'groudon_primal', 'Groudon Primigenio', 'Esfera Roja', ['ground', 'fire'], 'groudon-primal', '#d63031', 'Tierra del Ocaso', 'Calor extremo que abrasa a los enemigos y crea fisuras de lava.'),
    (384, 'rayquaza_mega', 'Mega-Rayquaza', 'Meteorito Ascenso', ['dragon', 'flying'], 'rayquaza-mega', '#00b894', 'Ráfaga Delta', 'Inmunidad a trampas y clima; vientos celestiales cortantes.'),

    # Sinnoh
    (398, 'staraptor_mega', 'Mega-Staraptor', 'Staraptorita', ['normal', 'flying'], 'staraptor', '#636e72', 'Audaz', 'Embestidas aéreas devastadoras con retroceso nulo.'),
    (428, 'lopunny_mega', 'Mega-Lopunny', 'Lopunnita', ['normal', 'fighting'], 'lopunny-mega', '#e17055', 'Intrépido', 'Golpea a tipos fantasma e inflige ráfagas de patadas.'),
    (445, 'garchomp_mega', 'Mega-Garchomp', 'Garchompita', ['dragon', 'ground'], 'garchomp-mega', '#d63031', 'Poder Arena', 'Hoz de dragón que desgarra formaciones enemigas.'),
    (448, 'lucario_mega', 'Mega-Lucario', 'Lucarionita', ['fighting', 'steel'], 'lucario-mega', '#ffeaa7', 'Adaptable', 'Ondas de choque aurales continuas que empujan y aturden.'),
    (460, 'abomasnow_mega', 'Mega-Abomasnow', 'Abomasnowita', ['grass', 'ice'], 'abomasnow-mega', '#81ecec', 'Nevada', 'Ventisca helada perenne que ralentiza y daña en área.'),
    (475, 'gallade_mega', 'Mega-Gallade', 'Galladita', ['psychic', 'fighting'], 'gallade-mega', '#00b894', 'Foco Interno', 'Espadas de luz en los brazos con alta probabilidad de crítico.'),
    (478, 'froslass_mega', 'Mega-Froslass', 'Froslassita', ['ice', 'ghost'], 'froslass', '#74b9ff', 'Manto Níveo', 'Se vuelve intangible periódicamente al esquivar.'),
    (483, 'dialga_primal', 'Dialga Primigenio', 'Diamante Oscuro', ['steel', 'dragon'], 'dialga', '#0984e3', 'Distorsión Temporal', 'Detiene brevemente el tiempo para todos los enemigos.'),
    (485, 'heatran_mega', 'Mega-Heatran', 'Heatranita', ['fire', 'steel'], 'heatran', '#d63031', 'Magma Fundido', 'Deja un rastro continuo de lava hirviente al moverse.'),
    (491, 'darkrai_mega', 'Mega-Darkrai', 'Darkrainita', ['dark'], 'darkrai', '#2d3436', 'Mal Sueño', 'Duerme a los enemigos y drena su energía vital.'),

    # Teselia / Unova
    (530, 'excadrill_mega', 'Mega-Excadrill', 'Excadrillita', ['ground', 'steel'], 'excadrill', '#b2bec3', 'Taladro Férreo', 'Giro taladrador que penetra armaduras.'),
    (531, 'audino_mega', 'Mega-Audino', 'Audinita', ['normal', 'fairy'], 'audino-mega', '#fd79a8', 'Alma Cura', 'Cura periódicamente estados alterados y otorga escudos.'),
    (545, 'scolipede_mega', 'Mega-Scolipede', 'Scolipedita', ['bug', 'poison'], 'scolipede', '#6c5ce7', 'Aceleración', 'Gana velocidad por cada enemigo derrotado.'),
    (560, 'scrafty_mega', 'Mega-Scrafty', 'Scraftyita', ['dark', 'fighting'], 'scrafty', '#e17055', 'Autoestima', 'Aumenta el ataque tras cada baja.'),
    (604, 'eelektross_mega', 'Mega-Eelektross', 'Eelektrossita', ['electric'], 'eelektross', '#00cec9', 'Sin Debilidad', 'Descargas eléctricas de alto voltaje.'),
    (609, 'chandelure_mega', 'Mega-Chandelure', 'Chandelurita', ['ghost', 'fire'], 'chandelure', '#6c5ce7', 'Fuego Fatuo', 'Llamas sombrías que se propagan entre enemigos.'),

    # Kalos
    (652, 'chesnaught_mega', 'Mega-Chesnaught', 'Chesnaughtita', ['grass', 'fighting'], 'chesnaught', '#55efc4', 'Púas Blindadas', 'Refleja el 30% del daño cuerpo a cuerpo.'),
    (655, 'delphox_mega', 'Mega-Delphox', 'Delphoxita', ['fire', 'psychic'], 'delphox', '#e17055', 'Varita Mística', 'Orbes de fuego teledirigidos.'),
    (658, 'greninja_ash', 'Ash-Greninja', 'Vínculo Batalla', ['water', 'dark'], 'greninja-ash', '#0984e3', 'Fuerte Afecto', 'Shurikens gigantes de agua con velocidad ultra rápida.'),
    (668, 'pyroar_mega', 'Mega-Pyroar', 'Pyroarita', ['fire', 'normal'], 'pyroar', '#e17055', 'Rugido Ígneo', 'Ondas de calor sónicas expansivas.'),
    (670, 'floette_eternal', 'Floette Flor Eterna', 'Luz del Alba', ['fairy'], 'floette-eternal', '#fd79a8', 'Luz Floral', 'Haces de luz celestial que purifican el mapa.'),
    (691, 'dragalge_mega', 'Mega-Dragalge', 'Dragalgeita', ['poison', 'dragon'], 'dragalge', '#6c5ce7', 'Adaptable', 'Nubes de veneno corrosivo persistentes.'),
    (701, 'hawlucha_mega', 'Mega-Hawlucha', 'Hawluchaita', ['fighting', 'flying'], 'hawlucha', '#ff7675', 'Plancha Real', 'Saltos acrobáticos de combate libre.'),
    (718, 'zygarde_complete', 'Zygarde Forma Completa', 'Núcleo Óptimo', ['dragon', 'ground'], 'zygarde-complete', '#00b894', 'Agrupamiento', 'Colosal barra de vida y Rayos Núcleo expansivos.'),
    (719, 'diancie_mega', 'Mega-Diancie', 'Diancita', ['rock', 'fairy'], 'diancie-mega', '#fd79a8', 'Espejo Mágico', 'Lanza diamantes resplandecientes que estallan.'),

    # Alola
    (768, 'golisopod_mega', 'Mega-Golisopod', 'Golisopodita', ['bug', 'water'], 'golisopod', '#00cec9', 'Escaramuza', 'Primer ataque tras moverse causa daño masivo.'),
    (780, 'drampa_mega', 'Mega-Drampa', 'Drampaita', ['normal', 'dragon'], 'drampa', '#81ecec', 'Cólera', 'Al caer su vida por debajo del 50%, duplica su ataque.'),
    (800, 'necrozma_ultra', 'Ultra-Necrozma', 'Ultranecrostal Z', ['psychic', 'dragon'], 'necrozma-ultra', '#ffeaa7', 'Fuerza Cerebral', 'Fábulas de luz destructivas en 360 grados.'),
    (807, 'zeraora_mega', 'Mega-Zeraora', 'Zeraoraita', ['electric'], 'zeraora', '#ffeaa7', 'Absorbe Electricidad', 'Velocidad de rayo y garras de plasma.'),

    # Paldea
    (952, 'scovillain_mega', 'Mega-Scovillain', 'Scovillainita', ['grass', 'fire'], 'scovillain', '#d63031', 'Picante Extremo', 'Explosiones de pimienta ardiente que ciegan a los enemigos.'),
    (978, 'tatsugiri_mega', 'Mega-Tatsugiri', 'Tatsugiriita', ['dragon', 'water'], 'tatsugiri', '#ff7675', 'Comandante', 'Invoca ráfagas de energía desde el suelo.')
]

# ----------------- 2. DEFINICIÓN DE LOS 33 GIGAMAX OFICIALES -----------------
# (dex, id, name, types, showdown_name, aura, passive, passive_desc)
GIGAMAX = [
    (3, 'venusaur_gmax', 'Venusaur Gigamax', ['grass', 'poison'], 'venusaur-gmax', '#5fcb6a', 'Gigaflorecimiento', 'Forma colosal: libera polen curativo 5% HP cada 12 s y envenena en área.'),
    (6, 'charizard_gmax', 'Charizard Gigamax', ['fire', 'flying'], 'charizard-gmax', '#ff7675', 'Gigallamarada', 'Forma colosal: mar de fuego que daña a todos los enemigos durante 10 s.'),
    (9, 'blastoise_gmax', 'Blastoise Gigamax', ['water'], 'blastoise-gmax', '#4b9bff', 'Gigacañonazo', 'Forma colosal: 4 cañonazos de agua de alto calibre cada 7 s.'),
    (12, 'butterfree_gmax', 'Butterfree Gigamax', ['bug', 'flying'], 'butterfree-gmax', '#55efc4', 'Gigaestupor', 'Forma colosal: escamas que duermen, paralizan y envenenan.'),
    (25, 'pikachu_gmax', 'Pikachu Gigamax', ['electric'], 'pikachu-gmax', '#ffd33d', 'Gigatronada', 'Forma colosal: descargas celestiales constantes que paralizan.'),
    (52, 'meowth_gmax', 'Meowth Gigamax', ['normal'], 'meowth-gmax', '#ffeaa7', 'Gigamonedas', 'Forma colosal: hace llover monedas de oro por el mapa.'),
    (68, 'machamp_gmax', 'Machamp Gigamax', ['fighting'], 'machamp-gmax', '#e0533d', 'Gigaempujón', 'Forma colosal: 4 puños de lava en cruz con gran empuje.'),
    (94, 'gengar_gmax', 'Gengar Gigamax', ['ghost', 'poison'], 'gengar-gmax', '#b45ec4', 'Gigaaparición', 'Forma colosal: boca portal que absorbe enemigos menores.'),
    (99, 'kingler_gmax', 'Kingler Gigamax', ['water'], 'kingler-gmax', '#74b9ff', 'Gigaespuma', 'Forma colosal: burbujas ácidas que reducen la velocidad enemiga.'),
    (131, 'lapras_gmax', 'Lapras Gigamax', ['water', 'ice'], 'lapras-gmax', '#0984e3', 'Gigamelodía', 'Forma colosal: crea una barrera de hielo protectora permanente.'),
    (133, 'eevee_gmax', 'Eevee Gigamax', ['normal'], 'eevee-gmax', '#d6a2e8', 'Gigaternura', 'Forma colosal: enamora a los enemigos, anulando sus ataques.'),
    (143, 'snorlax_gmax', 'Snorlax Gigamax', ['normal'], 'snorlax-gmax', '#2ed573', 'Gigarreciclaje', 'Forma colosal: hace crecer árboles de bayas curativas.'),
    (569, 'garbodor_gmax', 'Garbodor Gigamax', ['poison'], 'garbodor-gmax', '#a4b0be', 'Gigapestilencia', 'Forma colosal: nubes tóxicas que devoran la vida enemiga.'),
    (809, 'melmetal_gmax', 'Melmetal Gigamax', ['steel'], 'melmetal-gmax', '#747d8c', 'Gigafusión', 'Forma colosal: vigas electromagnéticas orbitales de acero líquido.'),
    (812, 'rillaboom_gmax', 'Rillaboom Gigamax', ['grass'], 'rillaboom-gmax', '#2ed573', 'Gigarritmo', 'Forma colosal: tambores gigantes que desatan terremotos sónicos.'),
    (815, 'cinderace_gmax', 'Cinderace Gigamax', ['fire'], 'cinderace-gmax', '#ff4757', 'Gigaesfera Ígnea', 'Forma colosal: balón gigante de magma que cae del cielo.'),
    (818, 'inteleon_gmax', 'Inteleon Gigamax', ['water'], 'inteleon-gmax', '#1e90ff', 'Gigadisparo', 'Forma colosal: francotirador desde su torre de agua con 100% crítico.'),
    (823, 'corviknight_gmax', 'Corviknight Gigamax', ['flying', 'steel'], 'corviknight-gmax', '#2f3542', 'Gigaviento Férreo', 'Forma colosal: ráfagas que eliminan proyectiles enemigos.'),
    (826, 'orbeetle_gmax', 'Orbeetle Gigamax', ['bug', 'psychic'], 'orbeetle-gmax', '#70a1ff', 'Gigagravitación', 'Forma colosal: ovni mental que atrae a todos los orbes de XP.'),
    (834, 'drednaw_gmax', 'Drednaw Gigamax', ['water', 'rock'], 'drednaw-gmax', '#7bed9f', 'Gigatrampa Rocosa', 'Forma colosal: picos de roca afilada en el suelo.'),
    (839, 'coalossal_gmax', 'Coalossal Gigamax', ['rock', 'fire'], 'coalossal-gmax', '#ff6348', 'Gigarroca Ígnea', 'Forma colosal: lluvia de rocas incandescentes continuas.'),
    (841, 'flapple_gmax', 'Flapple Gigamax', ['grass', 'dragon'], 'flapple-gmax', '#2ed573', 'Gigacorrosión', 'Forma colosal: néctar que funde la defensa enemiga.'),
    (842, 'appletun_gmax', 'Appletun Gigamax', ['grass', 'dragon'], 'appletun-gmax', '#ffa502', 'Gigadulzor', 'Forma colosal: néctar dulce que cura vida de forma continua.'),
    (844, 'sandaconda_gmax', 'Sandaconda Gigamax', ['ground'], 'sandaconda-gmax', '#eccc68', 'Gigasandvórtice', 'Forma colosal: tornado de arena que atrapa enemigos.'),
    (849, 'toxtricity_gmax', 'Toxtricity Gigamax', ['electric', 'poison'], 'toxtricity-gmax', '#9b59b6', 'Gigadescarga', 'Forma colosal: guitarra de trueno que paraliza en 360°.'),
    (851, 'centiskorch_gmax', 'Centiskorch Gigamax', ['fire', 'bug'], 'centiskorch-gmax', '#ff4757', 'Gigaciempiés', 'Forma colosal: trampa ígnea de cien patas ardientes.'),
    (858, 'hatterene_gmax', 'Hatterene Gigamax', ['psychic', 'fairy'], 'hatterene-gmax', '#ff78c4', 'Gigacastigo', 'Forma colosal: tentáculos espirituales que confunden a los jefes.'),
    (861, 'grimmsnarl_gmax', 'Grimmsnarl Gigamax', ['dark', 'fairy'], 'grimmsnarl-gmax', '#57606f', 'Gigamordaza', 'Forma colosal: pelo afilado que inmoviliza a la horda.'),
    (869, 'alcremie_gmax', 'Alcremie Gigamax', ['fairy'], 'alcremie-gmax', '#ffc048', 'Gigacolofón', 'Forma colosal: tarta milagrosa que cura y otorga invulnerabilidad.'),
    (879, 'copperajah_gmax', 'Copperajah Gigamax', ['steel'], 'copperajah-gmax', '#1e90ff', 'Gigaescombros', 'Forma colosal: trampas de acero que dañan al entrar.'),
    (884, 'duraludon_gmax', 'Duraludon Gigamax', ['steel', 'dragon'], 'duraludon-gmax', '#747d8c', 'Gigadesgaste', 'Forma colosal: rascacielos blindado que lanza rayos láser.'),
    (892, 'urshifu_gmax', 'Urshifu Gigamax', ['fighting', 'dark'], 'urshifu-gmax', '#2f3542', 'Gigagolpe', 'Forma colosal: impactos que traspasan cualquier escudo o invulnerabilidad.')
]

def download_file(url, out_path):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        return True
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'pokesurvivor/2.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            with open(out_path, 'wb') as f:
                f.write(r.read())
        return True
    except Exception as e:
        return False

def main():
    print('===========================================================')
    print('   POKESURVIVOR: Descarga de 93 Megas y 33 Gigamaxes       ')
    print('===========================================================')
    
    tasks = []
    with ThreadPoolExecutor(max_workers=10) as exe:
        # Descarga sprites Showdown de Megas
        for dex, fid, name, stone, types, sname, aura, pas, desc in MEGAS:
            url = f'https://play.pokemonshowdown.com/sprites/gen5/{sname}.png'
            out_file = os.path.join(OUT_FORMS, f'{fid}.png')
            tasks.append((fid, exe.submit(download_file, url, out_file)))
            
        # Descarga sprites Showdown de Gigamaxes
        for dex, fid, name, types, sname, aura, pas, desc in GIGAMAX:
            url = f'https://play.pokemonshowdown.com/sprites/gen5/{sname}.png'
            out_file = os.path.join(OUT_FORMS, f'{fid}.png')
            tasks.append((fid, exe.submit(download_file, url, out_file)))

    ok_count = 0
    fail_count = 0
    for fid, fut in tasks:
        if fut.result():
            ok_count += 1
        else:
            fail_count += 1
            print(f'  ! Falló o pendiente: {fid}')

    print(f'\nDescarga completada: {ok_count} descargados con éxito, {fail_count} pendientes.')

    # Generación de js/data/megas.js
    out_js = os.path.join(ROOT, 'js', 'data', 'megas.js')
    print(f'Generando catálogo integral en {out_js}...')

    entries = []
    
    # Agregar Megas
    for dex, fid, name, stone, types, sname, aura, pas, desc in MEGAS:
        entries.append({
            'id': fid,
            'dex': dex,
            'name': name,
            'stone': stone,
            'types': types,
            'gigamax': False,
            'sprite': f'assets/pokemon/forms/{fid}.png',
            'passive': pas,
            'passiveDesc': desc,
            'auraColor': aura,
            'statMult': {'atk': 1.4, 'spd': 1.2, 'hp': 1.25, 'area': 1.25}
        })
        
    # Agregar Gigamaxes
    for dex, fid, name, types, sname, aura, pas, desc in GIGAMAX:
        entries.append({
            'id': fid,
            'dex': dex,
            'name': name,
            'stone': f'Factor Gigamax ({name.split()[0]})',
            'types': types,
            'gigamax': True,
            'sprite': f'assets/pokemon/forms/{fid}.png',
            'passive': pas,
            'passiveDesc': desc,
            'auraColor': aura,
            'statMult': {'atk': 1.35, 'spd': 1.1, 'hp': 1.5, 'area': 1.35}
        })

    js_content = """/* ============ megas.js — catálogo completo de 93 Megas y 33 Gigamax ============
 * Formas supremas de rareza 6★ (Míticas) obtenibles exclusivamente en el
 * Sagrario del Juicio mediante Mega-Tickets de la Sentencia de Arceus.
 * Generado automáticamente por tools/fetch_megas_gigamax.py
 */
G.Megas = (() => {
  const LIST = """ + json.dumps(entries, ensure_ascii=False, indent=2) + """;

  const BY_ID = Object.fromEntries(LIST.map(m => [m.id, m]));
  const BY_DEX = {};
  for (const m of LIST) {
    if (!BY_DEX[m.dex]) BY_DEX[m.dex] = [];
    BY_DEX[m.dex].push(m);
  }

  function get(id) { return BY_ID[id] || null; }
  function getByDex(dex, preferGmax = false) {
    const arr = BY_DEX[dex];
    if (!arr || !arr.length) return null;
    if (arr.length === 1) return arr[0];
    const match = arr.find(m => m.gigamax === preferGmax);
    return match || arr[0];
  }
  function getAllForDex(dex) { return BY_DEX[dex] || []; }
  function hasMega(dex) { return !!(BY_DEX[dex] && BY_DEX[dex].length); }

  return {
    LIST,
    BY_ID,
    BY_DEX,
    get,
    getByDex,
    getAllForDex,
    hasMega
  };
})();
"""

    with open(out_js, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f'¡Catálogo exportado exitosamente con {len(entries)} formas míticas!')

if __name__ == '__main__':
    main()
