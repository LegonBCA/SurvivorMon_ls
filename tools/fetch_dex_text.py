#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Baja UNA vez de PokeAPI los textos de la Pokédex de los Pokémon del juego y los
deja en js/data/dex-text.json (el juego lo carga al abrir la Pokédex; no toca
internet al jugar).

    python tools/fetch_dex_text.py

Por cada Pokémon de js/data/pokedex.js:
    g / ge   categoría ("Pokémon Ratón" / "Mouse Pokémon")
    d / de   descripción de la Pokédex (la más reciente en español / inglés)
    h / w    altura (decímetros) y peso (hectogramos)
"""
import io
import json
import os
import re
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

API = 'https://pokeapi.co/api/v2'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEX = os.path.join(ROOT, 'js', 'data', 'pokedex.js')
OUT = os.path.join(ROOT, 'js', 'data', 'dex-text.json')


def get(url, retries=4):
    for _ in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'survivormon/1.0'})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
        except Exception:
            pass
    return None


def clean(t):
    return re.sub(r'\s+', ' ', t.replace('\f', ' ').replace('­', '')).strip()


def last_text(entries, lang):
    """La entrada más reciente en ese idioma (PokeAPI las da de más antigua a más nueva)."""
    texts = [clean(e['flavor_text']) for e in entries if e['language']['name'] == lang]
    return texts[-1] if texts else ''


def genus(gen, lang):
    for g in gen:
        if g['language']['name'] == lang:
            return g['genus']
    return ''


def main():
    with io.open(DEX, encoding='utf-8') as f:
        src = f.read()
    dexes = [int(m) for m in re.findall(r'"dex":(\d+)', src)]
    print(f'{len(dexes)} Pokémon...')

    def one(dex):
        sp = get(f'{API}/pokemon-species/{dex}') or {}
        pk = get(f'{API}/pokemon/{dex}') or {}
        e = sp.get('flavor_text_entries', [])
        return dex, {
            'g': genus(sp.get('genera', []), 'es'), 'ge': genus(sp.get('genera', []), 'en'),
            'd': last_text(e, 'es'), 'de': last_text(e, 'en'),
            'h': pk.get('height', 0), 'w': pk.get('weight', 0)
        }

    out = {}
    with ThreadPoolExecutor(max_workers=8) as ex:
        for i, (dex, row) in enumerate(ex.map(one, dexes)):
            out[str(dex)] = row
            if i % 100 == 0:
                print(f'  {i}/{len(dexes)}')
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    missing = [d for d, r in out.items() if not r['d']]
    print(f'-> {OUT} ({len(out)} Pokémon, {len(missing)} sin descripción en español)')


if __name__ == '__main__':
    main()
