#!/usr/bin/env python3
"""Prepara os assets da home-v5 a partir do material já extraído (home-v4/home-v3).
Roda fora da nuvem: lê src_assets/ e gen/, grava em out/assets/ e gen/data.json."""
import base64, json, os, shutil, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src_assets'
OUT = ROOT / 'out' / 'assets'
GEN = ROOT / 'gen'

def cp(src, dst):
    dst = OUT / dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC / src, dst)
    return 'assets/' + str(dst.relative_to(OUT))

d = json.load(open(SRC / 'content_v4.json'))

# ---------- vídeos ----------
VID = {
    'soja': ('v/soja-loop.mp4', [('v/soja_full.mp4', 'Filme do case', 0)]),
    'deezer': ('v/deezer-loop.mp4', [('v/deezer_full.mp4', 'Filme do case', 0)]),
    'comando': ('v/comando-loop.mp4', [('v/comando_full.mp4', 'Filme do case', 0)]),
    'coop': ('v/coop-loop.mp4', [('v/coop_full.mp4', 'Filme do case', 0)]),
    'megafol': ('v/megafol-loop.mp4', [('v/megafol_full.mp4', 'Filme do case', 0)]),
    'botafogo': ('v/botafogo-loop-vimeo.mp4', [('v/botafogo-filme-vimeo.mp4', 'Filme do case', 0)]),
    'mrsfem': ('v/mrsfem-loop-campanha.mp4', [
        ('v/mrsfem-filme-campanha.mp4', 'Filme da campanha', 1),
        ('v/mrsfem_full.mp4', 'Lugar de mulher é onde ela quiser', 1),
        ('v/mrsfem_filme2.mp4', 'Campanha de recrutamento', 1)]),
}
POSTER = {'botafogo': 'v/botafogo-poster-vimeo.jpg', 'mrsfem': 'v/mrsfem-poster-campanha.jpg'}

LOGO = {  # cliente -> arquivo (originais enviados pelo Fabricio primeiro)
    'Syngenta': 'syngenta-original.svg', 'OrthoDontic': 'ortho-original.png', 'MRS Logística': 'mrs.png',
    'Botafogo-SP': 'botafogo-official.jpg', 'Deezer': 'deezer-original.svg', 'Hospital Sírio-Libanês': 'sirio.svg',
    'UOL': 'uol-original.svg', 'Mart Minas': 'martminas.svg', 'Nidera Sementes': 'nidera.png',
    'EuroChem': 'eurochem.webp', 'Boston Scientific': 'boston-original.svg', 'Citrosuco': 'citrosuco-original.webp',
    'Apsen': 'apsen-original.png', 'Veiling Holambra': 'holambra.png', 'Positivo Tecnologia': 'positivo.png',
    'Credicitrus': 'credicitrus-original.png', 'thyssenkrupp Elevadores': 'thyssen-original.svg', 'Vittia': 'vittia.webp',
    'Digio': 'digio.png', 'Adimag': 'adimag-original.webp', 'Evera by Citrosuco': 'evera-original.webp',
}
logo_out = {k: cp('logos/' + v, 'logos/' + v) for k, v in LOGO.items()}
cargill = cp('logos/cargill-original.svg', 'logos/cargill-original.svg')

AW = {a['id']: a for a in d['awards']}
AW_SHORT = {'Prêmio Lusófonos': 'Lusófonos', 'Prêmio ABERJE': 'ABERJE', 'Titan Health Awards': 'Titan Health', 'Anuário Agro': 'Anuário Agro'}
SECTOR = {'Agro': 0, 'Saúde': 1, 'Varejo': 2, 'Consumo': 2}

cases = []
for c in d['cases']:
    cid = c['id']
    img_src = c['image'].replace('assets/', '')
    if cid in POSTER:
        img = cp(POSTER[cid], 'cases/' + cid + '-poster.jpg')
    else:
        img = cp(img_src, img_src)
    w, h = Image.open(OUT.parent / img).size
    o = {
        'id': cid, 'client': c['client'], 'title': c['title'], 'area': c.get('area') or '',
        'tags': c.get('tags') or [], 'desc': c.get('desc') or '', 'img': img, 'ar': round(w / h, 4),
        'acc': c.get('accent') or '#0BA8F9', 'col': SECTOR.get(c.get('area'), 3),
        'logo': logo_out.get(c['client'], ''),
        'story': [s for s in (c.get('story') or []) if not (s.get('k') == 'Case')],
        'nums': c.get('nums') or [], 'quote': c.get('quote') or None,
        'gal': [cp(g.replace('assets/', ''), g.replace('assets/', '')) for g in (c.get('gallery') or [])],
        'aw': [{'m': AW[a]['medal'], 'b': AW_SHORT[AW[a]['award']], 'c': AW[a]['cat'].split(' · ')[1] if ' · ' in AW[a]['cat'] else ''} for a in (c.get('awards') or [])],
    }
    if cid == 'eurochem-origens':
        o['gal'] = [cp('cases/eurochem-origens-secondary.webp', 'cases/eurochem-origens-secondary.webp')]
    if cid in VID:
        loop, films = VID[cid]
        o['loop'] = cp(loop, loop)
        o['films'] = [{'src': cp(f, f), 'label': l, 'vert': v} for f, l, v in films]
    cases.append(o)

# o ABERJE na lista do Fabricio vem sem categoria: não exibir categoria não confirmada
for c in cases:
    for a in c['aw']:
        if a['b'] == 'ABERJE':
            a['c'] = ''

# ---------- pessoas ----------
partners = []
for p in d['partners']:
    im = Image.open(SRC / 'people' / f"{p['id']}-original.png").convert('RGB')
    im.thumbnail((1600, 900), Image.LANCZOS)
    dst = OUT / 'people' / f"{p['id']}.webp"
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'WEBP', quality=84, method=6)
    partners.append({'id': p['id'], 'name': p['name'], 'role': p['role'], 'img': f"assets/people/{p['id']}.webp"})

# ---------- marca ----------
(OUT / 'brand').mkdir(parents=True, exist_ok=True)
shutil.copyfile(SRC / 'brand_official' / 'Logo Macfor_white.png', OUT / 'brand' / 'macfor-white.png')
shutil.copyfile(SRC / 'brand_official' / 'Logo Macfor_black.png', OUT / 'brand' / 'macfor-black.png')
for n in ('eco_agro.png', 'eco_health.png'):
    shutil.copyfile(SRC / 'brand' / n, OUT / 'brand' / n)

# ---------- texturas (névoa e grão), geradas por código ----------
(OUT / 'tex').mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
def fbm(n=512, octaves=5):
    out = np.zeros((n, n)); amp = 1.0; tot = 0
    for o in range(octaves):
        f = 2 ** (o + 1)
        g = rng.random((f, f))
        g = np.pad(g, ((0, 1), (0, 1)), mode='wrap')
        xs = np.linspace(0, f, n, endpoint=False)
        xi = xs.astype(int); xf = xs - xi; xf = xf * xf * (3 - 2 * xf)
        a = g[np.ix_(xi, xi)]; b = g[np.ix_(xi, xi + 1)]; c = g[np.ix_(xi + 1, xi)]; e = g[np.ix_(xi + 1, xi + 1)]
        top = a + (b - a) * xf[None, :]; bot = c + (e - c) * xf[None, :]
        out += amp * (top + (bot - top) * xf[:, None]); tot += amp; amp *= 0.5
    return out / tot
cl = fbm(); cl = (cl - cl.min()) / (cl.max() - cl.min())
Image.fromarray((cl * 255).astype('uint8')).save(OUT / 'tex' / 'nuvem.jpg', quality=82)
gr = rng.normal(128, 38, (256, 256)).clip(0, 255).astype('uint8')
Image.fromarray(gr).save(OUT / 'tex' / 'grao.png', optimize=True)

# ---------- esculturas (GLB comprimido em base64, carregado sob demanda) ----------
st = {}
for n in ('lusofonos', 'aberje', 'titan', 'anuario'):
    st[n] = base64.b64encode((GEN / f'{n}.glb').read_bytes()).decode()
(OUT / 'js').mkdir(parents=True, exist_ok=True)
(OUT / 'js' / 'esculturas.js').write_text('window.__GLB=' + json.dumps(st) + ';')

bodies = [
    {'id': 'lusofonos', 'l1': 'Prêmio', 'l2': 'Lusófonos', 'chip': 'Lusófonos',
     'desc': 'Ouro e Prata com Reality da Soja (Syngenta). Bronze com Deezer no TikTok (Deezer). Bronze com O Agro no Comando Delas (Macfor).',
     'obj': 'Câmera de cinema tomada por um pé de soja: o reality que fez do campo um set.', 'case': 'soja'},
    {'id': 'aberje', 'l1': 'Prêmio', 'l2': 'ABERJE', 'chip': 'ABERJE',
     'desc': 'Ouro com Mulheres na Ferrovia (MRS).',
     'obj': 'Uma ferroviária sobre os trilhos, lanterna na mão.', 'case': 'mrsfem'},
    {'id': 'titan', 'l1': 'Titan', 'l2': 'Health Awards', 'chip': 'Titan Health',
     'desc': 'Ouro em Conceito de Marca e Prata em Pesquisa e Dados com Ortodontia que dá o que falar (OrthoDontic).',
     'obj': 'Um dente de aparelho e um megafone: ortodontia que dá o que falar.', 'case': 'ortho'},
    {'id': 'anuario', 'l1': 'Anuário', 'l2': 'Agro', 'chip': 'Anuário Agro',
     'desc': 'Ouro em O Agro que Conecta com O Agro no Comando Delas (Macfor). Ouro em AgroTech e Dados com SMSyngenta (Syngenta). Prata em Experiência do Cliente com Mais Agro (Syngenta). Bronze com Reality do Tomate (Syngenta).',
     'obj': 'Ela no volante do trator: o agro no comando delas.', 'case': 'comando'},
]

DARK = {'Hospital Sírio-Libanês'}  # logo vetorizado em branco: pede fundo escuro
clients = [{'name': k, 'logo': v, 'dark': int(k in DARK)} for k, v in logo_out.items()] + [{'name': 'Cargill', 'logo': cargill, 'dark': 0}]
for c in cases:
    c['ld'] = int(c['client'] in DARK)

data = {
    'cases': cases, 'partners': partners, 'bodies': bodies, 'clients': clients,
    'inst': d['institutional'], 'services': [s['title'] for s in d['services']],
    'eco': d['ecosystem'],
    'cols': ['Agro', 'Saúde', 'Varejo e consumo', 'Outros setores'],
}
json.dump(data, open(GEN / 'data.json', 'w'), ensure_ascii=False)
from collections import Counter
print('cases', len(cases), 'por coluna', sorted(Counter(c['col'] for c in cases).items()))
print('filmes', sum(1 for c in cases if c.get('films')), 'clientes', len(clients))
tot = sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())
print('assets MB', round(tot / 1e6, 1))
