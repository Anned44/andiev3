if (window.__andyAppearanceBooted) {
  console.warn('appearance.js ya estaba cargado');
} else {
window.__andyAppearanceBooted = true;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APPEARANCE.JS — Andy.net v4
   Estado global · aplica a todas las páginas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GFONTS_KEY  = 'AIzaSyAvnT97F7A73UBhB3OYClMs6RyjUpHbrAY';
const STORAGE_KEY = 'andynet_appearance_v5';

/* ── Defaults ── */
const FONT_DEFAULTS = {
  display: { name: 'DM Serif Display',  css: "'DM Serif Display', Georgia, serif" },
  quote:   { name: 'Cormorant Garamond',css: "'Cormorant Garamond', Georgia, serif" },
  body:    { name: 'Inter',             css: "'Inter', system-ui, sans-serif" },
  mono:    { name: 'IBM Plex Mono',     css: "'IBM Plex Mono', monospace" }
};

const ROLE_META = {
  display: { label: 'Display · activo',  sample: 'Andrea',               desc: 'títulos principales' },
  quote:   { label: 'Quote · activo',    sample: '"así pasa la vida"',   desc: 'citas · subtítulos' },
  body:    { label: 'Body · activo',     sample: 'Texto de la interfaz', desc: 'texto corrido' },
  mono:    { label: 'Mono · activo',     sample: '08:42 · UI · data',    desc: 'datos · interfaz' }
};

const DEFAULT_STATE = () => ({
  theme:       'nocturne',
  bgType:      'color',
  bgValue:     '#0c0a12',
  bgOpacity:   70,
  bgBlur:      0,
  effect:      'none',
  fxIntensity: 50,
  fxSpeed:     'slow',
  surface:     'glass',
  fonts: {
    display: { ...FONT_DEFAULTS.display },
    quote:   { ...FONT_DEFAULTS.quote },
    body:    { ...FONT_DEFAULTS.body },
    mono:    { ...FONT_DEFAULTS.mono }
  }
});

const THEMES = {
  nocturne: {
    '--bg':'#0c0a12','--s1':'#120f1a','--s2':'#1a1625','--s3':'#241e30','--s4':'#2d253b',
    '--border':'rgba(180,140,220,0.08)','--bord2':'rgba(180,140,220,0.18)','--bord3':'rgba(180,140,220,0.30)',
    '--text':'#d4cfe0','--text2':'#ede5f5','--muted':'#5a4f70','--muted2':'#8a7a9a','--muted3':'#9a8aaa',
    '--hub':'#5a7aaa','--studio':'#c8965a','--muse':'#9b7ab8','--self':'#f4a7b9'
  },
  soleil: {
    '--bg':'#f5f0e8','--s1':'#ede8df','--s2':'#e4ddd3','--s3':'#d9d1c4','--s4':'#cec5b6',
    '--border':'rgba(192,180,204,0.35)','--bord2':'rgba(192,180,204,0.6)','--bord3':'rgba(192,180,204,0.85)',
    '--text':'#3a3430','--text2':'#1e1a16','--muted':'#9a8f80','--muted2':'#7a6f62','--muted3':'#6a5f54',
    '--hub':'#4f85e8','--studio':'#c0a050','--muse':'#9b7ab8','--self':'#e8a0a8'
  },
  botanical: {
    '--bg':'#0a120d','--s1':'#0f1a12','--s2':'#162018','--s3':'#1e2d20','--s4':'#263828',
    '--border':'rgba(100,180,120,0.10)','--bord2':'rgba(100,180,120,0.20)','--bord3':'rgba(100,180,120,0.35)',
    '--text':'#c8d8c0','--text2':'#e0f0d8','--muted':'#4a6a50','--muted2':'#6a8a70','--muted3':'#8aaa88',
    '--hub':'#5a9a70','--studio':'#a8b860','--muse':'#7a9ab8','--self':'#d8a8b0'
  },
  ambar: {
    '--bg':'#120a06','--s1':'#1a1008','--s2':'#22160a','--s3':'#2e1e0e','--s4':'#3a2814',
    '--border':'rgba(220,160,80,0.10)','--bord2':'rgba(220,160,80,0.20)','--bord3':'rgba(220,160,80,0.35)',
    '--text':'#e0d0b8','--text2':'#f0e0c8','--muted':'#6a5030','--muted2':'#9a7848','--muted3':'#baa068',
    '--hub':'#9a8860','--studio':'#d4a050','--muse':'#b07888','--self':'#e8b090'
  },
  editorial: {
    '--bg':'#f0eeec','--s1':'#e8e5e0','--s2':'#dedad4','--s3':'#d0ccc4','--s4':'#c4beb6',
    '--border':'rgba(80,70,60,0.12)','--bord2':'rgba(80,70,60,0.22)','--bord3':'rgba(80,70,60,0.38)',
    '--text':'#2a2420','--text2':'#100c08','--muted':'#8a8078','--muted2':'#6a6058','--muted3':'#4a4038',
    '--hub':'#4060b0','--studio':'#906820','--muse':'#7050a0','--self':'#b04060'
  }
};

/* ── State ── */
let S = DEFAULT_STATE();
let _undoStack = [];
let _toastTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) S = { ...DEFAULT_STATE(), ...saved, fonts: { ...DEFAULT_STATE().fonts, ...(saved.fonts || {}) } };
  } catch(e) {}
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch(e) {}
}

function pushUndo() {
  _undoStack.push(JSON.parse(JSON.stringify(S)));
  if (_undoStack.length > 40) _undoStack.shift();
}

function commit(fn) {
  pushUndo();
  fn(S);
  applyAll();
  syncPanel();
  saveState();
  sendToPreview();
}

function undo() {
  if (!_undoStack.length) { toast('Nada que deshacer'); return; }
  S = _undoStack.pop();
  applyAll();
  syncPanel();
  saveState();
  sendToPreview();
  toast('Deshecho');
}

function reset() {
  pushUndo();
  S = DEFAULT_STATE();
  applyAll();
  syncPanel();
  saveState();
  sendToPreview();
  toast('Reset aplicado');
}

/* ── Toast ── */
function toast(msg) {
  const el = document.getElementById('andy-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ── Apply functions ── */
function applyTheme(id) {
  const t = THEMES[id];
  if (!t) return;
  Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

const _loadedFonts = new Set();
function loadGFont(name) {
  if (!name || _loadedFonts.has(name)) return;
  _loadedFonts.add(name);
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g,'+')}:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap`;
  document.head.appendChild(l);
}

function applyFonts(fonts) {
  const r = document.documentElement;
  const f = fonts || S.fonts;
  if (f.display?.css) { r.style.setProperty('--font-display', f.display.css); r.style.setProperty('--serif', f.display.css); loadGFont(f.display.name); }
  if (f.quote?.css)   { r.style.setProperty('--font-quote', f.quote.css);   r.style.setProperty('--font-subtitle', f.quote.css); loadGFont(f.quote.name); }
  if (f.body?.css)    { r.style.setProperty('--font-body', f.body.css);     r.style.setProperty('--sans', f.body.css); loadGFont(f.body.name); }
  if (f.mono?.css)    { r.style.setProperty('--font-mono', f.mono.css);     r.style.setProperty('--mono', f.mono.css); loadGFont(f.mono.name); }
  applyQuoteSelectors();
}

function applyQuoteSelectors() {
  const q = getComputedStyle(document.documentElement).getPropertyValue('--font-quote').trim();
  if (!q) return;
  document.querySelectorAll('blockquote,.quote,.hero-quote,.quote-text,.manifesto-line,[data-quote],#heroQuote,.hero-eyebrow,.welcome-quote,.sdash-frase').forEach(el => {
    el.style.fontFamily = q;
  });
}

function applyBackground() {
  // Clear
  document.body.style.backgroundImage = '';
  document.body.style.backgroundColor = '';
  document.body.style.backgroundAttachment = '';
  const old = document.getElementById('andy-bg-layer');
  if (old) old.remove();

  if (S.bgType === 'color') {
    document.body.style.backgroundColor = S.bgValue || '#0c0a12';
  } else if (S.bgType === 'gradient') {
    document.body.style.backgroundImage = S.bgValue;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundColor = '#0c0a12';
  } else if (S.bgType === 'photo' && S.bgValue) {
    document.body.style.backgroundColor = '#0c0a12';
    const l = document.createElement('div');
    l.id = 'andy-bg-layer';
    l.style.cssText = `position:fixed;inset:0;z-index:-1;pointer-events:none;background:url(${S.bgValue}) center/cover;opacity:${(S.bgOpacity||70)/100};filter:blur(${S.bgBlur||0}px);`;
    document.body.prepend(l);
  }
}

function applySurface() {
  document.documentElement.setAttribute('data-surface', S.surface || 'glass');
}

function applyEffects() {
  const old = document.getElementById('andy-fx-layer');
  if (old) old.remove();
  if (S.effect === 'none') return;

  const layer = document.createElement('div');
  layer.id = 'andy-fx-layer';
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.appendChild(layer);

  const intensity = Math.max(0, Math.min(100, Number(S.fxIntensity ?? 50)));
  const dur = S.fxSpeed === 'fast' ? '8s' : S.fxSpeed === 'medium' ? '14s' : '22s';
  const a = (0.08 + (intensity / 100) * 0.26).toFixed(3);

  const kf = document.getElementById('andy-fx-kf');
  if (!kf) {
    const s = document.createElement('style');
    s.id = 'andy-fx-kf';
    s.textContent = `
      @keyframes fxFloat{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-16px) scale(1.04)}}
      @keyframes fxDrift{0%{transform:translate(0,0)}100%{transform:translate(18px,-12px)}}
      @keyframes fxAurora{0%{transform:translateX(-2%) scale(1)}100%{transform:translateX(2%) scale(1.06)}}
      @keyframes fxMist{0%{transform:translateX(-1%);opacity:.75}100%{transform:translateX(2%);opacity:1}}
    `;
    document.head.appendChild(s);
  }

  const effects = {
    bubbles: `<div style="position:absolute;inset:0;background:radial-gradient(circle at 18% 25%,rgba(255,255,255,${a}) 0 2%,transparent 8%),radial-gradient(circle at 72% 28%,rgba(155,122,184,${a}) 0 3%,transparent 10%),radial-gradient(circle at 58% 70%,rgba(90,122,170,${a}) 0 2.5%,transparent 9%);filter:blur(${8+intensity*.12}px);animation:fxFloat ${dur} ease-in-out infinite alternate"></div>`,
    constellation: `<div style="position:absolute;inset:0;opacity:${.35+intensity/220};background-image:radial-gradient(rgba(255,255,255,.9) 1px,transparent 1.5px),radial-gradient(rgba(155,122,184,.75) 1px,transparent 1.5px);background-size:120px 120px,180px 180px;background-position:20px 30px,70px 100px;animation:fxDrift ${dur} linear infinite"></div>`,
    aurora: `<div style="position:absolute;inset:-10%;background:radial-gradient(circle at 20% 30%,rgba(124,92,255,${a}) 0,transparent 35%),radial-gradient(circle at 70% 25%,rgba(79,195,247,${a}) 0,transparent 38%),radial-gradient(circle at 52% 80%,rgba(123,228,149,${a}) 0,transparent 42%);filter:blur(${18+intensity*.18}px);animation:fxAurora ${dur} ease-in-out infinite alternate"></div>`,
    particles: `<div style="position:absolute;inset:0;opacity:${.18+intensity/180};background-image:radial-gradient(rgba(255,220,160,.9) 1px,transparent 1.5px);background-size:${22-Math.min(10,intensity/10|0)}px ${22-Math.min(10,intensity/10|0)}px;animation:fxDrift ${dur} linear infinite"></div>`,
    mist: `<div style="position:absolute;inset:-10%;background:radial-gradient(circle at 30% 40%,rgba(255,255,255,${(a*.6).toFixed(3)}) 0,transparent 35%),radial-gradient(circle at 70% 50%,rgba(155,122,184,${a}) 0,transparent 35%);filter:blur(${24+intensity*.22}px);animation:fxMist ${dur} ease-in-out infinite alternate"></div>`
  };

  if (effects[S.effect]) layer.innerHTML = effects[S.effect];
}

function applyAll() {
  applyTheme(S.theme);
  applyBackground();
  applyEffects();
  applyFonts();
  applySurface();
}

/* ── Preview iframe ── */
let _iframe = null;
let _expanded = false;

function getPreviewUrl() {
  const p = location.pathname.split('/').pop();
  if (p === 'hub.html') return 'hub.html';
  if (p === 'studio.html') return 'studio.html';
  if (p === 'muse.html') return 'muse.html';
  return 'index.html';
}

function sendToPreview() {
  if (!_expanded || !_iframe?.contentWindow) return;
  try {
    _iframe.contentWindow.postMessage({ type: 'andy-appearance', state: JSON.parse(JSON.stringify(S)) }, '*');
  } catch(e) {}
}

window.addEventListener('message', e => {
  if (e.data?.type !== 'andy-appearance') return;
  S = e.data.state;
  applyAll();
});

function toggleExpand() {
  _expanded = !_expanded;
  const overlay = document.getElementById('andy-appearance-panel');
  const btn = document.getElementById('ap-expand-btn');
  const pane = document.getElementById('ap-preview-pane');

  if (_expanded) {
    overlay?.classList.add('ap-fullscreen');
    if (btn) btn.textContent = '←';
    if (pane) {
      pane.style.display = 'flex';
      // Init iframe
      if (!_iframe) {
        _iframe = document.createElement('iframe');
        _iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:12px;';
        _iframe.src = getPreviewUrl();
        _iframe.onload = () => sendToPreview();
        const wrap = document.getElementById('ap-preview-iframe-wrap');
        if (wrap) { wrap.innerHTML = ''; wrap.appendChild(_iframe); }
      } else {
        sendToPreview();
      }
    }
  } else {
    overlay?.classList.remove('ap-fullscreen');
    if (btn) btn.textContent = '⤢';
    if (pane) pane.style.display = 'none';
  }
}

/* ── Font grid ── */
let _allFonts = [];
let _fontsReady = false;
let _activeFontType = 'display';
let _searchTimer = null;
let _gradDir = '135deg';

async function fetchAllFonts() {
  if (_fontsReady) return _allFonts;
  try {
    const r = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GFONTS_KEY}&sort=popularity`);
    _allFonts = (await r.json()).items || [];
    _fontsReady = true;
  } catch(e) { console.warn('GFonts error:', e); }
  return _allFonts;
}

async function loadFontGrid(query = '', cat = 'all') {
  const grid = document.getElementById('ap-font-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="ap-font-loading">Cargando Google Fonts...</div>';
  const all = await fetchAllFonts();
  const q = query.toLowerCase();
  const filtered = all.filter(f =>
    (!q || f.family.toLowerCase().includes(q)) &&
    (cat === 'all' || f.category === cat)
  ).slice(0, 80);

  if (!filtered.length) { grid.innerHTML = '<div class="ap-font-loading">Sin resultados</div>'; return; }

  const current = S.fonts[_activeFontType]?.name;
  const isItalic = _activeFontType === 'display' || _activeFontType === 'quote';
  const sampleWord = ROLE_META[_activeFontType].sample.split(' ')[0];

  grid.innerHTML = '';
  filtered.forEach(f => {
    loadGFont(f.family);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'ap-font-row' + (f.family === current ? ' active' : '');
    row.innerHTML = `
      <span class="ap-font-row-sample" style="font-family:'${f.family}',serif;font-style:${isItalic?'italic':'normal'}">${sampleWord}</span>
      <div class="ap-font-row-info">
        <span class="ap-font-row-name">${f.family}</span>
        <span class="ap-font-row-cat">${f.category}</span>
      </div>
      <div class="ap-font-row-dot"></div>`;
    row.onclick = () => selectFont(f.family, f.category);
    grid.appendChild(row);
  });
}

function selectFont(family, category) {
  const fallback = category === 'monospace' ? 'monospace'
    : (category === 'serif' || category === 'display' || category === 'handwriting') ? 'Georgia, serif'
    : 'system-ui, sans-serif';
  const css = `'${family}', ${fallback}`;

  commit(s => { s.fonts[_activeFontType] = { name: family, css }; });
  updatePreviewBox(family, css);
  loadFontGrid(document.getElementById('ap-font-search')?.value || '', document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all');
}

function updatePreviewBox(name, css) {
  const role = ROLE_META[_activeFontType];
  const f = S.fonts[_activeFontType];
  const isItalic = _activeFontType === 'display' || _activeFontType === 'quote';

  const el = document.getElementById('ap-preview-role-label');
  const pt = document.getElementById('ap-font-preview-text');
  const pm = document.getElementById('ap-font-preview-meta');

  if (el) el.textContent = role.label;
  if (pt) {
    pt.textContent = role.sample;
    pt.style.fontFamily = css || f?.css || 'serif';
    pt.style.fontStyle = isItalic ? 'italic' : 'normal';
  }
  if (pm) pm.textContent = `${name || f?.name} · ${role.desc}`;
}

/* ── Gradient ── */
function buildGradient() {
  const c1 = document.getElementById('ap-grad-1')?.value || '#1e1428';
  const c2 = document.getElementById('ap-grad-2')?.value || '#2d1b4e';
  const c3 = document.getElementById('ap-grad-3')?.value || '#0c0a12';
  return _gradDir === 'radial'
    ? `radial-gradient(circle at center,${c1} 0%,${c2} 52%,${c3} 100%)`
    : `linear-gradient(${_gradDir},${c1} 0%,${c2} 52%,${c3} 100%)`;
}

function updateGradPreview() {
  const p = document.getElementById('ap-grad-preview');
  if (p) p.style.background = buildGradient();
}

/* ── Sync panel UI to state ── */
function syncPanel() {
  // Role pills
  document.querySelectorAll('.ap-role-pill').forEach(b => b.classList.toggle('active', b.dataset.type === _activeFontType));
  updatePreviewBox();

  // Background
  document.querySelectorAll('.ap-bg-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === S.bgType));
  document.querySelectorAll('.ap-bg-panel').forEach(p => p.classList.toggle('active', p.dataset.type === S.bgType));
  const pk = document.getElementById('ap-color-picker');
  if (pk && S.bgType === 'color') { pk.value = S.bgValue || '#0c0a12'; updateColorSwatch(pk.value); }

  // Effects
  document.querySelectorAll('.ap-fx-card').forEach(c => c.classList.toggle('active', c.dataset.effect === S.effect));
  const fi = document.getElementById('ap-fx-intensity');
  const fiv = document.getElementById('ap-fx-intensity-val');
  const fs = document.getElementById('ap-fx-speed');
  if (fi) fi.value = S.fxIntensity ?? 50;
  if (fiv) fiv.textContent = S.fxIntensity ?? 50;
  if (fs) fs.value = S.fxSpeed || 'slow';

  // Theme
  document.querySelectorAll('.ap-theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === S.theme));

  // Surface
  document.querySelectorAll('.ap-surface-card').forEach(c => c.classList.toggle('active', c.dataset.surface === S.surface));
}

function updateColorSwatch(hex) {
  const sw = document.getElementById('ap-color-swatch');
  const tx = document.getElementById('ap-color-hex');
  if (sw) sw.style.background = hex;
  if (tx) tx.textContent = hex;
}

/* ── Photo upload ── */
function handlePhoto(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    commit(s => {
      s.bgType = 'photo';
      s.bgValue = e.target.result;
      s.bgOpacity = parseInt(document.getElementById('ap-photo-opacity')?.value || 70);
      s.bgBlur = parseInt(document.getElementById('ap-photo-blur')?.value || 0);
    });
    const thumb = document.getElementById('ap-photo-thumb');
    if (thumb) { thumb.src = e.target.result; thumb.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

/* ── Panel open/close ── */
function openPanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;
  panel.removeAttribute('inert');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  syncPanel();
  loadFontGrid('', 'all');
}

function closePanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;
  if (document.activeElement && panel.contains(document.activeElement)) document.activeElement.blur();
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('inert', '');
}

/* ── Build panel (called after HTML inject) ── */
function buildPanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;
  panel.removeAttribute('inert');

  // Close on overlay click
  panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });

  // Main tabs
  panel.querySelectorAll('.ap-main-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-main-tab').forEach(b => b.classList.remove('active'));
      panel.querySelectorAll('.ap-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelector(`.ap-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
    };
  });

  // Role pills
  panel.querySelectorAll('.ap-role-pill').forEach(btn => {
    btn.onclick = () => {
      _activeFontType = btn.dataset.type;
      syncPanel();
      loadFontGrid(document.getElementById('ap-font-search')?.value || '', document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all');
    };
  });

  // Font search
  document.getElementById('ap-font-search')?.addEventListener('input', function() {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => loadFontGrid(this.value, document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'), 280);
  });

  // Filter chips
  panel.querySelectorAll('.ap-filter-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadFontGrid(document.getElementById('ap-font-search')?.value || '', btn.dataset.cat);
    };
  });

  // Background type
  panel.querySelectorAll('.ap-bg-type-btn').forEach(btn => {
    btn.onclick = () => commit(s => { s.bgType = btn.dataset.type; });
  });

  // Color picker
  document.getElementById('ap-color-picker')?.addEventListener('input', function() {
    updateColorSwatch(this.value);
    commit(s => { s.bgType = 'color'; s.bgValue = this.value; });
  });

  // Gradient
  ['ap-grad-1','ap-grad-2','ap-grad-3'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateGradPreview);
  });
  panel.querySelectorAll('.ap-grad-dir-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-grad-dir-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _gradDir = btn.dataset.dir;
      updateGradPreview();
    };
  });
  document.getElementById('ap-grad-apply')?.addEventListener('click', () => {
    commit(s => { s.bgType = 'gradient'; s.bgValue = buildGradient(); });
  });

  // Photo
  const zone = document.getElementById('ap-photo-zone');
  const inp  = document.getElementById('ap-photo-input');
  if (zone && inp) {
    zone.onclick = () => inp.click();
    zone.ondragover = e => { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = () => zone.classList.remove('drag');
    zone.ondrop = e => { e.preventDefault(); zone.classList.remove('drag'); handlePhoto(e.dataTransfer.files[0]); };
    inp.onchange = () => handlePhoto(inp.files[0]);
  }
  document.getElementById('ap-photo-opacity')?.addEventListener('input', function() {
    document.getElementById('ap-opacity-val').textContent = this.value;
    commit(s => { s.bgOpacity = +this.value; });
  });
  document.getElementById('ap-photo-blur')?.addEventListener('input', function() {
    document.getElementById('ap-blur-val').textContent = this.value + 'px';
    commit(s => { s.bgBlur = +this.value; });
  });

  // Effects
  panel.querySelectorAll('.ap-fx-card').forEach(card => {
    card.onclick = () => commit(s => { s.effect = card.dataset.effect; });
  });
  document.getElementById('ap-fx-intensity')?.addEventListener('input', function() {
    document.getElementById('ap-fx-intensity-val').textContent = this.value;
    commit(s => { s.fxIntensity = +this.value; });
  });
  document.getElementById('ap-fx-speed')?.addEventListener('change', function() {
    commit(s => { s.fxSpeed = this.value; });
  });

  // Surface
  panel.querySelectorAll('.ap-surface-card').forEach(card => {
    card.onclick = () => commit(s => { s.surface = card.dataset.surface; });
  });

  // Theme
  panel.querySelectorAll('.ap-theme-card').forEach(card => {
    card.onclick = () => commit(s => { s.theme = card.dataset.theme; });
  });

  // Expand
  document.getElementById('ap-expand-btn')?.addEventListener('click', toggleExpand);

  updateGradPreview();
  syncPanel();
}

function bindFooterActions() {
  document.getElementById('ap-save-btn')?.addEventListener('click', () => { saveState(); toast('Cambios guardados'); });
  document.getElementById('ap-reset-btn')?.addEventListener('click', reset);
  document.getElementById('ap-undo-btn')?.addEventListener('click', undo);
  document.getElementById('ap-close-corner')?.addEventListener('click', closePanel);
}

/* ── Expose globals ── */
window.buildPanel       = buildPanel;
window.bindFooterActions = bindFooterActions;
window.loadFontGrid     = loadFontGrid;
window.openPanel        = openPanel;
window.closePanel       = closePanel;

/* ── Init on load ── */
window.addEventListener('load', () => {
  loadState();
  applyAll();
  applyQuoteSelectors();
  document.querySelectorAll('[data-open-appearance], #settingsBtn, .settings-btn').forEach(btn => {
    btn.addEventListener('click', openPanel);
  });
});

} // end __andyAppearanceBooted
