if (window.__andyAppearanceBooted) {
  console.warn('appearance.js ya estaba cargado');
} else {
  window.__andyAppearanceBooted = true;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APPEARANCE.JS — Andy.net v4
   Global · 4 roles tipográficos
   Roles: display / quote / body / mono
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GFONTS_KEY = 'AIzaSyAvnT97F7A73UBhB3OYClMs6RyjUpHbrAY';
const STORAGE_KEY = 'andynet_v4_appearance';

const PAGE_ID = (() => {
  const p = location.pathname.split('/').pop().replace('.html', '');
  return ['hub', 'studio', 'muse'].includes(p) ? p : 'index';
})();

const FONT_DEFAULTS = {
  display: { name: 'DM Serif Display', css: "'DM Serif Display', Georgia, serif" },
  quote:   { name: 'Cormorant Garamond', css: "'Cormorant Garamond', Georgia, serif" },
  body:    { name: 'Inter', css: "'Inter', system-ui, sans-serif" },
  mono:    { name: 'IBM Plex Mono', css: "'IBM Plex Mono', monospace" }
};

// Samples por rol para el preview box
const ROLE_PREVIEW = {
  display: { label: 'Display · activo',     sample: 'Andrea',                  desc: 'títulos principales' },
  quote:   { label: 'Quote · activo',       sample: '"mientras se aplaza"',    desc: 'citas · subtítulos' },
  body:    { label: 'Body · activo',        sample: 'Texto de la interfaz',    desc: 'texto corrido · párrafos' },
  mono:    { label: 'Mono · activo',        sample: '08:42 · 01 · UI',         desc: 'datos · ui · código' }
};

const THEMES = {
  nocturne: {
    '--bg': '#0c0a12', '--s1': '#120f1a', '--s2': '#1a1625', '--s3': '#241e30', '--s4': '#2d253b',
    '--border': 'rgba(180,140,220,0.08)', '--bord2': 'rgba(180,140,220,0.18)', '--bord3': 'rgba(180,140,220,0.30)',
    '--text': '#d4cfe0', '--text2': '#ede5f5', '--muted': '#5a4f70', '--muted2': '#8a7a9a', '--muted3': '#9a8aaa',
    '--hub': '#5a7aaa', '--studio': '#c8965a', '--muse': '#9b7ab8', '--self': '#f4a7b9'
  },
  soleil: {
    '--bg': '#f5f0e8', '--s1': '#ede8df', '--s2': '#e4ddd3', '--s3': '#d9d1c4', '--s4': '#cec5b6',
    '--border': 'rgba(192,180,204,0.35)', '--bord2': 'rgba(192,180,204,0.6)', '--bord3': 'rgba(192,180,204,0.85)',
    '--text': '#3a3430', '--text2': '#1e1a16', '--muted': '#9a8f80', '--muted2': '#7a6f62', '--muted3': '#6a5f54',
    '--hub': '#4f85e8', '--studio': '#c0a050', '--muse': '#9b7ab8', '--self': '#e8a0a8'
  },
  botanical: {
    '--bg': '#0a120d', '--s1': '#0f1a12', '--s2': '#162018', '--s3': '#1e2d20', '--s4': '#263828',
    '--border': 'rgba(100,180,120,0.10)', '--bord2': 'rgba(100,180,120,0.20)', '--bord3': 'rgba(100,180,120,0.35)',
    '--text': '#c8d8c0', '--text2': '#e0f0d8', '--muted': '#4a6a50', '--muted2': '#6a8a70', '--muted3': '#8aaa88',
    '--hub': '#5a9a70', '--studio': '#a8b860', '--muse': '#7a9ab8', '--self': '#d8a8b0'
  },
  ambar: {
    '--bg': '#120a06', '--s1': '#1a1008', '--s2': '#22160a', '--s3': '#2e1e0e', '--s4': '#3a2814',
    '--border': 'rgba(220,160,80,0.10)', '--bord2': 'rgba(220,160,80,0.20)', '--bord3': 'rgba(220,160,80,0.35)',
    '--text': '#e0d0b8', '--text2': '#f0e0c8', '--muted': '#6a5030', '--muted2': '#9a7848', '--muted3': '#baa068',
    '--hub': '#9a8860', '--studio': '#d4a050', '--muse': '#b07888', '--self': '#e8b090'
  },
  editorial: {
    '--bg': '#f0eeec', '--s1': '#e8e5e0', '--s2': '#dedad4', '--s3': '#d0ccc4', '--s4': '#c4beb6',
    '--border': 'rgba(80,70,60,0.12)', '--bord2': 'rgba(80,70,60,0.22)', '--bord3': 'rgba(80,70,60,0.38)',
    '--text': '#2a2420', '--text2': '#100c08', '--muted': '#8a8078', '--muted2': '#6a6058', '--muted3': '#4a4038',
    '--hub': '#4060b0', '--studio': '#906820', '--muse': '#7050a0', '--self': '#b04060'
  }
};

const EFFECT_DEFAULTS = { effect: 'none', intensity: 50, speed: 'slow' };

window.__andyAppearanceState = window.__andyAppearanceState || {
  AppState: {}, undoStack: [], toastTimer: null
};

let AppState = window.__andyAppearanceState.AppState;
let _undoStack = window.__andyAppearanceState.undoStack;
const UNDO_LIMIT = 40;

function cloneState(obj) { return JSON.parse(JSON.stringify(obj)); }

function pushUndoState() {
  _undoStack.push(cloneState(AppState));
  if (_undoStack.length > UNDO_LIMIT) _undoStack.shift();
}

function showToast(message = 'Listo') {
  const toast = document.getElementById('andy-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__andyAppearanceState.toastTimer);
  window.__andyAppearanceState.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function makePageDefault(pageId) {
  return {
    theme: 'nocturne',
    bgType: 'color',
    bgValue: '#0c0a12',
    bgOpacity: 70,
    bgBlur: 0,
    effect: EFFECT_DEFAULTS.effect,
    fxIntensity: EFFECT_DEFAULTS.intensity,
    fxSpeed: EFFECT_DEFAULTS.speed,
    surface: 'glass',
    fonts: JSON.parse(JSON.stringify(FONT_DEFAULTS))
  };
}

function normalizeFonts(fonts = {}) {
  return {
    display: fonts.display || FONT_DEFAULTS.display,
    quote:   fonts.quote   || fonts.subtitle || FONT_DEFAULTS.quote,
    body:    fonts.body    || fonts.ui       || FONT_DEFAULTS.body,
    mono:    fonts.mono    || FONT_DEFAULTS.mono
  };
}

// Estado global único (no por página)
function getGS() {
  if (!AppState.global) AppState.global = makePageDefault('index');
  AppState.global.fonts = normalizeFonts(AppState.global.fonts);
  if (!AppState.global.effect) AppState.global.effect = EFFECT_DEFAULTS.effect;
  if (AppState.global.fxIntensity == null) AppState.global.fxIntensity = EFFECT_DEFAULTS.intensity;
  if (!AppState.global.fxSpeed) AppState.global.fxSpeed = EFFECT_DEFAULTS.speed;
  if (!AppState.global.surface) AppState.global.surface = 'glass';
  return AppState.global;
}

// Mantener compatibilidad con getPS para el resto del código
function getPS(pageId) { return getGS(); }

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState)); } catch (e) {}
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s) {
      AppState = s;
      // Migrar de formato por página a global si es necesario
      if (!AppState.global && AppState.index) {
        AppState.global = AppState.index;
      }
    }
  } catch (e) {}
}

function commitAppearanceChange(mutator) {
  pushUndoState();
  mutator(getGS());
  applyAll();
  syncPanel();
  saveState();
}

function undoAppearance() {
  if (!_undoStack.length) { showToast('Nada que deshacer'); return; }
  AppState = _undoStack.pop();
  applyAll();
  syncPanel();
  saveState();
  showToast('Último cambio deshecho');
}

function resetCurrentPageAppearance() {
  commitAppearanceChange(ps => Object.assign(ps, makePageDefault('index')));
  showToast('Reset aplicado');
}

function saveAppearance() { saveState(); showToast('Cambios guardados'); }

const _loadedFonts = new Set();

function loadGFont(name) {
  if (!name || _loadedFonts.has(name)) return;
  _loadedFonts.add(name);
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap`;
  document.head.appendChild(l);
}

let _allFonts = [];
let _fontsReady = false;

async function fetchFonts() {
  if (_fontsReady) return _allFonts;
  try {
    const r = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GFONTS_KEY}&sort=popularity`);
    _allFonts = (await r.json()).items || [];
    _fontsReady = true;
  } catch (e) { console.warn('GFonts:', e); }
  return _allFonts;
}

async function searchFonts(query, cat) {
  const all = await fetchFonts();
  return all.filter(f =>
    (!query || f.family.toLowerCase().includes(query.toLowerCase())) &&
    (!cat || cat === 'all' || f.category === cat)
  ).slice(0, 80);
}

function applyTheme(themeId) {
  const t = THEMES[themeId];
  if (!t) return;
  Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

function applyFonts(fonts) {
  if (!fonts) return;
  const f = normalizeFonts(fonts);
  const r = document.documentElement;
  if (f.display?.css) {
    r.style.setProperty('--font-display', f.display.css);
    r.style.setProperty('--serif', f.display.css);
    loadGFont(f.display.name);
  }
  if (f.quote?.css) {
    r.style.setProperty('--font-quote', f.quote.css);
    r.style.setProperty('--font-subtitle', f.quote.css);
    loadGFont(f.quote.name);
  }
  if (f.body?.css) {
    r.style.setProperty('--font-body', f.body.css);
    r.style.setProperty('--font-ui', f.body.css);
    r.style.setProperty('--sans', f.body.css);
    loadGFont(f.body.name);
  }
  if (f.mono?.css) {
    r.style.setProperty('--font-mono', f.mono.css);
    r.style.setProperty('--mono', f.mono.css);
    loadGFont(f.mono.name);
  }
  applyQuoteRole();
}

function applyQuoteRole(scope = document) {
  const quoteFont = getComputedStyle(document.documentElement).getPropertyValue('--font-quote').trim();
  if (!quoteFont) return;
  const selectors = ['blockquote','.quote','.hero-quote','.quote-text','.manifesto-line','[data-quote]','#heroQuote','.hero-eyebrow','.welcome-quote','.sdash-frase','.muse-dash-frase'];
  scope.querySelectorAll(selectors.join(',')).forEach(el => { el.style.fontFamily = quoteFont; });
}

function mkBgLayer() {
  let l = document.getElementById('andy-bg-layer');
  if (!l) {
    l = document.createElement('div');
    l.id = 'andy-bg-layer';
    l.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;';
    document.body.prepend(l);
  }
  return l;
}

function clearBackgroundLayers() {
  document.body.style.backgroundImage = '';
  document.body.style.backgroundColor = '';
  document.body.style.backgroundAttachment = '';
  const bg = document.getElementById('andy-bg-layer');
  if (bg) bg.remove();
  const fx = document.getElementById('andy-fx-layer');
  if (fx) fx.remove();
}

function applyBackground(ps) {
  clearBackgroundLayers();
  const body = document.body;
  if (ps.bgType === 'color') {
    body.style.backgroundColor = ps.bgValue || '#0c0a12';
  } else if (ps.bgType === 'gradient') {
    body.style.backgroundImage = ps.bgValue || 'linear-gradient(135deg,#1e1428 0%,#2d1b4e 50%,#0c0a12 100%)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundColor = '#0c0a12';
  } else if (ps.bgType === 'photo') {
    body.style.backgroundColor = '#0c0a12';
    const l = mkBgLayer();
    l.style.backgroundImage = `url(${ps.bgValue})`;
    l.style.backgroundSize = 'cover';
    l.style.backgroundPosition = 'center';
    l.style.opacity = (ps.bgOpacity || 70) / 100;
    l.style.filter = `blur(${ps.bgBlur || 0}px)`;
  }
}

function applySurface(surfaceId) {
  document.documentElement.removeAttribute('data-surface');
  document.documentElement.setAttribute('data-surface', surfaceId && surfaceId !== 'glass' ? surfaceId : 'glass');
}

function ensureFxLayer() {
  let fx = document.getElementById('andy-fx-layer');
  if (!fx) {
    fx = document.createElement('div');
    fx.id = 'andy-fx-layer';
    fx.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden;';
    document.body.appendChild(fx);
  }
  return fx;
}

function ensureFxKeyframes() {
  if (document.getElementById('andy-fx-keyframes')) return;
  const s = document.createElement('style');
  s.id = 'andy-fx-keyframes';
  s.textContent = `
    @keyframes andyFxFloat { 0%{transform:translateY(0) translateX(0) scale(1);} 100%{transform:translateY(-16px) translateX(10px) scale(1.04);} }
    @keyframes andyFxDrift { 0%{transform:translate3d(0,0,0);} 100%{transform:translate3d(18px,-12px,0);} }
    @keyframes andyFxAurora { 0%{transform:translateX(-2%) translateY(0) scale(1);} 100%{transform:translateX(2%) translateY(-2%) scale(1.06);} }
    @keyframes andyFxMist { 0%{transform:translateX(-1%) translateY(0) scale(1);opacity:.75;} 100%{transform:translateX(2%) translateY(-1%) scale(1.06);opacity:1;} }
  `;
  document.head.appendChild(s);
}

function applyEffects(ps) {
  const fx = document.getElementById('andy-fx-layer');
  if (fx) fx.remove();
  const effect = ps.effect || 'none';
  if (effect === 'none') return;
  const layer = ensureFxLayer();
  const intensity = Math.max(0, Math.min(100, Number(ps.fxIntensity ?? 50)));
  const speed = ps.fxSpeed || 'slow';
  const dur = speed === 'fast' ? '8s' : speed === 'medium' ? '14s' : '22s';
  const alpha = (0.08 + (intensity / 100) * 0.26).toFixed(3);

  if (effect === 'bubbles') {
    layer.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(circle at 18% 25%,rgba(255,255,255,${alpha}) 0 2%,transparent 8%),radial-gradient(circle at 72% 28%,rgba(155,122,184,${alpha}) 0 3%,transparent 10%),radial-gradient(circle at 58% 70%,rgba(90,122,170,${alpha}) 0 2.5%,transparent 9%),radial-gradient(circle at 28% 78%,rgba(244,167,185,${alpha}) 0 2.2%,transparent 8%);filter:blur(${8+intensity*0.12}px);animation:andyFxFloat ${dur} ease-in-out infinite alternate;"></div>`;
  } else if (effect === 'constellation') {
    layer.innerHTML = `<div style="position:absolute;inset:0;opacity:${0.35+intensity/220};background-image:radial-gradient(rgba(255,255,255,.9) 1px,transparent 1.5px),radial-gradient(rgba(155,122,184,.75) 1px,transparent 1.5px);background-size:120px 120px,180px 180px;background-position:20px 30px,70px 100px;animation:andyFxDrift ${dur} linear infinite;"></div>`;
  } else if (effect === 'aurora') {
    layer.innerHTML = `<div style="position:absolute;inset:-10%;background:radial-gradient(circle at 20% 30%,rgba(124,92,255,${alpha}) 0,transparent 35%),radial-gradient(circle at 70% 25%,rgba(79,195,247,${alpha}) 0,transparent 38%),radial-gradient(circle at 52% 80%,rgba(123,228,149,${alpha}) 0,transparent 42%);filter:blur(${18+intensity*0.18}px);animation:andyFxAurora ${dur} ease-in-out infinite alternate;"></div>`;
  } else if (effect === 'particles') {
    layer.innerHTML = `<div style="position:absolute;inset:0;opacity:${0.18+intensity/180};background-image:radial-gradient(rgba(255,220,160,.9) 1px,transparent 1.5px);background-size:${22-Math.min(10,Math.floor(intensity/10))}px ${22-Math.min(10,Math.floor(intensity/10))}px;animation:andyFxDrift ${dur} linear infinite;"></div>`;
  } else if (effect === 'mist') {
    layer.innerHTML = `<div style="position:absolute;inset:-10%;background:radial-gradient(circle at 30% 40%,rgba(255,255,255,${(alpha*0.6).toFixed(3)}) 0,transparent 35%),radial-gradient(circle at 70% 50%,rgba(155,122,184,${alpha}) 0,transparent 35%),radial-gradient(circle at 45% 72%,rgba(255,255,255,${(alpha*0.45).toFixed(3)}) 0,transparent 28%);filter:blur(${24+intensity*0.22}px);animation:andyFxMist ${dur} ease-in-out infinite alternate;"></div>`;
  }
  ensureFxKeyframes();
}

function applyAll() {
  const ps = getGS();
  applyTheme(ps.theme);
  applyBackground(ps);
  applyEffects(ps);
  applyFonts(ps.fonts);
  applySurface(ps.surface || 'glass');
}

// Panel state
let _expanded = false;
let _previewIframe = null;
let _activeFontType = 'display';
let _gradDir = '135deg';
let _searchTimer = null;

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

function toggleExpand() {
  _expanded = !_expanded;
  const overlay = document.getElementById('andy-appearance-panel');
  const btn = document.getElementById('ap-expand-btn');
  const pane = document.getElementById('ap-preview-pane');
  if (_expanded) {
    overlay?.classList.add('ap-fullscreen');
    if (btn) btn.textContent = '←';
    if (pane) pane.style.display = 'flex';
  } else {
    overlay?.classList.remove('ap-fullscreen');
    if (btn) btn.textContent = '⤢';
    if (pane) pane.style.display = 'none';
  }
}

function updateColorSwatch(hex) {
  const sw = document.getElementById('ap-color-swatch');
  const tx = document.getElementById('ap-color-hex');
  if (sw) sw.style.background = hex;
  if (tx) tx.textContent = hex;
}

function buildGradient() {
  const c1 = document.getElementById('ap-grad-1')?.value || '#1e1428';
  const c2 = document.getElementById('ap-grad-2')?.value || '#2d1b4e';
  const c3 = document.getElementById('ap-grad-3')?.value || '#0c0a12';
  return _gradDir === 'radial'
    ? `radial-gradient(circle at center, ${c1} 0%, ${c2} 52%, ${c3} 100%)`
    : `linear-gradient(${_gradDir}, ${c1} 0%, ${c2} 52%, ${c3} 100%)`;
}

function updateGradPreview() {
  const p = document.getElementById('ap-grad-preview');
  if (p) p.style.background = buildGradient();
}

function updateFontPreviewBox(fontName, fontCss, fontStyle) {
  const ps = getGS();
  const role = ROLE_PREVIEW[_activeFontType];
  const prevText = document.getElementById('ap-font-preview-text');
  const prevRole = document.getElementById('ap-preview-role-label');
  const prevMeta = document.getElementById('ap-font-preview-meta');

  if (prevRole) prevRole.textContent = role.label;
  if (prevText) {
    prevText.textContent = role.sample;
    prevText.style.fontFamily = fontCss || ps.fonts[_activeFontType]?.css || 'serif';
    prevText.style.fontStyle = fontStyle || (_activeFontType === 'display' || _activeFontType === 'quote' ? 'italic' : 'normal');
  }
  if (prevMeta) prevMeta.textContent = `${fontName || ps.fonts[_activeFontType]?.name} · ${role.desc}`;
}

function syncPanel() {
  // Role pills
  document.querySelectorAll('.ap-role-pill').forEach(b => b.classList.toggle('active', b.dataset.type === _activeFontType));

  // Font preview box
  const ps = getGS();
  const f = ps.fonts[_activeFontType];
  if (f) updateFontPreviewBox(f.name, f.css, null);

  // Background
  document.querySelectorAll('.ap-bg-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === (ps.bgType || 'color')));
  document.querySelectorAll('.ap-bg-panel').forEach(p => p.classList.toggle('active', p.dataset.type === (ps.bgType || 'color')));
  if (ps.bgType === 'color') {
    const pk = document.getElementById('ap-color-picker');
    if (pk) { pk.value = ps.bgValue || '#0c0a12'; updateColorSwatch(pk.value); }
  }

  // Theme
  document.querySelectorAll('.ap-theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === (ps.theme || 'nocturne')));

  // Effects
  document.querySelectorAll('.ap-fx-card').forEach(c => c.classList.toggle('active', c.dataset.effect === (ps.effect || 'none')));
  const fxInt = document.getElementById('ap-fx-intensity');
  const fxIntVal = document.getElementById('ap-fx-intensity-val');
  const fxSpeed = document.getElementById('ap-fx-speed');
  if (fxInt) fxInt.value = ps.fxIntensity ?? 50;
  if (fxIntVal) fxIntVal.textContent = ps.fxIntensity ?? 50;
  if (fxSpeed) fxSpeed.value = ps.fxSpeed || 'slow';

  // Surface
  document.querySelectorAll('.ap-surface-card[data-surface]').forEach(c => c.classList.toggle('active', c.dataset.surface === (ps.surface || 'glass')));
}

async function loadFontGrid(query, cat) {
  const grid = document.getElementById('ap-font-grid');
  if (!grid) return;
  grid.innerHTML = `<div class="ap-font-loading">Cargando Google Fonts...</div>`;
  const fonts = await searchFonts(query, cat);
  const current = getGS().fonts[_activeFontType]?.name;
  const role = ROLE_PREVIEW[_activeFontType];

  if (!fonts.length) { grid.innerHTML = `<div class="ap-font-loading">Sin resultados</div>`; return; }

  grid.innerHTML = '';
  fonts.forEach(f => {
    loadGFont(f.family);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `ap-font-row ${f.family === current ? 'active' : ''}`;
    row.dataset.family = f.family;

    const isItalic = _activeFontType === 'display' || _activeFontType === 'quote';
    row.innerHTML = `
      <span class="ap-font-row-sample" style="font-family:'${f.family}',serif;font-style:${isItalic?'italic':'normal'};">${role.sample.split(' ')[0]}</span>
      <div class="ap-font-row-info">
        <span class="ap-font-row-name">${f.family}</span>
        <span class="ap-font-row-cat">${f.category}</span>
      </div>
      <div class="ap-font-row-dot"></div>
    `;
    row.onclick = () => selectFont(f.family, f.category);
    grid.appendChild(row);
  });
}

function selectFont(family, category) {
  const fallback = category === 'monospace' ? 'monospace'
    : (category === 'serif' || category === 'display' || category === 'handwriting') ? 'Georgia, serif'
    : 'system-ui, sans-serif';

  const css = `'${family}', ${fallback}`;
  const isItalic = _activeFontType === 'display' || _activeFontType === 'quote';

  commitAppearanceChange(ps => {
    ps.fonts[_activeFontType] = { name: family, css };
  });

  // Update preview box immediately
  updateFontPreviewBox(family, css, isItalic ? 'italic' : 'normal');

  // Reload list to update checkmark
  loadFontGrid(
    document.getElementById('ap-font-search')?.value || '',
    document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'
  );
}

function handlePhotoUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    commitAppearanceChange(ps => {
      ps.bgType = 'photo';
      ps.bgValue = e.target.result;
      ps.bgOpacity = parseInt(document.getElementById('ap-photo-opacity')?.value || 70, 10);
      ps.bgBlur = parseInt(document.getElementById('ap-photo-blur')?.value || 0, 10);
    });
    const thumb = document.getElementById('ap-photo-thumb');
    if (thumb) { thumb.src = e.target.result; thumb.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function buildPanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;
  panel.removeAttribute('inert');

  panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });

  // Main tabs
  panel.querySelectorAll('.ap-main-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-main-tab').forEach(b => b.classList.remove('active'));
      panel.querySelectorAll('.ap-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelector(`.ap-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
      syncPanel();
    };
  });

  // Role pills
  panel.querySelectorAll('.ap-role-pill').forEach(btn => {
    btn.onclick = () => {
      _activeFontType = btn.dataset.type;
      syncPanel();
      loadFontGrid(
        document.getElementById('ap-font-search')?.value || '',
        document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'
      );
    };
  });

  // Font search
  document.getElementById('ap-font-search')?.addEventListener('input', function () {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      loadFontGrid(this.value, document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all');
    }, 250);
  });

  // Filter buttons
  panel.querySelectorAll('.ap-filter-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadFontGrid(document.getElementById('ap-font-search')?.value || '', btn.dataset.cat);
    };
  });

  // Background type
  panel.querySelectorAll('.ap-bg-type-btn').forEach(btn => {
    btn.onclick = () => { commitAppearanceChange(ps => { ps.bgType = btn.dataset.type; }); };
  });

  document.getElementById('ap-color-picker')?.addEventListener('input', function () {
    updateColorSwatch(this.value);
    commitAppearanceChange(ps => { ps.bgType = 'color'; ps.bgValue = this.value; });
  });

  ['ap-grad-1', 'ap-grad-2', 'ap-grad-3'].forEach(id => {
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
    commitAppearanceChange(ps => { ps.bgType = 'gradient'; ps.bgValue = buildGradient(); });
  });

  const zone = document.getElementById('ap-photo-zone');
  const inp = document.getElementById('ap-photo-input');
  if (zone && inp) {
    zone.onclick = () => inp.click();
    zone.ondragover = e => { e.preventDefault(); zone.classList.add('drag'); };
    zone.ondragleave = () => zone.classList.remove('drag');
    zone.ondrop = e => { e.preventDefault(); zone.classList.remove('drag'); handlePhotoUpload(e.dataTransfer.files[0]); };
    inp.onchange = () => handlePhotoUpload(inp.files[0]);
  }

  document.getElementById('ap-photo-opacity')?.addEventListener('input', function () {
    const t = document.getElementById('ap-opacity-val');
    if (t) t.textContent = this.value;
    commitAppearanceChange(ps => { ps.bgOpacity = parseInt(this.value, 10); });
  });

  document.getElementById('ap-photo-blur')?.addEventListener('input', function () {
    const t = document.getElementById('ap-blur-val');
    if (t) t.textContent = `${this.value}px`;
    commitAppearanceChange(ps => { ps.bgBlur = parseInt(this.value, 10); });
  });

  // Effects
  panel.querySelectorAll('.ap-fx-card').forEach(card => {
    card.onclick = () => { commitAppearanceChange(ps => { ps.effect = card.dataset.effect; }); };
  });

  document.getElementById('ap-fx-intensity')?.addEventListener('input', function () {
    const t = document.getElementById('ap-fx-intensity-val');
    if (t) t.textContent = this.value;
    commitAppearanceChange(ps => { ps.fxIntensity = parseInt(this.value, 10); });
  });

  document.getElementById('ap-fx-speed')?.addEventListener('change', function () {
    commitAppearanceChange(ps => { ps.fxSpeed = this.value; });
  });

  // Surface
  panel.querySelectorAll('.ap-surface-card[data-surface]').forEach(card => {
    card.onclick = () => { commitAppearanceChange(ps => { ps.surface = card.dataset.surface; }); };
  });

  // Theme
  panel.querySelectorAll('.ap-theme-card').forEach(card => {
    card.onclick = () => { commitAppearanceChange(ps => { ps.theme = card.dataset.theme; }); };
  });

  document.getElementById('ap-expand-btn')?.addEventListener('click', toggleExpand);

  updateGradPreview();
  syncPanel();
}

function bindFooterActions() {
  document.getElementById('ap-save-btn')?.addEventListener('click', saveAppearance);
  document.getElementById('ap-reset-btn')?.addEventListener('click', resetCurrentPageAppearance);
  document.getElementById('ap-undo-btn')?.addEventListener('click', undoAppearance);
  document.getElementById('ap-close-corner')?.addEventListener('click', closePanel);
}

window.buildPanel = buildPanel;
window.bindFooterActions = bindFooterActions;
window.loadFontGrid = loadFontGrid;
window.openPanel = openPanel;
window.closePanel = closePanel;

window.addEventListener('load', () => {
  loadState();
  applyAll();
  applyQuoteRole();
  document.querySelectorAll('[data-open-appearance], #settingsBtn, .settings-btn').forEach(btn => {
    btn.addEventListener('click', openPanel);
  });
});

}
