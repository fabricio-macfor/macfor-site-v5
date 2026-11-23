#!/usr/bin/env python3
"""QA da home-v5: abre o index.html por file://, percorre a página e grava prints.
uso: python3 src/qa.py [largura] [altura] [prefixo] [lista de posições em vh, separadas por vírgula]"""
import sys, json, asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parent.parent
W = int(sys.argv[1]) if len(sys.argv) > 1 else 1440
H = int(sys.argv[2]) if len(sys.argv) > 2 else 900
PRE = sys.argv[3] if len(sys.argv) > 3 else 'd'
POS = sys.argv[4] if len(sys.argv) > 4 else ''
QA = ROOT.parent / 'qa'; QA.mkdir(exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio', '--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, is_mobile=W < 500, has_touch=W < 500, reduced_motion='reduce' if PRE.startswith('rm') else 'no-preference')
        pg = await ctx.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('requestfailed', lambda r: errs.append('REQFAIL ' + r.url[-80:]) if 'ERR_ABORTED' not in (r.failure or '') else None)
        if PRE.endswith('intro'): await pg.add_init_script('window.__slow=6')
        await pg.goto((ROOT / 'out' / 'index.html').as_uri())
        if PRE.endswith('intro'):
            for t in (300, 1500, 2300, 2700, 3000, 3400, 4600):
                await pg.wait_for_timeout(t - (0 if t == 300 else 0)) if False else None
            t0 = 0
            for t in (600, 1400, 2200, 3000, 3800, 4600, 5400, 6200, 7000, 8000):
                await pg.wait_for_timeout(t - t0); t0 = t
                await pg.screenshot(path=str(QA / f'{PRE}_{t:04d}.jpg'), quality=70, type='jpeg')
        else:
            await pg.wait_for_timeout(5200)
        info = await pg.evaluate('''() => ({sw: document.documentElement.scrollWidth, iw: innerWidth, docH: document.documentElement.scrollHeight, M: window.__mf && window.__mf.M})''')
        print(json.dumps(info))
        if POS:
            for s in POS.split(','):
                if s.startswith('case:'):
                    await pg.evaluate(f"window.__mf.openCase('{s[5:]}')"); await pg.wait_for_timeout(1500)
                    await pg.screenshot(path=str(QA / f'{PRE}_case_{s[5:]}.jpg'), quality=70, type='jpeg')
                    await pg.evaluate("document.querySelector('#css').scrollTop=900"); await pg.wait_for_timeout(500)
                    await pg.screenshot(path=str(QA / f'{PRE}_case_{s[5:]}_2.jpg'), quality=70, type='jpeg')
                    await pg.evaluate("window.__mf.closeCase()"); await pg.wait_for_timeout(1000)
                    continue
                if s.startswith('wait:'):
                    await pg.wait_for_timeout(int(s[5:])); continue
                v = float(s)
                await pg.evaluate(f'window.scrollTo(0, {v}*innerHeight/100)')
                if PRE.startswith('cmp'):
                    await pg.mouse.move(W * .93, H * .66); await pg.wait_for_timeout(700)
                    await pg.mouse.move(W * .9, H * .64); await pg.wait_for_timeout(1600)
                else:
                    await pg.mouse.move(W * .6, H * .5); await pg.wait_for_timeout(700)
                    await pg.mouse.move(W * .45, H * .55); await pg.wait_for_timeout(900)
                await pg.screenshot(path=str(QA / f'{PRE}_{int(v):05d}.jpg'), quality=70, type='jpeg')
        print('ERROS', len(errs)); [print(' ', e[:300]) for e in errs[:20]]
        await b.close()
asyncio.run(main())
