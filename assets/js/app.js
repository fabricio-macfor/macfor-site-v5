/* Macfor · home-v5 · interações */
(function () {
  'use strict';
  var D = window.__DATA, V = window.V || {};
  var doc = document, html = doc.documentElement, body = doc.body;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var S = { vw: innerWidth, vh: innerHeight, sy: 0, mx: innerWidth / 2, my: innerHeight / 2, nx: 0, ny: 0, t: 0, dt: 16, last: performance.now(), mob: innerWidth <= 760, moved: 0 };
  var CASE = {}; D.cases.forEach(function (c, i) { c.i = i; CASE[c.id] = c; });
  var MED = { ouro: 'o', prata: 'p', bronze: 'z' }, MEDN = { ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze' };
  var M = {};
  var PAL = [['#12C5A0', '#0A7F68', '#B9F3E6'], ['#9149FB', '#5D50A2', '#DCCBFF'], ['#E33547', '#FE384E', '#FFC2C9'], ['#0BA8F9', '#0668B8', '#B5E5FF']];
  var lenis = null;
  if (FINE) html.classList.add('cur');

  function awTags(c, tag) {
    return (c.aw || []).map(function (a) { return '<' + tag + ' class="' + MED[a.m] + '">' + MEDN[a.m] + ' · ' + esc(a.b) + '</' + tag + '>'; }).join('');
  }
  function lum(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  function vplay(v) {
    if (!v || v._on) return; v._on = true;
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.addEventListener('playing', function () { v.classList.add('play'); }, { once: true }); }
    var p = v.play(); if (p && p.catch) p.catch(function () { v._on = false; });
  }
  function vpause(v) { if (!v || !v._on) return; v._on = false; try { v.pause(); } catch (e) { } }
  function scrollToY(y, instant) {
    if (lenis && !instant) lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo(0, y);
  }

  /* ---------- divisão de letras ---------- */
  $$('[data-split]').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/), i = 0;
    h.innerHTML = words.map(function (w) {
      return '<span class="w" style="display:inline-block;white-space:nowrap">' + w.split('').map(function (ch) { return '<span class="ch" style="transition-delay:' + (i++ * 45) + 'ms">' + esc(ch) + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  $$('[data-letters]').forEach(function (h) {
    var out = '', n = 0;
    h.innerHTML.split(/<br\s*\/?>/i).forEach(function (line, li) {
      if (li) out += '<br>';
      out += line.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w.split('').map(function (ch) { n++; return '<span class="ch">' + esc(ch) + '</span>'; }).join('') + '</span>'; }).join(' ');
    });
    h.innerHTML = out; h._ch = $$('.ch', h); h._n = -1;
  });

  /* ---------- anel de cartas (hero) ---------- */
  var ring = { el: $('#ring'), rot: $('#ring .rot'), cards: [], ang: 0, sp: 0, hover: false, k: RM ? 1 : 0, R: 600, shown: true };
  function buildRing() {
    var films = D.cases.filter(function (c) { return c.loop; }), kvs = D.cases.filter(function (c) { return !c.loop; });
    var N = S.mob ? 18 : D.cases.length, seq = [], fi = 0, ki = 0, step = Math.max(2, Math.floor(N / films.length));
    for (var i = 0; i < N; i++) { if ((i % step === 0 && fi < films.length) || ki >= kvs.length) seq.push(films[fi++]); else seq.push(kvs[ki++]); }
    seq = seq.filter(Boolean); N = seq.length;
    var ys = [-.30, .12, -.07, .33, -.19, .22, .02, -.36, .30, -.12];
    var h = '';
    seq.forEach(function (c, i) {
      var film = !!c.loop, vert = c.ar < 1;
      var acc = PAL[c.col][i % 3];
      var cls = 'rc ' + (film ? 'film' : 'kv' + (lum(acc) > .6 ? ' lt' : '')) + (vert ? ' vert' : '');
      h += '<article class="' + cls + '" data-case="' + c.id + '" data-cur="card" style="--acc:' + acc + ';--cw:calc(var(--cwb)*' + (film ? 1 : .8) + ')"><div class="rc-in"><div class="rc-f">' +
        '<div class="rc-m"><img src="' + c.img + '" alt=""' + (vert && !film ? ' style="object-fit:contain"' : '') + '>' + (film ? '<video muted loop playsinline preload="none" data-src="' + c.loop + '"></video>' : '') + '</div>' +
        '<span class="rc-c">' + esc(c.client) + '</span><b class="rc-t">' + esc(c.title) + '</b>' +
        (film ? '<span class="rc-d">' + esc(c.desc) + '</span>' : '') +
        '<div class="rc-a">' + (film ? '<span class="film">▶ Filme</span>' : '') + awTags(c, 'span') + '</div>' +
        '</div><div class="rc-b" style="background-image:url(' + c.img + ')"></div><div class="rc-dim"></div></div></article>';
    });
    ring.rot.innerHTML = h;
    ring.cards = $$('.rc', ring.rot).map(function (el, i) {
      return { el: el, dim: $('.rc-dim', el), vid: $('video', el), a: i / N * Math.PI * 2 + (Math.sin(i * 12.9898) * .5) * (Math.PI * 2 / N) * .5, y: ys[i % ys.length] + Math.sin(i * 4.1) * .04, tz: Math.sin(i * 7.3) * 7, tx: Math.sin(i * 3.7) * 6, d: -1 };
    });
    ring.el.addEventListener('mouseover', function (e) { ring.hover = !!e.target.closest('.rc'); });
    ring.el.addEventListener('mouseleave', function () { ring.hover = false; });
  }
  function ringSize() {
    ring.R = S.mob ? S.vw * 1.0 : clamp(S.vw * .5, 360, 940);
    ring.el.style.perspective = (S.mob ? 760 : 1200) + 'px';
    ring.el.style.setProperty('--cwb', (S.mob ? clamp(S.vw * .4, 130, 170) : clamp(S.vw * .146, 165, 290)) + 'px');
  }
  function ringUpdate() {
    var p = S.sy / S.vh, vis = p < 1.02;
    if (vis !== ring.shown) { ring.shown = vis; ring.el.style.display = vis ? '' : 'none'; if (!vis) ring.cards.forEach(function (c) { vpause(c.vid); }); }
    if (!vis) return;
    if (ring.k < 1 && ring.go) ring.k = Math.min(1, ring.k + S.dt / 1900);
    var k = eo(ring.k), al = (1 - sm(.5, .98, p)) * sm(0, .25, ring.k);
    ring.el.style.opacity = al;
    var tgt = RM ? 0 : (ring.hover ? .012 : .1);
    ring.sp = lerp(ring.sp, tgt, .05);
    ring.ang += ring.sp * S.dt / 1000 + (S.sy - (ring.ls || 0)) * .0009; ring.ls = S.sy;
    var R = ring.R * (1 + (1 - k) * .9), H = S.vh * (S.mob ? .78 : .92);
    ring.rot.style.transform = 'translate3d(0,' + (-S.sy * .32) + 'px,0) rotateX(' + (-S.ny * 4 + (1 - k) * 18) + 'deg) rotateY(' + (S.nx * 6) + 'deg)';
    var off = ring.ang + (1 - k) * 1.6;
    for (var i = 0; i < ring.cards.length; i++) {
      var c = ring.cards[i], a = c.a + off, sx = Math.sin(a), cz = Math.cos(a);
      c.el.style.transform = 'translate3d(' + (sx * R).toFixed(1) + 'px,' + (c.y * H * (1 + (1 - k) * .6)).toFixed(1) + 'px,' + (cz * R - R * .6).toFixed(1) + 'px) rotateY(' + a.toFixed(4) + 'rad) rotateZ(' + c.tz + 'deg) rotateX(' + c.tx + 'deg) translateY(-50%)';
      var d = Math.round(clamp((1 - cz) * .42, 0, .8) * 50) / 50;
      if (d !== c.d) { c.d = d; c.dim.style.opacity = d; }
      if (c.vid) { if (cz > .3 && al > .2) vplay(c.vid); else vpause(c.vid); }
    }
  }

  /* ---------- loader ---------- */
  function loader(done) {
    var L = $('#loader');
    if (RM || !L) { if (L) L.remove(); done(); return; }
    var veil = $('.veil', L), fans = $$('.fan', L), card = $('.ld-card', L), inn = $('.ld-in', L), n = $('#ldn');
    var t0 = performance.now(), ready = false, called = false;
    var fr = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
    fr.then(function () { ready = true; }); setTimeout(function () { ready = true; }, 3500);
    function quad(p, grow, rk) {
      var e = eio(clamp(p, 0, 1)), s = Math.sin(clamp(p, 0, 1) * Math.PI);
      var hw = lerp(card._w / 2, S.vw * .8, e) * grow, hh = lerp(card._h / 2, S.vh * .9, e) * grow;
      var a = -(.07 * (1 - e) + .1 * s) * rk, k = .12 * s, ca = Math.cos(a), sa = Math.sin(a), cx = S.vw / 2, cy = S.vh / 2;
      return [[-hw, -hh * (1 - k)], [hw, -hh * (1 + k)], [hw, hh * (1 + k)], [-hw, hh * (1 - k)]].map(function (q) {
        return (cx + q[0] * ca - q[1] * sa).toFixed(1) + 'px ' + (cy + q[0] * sa + q[1] * ca).toFixed(1) + 'px';
      });
    }
    function poly(outer, hole) { return 'polygon(evenodd,' + outer.concat([outer[0]]).concat(hole).concat([hole[0]]).join(',') + ')'; }
    function open() {
      var r = card.getBoundingClientRect(); card._w = r.width; card._h = r.height;
      var t1 = performance.now(), d2 = 1350 * (window.__slow || 1);
      ring.go = true;
      (function step(now) {
        var p = clamp((now - t1) / d2, 0, 1);
        var H = quad(p, 1, 1), scr = ['0px 0px', S.vw + 'px 0px', S.vw + 'px ' + S.vh + 'px', '0px ' + S.vh + 'px'];
        veil.style.clipPath = poly(scr, H);
        fans[0].style.clipPath = poly(quad(p + .03, 1.07, 1.6), H);
        fans[1].style.clipPath = poly(quad(p + .06, 1.15, -1.2), H);
        if (p === 0) { fans.forEach(function (f) { f.style.opacity = 1; }); }
        card.style.opacity = 0;
        if (p > .5 && !called) { called = true; done(); }
        if (p < 1) requestAnimationFrame(step); else L.remove();
      })(t1);
    }
    (function count(now) {
      var p = clamp((now - t0) / 1500, 0, 1); if (!ready) p = Math.min(p, .9);
      n.textContent = Math.round(eo(p) * 100) + '%';
      if (p < 1) requestAnimationFrame(count); else { inn.classList.add('flip'); setTimeout(open, 640); }
    })(t0);
  }

  /* ---------- título do hero ---------- */
  var heroT = $('.hero-title');
  function fitHero() {
    heroT.style.fontSize = '100px';
    var w = 0;
    if (S.mob) { $$('.w', heroT).forEach(function (x) { w = Math.max(w, x.offsetWidth); }); heroT.style.fontSize = Math.min(S.vw * .9 / w * 100, S.vw * .2) + 'px'; }
    else { var r = doc.createRange(); r.selectNodeContents(heroT); w = r.getBoundingClientRect().width; heroT.style.fontSize = (S.vw * .945 / w * 100) + 'px'; }
  }

  /* ---------- capítulo 02 ---------- */
  var c2 = { sec: $('#c2'), blob: $('#blob'), phone: $('#phone'), frame: $('.ph-frame'), ui: $('.ph-ui'), title: $('#c2t'), bot: $('#c2b'), giant: $('#giant'), gs: $('#giant span'), nl: $('#c2n'), vid: $('.ph-card video'), tc: $('#phtc'), idx: -1, lastSw: 0, full: false };
  var c2nums = CASE.mrsfem.nums;
  function c2num(i) {
    c2.idx = i; var n = c2nums[i];
    c2.giant.classList.add('out');
    setTimeout(function () {
      c2.gs.textContent = n[0]; c2.giant.style.fontSize = '100px';
      var w = c2.gs.offsetWidth || 1;
      c2.giant.style.fontSize = Math.min(S.vw * (S.mob ? .4 : .26), S.vw * .9 / w * 100, S.vh * .5) + 'px';
      c2.nl.innerHTML = '<b>' + esc(n[0]) + '</b> ' + esc(n[1]) + '.';
      c2.giant.classList.remove('out');
    }, c2.gs.textContent ? 380 : 0);
  }
  function c2update() {
    var m = M.c2, p = clamp((S.sy - m.top) / (m.h - S.vh), 0, 1), vis = S.sy > m.top - S.vh && S.sy < m.top + m.h;
    if (!vis) { vpause(c2.vid); return; }
    vplay(c2.vid);
    var pb = sm(.1, .42, p), cx = S.vw / 2, cy = S.vh * .54;
    if (pb >= 1) { if (!c2.full) { c2.full = true; c2.blob.style.clipPath = 'none'; } }
    else {
      c2.full = false;
      var R = pb * pb * Math.hypot(S.vw, S.vh) * .68 + pb * S.vw * .09, w = 1 - pb * .55, t = RM ? 0 : S.t, pts = [];
      for (var i = 0; i < 56; i++) {
        var th = i / 56 * Math.PI * 2, r = R * (1 + w * (.13 * Math.sin(3 * th + t * .9) + .08 * Math.sin(5 * th - t * 1.2) + .045 * Math.sin(8 * th + t * 1.9)));
        pts.push((cx + Math.cos(th) * r).toFixed(1) + 'px ' + (cy + Math.sin(th) * r).toFixed(1) + 'px');
      }
      c2.blob.style.clipPath = 'polygon(' + pts.join(',') + ')';
    }
    var pf = sm(.4, .6, p);
    c2.frame.style.opacity = pf; c2.ui.style.opacity = pf;
    c2.phone.style.transform = 'scale(' + lerp(1.12, 1, pf).toFixed(4) + ') rotate(' + (Math.sin(pb * Math.PI) * 7 * (1 - pf)).toFixed(2) + 'deg)';
    var on = p > .5;
    if (on !== c2.on) { c2.on = on; c2.title.classList.toggle('on', on); c2.bot.classList.toggle('on', on); c2.sec.classList.toggle('b', on); }
    if (c2.idx < 0) c2num(0);
    else if (!RM && pb > .15 && S.t - c2.lastSw > 3.4) { c2.lastSw = S.t; c2num((c2.idx + 1) % c2nums.length); }
    if (c2.tc && c2.vid.currentTime != null) { var s = Math.floor(c2.vid.currentTime || 0); c2.tc.textContent = '00:0' + s; }
  }

  /* ---------- capítulo 03: lista de cases ---------- */
  var rowsEl = $('#rows'), rows = [];
  function buildRows() {
    var h = '';
    D.cases.forEach(function (c, i) {
      var port = c.ar < 1, meta = [c.area].concat(c.tags || []).filter(Boolean).join(' · ');
      h += '<div class="row" data-case="' + c.id + '" data-cur="card"><div class="l"><small>' + esc(c.client) + '</small><b>' + esc(c.title) + '</b>' + awTags(c, 'em') + '<i>' + (i < 9 ? '0' : '') + (i + 1) + '</i></div>' +
        '<div class="m' + (port ? ' p' : '') + '" style="aspect-ratio:' + c.ar + '"><img loading="lazy" src="' + c.img + '" alt="' + esc(c.title) + '">' + (c.loop ? '<video muted loop playsinline preload="none" data-src="' + c.loop + '"></video><span class="pl"></span>' : '') + '</div>' +
        '<div class="r">' + (c.desc ? esc(c.desc) + '<span>' + esc(meta) + '</span>' : esc(meta)) + '</div></div>';
    });
    rowsEl.innerHTML = h;
    rows = $$('.row', rowsEl).map(function (el) { return { el: el, vid: $('video', el), k: -1 }; });
  }
  var tile = { el: $('#c3tile'), i: 0, last: 0, logos: D.clients.filter(function (c) { return !c.dark; }).map(function (c) { return c.logo; }) };
  function tileNext() {
    var old = $('img', tile.el), im = doc.createElement('img');
    im.src = tile.logos[tile.i % tile.logos.length]; im.alt = ''; im.className = 'pre'; tile.i++;
    tile.el.appendChild(im); im.offsetWidth; im.className = '';
    if (old) { old.className = 'out'; setTimeout(function () { old.remove(); }, 650); }
  }
  function sheetTilt(el, m, exit) {
    var y = m.top - S.sy, yb = y + m.h, tr = '';
    if (y > 0) { var e = clamp(y / S.vh, 0, 1); el.style.transformOrigin = '0 0'; tr = 'translateX(' + (e * S.vw * .06).toFixed(1) + 'px) rotate(' + (e * 5).toFixed(3) + 'deg)'; }
    else if (exit && yb < S.vh) { var x = clamp(1 - yb / S.vh, 0, 1); el.style.transformOrigin = '0 100%'; tr = 'translateX(' + (x * S.vw * .035).toFixed(1) + 'px) rotate(' + (-x * 3).toFixed(3) + 'deg)'; }
    if (RM) tr = '';
    if (tr !== el._tr) { el._tr = tr; el.style.transform = tr; }
  }
  var sheet3 = $('#sheet3'), sheet7 = $('#sheet7');
  function c3update() {
    var m = M.c3, y = m.top - S.sy;
    if (y > S.vh || y + m.h < 0) return;
    sheetTilt(sheet3, m, true);
    if (!RM && S.t - tile.last > 1.5) { tile.last = S.t; tileNext(); }
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], ry = y + M.rowsTop + M.rowOff[i], vis = ry > -M.rowH && ry < S.vh;
      if (r.vid) { if (vis && ry < S.vh * .82) vplay(r.vid); else vpause(r.vid); }
      if (!vis || S.mob || RM) { if (r.k !== 0 && (S.mob || RM)) { r.k = 0; r.el.style.transform = ''; r.el.style.opacity = ''; } continue; }
      var k = Math.round(clamp((ry - S.vh * .6) / (S.vh * .4), 0, 1) * 60) / 60;
      if (k !== r.k) { r.k = k; r.el.style.transform = 'translate3d(' + (k * k * S.vw * .075).toFixed(1) + 'px,0,0)'; r.el.style.opacity = 1 - k * .82; r.el.style.setProperty('--k', k); }
    }
  }

  /* ---------- capítulo 04: sócios ---------- */
  var c4 = { sec: $('#c4'), stage: $('#c4 .stage'), scr: $('#dvs'), chips: $('#dvc'), p: $('#c4p'), i: -1, last: 0, hold: 0 };
  function buildC4() {
    c4.scr.innerHTML = D.partners.map(function (p) { return '<img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">'; }).join('');
    c4.chips.innerHTML = D.partners.map(function (p, i) { return '<button class="chip mag" data-p="' + i + '">' + esc(p.name.split(' ')[0]) + '</button>'; }).join('');
    c4.imgs = $$('img', c4.scr); c4.btns = $$('.chip', c4.chips);
    c4.chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) { c4set(+b.dataset.p); c4.hold = S.t + 12; } });
    c4set(0);
  }
  function c4set(i) {
    c4.i = i; c4.last = S.t; var p = D.partners[i];
    c4.imgs.forEach(function (im, j) { im.classList.toggle('act', j === i); });
    c4.btns.forEach(function (b, j) { b.classList.toggle('act', j === i); });
    c4.p.innerHTML = '<b>' + esc(p.name) + '</b>' + esc(p.role);
  }
  function c4update() {
    var m = M.c4, p = clamp((S.sy - m.top) / (m.h - S.vh), 0, 1), vis = S.sy > m.top - S.vh * .2 && S.sy < m.top + m.h;
    if (!vis) return;
    var on = p > .3; if (on !== c4.on) { c4.on = on; c4.stage.classList.toggle('on', on); }
    c4.stage.style.opacity = 1 - sm(.84, .98, p);
    if (!RM && on && S.t > c4.hold && S.t - c4.last > 4) c4set((c4.i + 1) % D.partners.length);
  }

  /* ---------- capítulo 05: prêmios em escultura ---------- */
  var c5 = { sec: $('#c5'), cv: $('#gl5'), d: $('#c5d'), n: $('#c5n'), a: $('#c5a'), b: $('#c5b'), chips: $('#c5c'), drag: $('#c5drag'), i: -1, rotY: -.5, vel: 0, dragging: false, objs: {}, st: 0 };
  function swapText(span, txt, after) {
    if (RM || !span.textContent) { span.textContent = txt; if (after) after(); return; }
    span.style.transition = 'transform .42s cubic-bezier(.65,0,.35,1)'; span.style.transform = 'translateY(-112%)';
    setTimeout(function () {
      span.textContent = txt; if (after) after();
      span.style.transition = 'none'; span.style.transform = 'translateY(112%)'; span.offsetWidth;
      span.style.transition = ''; span.style.transform = '';
    }, 430);
  }
  function c5fit() {
    var bw = c5.b.parentNode.parentNode; bw.style.fontSize = '';
    var w = c5.b.offsetWidth, max = S.vw * .93;
    if (w > max) bw.style.fontSize = (parseFloat(getComputedStyle(bw).fontSize) * max / w) + 'px';
  }
  function c5set(i) {
    if (i === c5.i) return; c5.i = i; var b = D.bodies[i];
    swapText(c5.a, b.l1); swapText(c5.b, b.l2, c5fit);
    c5.n.textContent = '(' + (i + 1) + ')';
    c5.d.innerHTML = esc(b.desc) + '<span>' + esc(b.obj) + '</span>';
    c5.btns.forEach(function (x, j) { x.classList.toggle('act', j === i); });
  }
  function buildC5() {
    c5.chips.innerHTML = D.bodies.map(function (b, i) { return '<button class="chip mag" data-b="' + i + '">' + esc(b.chip) + '</button>'; }).join('');
    c5.btns = $$('.chip', c5.chips);
    c5.chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      var m = M.c5; scrollToY(m.top + (m.h - S.vh) * ((+b.dataset.b + .5) / D.bodies.length));
    });
    var lx = 0;
    c5.drag.addEventListener('pointerdown', function (e) { c5.dragging = true; lx = e.clientX; c5.vel = 0; try { c5.drag.setPointerCapture(e.pointerId); } catch (x) { } });
    c5.drag.addEventListener('pointermove', function (e) { if (!c5.dragging) return; var dx = e.clientX - lx; lx = e.clientX; c5.rotY += dx * .009; c5.vel = dx * .009; });
    var up = function () { c5.dragging = false; };
    c5.drag.addEventListener('pointerup', up); c5.drag.addEventListener('pointercancel', up);
    c5set(0);
  }
  function c5gl() {
    if (c5.st) return; c5.st = 1;
    var T = V.THREE; if (!T) { c5.st = -1; return; }
    try {
      var r = new T.WebGLRenderer({ canvas: c5.cv, alpha: true, antialias: true, powerPreference: 'high-performance' });
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = .82; r.outputColorSpace = T.SRGBColorSpace;
      var sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 50); cam.position.set(0, 0, 4.4);
      var pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new V.RoomEnvironment(), .04).texture; sc.environmentIntensity = .5;
      var key = new T.DirectionalLight(0xffe2b0, 2.6); key.position.set(-2.4, 3, 2.2); sc.add(key);
      var rim = new T.DirectionalLight(0x0BA8F9, 2.2); rim.position.set(3, 1.2, -2.4); sc.add(rim);
      var rim2 = new T.DirectionalLight(0x804AFB, 1.4); rim2.position.set(-3, -1, -2); sc.add(rim2);
      c5.mat = new T.MeshStandardMaterial({ color: 0xBE8C36, metalness: 1, roughness: .38 });
      c5.r = r; c5.sc = sc; c5.cam = cam; c5resize();
    } catch (e) { c5.st = -1; c5.cv.style.display = 'none'; return; }
    var s = doc.createElement('script'); s.src = 'assets/js/esculturas.js';
    s.onload = function () {
      var G = window.__GLB || {}, T = V.THREE, L = new V.GLTFLoader(); L.setMeshoptDecoder(V.MeshoptDecoder);
      D.bodies.forEach(function (b, i) {
        var bin = atob(G[b.id] || ''), u8 = new Uint8Array(bin.length); for (var k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
        L.parse(u8.buffer, '', function (g) {
          var o = g.scene; o.traverse(function (x) { if (x.isMesh) { x.material = c5.mat; } });
          var box = new T.Box3().setFromObject(o), sz = box.getSize(new T.Vector3()), ct = box.getCenter(new T.Vector3());
          var sc = 1.72 / Math.max(sz.y, Math.max(sz.x, sz.z) * 1.12);
          o.position.sub(ct); var piv = new T.Group(); piv.add(o); piv.userData = { s: sc, k: 0 }; piv.scale.setScalar(sc * .5); piv.visible = false;
          c5.sc.add(piv); c5.objs[i] = piv; c5.st = 2;
        }, function () { });
      });
      window.__GLB = null;
    };
    doc.head.appendChild(s);
  }
  function c5resize() {
    if (!c5.r) return; var w = c5.cv.clientWidth || S.vw, h = c5.cv.clientHeight || S.vh;
    c5.r.setSize(w, h, false); c5.cam.aspect = w / h;
    c5.port = w / h < .8; c5.cam.position.z = c5.port ? 6.4 : 4.4; c5.cam.updateProjectionMatrix();
  }
  function c5update() {
    var m = M.c5, near = S.sy > m.top - S.vh * 2.5 && S.sy < m.top + m.h + S.vh, vis = S.sy > m.top - S.vh && S.sy < m.top + m.h;
    if (near) c5gl();
    if (!vis) return;
    var p = clamp((S.sy - m.top) / (m.h - S.vh), 0, 1);
    c5set(clamp(Math.floor(p * D.bodies.length), 0, D.bodies.length - 1));
    if (c5.st < 1 || !c5.r) return;
    if (!c5.dragging) { c5.rotY += c5.vel + (RM ? 0 : S.dt * .00022); c5.vel *= .94; }
    for (var i in c5.objs) {
      var o = c5.objs[i], u = o.userData, tg = (+i === c5.i) ? 1 : 0;
      u.k += (tg - u.k) * (1 - Math.exp(-S.dt / 1000 * (tg ? 4.2 : 7))); if (Math.abs(u.k - tg) < .002) u.k = tg;
      o.visible = u.k > .04; if (!o.visible) continue;
      var e = eo(u.k);
      var ps = c5.port ? .74 : 1; o.scale.setScalar(u.s * ps * (.5 + .5 * e)); o.position.y = (c5.port ? .5 : .15) - (1 - e) * (tg ? -2.2 : 2.6);
      o.rotation.y = c5.rotY + (1 - e) * (tg ? -2.6 : 2.2);
    }
    c5.r.render(c5.sc, c5.cam);
  }

  /* ---------- capítulo 06: pilha com física ---------- */
  var c6 = { sec: $('#c6'), stage: $('#c6 .stage'), cv: $('#phys'), cols: $('#cols'), tip: $('#c6tip'), count: [0, 0, 0, 0], q: [[], [], [], []], bodies: [], lastDrop: 0, lastAuto: 0, lx: 0, ly: 0, hov: null, st: 0 };
  function buildC6() {
    c6.cols.innerHTML = D.cols.map(function (n) { return '<div><small>' + esc(n) + '</small><b>0</b></div>'; }).join('');
    c6.nums = $$('b', c6.cols);
    c6.stage.addEventListener('click', function () { if (c6.hov) openCase(c6.hov.case.id); });
  }
  function c6world() {
    var Mt = V.Matter; if (!Mt) { c6.st = -1; return; }
    var w = c6.cv.clientWidth || S.vw, h = c6.cv.clientHeight || S.vh, dpr = Math.min(devicePixelRatio || 1, 2);
    c6.w = w; c6.h = h; c6.cv.width = w * dpr; c6.cv.height = h * dpr; c6.ctx = c6.cv.getContext('2d'); c6.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    c6.cw = w / 4; c6.r = clamp(c6.cw * .105, 11, 46);
    c6.eng = Mt.Engine.create(); c6.eng.gravity.y = 1.15;
    var B = Mt.Bodies, st = { isStatic: true, friction: .6 }, walls = [B.rectangle(w / 2, h + 40, w * 2, 80, st), B.rectangle(-40, h / 2, 80, h * 3, st), B.rectangle(w + 40, h / 2, 80, h * 3, st)];
    for (var i = 1; i < 4; i++) walls.push(B.rectangle(c6.cw * i, h - c6.r * 1.6, 3, c6.r * 3.2, st));
    c6.ball = B.circle(-200, -200, 27, { isStatic: true }); walls.push(c6.ball);
    Mt.Composite.add(c6.eng.world, walls);
    c6.bodies = []; c6.q = [[], [], [], []]; c6.count = [0, 0, 0, 0];
    D.cases.forEach(function (c) { c6.q[c.col].push(c); });
    c6.nums.forEach(function (n) { n.textContent = '0'; });
    c6.st = 1;
    if (RM) { for (var k = 0; k < 4; k++) while (c6.q[k].length) c6drop(k); for (var s = 0; s < 240; s++) Mt.Engine.update(c6.eng, 16.6); }
  }
  function c6drop(col, x, y) {
    var c = c6.q[col].shift(); if (!c) return; var Mt = V.Matter, B = Mt.Bodies, r = c6.r * (.86 + ((c.i * 37) % 10) / 34), kind = (c.i * 7 + col) % 4;
    var px = x == null ? c6.cw * col + c6.cw * (.2 + Math.random() * .6) : clamp(x, c6.cw * col + r, c6.cw * (col + 1) - r), py = y == null ? -r * 2 : Math.min(y, c6.h * .55), o = { restitution: .28, friction: .45, density: .002 }, b;
    if (kind === 1) b = B.rectangle(px, py, r * 2.5, r * 1.5, Object.assign({ chamfer: { radius: r * .74 } }, o));
    else if (kind === 2) { var vs = []; for (var a = 0; a <= 12; a++) vs.push({ x: Math.cos(Math.PI * a / 12) * r * 1.25, y: -Math.sin(Math.PI * a / 12) * r * 1.25 }); b = Mt.Bodies.fromVertices(px, py, [vs], o); }
    else b = B.circle(px, py, r, o);
    b.case = c; b.kind = kind; b.rr = r; b.pal = PAL[col]; b.ci = c.i % 3;
    Mt.Body.setVelocity(b, { x: (Math.random() - .5) * 2, y: 2 }); Mt.Body.setAngularVelocity(b, (Math.random() - .5) * .15);
    Mt.Composite.add(c6.eng.world, b); c6.bodies.push(b);
    c6.count[col]++; c6.nums[col].textContent = c6.count[col];
  }
  function c6draw() {
    var x = c6.ctx; x.clearRect(0, 0, c6.w, c6.h);
    for (var i = 0; i < c6.bodies.length; i++) {
      var b = c6.bodies[i], r = b.rr, c1 = b.pal[b.ci], c2 = b.pal[(b.ci + 1) % 3];
      x.save(); x.translate(b.position.x, b.position.y); x.rotate(b.angle);
      if (b === c6.hov) { x.scale(1.08, 1.08); }
      x.beginPath();
      if (b.kind === 1) { var w = r * 2.5, h = r * 1.5, q = r * .74; x.roundRect ? x.roundRect(-w / 2, -h / 2, w, h, q) : x.rect(-w / 2, -h / 2, w, h); }
      else if (b.kind === 2) { var vs = b.vertices; x.rotate(-b.angle); x.translate(-b.position.x, -b.position.y); x.moveTo(vs[0].x, vs[0].y); for (var k = 1; k < vs.length; k++) x.lineTo(vs[k].x, vs[k].y); x.closePath(); }
      else x.arc(0, 0, r, 0, 6.2832);
      x.fillStyle = c1; x.fill();
      if (b.kind === 0 || b.kind === 1) { x.save(); x.clip(); x.fillStyle = c2; x.beginPath(); if (b.kind === 0) x.rect(-r, 0, r * 2, r); else { x.moveTo(-r * .2, -r); x.lineTo(r * .7, -r); x.lineTo(r * .1, r); x.lineTo(-r * .8, r); x.closePath(); } x.fill(); x.restore(); }
      x.restore();
    }
  }
  function c6update() {
    var m = M.c6, vis = S.sy > m.top - S.vh * .5 && S.sy < m.top + m.h;
    if (!vis) return;
    if (!c6.st) c6world();
    if (c6.st < 1) return;
    var Mt = V.Matter, rect = M.c6.top - S.sy, inPin = rect <= 4 && S.sy < m.top + m.h - S.vh + 4, my = S.my - Math.max(rect, 0), now = S.t * 1000;
    var left = c6.q[0].length + c6.q[1].length + c6.q[2].length + c6.q[3].length;
    if (inPin && left) {
      var col = clamp(Math.floor(S.mx / c6.cw), 0, 3), movedNow = FINE && (Math.abs(S.mx - c6.lx) + Math.abs(S.my - c6.ly)) > 3;
      if (movedNow && c6.q[col].length && now - c6.lastDrop > 120) { c6.lastDrop = now; c6.lastMoveT = now; c6drop(col, S.mx, my); }
      else if (now - (c6.lastMoveT || 0) > 700 && now - c6.lastAuto > (FINE ? 230 : 150)) { c6.lastAuto = now; var cc = (c6.rr = ((c6.rr || 0) + 1) % 4), t = 0; while (!c6.q[cc].length && t++ < 4) cc = (cc + 1) % 4; c6drop(cc); }
    }
    c6.lx = S.mx; c6.ly = S.my;
    if (FINE) Mt.Body.setPosition(c6.ball, { x: S.mx, y: my });
    Mt.Engine.update(c6.eng, Math.min(S.dt, 33));
    var hov = null;
    if (FINE && inPin) { var hit = Mt.Query.point(c6.bodies, { x: S.mx, y: my }); hov = hit.length ? hit[hit.length - 1] : null; }
    if (hov !== c6.hov) {
      c6.hov = hov;
      if (hov) { c6.tip.innerHTML = esc(hov.case.title) + ' · ' + esc(hov.case.client); c6.tip.style.opacity = 1; setCur('card', 'Abrir'); }
      else { c6.tip.style.opacity = 0; setCur('ball', ''); }
    }
    if (hov) { c6.tip.style.left = S.mx + 'px'; c6.tip.style.top = my + 'px'; }
    c6draw();
  }

  /* ---------- capítulo 07: clientes ---------- */
  var c7 = { sec: $('#c7'), tiles: $('#tiles'), list: [], heads: $$('#c7 [data-letters]') };
  var TP = [[14, 22, 9], [33, 15, 8], [52, 25, 9.5], [71, 14, 8], [88, 27, 9], [24, 45, 8.5], [44, 47, 7.5], [63, 44, 8.5], [81, 51, 8], [8, 72, 9], [92, 76, 8.5], [12, 100, 8], [89, 103, 9], [22, 127, 8.5], [78, 131, 8], [50, 122, 7], [10, 156, 9], [91, 160, 8.5], [15, 186, 8], [86, 190, 9], [8, 212, 8], [93, 214, 8]];
  var TPM = [[18, 15, 21], [50, 22, 22], [82, 14, 20], [28, 38, 20], [72, 40, 21], [16, 86, 19], [84, 90, 20], [50, 99, 18], [20, 182, 20], [80, 186, 20], [50, 204, 19], [18, 220, 19]];
  var TC = ['#00A5DF', '#5D50A2', '#00B698', '#FE384E'];
  function buildC7() {
    var pos = S.mob ? TPM : TP, cl = D.clients.slice(0, pos.length), h = '';
    cl.forEach(function (c, i) {
      var cs = D.cases.filter(function (x) { return x.client === c.name; })[0];
      h += '<div class="tl' + (c.dark ? ' dk' : '') + '" style="left:' + pos[i][0] + '%;top:' + pos[i][1] + 'vh;--s:' + pos[i][2] + 'vw;--c:' + TC[i % 4] + '"' + (cs ? ' data-case="' + cs.id + '" data-cur="card"' : '') + '><div class="e"></div><div class="f"><img src="' + c.logo + '" alt="' + esc(c.name) + '" loading="lazy"></div><small>' + esc(c.name) + '</small></div>';
    });
    c7.tiles.innerHTML = h;
    c7.list = $$('.tl', c7.tiles).map(function (el, i) { return { el: el, x: pos[i][0] / 100, y: pos[i][1] / 100, rz: Math.sin(i * 5.3) * 15, d: .4 + (i % 5) * .22, rx: 0, ry: 0 }; });
    $('#svc').textContent = D.services.join(' · ');
  }
  function c7update() {
    var m = M.c7, y = m.top - S.sy;
    var show8 = S.sy > m.top + m.h - S.vh * 1.02; if (show8 !== c8.vis) { c8.vis = show8; c8.el.classList.toggle('vis', show8); }
    if (y > S.vh || y + m.h < -S.vh * .1) return;
    sheetTilt(sheet7, m, false);
    var t = RM ? 0 : S.t, sc = clamp(-y, -S.vh, m.h);
    for (var i = 0; i < c7.list.length; i++) {
      var o = c7.list[i], cy = y + o.y * S.vh, cx = o.x * S.vw;
      if (cy < -S.vh * .4 || cy > S.vh * 1.4) continue;
      var dx = clamp((S.mx - cx) / 420, -1, 1), dy = clamp((S.my - cy) / 420, -1, 1), near = FINE ? Math.max(0, 1 - Math.hypot(dx, dy)) : 0;
      o.ry = lerp(o.ry, dx * 26 * near + Math.sin(t * .5 + i) * 10, .08); o.rx = lerp(o.rx, -dy * 26 * near + Math.cos(t * .43 + i * 2) * 10, .08);
      o.el.style.transform = 'translate3d(' + (Math.sin(t * .37 + i * 1.3) * 10).toFixed(1) + 'px,' + (Math.sin(t * .6 + i) * 12 - sc * o.d * .1).toFixed(1) + 'px,0) rotateX(' + o.rx.toFixed(2) + 'deg) rotateY(' + o.ry.toFixed(2) + 'deg) rotateZ(' + (o.rz + Math.sin(t * .4 + i * 1.7) * 6).toFixed(2) + 'deg)';
    }
    for (var k = 0; k < c7.heads.length; k++) {
      var hd = c7.heads[k], top = y + M.c7heads[k], pr = RM ? 1 : clamp((S.vh * .96 - top) / (S.vh * .55), 0, 1), n = Math.round(pr * hd._ch.length);
      if (n !== hd._n) { hd._n = n; for (var j = 0; j < hd._ch.length; j++) hd._ch[j].classList.toggle('on', j < n); }
    }
  }

  /* ---------- capítulo 08 ---------- */
  var c8 = { el: $('#c8'), vis: false };
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault(); var v = $('#mail').value.trim(), n = $('#c8n');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { n.textContent = 'Confira o e-mail digitado.'; return; }
    n.innerHTML = 'Abrimos o seu aplicativo de e-mail com a mensagem pronta para <a href="mailto:resultado@macfor.com.br">resultado@macfor.com.br</a>';
    location.href = 'mailto:resultado@macfor.com.br?subject=' + encodeURIComponent('Contato pelo site') + '&body=' + encodeURIComponent('Olá, Macfor. Quero conversar. Meu e-mail: ' + v);
  });

  /* ---------- pílula, fundo e cursor ---------- */
  var pill = $('#pill'), bgEl = $('#bg'), bgState = 'st-dark';
  function chrome() {
    var docH = M.docH - S.vh, pr = clamp(S.sy / docH, 0, 1), pw = pill.offsetWidth;
    pill.style.transform = 'translate3d(' + lerp(S.vw * .04, S.vw * .96 - pw, pr).toFixed(1) + 'px,0,0)';
    var show = S.sy > S.vh * .8 && !c8.vis && !body.classList.contains('intro'); if (show !== pill._s) { pill._s = show; pill.classList.toggle('vis', show); }
    var py = S.vh * .93, a = M.c3.top - S.sy, b = M.c7.top - S.sy, lt = (a < py - 20 && a + M.c3.h > py) || (b < py - 20 && b + M.c7.h > py);
    if (lt !== pill._l) { pill._l = lt; pill.classList.toggle('lt', lt); }
    var st = 'st-dark';
    if (S.sy > M.c2.top + (M.c2.h - S.vh) * .42) st = 'st-blue';
    if (S.sy > M.c4.top + (M.c4.h - S.vh) * .9) st = 'st-smoke';
    if (S.sy > M.c7.top) st = 'st-glow';
    if (st !== bgState) { bgEl.classList.remove(bgState); bgEl.classList.add(st); bgState = st; }
  }
  var cur = $('#cur'), curI = { x: S.mx, y: S.my, st: '', txt: '' };
  function setCur(st, txt) { if (st === curI.st && txt === curI.txt) return; curI.st = st; curI.txt = txt; cur.className = st; $('b', cur).textContent = txt || ''; }
  var CURT = { card: 'Ver case', drag: '↔', ball: '' };
  if (FINE) {
    doc.addEventListener('mousemove', function (e) { S.mx = e.clientX; S.my = e.clientY; S.moved = performance.now(); }, { passive: true });
    doc.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cur]') : null;
      if (t) { var k = t.dataset.cur; if (k === 'ball' && c6.hov) return; setCur(k, CURT[k]); }
      else if (e.target.closest && e.target.closest('a,button,input')) setCur('link', '');
      else setCur('', '');
    });
    doc.addEventListener('mousemove', function (e) {
      var t = e.target.closest ? e.target.closest('.mag') : null;
      if (t) { var r = t.getBoundingClientRect(); t.style.transition = 'transform .15s'; t.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .32).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + 'px)'; t._m = 1; }
    }, { passive: true });
    doc.addEventListener('mouseout', function (e) { var t = e.target.closest ? e.target.closest('.mag') : null; if (t && t._m && !t.contains(e.relatedTarget)) { t._m = 0; t.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)'; t.style.transform = ''; } });
  } else {
    doc.addEventListener('touchstart', function (e) { var t = e.touches[0]; S.mx = t.clientX; S.my = t.clientY; }, { passive: true });
  }

  /* ---------- página de case ---------- */
  var caseEl = $('#case'), caseScroll = $('#css'), caseOpen = false;
  function openCase(id) {
    var c = CASE[id]; if (!c) return;
    var nx = D.cases[(c.i + 1) % D.cases.length], h = '';
    h += '<div class="cs-h">' + (c.logo ? '<img' + (c.ld ? ' class="dk"' : '') + ' src="' + c.logo + '" alt="' + esc(c.client) + '">' : '') + '<span>' + esc(c.client) + (c.area ? ' · ' + esc(c.area) : '') + '</span></div>';
    h += '<h2 class="cs-t serif">' + esc(c.title) + '</h2>';
    h += '<div class="cs-meta">' + (c.aw || []).map(function (a) { return '<em class="' + MED[a.m] + '">' + MEDN[a.m] + ' · ' + esc(a.b) + (a.c ? ' · ' + esc(a.c) : '') + '</em>'; }).join('') + (c.tags || []).map(function (t) { return '<em>' + esc(t) + '</em>'; }).join('') + '</div>';
    if (c.desc) h += '<p class="cs-d">' + esc(c.desc) + '</p>';
    if (c.films) {
      var f = c.films[0];
      h += '<div class="cs-film' + (f.vert ? ' vert' : '') + '"><video controls playsinline preload="metadata" poster="' + c.img + '" src="' + f.src + '"></video></div>';
      if (c.films.length > 1) h += '<div class="cs-tabs">' + c.films.map(function (x, i) { return '<button class="chip' + (i ? '' : ' act') + '" data-film="' + i + '">' + esc(x.label) + '</button>'; }).join('') + '</div>';
    } else h += '<div class="cs-film"><img src="' + c.img + '" alt="' + esc(c.title) + '"></div>';
    if (c.nums && c.nums.length) h += '<div class="cs-nums">' + c.nums.map(function (n) { return '<div><b>' + esc(n[0]) + '</b><span>' + esc(n[1]) + '</span></div>'; }).join('') + '</div>';
    (c.story || []).forEach(function (s) { h += '<div class="cs-st"><small>' + esc(s.k) + '</small><div>' + (s.t ? '<h4>' + esc(s.t) + '</h4>' : '') + '<p>' + esc(s.p) + '</p></div></div>'; });
    if (c.quote) h += '<blockquote class="cs-q">“' + esc(c.quote[0]) + '”<cite>' + esc(c.quote[1]) + '</cite></blockquote>';
    if (c.gal && c.gal.length) h += '<div class="cs-gal">' + c.gal.map(function (g) { return '<img src="' + g + '" alt="" loading="lazy">'; }).join('') + '</div>';
    h += '<div class="cs-next" data-case="' + nx.id + '" data-cur="card"><div><small>Próximo case · ' + esc(nx.client) + '</small><b>' + esc(nx.title) + '</b></div><span>→</span></div>';
    caseScroll.innerHTML = h; caseScroll.scrollTop = 0; caseScroll._c = c;
    var g = $('.cs-gal', caseScroll);
    if (g) { var dn = false, sx = 0, sl = 0; g.addEventListener('pointerdown', function (e) { dn = true; sx = e.clientX; sl = g.scrollLeft; }); g.addEventListener('pointermove', function (e) { if (dn) g.scrollLeft = sl - (e.clientX - sx); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { g.addEventListener(n, function () { dn = false; }); }); }
    if (!caseOpen) { caseOpen = true; caseEl.classList.add('open'); caseEl.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); body.classList.add('lock'); }
    setCur('', '');
  }
  function closeCase() {
    if (!caseOpen) return; caseOpen = false; caseEl.classList.remove('open'); caseEl.setAttribute('aria-hidden', 'true');
    var v = $('video', caseScroll); if (v) v.pause();
    if (lenis) lenis.start(); body.classList.remove('lock');
    setTimeout(function () { if (!caseOpen) caseScroll.innerHTML = ''; }, 900);
  }
  $('#csx').addEventListener('click', closeCase); $('#case .bk').addEventListener('click', closeCase);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCase(); });
  caseScroll.addEventListener('click', function (e) {
    var b = e.target.closest('[data-film]'); if (!b) return;
    var c = caseScroll._c, f = c.films[+b.dataset.film], box = $('.cs-film', caseScroll), v = $('video', box);
    $$('[data-film]', caseScroll).forEach(function (x) { x.classList.toggle('act', x === b); });
    box.classList.toggle('vert', !!f.vert); v.pause(); v.src = f.src; v.load();
  });
  doc.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); closeCase(); scrollToY(go.dataset.go === 'top' ? 0 : M.docH); return; }
    var t = e.target.closest('[data-case]'); if (t) { e.preventDefault(); openCase(t.dataset.case); }
  });

  /* ---------- medidas ---------- */
  function measure() {
    S.vw = innerWidth; S.vh = innerHeight; S.mob = S.vw <= 760;
    ['c2', 'c3', 'c4', 'c5', 'c6', 'c7'].forEach(function (id) { var e = doc.getElementById(id); M[id] = { top: e.offsetTop, h: e.offsetHeight }; });
    M.rowsTop = rowsEl.offsetTop; M.rowOff = rows.map(function (r) { return r.el.offsetTop; }); M.rowH = rows.length ? rows[0].el.offsetHeight : 100;
    M.c7heads = c7.heads.map(function (h) { var t = 0, e = h; while (e && e !== sheet7) { t += e.offsetTop; e = e.offsetParent; } return t; });
    M.docH = Math.max(body.scrollHeight, html.scrollHeight);
  }
  var rz; addEventListener('resize', function () {
    clearTimeout(rz); rz = setTimeout(function () {
      var wasMob = S.mob; measure(); ringSize(); fitHero(); c5resize(); c5fit(); if (c6.st > 0) { c6.st = 0; }
      if (wasMob !== S.mob) { buildRing(); buildC7(); measure(); }
      if (c2.idx >= 0) c2num(c2.idx);
    }, 160);
  });

  /* ---------- revelações ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px -18% 0px' });
    $$('[data-rev]').forEach(function (e) { io.observe(e); });
  } else $$('[data-rev]').forEach(function (e) { e.classList.add('on'); });

  /* ---------- início ---------- */
  buildRing(); buildRows(); buildC4(); buildC5(); buildC6(); buildC7();
  measure(); ringSize(); fitHero(); tileNext();
  var ck = $('#phclock'); function clock() { var d = new Date(); ck.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); } clock(); setInterval(clock, 20000);
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  if (V.Lenis && !RM) { try { lenis = new V.Lenis({ lerp: .11, wheelMultiplier: 1, smoothWheel: true }); lenis.stop(); } catch (e) { lenis = null; } }
  loader(function () {
    body.classList.remove('intro', 'lock'); heroT.classList.add('on'); ring.go = true; if (lenis) lenis.start();
    setTimeout(measure, 400);
  });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitHero(); measure(); c5fit(); });
  addEventListener('load', function () { measure(); });

  function frame(now) {
    S.dt = Math.min(50, now - S.last); S.last = now; S.t = now / 1000;
    if (lenis) lenis.raf(now);
    S.sy = window.scrollY || html.scrollTop || 0;
    S.nx = lerp(S.nx, (S.mx / S.vw - .5) * 2, .06); S.ny = lerp(S.ny, (S.my / S.vh - .5) * 2, .06);
    if (FINE) { curI.x = lerp(curI.x, S.mx, .24); curI.y = lerp(curI.y, S.my, .24); cur.style.transform = 'translate3d(' + curI.x.toFixed(1) + 'px,' + curI.y.toFixed(1) + 'px,0)'; }
    ringUpdate(); c2update(); c3update(); c4update(); c5update(); c6update(); c7update(); chrome();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__mf = { S: S, M: M, openCase: openCase, closeCase: closeCase, c5: c5, c6: c6 };
})();
