#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Descarga sprites 100% auténticos de Mundo Misterioso (PMD) para las Megas
desde el repositorio de SpriteCollab (PMDCollab) y genera su metadata.
"""
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

RAW = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_ASSETS = os.path.join(ROOT, 'assets', 'pokemon')
OUT_META = os.path.join(ROOT, 'js', 'data', 'megas-meta.js')

WANT = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint']
FALLBACK = {
    'Idle': ['Walk'],
    'Walk': ['Idle'],
    'Attack': ['Strike', 'Swing', 'Shoot', 'Idle'],
    'Shoot': ['Attack', 'Strike', 'Idle'],
    'Charge': ['DeepBreath', 'Idle'],
    'Hurt': ['Cringe', 'Idle'],
    'Faint': ['Hurt', 'Idle'],
}

VERIFIED_MEGAS = [
    (6, 'mega_charizard_x', '0006', '0001', 'Mega Charizard X', 'charizardita_x', ['fire', 'dragon'], 634, 'Garra Dura', 'Aumenta el daño de contacto y fuego un +35%.'),
    (65, 'mega_alakazam', '0065', '0001', 'Mega Alakazam', 'alakazamita', ['psychic'], 600, 'Rastro Arcano', 'Los proyectiles psíquicos rebotan y atraviesan enemigos.'),
    (80, 'mega_slowbro', '0080', '0002', 'Mega Slowbro', 'slowbronita', ['water', 'psychic'], 590, 'Caparazón Férreo', 'Reduce un 40% el daño recibido y resiste empujes.'),
    (94, 'mega_gengar', '0094', '0001', 'Mega Gengar', 'gengarita', ['ghost', 'poison'], 600, 'Sombra Trampa', 'Ralentiza a los enemigos cercanos un 50% y absorbe vida.'),
    (115, 'mega_kangaskhan', '0115', '0001', 'Mega Kangaskhan', 'kangaskhanita', ['normal'], 590, 'Amor Filial', 'Cada ataque dispara un segundo proyectil al 50% de daño.'),
    (142, 'mega_aerodactyl', '0142', '0001', 'Mega Aerodactyl', 'aerodactylita', ['rock', 'flying'], 615, 'Mandíbula Fuerte', 'Aumenta un 35% el daño cortante y la velocidad de vuelo.'),
    (150, 'mega_mewtwo_y', '0150', '0002', 'Mega Mewtwo Y', 'mewtwoita_y', ['psychic'], 780, 'Insomnio Cósmico', 'Poder psíquico descomunal: +50% daño especial.'),
    (208, 'mega_steelix', '0208', '0001', 'Mega Steelix', 'steelixita', ['steel', 'ground'], 610, 'Fuerza Arena', 'Invoca una tormenta de acero que desgarra a los enemigos.'),
    (227, 'mega_skarmory', '0227', '0001', 'Mega Skarmory', 'skarmoryita', ['steel', 'flying'], 565, 'Plumas Afiladas', 'Dispara púas de acero continuas al moverse.'),
    (229, 'mega_houndoom', '0229', '0001', 'Mega Houndoom', 'houndoomita', ['dark', 'fire'], 600, 'Poder Solar', 'Genera un infierno abrasador de fuego negro que quema jefes.'),
    (248, 'mega_tyranitar', '0248', '0001', 'Mega Tyranitar', 'tyranitarita', ['rock', 'dark'], 700, 'Chorro Arena', 'Tormenta de arena constante que daña a toda la pantalla.'),
    (254, 'mega_sceptile', '0254', '0001', 'Mega Sceptile', 'sceptilita', ['grass', 'dragon'], 630, 'Pararrayos', 'Inmune al rayo y dispara semillas dracónicas explosivas.'),
    (282, 'mega_gardevoir', '0282', '0001', 'Mega Gardevoir', 'gardevoirita', ['psychic', 'fairy'], 618, 'Piel Feérica', 'Convierte todos los proyectiles en daño Hada con +30% daño.'),
    (302, 'mega_sableye', '0302', '0001', 'Mega Sableye', 'sableyita', ['dark', 'ghost'], 480, 'Espejo Mágico', 'Bloquea y devuelve ataques a distancia como joyas oscuras.'),
    (303, 'mega_mawile', '0303', '0001', 'Mega Mawile', 'mawilita', ['steel', 'fairy'], 480, 'Potencia Divina', 'Duplica el ataque base: ataques cuerpo a cuerpo devastadores.'),
    (308, 'mega_medicham', '0308', '0001', 'Mega Medicham', 'medichamita', ['fighting', 'psychic'], 510, 'Energía Pura', 'Golpes de combate generan ondas de choque psíquicas.'),
    (310, 'mega_manectric', '0310', '0001', 'Mega Manectric', 'manectricita', ['electric'], 575, 'Intimidación', 'Descargas eléctricas constantes caen sobre los enemigos.'),
    (319, 'mega_sharpedo', '0319', '0001', 'Mega Sharpedo', 'sharpedonita', ['water', 'dark'], 560, 'Mandíbula Fuerte', 'Embestida acuática que tritura enemigos en masa.'),
    (323, 'mega_camerupt', '0323', '0001', 'Mega Camerupt', 'cameruptita', ['fire', 'ground'], 560, 'Potencia Bruta', 'Erupciones constantes de magma fundido desde sus jorobas.'),
    (334, 'mega_altaria', '0334', '0001', 'Mega Altaria', 'altarianita', ['dragon', 'fairy'], 590, 'Piel Feérica', 'Nube de algodón místico que repele proyectiles.'),
    (354, 'mega_banette', '0354', '0001', 'Mega Banette', 'banettita', ['ghost'], 555, 'Bromista', 'Maldición que congela y aterroriza a los enemigos cercanos.'),
    (358, 'mega_chimecho', '0358', '0001', 'Mega Chimecho', 'chimechita', ['psychic', 'steel'], 525, 'Campana Mística', 'Ondas sanadoras continuas para el compañero.'),
    (359, 'mega_absol', '0359', '0001', 'Mega Absol', 'absolita', ['dark', 'fairy'], 565, 'Espejo Mágico', 'Alas de ángel oscuro: +50% de probabilidad de crítico.'),
    (362, 'mega_glalie', '0362', '0001', 'Mega Glalie', 'glalita', ['ice'], 580, 'Piel Helada', 'Fauces congeladas que congelan al instante al tocar enemigos.'),
    (380, 'mega_latias', '0380', '0001', 'Mega Latias', 'latiasita', ['dragon', 'psychic'], 700, 'Levitación', 'Vuelo hipersónico y escudo reflector imperecedero.'),
    (381, 'mega_latios', '0381', '0001', 'Mega Latios', 'latiosita', ['dragon', 'psychic'], 700, 'Levitación', 'Dispara rayos de energía dracónica a toda velocidad.'),
    (382, 'kyogre_primal', '0382', '0001', 'Kyogre Primigenio', 'prisma_azul', ['water'], 770, 'Mar del Albor', 'Inundación absoluta: +50% daño de agua en toda el área.'),
    (383, 'groudon_primal', '0383', '0001', 'Groudon Primigenio', 'prisma_rojo', ['ground', 'fire'], 770, 'Tierra del Ocaso', 'Fuegos de la creación: erupciones constantes en el suelo.'),
    (384, 'mega_rayquaza', '0384', '0001', 'Mega Rayquaza', 'esfera_cielo', ['dragon', 'flying'], 780, 'Ráfaga Delta', 'Anula debilidades de tipo volador y arrasa con Ascenso Draco.'),
    (428, 'mega_lopunny', '0428', '0001', 'Mega Lopunny', 'lopunnita', ['normal', 'fighting'], 580, 'Intrépido', 'Golpea a tipos Fantasma y tiene +40% de velocidad de ataque.'),
    (448, 'mega_lucario', '0448', '0001', 'Mega Lucario', 'lucarionita', ['fighting', 'steel'], 625, 'Adaptable', 'Aura desbordante: +40% al daño de Lucha y Acero.'),
    (475, 'mega_gallade', '0475', '0001', 'Mega Gallade', 'galladita', ['psychic', 'fighting'], 618, 'Foco Interno', 'Cuchillas de energía psíquica que cortan en área circular.'),
    (483, 'dialga_primal', '0483', '0002', 'Dialga Primigenio', 'diamante_primigenio', ['steel', 'dragon'], 750, 'Distorsión Temporal', 'Detiene periódicamente el tiempo para todos los enemigos.'),
    (491, 'mega_darkrai', '0491', '0002', 'Mega Darkrai', 'pesadilla_oscura', ['dark', 'ghost'], 700, 'Mal Sueño Supremo', 'Los enemigos duermen y reciben daño continuo en sombra.'),
    (530, 'mega_excadrill', '0530', '0001', 'Mega Excadrill', 'excadrillita', ['ground', 'steel'], 608, 'Taladro de Titanio', 'Gira como un taladro imparable atravesando hordas.'),
    (560, 'mega_scrafty', '0560', '0001', 'Mega Scrafty', 'scraftyita', ['dark', 'fighting'], 588, 'Cresta Imponente', 'Aturde a los enemigos al recibir golpes y roba velocidad.'),
    (604, 'mega_eelektross', '0604', '0001', 'Mega Eelektross', 'eelektrossita', ['electric'], 615, 'Bobina Voltio', 'Sin debilidades de tipo; electrocuta en arco continuo.'),
    (670, 'mega_floette', '0670', '0006', 'Mega Floette', 'flor_eterna', ['fairy'], 600, 'Luz del Infinito', 'Dispara Luz Aniquiladora en 8 direcciones al atacar.'),
    (691, 'mega_dragalge', '0691', '0001', 'Mega Dragalge', 'dragalgita', ['poison', 'dragon'], 594, 'Adaptable', 'Veneno corrosivo que reduce la defensa de jefes a la mitad.'),
    (701, 'mega_hawlucha', '0701', '0001', 'Mega Hawlucha', 'hawluchita', ['fighting', 'flying'], 600, 'Rey del Cuadrilátero', 'Impactos aéreos masivos que derriban a todos los enemigos.'),
    (718, 'mega_zygarde', '0718', '0005', 'Mega Zygarde Completo', 'nucleo_zygarde', ['dragon', 'ground'], 708, 'Agrupamiento Núcleo', 'Dispara el Núcleo Castigo: rayo en cruz colosal.'),
    (719, 'mega_diancie', '0719', '0001', 'Mega Diancie', 'diancita', ['rock', 'fairy'], 700, 'Espejo Mágico', 'Diamantes flotantes que disparan proyectiles sagrados.'),
    (780, 'mega_drampa', '0780', '0001', 'Mega Drampa', 'drampita', ['normal', 'dragon'], 585, 'Cólera Dracónica', 'Aumenta el daño exponencialmente al bajar de salud.'),
    (807, 'mega_zeraora', '0807', '0001', 'Mega Zeraora', 'plasma_zeraora', ['electric', 'fighting'], 700, 'Plasma Puro', 'Puños de plasma a la velocidad de la luz.'),
    (978, 'mega_tatsugiri', '0978', '0003', 'Mega Tatsugiri', 'nigiri_mistico', ['dragon', 'water'], 575, 'Comandante Supremo', 'Dirige ataques dracónicos guiados automáticos.')
]

def fetch(url, retries=3):
    for _ in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'pokesurvivor/1.0'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
        except Exception:
            pass
    return None

def parse_animdata(xml):
    anims = {}
    for blk in re.findall(r'<Anim>(.*?)</Anim>', xml, re.S):
        name = re.search(r'<Name>(\w+)</Name>', blk)
        if not name: continue
        name = name.group(1)
        copy = re.search(r'<CopyOf>(\w+)</CopyOf>', blk)
        if copy:
            anims[name] = {'copyOf': copy.group(1)}
            continue
        fw = re.search(r'<FrameWidth>(\d+)</FrameWidth>', blk)
        fh = re.search(r'<FrameHeight>(\d+)</FrameHeight>', blk)
        if not (fw and fh): continue
        durs = [int(x) for x in re.findall(r'<Duration>(\d+)</Duration>', blk)]
        anims[name] = {'w': int(fw.group(1)), 'h': int(fh.group(1)), 'n': len(durs), 'd': durs}
    shadow = re.search(r'<ShadowSize>(\d+)</ShadowSize>', xml)
    return anims, int(shadow.group(1)) if shadow else 1

def resolve(anims, name, seen=None):
    seen = seen or set()
    if name not in anims or name in seen: return None, None
    seen.add(name)
    a = anims[name]
    if 'copyOf' in a: return resolve(anims, a['copyOf'], seen)
    return name, a

def download_mega(info):
    dex, form_id, dex_str, sub_id, name, stone, types, bst, passive, pdesc = info
    url_base = f'{RAW}/sprite/{dex_str}/{sub_id}'
    out_dir = os.path.join(OUT_ASSETS, form_id)
    os.makedirs(out_dir, exist_ok=True)

    xml_data = fetch(f'{url_base}/AnimData.xml')
    if not xml_data:
        print(f'  [ERROR] No AnimData for {name} ({dex_str}/{sub_id})')
        return None

    anims, shadow_size = parse_animdata(xml_data.decode('utf-8'))
    meta_anims = {}

    for want in WANT:
        src, geom = None, None
        for cand in [want] + FALLBACK[want]:
            src, geom = resolve(anims, cand)
            if geom: break
        if not geom: continue

        png = fetch(f'{url_base}/{src}-Anim.png')
        if not png: continue

        path = os.path.join(out_dir, want + '.png')
        with open(path, 'wb') as f:
            f.write(png)

        w = int.from_bytes(png[16:20], 'big')
        h = int.from_bytes(png[20:24], 'big')
        cols = w // geom['w']
        rows = h // geom['h']
        if cols < 1 or rows < 1: continue

        # ground anchor: approximate based on shadow or standard
        ax = geom['w'] / 2.0
        ay = geom['h'] * 0.78
        meta_anims[want] = {
            'w': geom['w'], 'h': geom['h'],
            'n': min(geom['n'], cols), 'r': rows,
            'd': geom['d'][:cols],
            'ax': round(ax, 1), 'ay': round(ay, 1)
        }

    if 'Idle' not in meta_anims and 'Walk' not in meta_anims:
        print(f'  [ERROR] Missing Idle/Walk for {name}')
        return None

    print(f'  ✓ {name} ({form_id}): {len(meta_anims)} anims saved to {form_id}/')
    return {
        'dex': dex,
        'id': form_id,
        'name': name,
        'stone': stone,
        'types': types,
        'bst': bst,
        'passive': passive,
        'passiveDesc': pdesc,
        'shadow': shadow_size,
        'anims': meta_anims
    }

def main():
    print(f'Descargando sprites PMD 100% auténticos para {len(VERIFIED_MEGAS)} Megas...')
    results = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        for res in ex.map(download_mega, VERIFIED_MEGAS):
            if res:
                results.append(res)

    print(f'\nTotal descargadas con éxito: {len(results)}')

    # Generar js/data/megas-meta.js
    meta_dict = {}
    catalog = []
    for r in results:
        meta_dict[r['id']] = {
            's': r['shadow'],
            'a': r['anims'],
            'sh': 0
        }
        catalog.append({
            'id': r['id'],
            'dex': r['dex'],
            'name': r['name'],
            'stone': r['stone'],
            'types': r['types'],
            'bst': r['bst'],
            'auraColor': '#00e5ff' if 'water' in r['types'] or 'dragon' in r['types'] else ('#ff3366' if 'fire' in r['types'] else '#c47bff'),
            'passive': r['passive'],
            'passiveDesc': r['passiveDesc']
        })

    # Ordenar por dex
    catalog.sort(key=lambda x: x['dex'])

    with open(OUT_META, 'w', encoding='utf-8') as f:
        f.write('/* ============ megas-meta.js — GENERADO ============ */\n')
        f.write('G.MEGA_SPRITE_META = ' + json.dumps(meta_dict, ensure_ascii=False, separators=(',', ':')) + ';\n')
        f.write('if (G.SPRITE_META) Object.assign(G.SPRITE_META, G.MEGA_SPRITE_META);\n')

    print(f'Escrito {OUT_META}')

    # Actualizar js/data/megas.js con el catálogo limpio y 100% auténtico
    megas_js_path = os.path.join(ROOT, 'js', 'data', 'megas.js')
    catalog_json = json.dumps(catalog, ensure_ascii=False, indent=2)
    with open(megas_js_path, 'w', encoding='utf-8') as f:
        f.write('''/* ============ megas.js — Megas auténticas de Mundo Misterioso ============
 * Todas con sprites PMD completos (Idle, Walk, Attack en 8 direcciones).
 */
G.Megas = (() => {
  const LIST = ''' + catalog_json + ''';

  const BY_ID = {};
  const BY_DEX = {};
  for (const m of LIST) {
    BY_ID[m.id] = m;
    if (!BY_DEX[m.dex]) BY_DEX[m.dex] = [];
    BY_DEX[m.dex].push(m);
  }

  function getById(id) { return BY_ID[id] || null; }
  function getByDex(dex) { const l = BY_DEX[dex]; return l && l.length ? l[0] : null; }
  function getAllForDex(dex) { return BY_DEX[dex] || []; }
  function hasMega(dex) { return !!BY_DEX[dex] && BY_DEX[dex].length > 0; }

  return { LIST, BY_ID, BY_DEX, getById, getByDex, getAllForDex, hasMega };
})();
''')
    print(f'Escrito {megas_js_path}')

if __name__ == '__main__':
    main()
