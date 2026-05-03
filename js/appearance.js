/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APPEARANCE.JS — Andy.net v4
   Preview unificado por página + 4 roles tipográficos
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
  quote: { name: 'Cormorant Garamond', css: "'Cormorant Garamond', Georgia, serif" },
  body: { name: 'Inter', css: "'Inter', system-ui, sans-serif" },
  mono: { name: 'IBM Plex Mono', css: "'IBM Plex Mono', monospace" }
};

const MUSE_FONT_DEFAULTS = {
  ...FONT_DEFAULTS,
  display: { name: 'Amarante', css: "'Amarante', Georgia, serif" },
  quote: { name: 'Cormorant Garamond', css: "'Cormorant Garamond', Georgia, serif" }
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

const EFFECT_DEFAULTS = {
  effect: 'none',
  intensity: 50,
  speed: 'slow'
};

let AppState = {};
let _undoStack = [];
const UNDO_LIMIT = 40;
let _toastTimer = null;

function cloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pushUndoState() {
  _undoStack.push(cloneState(AppState));
  if (_undoStack.length > UNDO_LIMIT) _undoStack.shift();
}

function showToast(message = 'Listo') {
  const toast = document.getElementById('andy-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function commitAppearanceChange(mutator) {
  pushUndoState();
  mutator(getPS(PAGE_ID));
  applyAll();
  syncPanel();
  saveState();
  sendPreviewState();
}
function undoAppearance() {
  if (!_undoStack.length) {
    showToast('Nada que deshacer');
    return;
  }

  AppState = _undoStack.pop();
  applyAll();
  syncPanel();
  saveState();
  sendPreviewState();
  showToast('Último cambio deshecho');
}

function resetCurrentPageAppearance() {
  pushUndoState();
  AppState[PAGE_ID] = makePageDefault(PAGE_ID);
  applyAll();
  syncPanel();
  saveState();
  sendPreviewState();
  showToast('Reset aplicado');
}

function saveAppearance() {
  saveState();
  showToast('Cambios guardados');
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
    fonts: JSON.parse(JSON.stringify(pageId === 'muse' ? MUSE_FONT_DEFAULTS : FONT_DEFAULTS))
  };
}

function normalizeFonts(fonts = {}, pageId = PAGE_ID) {
  const base = JSON.parse(JSON.stringify(pageId === 'muse' ? MUSE_FONT_DEFAULTS : FONT_DEFAULTS));

  return {
    display: fonts.display || base.display,
    quote: fonts.quote || fonts.subtitle || base.quote,
    body: fonts.body || fonts.ui || base.body,
    mono: fonts.mono || base.mono
  };
}

function getPS(pageId) {
  if (!AppState[pageId]) AppState[pageId] = makePageDefault(pageId);
  AppState[pageId].fonts = normalizeFonts(AppState[pageId].fonts, pageId);

  if (!AppState[pageId].effect) AppState[pageId].effect = EFFECT_DEFAULTS.effect;
  if (AppState[pageId].fxIntensity == null) AppState[pageId].fxIntensity = EFFECT_DEFAULTS.intensity;
  if (!AppState[pageId].fxSpeed) AppState[pageId].fxSpeed = EFFECT_DEFAULTS.speed;
  if (!AppState[pageId].surface) AppState[pageId].surface = 'glass';

  return AppState[pageId];
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch (e) {}
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s) AppState = s;
  } catch (e) {}
}

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
  } catch (e) {
    console.warn('GFonts:', e);
  }
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

  const f = normalizeFonts(fonts, PAGE_ID);
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
  const quoteFont = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-quote')
    .trim();

  if (!quoteFont) return;

  const selectors = [
    'blockquote',
    '.quote',
    '.hero-quote',
    '.quote-text',
    '.manifesto-line',
    '[data-quote]',
    '#heroQuote',
    '.hero-eyebrow'
  ];

  scope.querySelectorAll(selectors.join(',')).forEach(el => {
    el.style.fontFamily = quoteFont;
  });
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
    @keyframes andyFxFloat {
      0% { transform: translateY(0) translateX(0) scale(1); }
      100% { transform: translateY(-16px) translateX(10px) scale(1.04); }
    }
    @keyframes andyFxDrift {
      0% { transform: translate3d(0,0,0); }
      100% { transform: translate3d(18px,-12px,0); }
    }
    @keyframes andyFxAurora {
      0% { transform: translateX(-2%) translateY(0) scale(1); }
      100% { transform: translateX(2%) translateY(-2%) scale(1.06); }
    }
    @keyframes andyFxMist {
      0% { transform: translateX(-1%) translateY(0) scale(1); opacity:.75; }
      100% { transform: translateX(2%) translateY(-1%) scale(1.06); opacity:1; }
    }
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
    layer.innerHTML = `
      <div style="position:absolute;inset:0;
        background:
          radial-gradient(circle at 18% 25%, rgba(255,255,255,${alpha}) 0 2%, transparent 8%),
          radial-gradient(circle at 72% 28%, rgba(155,122,184,${alpha}) 0 3%, transparent 10%),
          radial-gradient(circle at 58% 70%, rgba(90,122,170,${alpha}) 0 2.5%, transparent 9%),
          radial-gradient(circle at 28% 78%, rgba(244,167,185,${alpha}) 0 2.2%, transparent 8%);
        filter: blur(${8 + intensity * 0.12}px);
        animation: andyFxFloat ${dur} ease-in-out infinite alternate;"></div>`;
  } else if (effect === 'constellation') {
    layer.innerHTML = `
      <div style="position:absolute;inset:0;opacity:${0.35 + intensity / 220};
        background-image:
          radial-gradient(rgba(255,255,255,.9) 1px, transparent 1.5px),
          radial-gradient(rgba(155,122,184,.75) 1px, transparent 1.5px);
        background-size: 120px 120px, 180px 180px;
        background-position: 20px 30px, 70px 100px;
        animation: andyFxDrift ${dur} linear infinite;"></div>`;
  } else if (effect === 'aurora') {
    layer.innerHTML = `
      <div style="position:absolute;inset:-10%;
        background:
          radial-gradient(circle at 20% 30%, rgba(124,92,255,${alpha}) 0, transparent 35%),
          radial-gradient(circle at 70% 25%, rgba(79,195,247,${alpha}) 0, transparent 38%),
          radial-gradient(circle at 52% 80%, rgba(123,228,149,${alpha}) 0, transparent 42%);
        filter: blur(${18 + intensity * 0.18}px);
        animation: andyFxAurora ${dur} ease-in-out infinite alternate;"></div>`;
  } else if (effect === 'particles') {
    layer.innerHTML = `
      <div style="position:absolute;inset:0;opacity:${0.18 + intensity / 180};
        background-image: radial-gradient(rgba(255,220,160,.9) 1px, transparent 1.5px);
        background-size: ${22 - Math.min(10, Math.floor(intensity / 10))}px ${22 - Math.min(10, Math.floor(intensity / 10))}px;
        animation: andyFxDrift ${dur} linear infinite;"></div>`;
  } else if (effect === 'mist') {
    layer.innerHTML = `
      <div style="position:absolute;inset:-10%;
        background:
          radial-gradient(circle at 30% 40%, rgba(255,255,255,${(alpha * 0.6).toFixed(3)}) 0, transparent 35%),
          radial-gradient(circle at 70% 50%, rgba(155,122,184,${alpha}) 0, transparent 35%),
          radial-gradient(circle at 45% 72%, rgba(255,255,255,${(alpha * 0.45).toFixed(3)}) 0, transparent 28%);
        filter: blur(${24 + intensity * 0.22}px);
        animation: andyFxMist ${dur} ease-in-out infinite alternate;"></div>`;
  }

  ensureFxKeyframes();
}

function applyAll(pageId = PAGE_ID) {
  const ps = getPS(pageId);
  applyTheme(ps.theme);
  applyBackground(ps);
  applyEffects(ps);
  applyFonts(ps.fonts);
  applySurface(ps.surface || 'glass');
}

let _expanded = false;
let _previewIframe = null;
let _activeFontPage = PAGE_ID;
let _activeBgPage = PAGE_ID;
let _activeFxPage = PAGE_ID;
let _activeThemePage = PAGE_ID;
let _activeSurfacePage = PAGE_ID;
let _activeFontType = 'display';
let _gradDir = '135deg';
let _searchTimer = null;

function getActiveMainTab() {
  return document.querySelector('.ap-main-tab.active')?.dataset.tab || 'fonts';
}

function getPreviewPageId() {
  const activeMainTab = getActiveMainTab();
  if (activeMainTab === 'fonts') return _activeFontPage || PAGE_ID;
  if (activeMainTab === 'background') return _activeBgPage || PAGE_ID;
  if (activeMainTab === 'effects') return _activeFxPage || PAGE_ID;
  if (activeMainTab === 'theme') return _activeThemePage || PAGE_ID;
  if (activeMainTab === 'surface') return _activeSurfacePage || PAGE_ID;
  return PAGE_ID;
}

function getPreviewPageUrl(pageId) {
  switch (pageId) {
    case 'hub': return 'hub.html';
    case 'studio': return 'studio.html';
    case 'muse': return 'muse.html';
    case 'index':
    default: return 'index.html';
  }
}

function openPanel() {
  _activeFontPage = PAGE_ID;
  _activeBgPage = PAGE_ID;
  _activeFxPage = PAGE_ID;
  _activeSurfacePage = PAGE_ID;
  _activeThemePage = PAGE_ID;
  document.getElementById('andy-appearance-panel')?.classList.add('open');
  syncPanel();
  loadFontGrid('', 'all');
}

function closePanel() {
  document.getElementById('andy-appearance-panel')?.classList.remove('open');
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
    previewCurrentStateFor(getPreviewPageId());
  } else {
    overlay?.classList.remove('ap-fullscreen');
    if (btn) btn.textContent = '⤢';
    if (pane) pane.style.display = 'none';
  }
}

function initPreviewIframe(pageId = getPreviewPageId()) {
  const container = document.getElementById('ap-preview-iframe-wrap');
  if (!container) return null;

  const nextSrc = getPreviewPageUrl(pageId);
  let iframe = container.querySelector('iframe');

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:12px;background:#0c0a12;';
    iframe.onload = () => {
      _previewIframe = iframe;
      sendPreviewState({ pageId: iframe.dataset.pageId || pageId });
    };
    container.innerHTML = '';
    container.appendChild(iframe);
  }

  _previewIframe = iframe;

  if (iframe.dataset.pageId !== pageId) {
    iframe.dataset.pageId = pageId;
    iframe.src = nextSrc;
  }

  return iframe;
}

function previewCurrentStateFor(pageId) {
  if (!_expanded) return;

  const iframe = initPreviewIframe(pageId);
  if (!iframe) return;

  if (iframe.dataset.pageId === pageId && iframe.contentWindow) {
    sendPreviewState({ pageId });
  }
}

function sendPreviewState(overrides = {}) {
  if (!_previewIframe || !_previewIframe.contentWindow) return;

  const previewPageId = overrides.pageId || getPreviewPageId();
  const ps = getPS(previewPageId);

  try {
    _previewIframe.contentWindow.postMessage({
      type: 'andy-preview',
      pageId: previewPageId,
      theme: overrides.theme ?? ps.theme ?? 'nocturne',
      surface: overrides.surface ?? ps.surface ?? 'glass',
      bgType: overrides.bgType ?? ps.bgType ?? 'color',
      bgValue: overrides.bgValue ?? ps.bgValue ?? '#0c0a12',
      bgOpacity: overrides.bgOpacity ?? ps.bgOpacity ?? 70,
      bgBlur: overrides.bgBlur ?? ps.bgBlur ?? 0,
      effect: overrides.effect ?? ps.effect ?? 'none',
      fxIntensity: overrides.fxIntensity ?? ps.fxIntensity ?? 50,
      fxSpeed: overrides.fxSpeed ?? ps.fxSpeed ?? 'slow',
      fonts: overrides.fonts ?? ps.fonts
    }, '*');
  } catch (e) {}
}

window.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'andy-preview') return;

  const d = e.data;

  applyTheme(d.theme);
  applyBackground({
    bgType: d.bgType,
    bgValue: d.bgValue,
    bgOpacity: d.bgOpacity,
    bgBlur: d.bgBlur
  });
  applyEffects({
    effect: d.effect,
    fxIntensity: d.fxIntensity,
    fxSpeed: d.fxSpeed
  });
  applySurface(d.surface);
  applyFonts(d.fonts);
  applyQuoteRole();
});

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

function syncPanel() {
  document.querySelectorAll('#ap-font-page-tabs .ap-page-tab')
    .forEach(b => b.classList.toggle('active', b.dataset.page === _activeFontPage));

  document.querySelectorAll('#ap-bg-page-tabs .ap-page-tab')
    .forEach(b => b.classList.toggle('active', b.dataset.page === _activeBgPage));

  document.querySelectorAll('#ap-fx-page-tabs .ap-page-tab')
    .forEach(b => b.classList.toggle('active', b.dataset.page === _activeFxPage));

  document.querySelectorAll('#ap-theme-page-tabs .ap-page-tab')
    .forEach(b => b.classList.toggle('active', b.dataset.page === _activeThemePage));

  document.querySelectorAll('#ap-surface-page-tabs .ap-page-tab')
    .forEach(b => b.classList.toggle('active', b.dataset.page === _activeSurfacePage));

  document.querySelectorAll('.ap-font-type-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.type === _activeFontType));

  syncFontBtnPreviews();

  const bps = getPS(_activeBgPage);
  document.querySelectorAll('.ap-bg-type-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.type === (bps.bgType || 'color')));
  document.querySelectorAll('.ap-bg-panel')
    .forEach(p => p.classList.toggle('active', p.dataset.type === (bps.bgType || 'color')));

  if (bps.bgType === 'color') {
    const pk = document.getElementById('ap-color-picker');
    if (pk) {
      pk.value = bps.bgValue || '#0c0a12';
      updateColorSwatch(pk.value);
    }
  }

  const tps = getPS(_activeThemePage);
  document.querySelectorAll('.ap-theme-card')
    .forEach(c => c.classList.toggle('active', c.dataset.theme === (tps.theme || 'nocturne')));

  const fps = getPS(_activeFxPage);
  document.querySelectorAll('.ap-fx-card')
    .forEach(c => c.classList.toggle('active', c.dataset.effect === (fps.effect || 'none')));

  const fxInt = document.getElementById('ap-fx-intensity');
  const fxIntVal = document.getElementById('ap-fx-intensity-val');
  const fxSpeed = document.getElementById('ap-fx-speed');

  if (fxInt) fxInt.value = fps.fxIntensity ?? 50;
  if (fxIntVal) fxIntVal.textContent = fps.fxIntensity ?? 50;
  if (fxSpeed) fxSpeed.value = fps.fxSpeed || 'slow';

  const sps = getPS(_activeSurfacePage);
  document.querySelectorAll('.ap-surface-card[data-surface]')
    .forEach(c => c.classList.toggle('active', c.dataset.surface === (sps.surface || 'glass')));
}

function syncFontBtnPreviews() {
  const ps = getPS(_activeFontPage);
  ['display', 'quote', 'body', 'mono'].forEach(type => {
    const f = ps.fonts?.[type];
    if (!f) return;
    const btn = document.querySelector(`.ap-font-type-btn[data-type="${type}"] .ap-font-type-btn-preview`);
    if (btn) {
      btn.style.fontFamily = f.css;
      loadGFont(f.name);
    }
  });

  const current = ps.fonts?.[_activeFontType];
  const label = document.getElementById('ap-font-current-name');
  if (label && current) label.textContent = current.name;
}

async function loadFontGrid(query, cat) {
  const grid = document.getElementById('ap-font-grid');
  if (!grid) return;

  grid.innerHTML = `<div class="ap-font-loading">Cargando Google Fonts...</div>`;
  const fonts = await searchFonts(query, cat);
  const current = getPS(_activeFontPage).fonts?.[_activeFontType]?.name;

  const sampleMap = {
    display: 'Andy Net',
    quote: 'Mientras se aplaza la vida, pasa.',
    body: 'Texto de ejemplo',
    mono: '01 · 08:42'
  };
  const sample = sampleMap[_activeFontType] || 'Andy Net';

  if (!fonts.length) {
    grid.innerHTML = `<div class="ap-font-loading">Sin resultados</div>`;
    return;
  }

  grid.innerHTML = '';
  fonts.forEach(f => {
    loadGFont(f.family);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `ap-font-card ${f.family === current ? 'active' : ''}`;
    card.dataset.family = f.family;
    card.innerHTML = `
      <div class="ap-font-sample" style="font-family:'${f.family}', serif;">${sample}</div>
      <div class="ap-font-name">${f.family}</div>
      <div class="ap-font-cat">${f.category}</div>
    `;
    card.onclick = () => selectFont(f.family, f.category);
    grid.appendChild(card);
  });
}

function selectFont(family, category) {
  const fallback = category === 'monospace'
    ? 'monospace'
    : category === 'serif' || category === 'display' || category === 'handwriting'
      ? 'Georgia, serif'
      : 'system-ui, sans-serif';

  const ps = getPS(_activeFontPage);
  ps.fonts[_activeFontType] = {
    name: family,
    css: `'${family}', ${fallback}`
  };

  if (_activeFontPage === PAGE_ID) applyFonts(ps.fonts);
  saveState();
  syncFontBtnPreviews();
  loadFontGrid(
    document.getElementById('ap-font-search')?.value || '',
    document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'
  );
  previewCurrentStateFor(_activeFontPage);
}

function handlePhotoUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const ps = getPS(_activeBgPage);
    ps.bgType = 'photo';
    ps.bgValue = e.target.result;
    ps.bgOpacity = parseInt(document.getElementById('ap-photo-opacity')?.value || 70, 10);
    ps.bgBlur = parseInt(document.getElementById('ap-photo-blur')?.value || 0, 10);

    const thumb = document.getElementById('ap-photo-thumb');
    if (thumb) {
      thumb.src = e.target.result;
      thumb.style.display = 'block';
    }

    if (_activeBgPage === PAGE_ID) applyBackground(ps);
    saveState();
    previewCurrentStateFor(_activeBgPage);
  };
  reader.readAsDataURL(file);
}

function buildPanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;

  panel.addEventListener('click', e => {
    if (e.target === panel) closePanel();
  });

  panel.querySelectorAll('.ap-main-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-main-tab').forEach(b => b.classList.remove('active'));
      panel.querySelectorAll('.ap-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelector(`.ap-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
      syncPanel();
      previewCurrentStateFor(getPreviewPageId());
    };
  });

  panel.querySelectorAll('#ap-font-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      _activeFontPage = btn.dataset.page;
      syncPanel();
      loadFontGrid(
        document.getElementById('ap-font-search')?.value || '',
        document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'
      );
      previewCurrentStateFor(_activeFontPage);
    };
  });

  panel.querySelectorAll('.ap-font-type-btn').forEach(btn => {
    btn.onclick = () => {
      _activeFontType = btn.dataset.type;
      syncPanel();
      loadFontGrid(
        document.getElementById('ap-font-search')?.value || '',
        document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'
      );
    };
  });

  document.getElementById('ap-font-search')?.addEventListener('input', function () {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      loadFontGrid(
        this.value,
        document.querySelector('.ap-filter-btn.active')?.dataset.cat || 'all'
      );
    }, 250);
  });

  panel.querySelectorAll('.ap-filter-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadFontGrid(document.getElementById('ap-font-search')?.value || '', btn.dataset.cat);
    };
  });

  panel.querySelectorAll('#ap-bg-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      _activeBgPage = btn.dataset.page;
      syncPanel();
      previewCurrentStateFor(_activeBgPage);
    };
  });

  panel.querySelectorAll('.ap-bg-type-btn').forEach(btn => {
    btn.onclick = () => {
      const ps = getPS(_activeBgPage);
      ps.bgType = btn.dataset.type;
      saveState();
      syncPanel();

      if (_activeBgPage === PAGE_ID) applyBackground(ps);
      previewCurrentStateFor(_activeBgPage);
    };
  });

  document.getElementById('ap-color-picker')?.addEventListener('input', function () {
    const ps = getPS(_activeBgPage);
    ps.bgType = 'color';
    ps.bgValue = this.value;
    updateColorSwatch(this.value);

    if (_activeBgPage === PAGE_ID) applyBackground(ps);
    saveState();
    previewCurrentStateFor(_activeBgPage);
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
    const ps = getPS(_activeBgPage);
    ps.bgType = 'gradient';
    ps.bgValue = buildGradient();
    saveState();

    if (_activeBgPage === PAGE_ID) applyBackground(ps);
    previewCurrentStateFor(_activeBgPage);
  });

  const zone = document.getElementById('ap-photo-zone');
  const inp = document.getElementById('ap-photo-input');

  if (zone && inp) {
    zone.onclick = () => inp.click();

    zone.ondragover = e => {
      e.preventDefault();
      zone.classList.add('drag');
    };

    zone.ondragleave = () => zone.classList.remove('drag');

    zone.ondrop = e => {
      e.preventDefault();
      zone.classList.remove('drag');
      handlePhotoUpload(e.dataTransfer.files[0]);
    };

    inp.onchange = () => handlePhotoUpload(inp.files[0]);
  }

  document.getElementById('ap-photo-opacity')?.addEventListener('input', function () {
    const ps = getPS(_activeBgPage);
    ps.bgOpacity = parseInt(this.value, 10);

    const t = document.getElementById('ap-opacity-val');
    if (t) t.textContent = this.value;

    if (_activeBgPage === PAGE_ID && ps.bgType === 'photo') {
      applyBackground(ps);
    }

    saveState();
    previewCurrentStateFor(_activeBgPage);
  });

  document.getElementById('ap-photo-blur')?.addEventListener('input', function () {
    const ps = getPS(_activeBgPage);
    ps.bgBlur = parseInt(this.value, 10);

    const t = document.getElementById('ap-blur-val');
    if (t) t.textContent = `${this.value}px`;

    if (_activeBgPage === PAGE_ID && ps.bgType === 'photo') {
      applyBackground(ps);
    }

    saveState();
    previewCurrentStateFor(_activeBgPage);
  });

  panel.querySelectorAll('#ap-fx-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      _activeFxPage = btn.dataset.page;
      syncPanel();
      previewCurrentStateFor(_activeFxPage);
    };
  });

  panel.querySelectorAll('.ap-fx-card').forEach(card => {
    card.onclick = () => {
      const ps = getPS(_activeFxPage);
      ps.effect = card.dataset.effect;
      saveState();
      syncPanel();

      if (_activeFxPage === PAGE_ID) applyEffects(ps);
      previewCurrentStateFor(_activeFxPage);
    };
  });

  document.getElementById('ap-fx-intensity')?.addEventListener('input', function () {
    const ps = getPS(_activeFxPage);
    ps.fxIntensity = parseInt(this.value, 10);

    const t = document.getElementById('ap-fx-intensity-val');
    if (t) t.textContent = this.value;

    saveState();

    if (_activeFxPage === PAGE_ID) {
      applyEffects(ps);
    }

    previewCurrentStateFor(_activeFxPage);
  });

  document.getElementById('ap-fx-speed')?.addEventListener('change', function () {
    const ps = getPS(_activeFxPage);
    ps.fxSpeed = this.value;
    saveState();

    if (_activeFxPage === PAGE_ID) {
      applyEffects(ps);
    }

    previewCurrentStateFor(_activeFxPage);
  });

  panel.querySelectorAll('#ap-surface-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      _activeSurfacePage = btn.dataset.page;
      syncPanel();
      previewCurrentStateFor(_activeSurfacePage);
    };
  });

  panel.querySelectorAll('.ap-surface-card[data-surface]').forEach(card => {
    card.onclick = () => {
      const ps = getPS(_activeSurfacePage);
      ps.surface = card.dataset.surface;
      saveState();

      panel.querySelectorAll('.ap-surface-card[data-surface]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (_activeSurfacePage === PAGE_ID) {
        applySurface(ps.surface);
      }

      previewCurrentStateFor(_activeSurfacePage);
    };
  });

  panel.querySelectorAll('#ap-theme-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      _activeThemePage = btn.dataset.page;
      syncPanel();
      previewCurrentStateFor(_activeThemePage);
    };
  });

  panel.querySelectorAll('.ap-theme-card').forEach(card => {
    card.onclick = () => {
      const ps = getPS(_activeThemePage);
      ps.theme = card.dataset.theme;
      saveState();
      syncPanel();

      if (_activeThemePage === PAGE_ID) {
        applyTheme(ps.theme);
      }

      previewCurrentStateFor(_activeThemePage);
    };
  });

  document.getElementById('ap-expand-btn')?.addEventListener('click', toggleExpand);

  document.getElementById('ap-reset-btn')?.addEventListener('click', () => {
    if (!confirm('¿Resetear apariencia?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  document.getElementById('ap-export-btn')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(AppState, null, 2)], { type: 'application/json' })
    );
    a.download = 'andynet-appearance-v4.json';
    a.click();
  });

  updateGradPreview();
  syncPanel();
}

function bindFooterActions() {
  document.getElementById('ap-save-btn')?.addEventListener('click', saveAppearance);
  document.getElementById('ap-reset-btn')?.addEventListener('click', resetCurrentPageAppearance);
  document.getElementById('ap-undo-btn')?.addEventListener('click', undoAppearance);
  document.getElementById('ap-close-corner')?.addEventListener('click', closePanel);
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  applyAll();
  applyQuoteRole();
  bindFooterActions();

  document.querySelectorAll('[data-open-appearance], #settingsBtn, .settings-btn').forEach(btn => {
    btn.addEventListener('click', openPanel);
  });

  window.onAppearancePanelLoaded = function () {
    buildPanel();
    loadFontGrid('', 'all');
  };
});
