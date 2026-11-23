#!/usr/bin/env python3
"""Monta out/index.html da home-v5. Rode fora de pasta de nuvem: python3 src/build.py"""
import base64, json, shutil
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT, GEN, NM = ROOT / 'src', ROOT / 'out', ROOT / 'gen', ROOT / 'node_modules'

def face(family, weight, f):
    b = base64.b64encode(f.read_bytes()).decode()
    return "@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (family, weight, b)

fonts = [face('Libre Caslon Display', 400, NM / '@fontsource/libre-caslon-display/files/libre-caslon-display-latin-400-normal.woff2')]
for w in (400, 500, 600, 700):
    fonts.append(face('Poppins', w, NM / f'@fontsource/poppins/files/poppins-latin-{w}-normal.woff2'))

data = json.load(open(GEN / 'data.json'))
html = (SRC / 'template.html').read_text()
html = html.replace('{{FONTS}}', '\n'.join(fonts)).replace('{{CSS}}', (SRC / 'styles.css').read_text())
html = html.replace('{{DATA}}', json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
(OUT / 'index.html').write_text(html)
(OUT / 'assets' / 'js').mkdir(parents=True, exist_ok=True)
shutil.copyfile(SRC / 'app.js', OUT / 'assets' / 'js' / 'app.js')
ids = [c['id'] for c in data['cases']]
assert len(ids) == len(set(ids)) == 39, 'cases'
missing = [p for c in data['cases'] for p in [c['img'], c.get('loop')] + [f['src'] for f in c.get('films', [])] + c['gal'] if p and not (OUT / p).exists()]
assert not missing, missing
assert sum(len(c['aw']) for c in data['cases']) == 11, 'prêmios'
print('ok', len(html) // 1024, 'KB index.html')
