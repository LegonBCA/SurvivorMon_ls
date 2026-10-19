#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Descarga los retratos con emociones de SpriteCollab (estilo Mundo Misterioso)
a assets/pokemon/{dex}/p/{Emocion}.png y genera js/data/portraits-meta.js.

    python tools/fetch_portraits.py

Sólo los Pokémon que ya tienen sprites (carpetas de assets/pokemon) y sólo las
emociones que usa el juego y que existen (lo dice el tracker.json de
SpriteCollab, así no se pide nada que no esté). Se puede relanzar: lo ya
bajado no se vuelve a pedir.

Fuente: https://github.com/PMDCollab/SpriteCollab  (CC BY-NC 4.0)
Créditos: python tools/fetch_credits.py (incluye los de los retratos)
"""
import io
import json
import os
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

RAW = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'assets', 'pokemon')
OUT_META = os.path.join(ROOT, 'js', 'data', 'portraits-meta.js')

# Emoción de SpriteCollab -> letra en portraits-meta.js
EMO = {'Normal': 'N', 'Happy': 'H', 'Determined': 'D', 'Pain': 'P', 'Sad': 'S'}


def fetch(url, retries=4):
    last = None
    for _ in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'survivormon/1.0'})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            last = e
        except Exception as e:
            last = e
    print(f'    ! {url} -> {last}')
    return None


def main():
    print('Leyendo tracker.json de SpriteCollab...')
    tracker = json.loads(fetch(f'{RAW}/tracker.json').decode('utf-8'))
    dexes = sorted(int(d) for d in os.listdir(ASSETS) if d.isdigit())

    def one(dex):
        node = tracker.get(f'{dex:04d}') or {}
        files = node.get('portrait_files') or {}
        got = ''
        for emo, letter in EMO.items():
            if emo not in files:
                continue
            out = os.path.join(ASSETS, str(dex), 'p', emo + '.png')
            if not os.path.exists(out):
                data = fetch(f'{RAW}/portrait/{dex:04d}/{emo}.png')
                if not data:
                    continue
                os.makedirs(os.path.dirname(out), exist_ok=True)
                with open(out, 'wb') as f:
                    f.write(data)
            got += letter
        return dex, got

    meta = {}
    with ThreadPoolExecutor(max_workers=16) as ex:
        for i, (dex, got) in enumerate(ex.map(one, dexes)):
            if got:
                meta[dex] = got
            if i % 100 == 0:
                print(f'  {i}/{len(dexes)}')

    with io.open(OUT_META, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* ============ portraits-meta.js — GENERADO por tools/fetch_portraits.py ============\n')
        f.write(' * dex -> emociones con retrato en assets/pokemon/{dex}/p/:\n')
        f.write(' *   N Normal · H Happy · D Determined · P Pain · S Sad\n */\n')
        f.write('G.PORTRAITS = ' + json.dumps({str(k): v for k, v in meta.items()}, separators=(',', ':')) + ';\n')
    total = sum(len(v) for v in meta.values())
    print(f'{len(meta)} Pokemon con retrato, {total} retratos -> {OUT_META}')


def credits():
    """Añade (o actualiza) la sección "Retratos" de CREDITS.md con sus artistas."""
    out = os.path.join(ROOT, 'CREDITS.md')
    names = {}
    for line in (fetch(f'{RAW}/credit_names.txt') or b'').decode('utf-8', 'replace').splitlines()[1:]:
        parts = line.split('\t')
        if len(parts) >= 2:
            display, contact = parts[0].strip(), (parts[2].strip() if len(parts) > 2 else '')
            names[parts[1].strip()] = (display, contact)
            names[display] = (display, contact)
    dexes = sorted(int(d) for d in os.listdir(ASSETS) if os.path.isdir(os.path.join(ASSETS, d, 'p')) and d.isdigit())

    def one(dex):
        txt = (fetch(f'{RAW}/portrait/{dex:04d}/credits.txt') or b'').decode('utf-8', 'replace')
        return dex, [p[1].strip() for p in (l.split('\t') for l in txt.splitlines()) if len(p) > 1 and p[1].strip()]

    per = {}
    with ThreadPoolExecutor(max_workers=12) as ex:
        for dex, authors in ex.map(one, dexes):
            for a in set(authors):
                per.setdefault(names.get(a, (a, '')), set()).add(dex)
    sec = ['## Retratos', '',
           'Los retratos con emociones también vienen de',
           '[SpriteCollab](https://github.com/PMDCollab/SpriteCollab) (CC BY-NC 4.0).', '',
           '| Artista | Contacto | Retratos (nº de Pokédex) |', '|---|---|---|']
    for (display, contact), dx in sorted(per.items(), key=lambda kv: kv[0][0].lower()):
        sec.append(f'| {display} | {contact} | {", ".join(str(d) for d in sorted(dx))} |')
    sec = '\n'.join(sec) + '\n\n'
    with io.open(out, encoding='utf-8') as f:
        md = f.read()
    a = md.find('## Retratos')
    if a >= 0:
        b = md.find('\n## ', a + 3)
        md = md[:a] + sec + md[b + 1:]
    else:
        b = md.find('## Datos')
        md = md[:b] + sec + md[b:]
    with io.open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(md)
    print(f'{len(per)} artistas de retratos -> CREDITS.md')


if __name__ == '__main__':
    import sys
    if '--credits' in sys.argv:
        credits()
    else:
        main()
