/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APPEARANCE.JS — Andy.net v3
   Todo por página: tipografía, fondo, tema
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GFONTS_KEY = 'AIzaSyAvnT97F7A73UBhB3OYClMs6RyjUpHbrAY';
const STORAGE_KEY = 'andynet_v3_appearance';

const PAGE_ID = (() => {
  const p = location.pathname.split('/').pop().replace('.html','');
  return ['hub','studio','muse'].includes(p) ? p : 'index';
})();

/* ── Defaults ── */
const FONT_DEFAULTS = {
  display:  { name:'DM Serif Display', css:"'DM Serif Display',Georgia,serif" },
  subtitle: { name:'DM Serif Display', css:"'DM Serif Display',Georgia,serif" },
  ui:       { name:'Inter',            css:"'Inter',system-ui,sans-serif" },
  body:     { name:'Inter',            css:"'Inter',system-ui,sans-serif" },
  mono:     { name:'IBM Plex Mono',    css:"'IBM Plex Mono',monospace" },
};
const MUSE_FONT_DEFAULTS = {
  ...FONT_DEFAULTS,
  display: { name:'Amarante', css:"'Amarante',Georgia,serif" },
};

function makePageDefault(pageId) {
  return {
    theme: 'nocturne',
    bgType: 'color', bgValue: '#0c0a12', bgOpacity: 70, bgBlur: 0,
    fonts: JSON.parse(JSON.stringify(pageId === 'muse' ? MUSE_FONT_DEFAULTS : FONT_DEFAULTS)),
  };
}

/* ── Temas ── */
const THEMES = {
  nocturne:  {'--bg':'#0c0a12','--s1':'#120f1a','--s2':'#1a1625','--s3':'#241e30','--s4':'#2d253b','--border':'rgba(180,140,220,0.08)','--bord2':'rgba(180,140,220,0.18)','--bord3':'rgba(180,140,220,0.30)','--text':'#d4cfe0','--text2':'#ede5f5','--muted':'#5a4f70','--muted2':'#8a7a9a','--muted3':'#9a8aaa','--hub':'#5a7aaa','--studio':'#c8965a','--muse':'#9b7ab8','--self':'#f4a7b9'},
  soleil:    {'--bg':'#f5f0e8','--s1':'#ede8df','--s2':'#e4ddd3','--s3':'#d9d1c4','--s4':'#cec5b6','--border':'rgba(192,180,204,0.35)','--bord2':'rgba(192,180,204,0.6)','--bord3':'rgba(192,180,204,0.85)','--text':'#3a3430','--text2':'#1e1a16','--muted':'#9a8f80','--muted2':'#7a6f62','--muted3':'#6a5f54','--hub':'#4f85e8','--studio':'#c0a050','--muse':'#9b7ab8','--self':'#e8a0a8'},
  botanical: {'--bg':'#0a120d','--s1':'#0f1a12','--s2':'#162018','--s3':'#1e2d20','--s4':'#263828','--border':'rgba(100,180,120,0.10)','--bord2':'rgba(100,180,120,0.20)','--bord3':'rgba(100,180,120,0.35)','--text':'#c8d8c0','--text2':'#e0f0d8','--muted':'#4a6a50','--muted2':'#6a8a70','--muted3':'#8aaa88','--hub':'#5a9a70','--studio':'#a8b860','--muse':'#7a9ab8','--self':'#d8a8b0'},
  ambar:     {'--bg':'#120a06','--s1':'#1a1008','--s2':'#22160a','--s3':'#2e1e0e','--s4':'#3a2814','--border':'rgba(220,160,80,0.10)','--bord2':'rgba(220,160,80,0.20)','--bord3':'rgba(220,160,80,0.35)','--text':'#e0d0b8','--text2':'#f0e0c8','--muted':'#6a5030','--muted2':'#9a7848','--muted3':'#baa068','--hub':'#9a8860','--studio':'#d4a050','--muse':'#b07888','--self':'#e8b090'},
  editorial: {'--bg':'#f0eeec','--s1':'#e8e5e0','--s2':'#dedad4','--s3':'#d0ccc4','--s4':'#c4beb6','--border':'rgba(80,70,60,0.12)','--bord2':'rgba(80,70,60,0.22)','--bord3':'rgba(80,70,60,0.38)','--text':'#2a2420','--text2':'#100c08','--muted':'#8a8078','--muted2':'#6a6058','--muted3':'#4a4038','--hub':'#4060b0','--studio':'#906820','--muse':'#7050a0','--self':'#b04060'},
};

/* ━━ ESTADO ━━ */
let AppState = {};

function getPS(pageId) {
  if (!AppState[pageId]) AppState[pageId] = makePageDefault(pageId);
  if (!AppState[pageId].fonts) AppState[pageId].fonts = JSON.parse(JSON.stringify(pageId === 'muse' ? MUSE_FONT_DEFAULTS : FONT_DEFAULTS));
  return AppState[pageId];
}

/* ━━ PERSISTENCIA ━━ */
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState)); } catch(e){} }
function loadState() { try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY)); if(s) AppState = s; } catch(e){} }

/* ━━ APLICAR ━━ */
function applyAll() {
  const ps = getPS(PAGE_ID);
  applyTheme(ps.theme);
  applyBackground(ps);
  applyFonts(ps.fonts);
  applySurface(PAGE_ID, ps.surface || 'solid');
}

function applyTheme(themeId) {
  const t = THEMES[themeId]; if(!t) return;
  Object.entries(t).forEach(([k,v]) => document.documentElement.style.setProperty(k,v));
}

function applyFonts(fonts) {
  if (!fonts) return;
  const r = document.documentElement;
  if (fonts.display)  { r.style.setProperty('--serif',        fonts.display.css);  r.style.setProperty('--font-display',  fonts.display.css);  loadGFont(fonts.display.name); }
  if (fonts.subtitle) { r.style.setProperty('--font-subtitle',fonts.subtitle.css);                                                               loadGFont(fonts.subtitle.name); }
  if (fonts.ui)       { r.style.setProperty('--sans',         fonts.ui.css);       r.style.setProperty('--font-ui',       fonts.ui.css);       loadGFont(fonts.ui.name); }
  if (fonts.body)     { r.style.setProperty('--font-body',    fonts.body.css);                                                                   loadGFont(fonts.body.name); }
  if (fonts.mono)     { r.style.setProperty('--mono',         fonts.mono.css);     r.style.setProperty('--font-mono',     fonts.mono.css);     loadGFont(fonts.mono.name); }
}

function applyBackground(ps) {
  const body = document.body;
  body.style.backgroundImage = ''; body.style.backgroundColor = '';
  document.getElementById('andy-bg-layer')?.remove();
  // Limpiar orbes si el tipo de fondo no es orbes
  if (ps.bgType !== 'orbs' && window.AndyOrbs) window.AndyOrbs.removeOrbs();

  if (ps.bgType === 'color') {
    body.style.backgroundColor = ps.bgValue || '#0c0a12';
  } else if (ps.bgType === 'gradient') {
    body.style.backgroundImage = ps.bgValue; body.style.backgroundAttachment = 'fixed';
  } else if (ps.bgType === 'photo') {
    const l = mkBgLayer();
    l.style.backgroundImage = `url(${ps.bgValue})`;
    l.style.backgroundSize = 'cover'; l.style.backgroundPosition = 'center';
    l.style.opacity = (ps.bgOpacity||70)/100; l.style.filter = `blur(${ps.bgBlur||0}px)`;
  } else if (ps.bgType === 'ai') {
    mkBgLayer().innerHTML = ps.bgValue || '';
  } else if (ps.bgType === 'orbs') {
    body.style.backgroundColor = ps.orbsBg || '#0c0a12';
    if (window.AndyOrbs) window.AndyOrbs.createOrbs(PAGE_ID, ps.orbsConfig);
  }
}

function mkBgLayer() {
  const l = document.createElement('div'); l.id = 'andy-bg-layer';
  l.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;';
  document.body.prepend(l); return l;
}

/* ━━ GOOGLE FONTS ━━ */
const _loaded = new Set();
function loadGFont(name) {
  if (!name || _loaded.has(name)) return; _loaded.add(name);
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g,'+')}:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap`;
  document.head.appendChild(l);
}

let _allFonts = [], _fontsReady = false;
async function fetchFonts() {
  if (_fontsReady) return _allFonts;
  try {
    const r = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GFONTS_KEY}&sort=popularity`);
    _allFonts = (await r.json()).items || []; _fontsReady = true;
  } catch(e) { console.warn('GFonts:', e); }
  return _allFonts;
}

async function searchFonts(query, cat) {
  const all = await fetchFonts();
  return all.filter(f =>
    (!query || f.family.toLowerCase().includes(query.toLowerCase())) &&
    (!cat || cat === 'all' || f.category === cat)
  ).slice(0, 80);
}

/* ━━ PANEL STATE ━━ */
let _expanded = false;
let _activeFontPage = PAGE_ID;
let _activeSurfacePage = PAGE_ID;
let _activeFontType = 'display';
let _activeBgPage   = PAGE_ID;
let _activeThemePage = PAGE_ID;
let _gradDir = '135deg';
let _searchTimer = null;

/* ── Abrir / cerrar ── */
function openPanel() {
  _activeFontPage  = PAGE_ID;
  _activeBgPage    = PAGE_ID;
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
  const d = document.querySelector('.ap-drawer');
  const b = document.getElementById('ap-expand-btn');
  if (d) { d.style.width = _expanded ? '100vw' : ''; d.style.maxWidth = _expanded ? '100vw' : ''; }
  if (b) b.textContent = _expanded ? '←' : '→';
}

/* ── Sync panel con estado ── */
function syncPanel() {
  // Font page tabs
  document.querySelectorAll('#ap-font-page-tabs .ap-page-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.page === _activeFontPage));
  // Font type btns
  document.querySelectorAll('.ap-font-type-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.type === _activeFontType));
  // Fuente actual label + preview btns
  syncFontBtnPreviews();
  // BG page tabs
  document.querySelectorAll('#ap-bg-page-tabs .ap-page-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.page === _activeBgPage));
  // BG tipo activo
  const bps = getPS(_activeBgPage);
  const bgType = bps.bgType || 'color';
  document.querySelectorAll('.ap-bg-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === bgType));
  document.querySelectorAll('.ap-bg-panel').forEach(p => p.classList.toggle('active', p.dataset.type === bgType));
  if (bgType === 'color') {
    const pk = document.getElementById('ap-color-picker');
    if (pk) { pk.value = bps.bgValue || '#0c0a12'; updateColorSwatch(pk.value); }
  }
  // Theme page tabs
  document.querySelectorAll('#ap-theme-page-tabs .ap-page-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.page === _activeThemePage));
  const tps = getPS(_activeThemePage);
  document.querySelectorAll('.ap-theme-card').forEach(c =>
    c.classList.toggle('active', c.dataset.theme === (tps.theme || 'nocturne')));
}

function syncFontBtnPreviews() {
  const ps = getPS(_activeFontPage);
  ['display','subtitle','ui','body','mono'].forEach(type => {
    const f = ps.fonts?.[type];
    if (!f) return;
    const btn = document.querySelector(`.ap-font-type-btn[data-type="${type}"] .ap-font-type-btn-preview`);
    if (btn) { btn.style.fontFamily = f.css; loadGFont(f.name); }
  });
  const current = ps.fonts?.[_activeFontType];
  const label = document.getElementById('ap-font-current-name');
  if (label && current) label.textContent = current.name;
}

/* ━━ FONT GRID ━━ */
async function loadFontGrid(query, cat) {
  const grid = document.getElementById('ap-font-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="ap-font-loading">Cargando Google Fonts...</div>';
  const fonts = await searchFonts(query, cat);
  const current = getPS(_activeFontPage).fonts?.[_activeFontType]?.name;
  const samples = { display:'Andinet', subtitle:'Sección', ui:'Menú', body:'Texto', mono:'08:42' };
  const sample = samples[_activeFontType] || 'Ag';
  grid.innerHTML = '';
  if (!fonts.length) { grid.innerHTML = '<div class="ap-font-loading">Sin resultados</div>'; return; }
  fonts.forEach(f => {
    loadGFont(f.family);
    const card = document.createElement('div');
    card.className = 'ap-font-card' + (f.family === current ? ' active' : '');
    card.dataset.family = f.family;
    card.innerHTML = `
      <div class="ap-font-sample" style="font-family:'${f.family}',serif">${sample}</div>
      <div class="ap-font-name">${f.family}</div>
      <div class="ap-font-cat">${f.category}</div>`;
    card.onclick = () => selectFont(f.family, f.category);
    grid.appendChild(card);
  });
}

function selectFont(family, category) {
  const fallback = category === 'monospace' ? 'monospace' :
                   (category === 'serif' || category === 'display') ? 'Georgia,serif' : 'system-ui,sans-serif';
  const ps = getPS(_activeFontPage);
  ps.fonts[_activeFontType] = { name: family, css: `'${family}',${fallback}` };
  // Aplicar si es la página actual
  if (_activeFontPage === PAGE_ID) applyFonts(ps.fonts);
  saveState();
  document.querySelectorAll('.ap-font-card').forEach(c => c.classList.toggle('active', c.dataset.family === family));
  syncFontBtnPreviews();
  showToast(`${_activeFontType}: ${family}`);
}

/* ━━ TEMA ━━ */
function selectTheme(themeId) {
  getPS(_activeThemePage).theme = themeId;
  if (_activeThemePage === PAGE_ID) applyTheme(themeId);
  saveState();
  document.querySelectorAll('.ap-theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === themeId));
  showToast(`Tema: ${themeId}`);
}

/* ━━ FONDO ━━ */
function updateColorSwatch(hex) {
  const s = document.getElementById('ap-color-swatch'); if(s) s.style.background = hex;
  const l = document.getElementById('ap-color-hex'); if(l) l.textContent = hex;
}
function applyColorBg(hex) {
  previewBg(_activeBgPage, { bgType:'color', bgValue:hex });
}
function buildGradient() {
  const c1 = document.getElementById('ap-grad-1')?.value||'#1e1428';
  const c2 = document.getElementById('ap-grad-2')?.value||'#2d1b4e';
  const c3 = document.getElementById('ap-grad-3')?.value||'#0c0a12';
  return _gradDir==='radial'
    ? `radial-gradient(ellipse at center,${c1} 0%,${c2} 50%,${c3} 100%)`
    : `linear-gradient(${_gradDir},${c1} 0%,${c2} 50%,${c3} 100%)`;
}
function updateGradPreview() { const p = document.getElementById('ap-grad-preview'); if(p) p.style.background = buildGradient(); }
function applyGradientBg() {
  previewBg(_activeBgPage, { bgType:'gradient', bgValue:buildGradient() });
}
function handlePhotoUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const opacity = parseInt(document.getElementById('ap-photo-opacity')?.value||70);
    const blur = parseInt(document.getElementById('ap-photo-blur')?.value||0);
    const thumb = document.getElementById('ap-photo-thumb');
    if (thumb) { thumb.src = e.target.result; thumb.style.display='block'; }
    document.getElementById('ap-photo-zone')?.classList.add('has-photo');
    previewBg(_activeBgPage, { bgType:'photo', bgValue:e.target.result, bgOpacity:opacity, bgBlur:blur });
  };
  reader.readAsDataURL(file);
}
function updatePhotoSettings() {
  const ps = getPS(_activeBgPage); if (ps.bgType !== 'photo') return;
  ps.bgOpacity = parseInt(document.getElementById('ap-photo-opacity')?.value||70);
  ps.bgBlur    = parseInt(document.getElementById('ap-photo-blur')?.value||0);
  if (_activeBgPage === PAGE_ID) applyBackground(ps); saveState();
}
async function generateAIBackground(prompt) {
  const btn = document.getElementById('ap-ai-gen-btn');
  const status = document.getElementById('ap-ai-status');
  if (btn) btn.disabled = true; if (status) status.textContent = 'Generando...';
  try {
    const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message:`Crea un fondo animado CSS/SVG para: "${prompt}". Solo HTML: <style>+<div> o <svg>. Position:fixed,inset:0,z-index:-1. Colores oscuros elegantes. Máx 50 líneas.` }) });
    const data = await res.json();
    const html = data.response || data.content || '';
    const grid = document.getElementById('ap-ai-results');
    if (grid && html) {
      grid.innerHTML = '';
      [html, html.replace(/#9333ea/g,'#2563eb'), html.replace(/#9333ea/g,'#059669')].forEach(v => {
        const card = document.createElement('div'); card.className = 'ap-ai-result-card';
        card.innerHTML = `<div class="ap-ai-preview">${v}</div><div class="ap-ai-apply-btn">Aplicar</div>`;
        card.querySelector('.ap-ai-apply-btn').onclick = () => {
          const ps = getPS(_activeBgPage); ps.bgType = 'ai'; ps.bgValue = v;
          if (_activeBgPage === PAGE_ID) applyBackground(ps); saveState(); showToast('Fondo IA aplicado ✦');
        };
        grid.appendChild(card);
      });
    }
  } catch(e) { if(status) status.textContent = 'Error, intenta de nuevo.'; }
  finally { if(btn) btn.disabled=false; if(status) setTimeout(()=>status.textContent='',3000); }
}

function applyOrbsBg() {
  const orbsBg = document.getElementById('ap-orbs-bg')?.value || '#0c0a12';
  const orbsConfig = {
    count:   parseInt(document.getElementById('ap-orbs-count')?.value || 4),
    blur:    parseInt(document.getElementById('ap-orbs-blur')?.value  || 80),
    opacity: parseFloat(document.getElementById('ap-orbs-opacity')?.value || 0.55),
    speed:   document.getElementById('ap-orbs-speed')?.value || 'slow',
    colors:  getOrbColors(),
  };
  previewBg(_activeBgPage, { bgType:'orbs', orbsBg, orbsConfig });
}

function getOrbColors() {
  const colors = [];
  document.querySelectorAll('.ap-orb-color-input').forEach(inp => colors.push(inp.value));
  return colors.length ? colors : ['#9b7ab8','#5a7aaa','#c8965a','#f4a7b9'];
}

function syncOrbColorInputs(count) {
  const container = document.getElementById('ap-orbs-colors');
  if (!container) return;
  const defaults = ['#9b7ab8','#5a7aaa','#c8965a','#f4a7b9','#7a9ab8','#a8b860'];
  const existing = [...container.querySelectorAll('.ap-orb-color-input')].map(i=>i.value);
  container.innerHTML = '';
  for (let i = 0; i < Math.min(count, 6); i++) {
    const wrap = document.createElement('div');
    wrap.className = 'ap-orb-color-wrap';
    const inp = document.createElement('input');
    inp.type = 'color';
    inp.className = 'ap-orb-color-input ap-color-wheel';
    inp.value = existing[i] || defaults[i] || '#9b7ab8';
    inp.style.cssText = 'width:40px;height:40px;';
    wrap.appendChild(inp);
    container.appendChild(wrap);
  }
}

async function previewOrbs() {
  const ps = getPS(_activeBgPage);
  const tempConfig = {
    count:   parseInt(document.getElementById('ap-orbs-count')?.value || 4),
    blur:    parseInt(document.getElementById('ap-orbs-blur')?.value  || 80),
    opacity: parseFloat(document.getElementById('ap-orbs-opacity')?.value || 0.55),
    speed:   document.getElementById('ap-orbs-speed')?.value || 'slow',
    colors:  getOrbColors(),
  };
  document.body.style.backgroundColor = document.getElementById('ap-orbs-bg')?.value || '#0c0a12';
  if (window.AndyOrbs) window.AndyOrbs.createOrbs(PAGE_ID, tempConfig);
}
/* ━━ SUPERFICIES ━━ */

const SURFACES = ['solid','glass','clay','neumorphism','flat','material','skeuomorphic','brutalist'];

function applySurface(pageId, surfaceId) {
  if (pageId !== PAGE_ID) return;
  document.documentElement.removeAttribute('data-surface');
  if (surfaceId && surfaceId !== 'solid') {
    document.documentElement.setAttribute('data-surface', surfaceId);
  }
}

function previewSurface(surfaceId) {
  document.documentElement.removeAttribute('data-surface');
  if (surfaceId && surfaceId !== 'solid') {
    document.documentElement.setAttribute('data-surface', surfaceId);
  }
  document.documentElement.setAttribute('data-surface-preview', surfaceId || 'solid');
  const confirm = document.getElementById('ap-surface-confirm');
  const cancel  = document.getElementById('ap-surface-cancel');
  if (confirm) confirm.style.display = 'flex';
  if (cancel)  cancel.style.display  = 'flex';
}

function confirmSurface() {
  const preview = document.documentElement.getAttribute('data-surface-preview');
  if (!preview) return;
  const ps = getPS(_activeSurfacePage);
  ps.surface = preview;
  document.documentElement.removeAttribute('data-surface-preview');
  applySurface(_activeSurfacePage, preview);
  saveState();
  showToast(`Superficie: ${preview}`);
  const confirm = document.getElementById('ap-surface-confirm');
  const cancel  = document.getElementById('ap-surface-cancel');
  if (confirm) confirm.style.display = 'none';
  if (cancel)  cancel.style.display  = 'none';
  syncSurfaceCards();
}

function cancelSurface() {
  document.documentElement.removeAttribute('data-surface-preview');
  const ps = getPS(_activeSurfacePage);
  applySurface(_activeSurfacePage, ps.surface || 'solid');
  const confirm = document.getElementById('ap-surface-confirm');
  const cancel  = document.getElementById('ap-surface-cancel');
  if (confirm) confirm.style.display = 'none';
  if (cancel)  cancel.style.display  = 'none';
  syncSurfaceCards();
}

function syncSurfaceCards() {
  const ps = getPS(_activeSurfacePage);
  const current = ps.surface || 'solid';
  document.querySelectorAll('.ap-surface-card').forEach(c =>
    c.classList.toggle('active', c.dataset.surface === current));
  document.querySelectorAll('#ap-surface-page-tabs .ap-page-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.page === _activeSurfacePage));
}

/* ━━ TOAST ━━ */
function showToast(msg) {
  let t = document.getElementById('andy-toast');
  if (!t) { t = document.createElement('div'); t.id='andy-toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000);
}

/* ━━ PREVIEW vs GUARDAR ━━ */
let _previewState = null;

function previewBg(pageId, changes) {
  _previewState = { pageId, ...changes };
  if (pageId === PAGE_ID) applyBackground({ ...getPS(pageId), ...changes });
  showPreviewBar();
}

function confirmPreview() {
  if (!_previewState) return;
  Object.assign(getPS(_previewState.pageId), _previewState);
  saveState(); _previewState = null;
  hidePreviewBar(); showToast('Guardado ✓');
}

function cancelPreview() {
  _previewState = null;
  applyBackground(getPS(PAGE_ID));
  hidePreviewBar(); showToast('Cancelado');
}

function showPreviewBar() {
  document.getElementById('andy-preview-bar')?.remove();
  const bar = document.createElement('div');
  bar.id = 'andy-preview-bar';
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(12,10,18,0.95);backdrop-filter:blur(12px);border-top:1px solid rgba(155,122,184,0.3);display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 20px;';
  bar.innerHTML = `
    <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.06em;color:rgba(180,140,220,.7);text-transform:uppercase;">Preview activo — ¿te gusta?</span>
    <button onclick="confirmPreview()" style="background:#9b7ab8;border:none;border-radius:8px;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:8px 18px;cursor:pointer;">Guardar ✓</button>
    <button onclick="cancelPreview()" style="background:none;border:1px solid rgba(180,140,220,.3);border-radius:8px;color:rgba(180,140,220,.7);font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:8px 14px;cursor:pointer;">Cancelar ✕</button>
  `;
  document.body.appendChild(bar);
}

function hidePreviewBar() {
  document.getElementById('andy-preview-bar')?.remove();
}

/* ━━ EXPORT / RESET ━━ */
function exportAppearance() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(AppState,null,2)],{type:'application/json'}));
  a.download = 'andynet-appearance.json'; a.click();
}
function resetAppearance() {
  if (!confirm('¿Resetear apariencia?')) return;
  localStorage.removeItem(STORAGE_KEY); location.reload();
}

/* ━━ BUILD PANEL ━━ */
function buildPanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;

  panel.addEventListener('click', e => { if(e.target===panel) closePanel(); });

  /* Tabs principales */
  panel.querySelectorAll('.ap-main-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-main-tab').forEach(b=>b.classList.remove('active'));
      panel.querySelectorAll('.ap-tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelector(`.ap-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
    };
  });

  /* ── TIPOGRAFÍA ── */

  // Página
  panel.querySelectorAll('#ap-font-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('#ap-font-page-tabs .ap-page-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      _activeFontPage = btn.dataset.page;
      syncFontBtnPreviews();
      loadFontGrid(document.getElementById('ap-font-search')?.value||'',
                   document.querySelector('.ap-filter-btn.active')?.dataset.cat||'all');
    };
  });

  // Tipo de texto
  panel.querySelectorAll('.ap-font-type-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-font-type-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      _activeFontType = btn.dataset.type;
      syncFontBtnPreviews();
      loadFontGrid(document.getElementById('ap-font-search')?.value||'',
                   document.querySelector('.ap-filter-btn.active')?.dataset.cat||'all');
    };
  });

  // Búsqueda
  document.getElementById('ap-font-search')?.addEventListener('input', function() {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      loadFontGrid(this.value, document.querySelector('.ap-filter-btn.active')?.dataset.cat||'all');
    }, 350);
  });

  // Filtros
  panel.querySelectorAll('.ap-filter-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadFontGrid(document.getElementById('ap-font-search')?.value||'', btn.dataset.cat);
    };
  });

  /* ── FONDO ── */

  // Página
  panel.querySelectorAll('#ap-bg-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('#ap-bg-page-tabs .ap-page-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      _activeBgPage = btn.dataset.page;
      const ps = getPS(_activeBgPage);
      const bgType = ps.bgType||'color';
      panel.querySelectorAll('.ap-bg-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===bgType));
      panel.querySelectorAll('.ap-bg-panel').forEach(p=>p.classList.toggle('active',p.dataset.type===bgType));
      if (bgType==='color') { const pk=document.getElementById('ap-color-picker'); if(pk){pk.value=ps.bgValue||'#0c0a12';updateColorSwatch(pk.value);} }
    };
  });

  // Tipo de fondo
  panel.querySelectorAll('.ap-bg-type-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-bg-type-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelectorAll('.ap-bg-panel').forEach(p=>p.classList.remove('active'));
      panel.querySelector(`.ap-bg-panel[data-type="${btn.dataset.type}"]`)?.classList.add('active');
      if (btn.dataset.type === 'orbs') {
        const ps = getPS(_activeBgPage);
        const inp = document.getElementById('ap-orbs-bg');
        if (inp) inp.value = ps.orbsBg || '#0c0a12';
        syncOrbColorInputs(parseInt(document.getElementById('ap-orbs-count')?.value||4));
      }
    };
  });

  document.getElementById('ap-color-picker')?.addEventListener('input', function() {
    updateColorSwatch(this.value); applyColorBg(this.value);
  });
  ['ap-grad-1','ap-grad-2','ap-grad-3'].forEach(id => document.getElementById(id)?.addEventListener('input',updateGradPreview));
  panel.querySelectorAll('.ap-grad-dir-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-grad-dir-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); _gradDir=btn.dataset.dir; updateGradPreview();
    };
  });
  document.getElementById('ap-grad-apply')?.addEventListener('click', applyGradientBg);

  // Orbes
  document.getElementById('ap-orbs-count')?.addEventListener('input', function() {
    document.getElementById('ap-orbs-count-val').textContent = this.value;
    syncOrbColorInputs(parseInt(this.value));
  });
  document.getElementById('ap-orbs-blur')?.addEventListener('input', function() {
    document.getElementById('ap-orbs-blur-val').textContent = this.value+'px';
  });
  document.getElementById('ap-orbs-opacity')?.addEventListener('input', function() {
    document.getElementById('ap-orbs-opacity-val').textContent = Math.round(this.value*100)+'%';
  });
  document.getElementById('ap-orbs-preview-btn')?.addEventListener('click', previewOrbs);
  document.getElementById('ap-orbs-apply-btn')?.addEventListener('click', applyOrbsBg);
  syncOrbColorInputs(4);

  const zone=document.getElementById('ap-photo-zone'), inp=document.getElementById('ap-photo-input');
  if (zone&&inp) {
    zone.onclick=()=>inp.click();
    zone.ondragover=e=>{e.preventDefault();zone.classList.add('drag');};
    zone.ondragleave=()=>zone.classList.remove('drag');
    zone.ondrop=e=>{e.preventDefault();zone.classList.remove('drag');handlePhotoUpload(e.dataTransfer.files[0]);};
    inp.onchange=()=>handlePhotoUpload(inp.files[0]);
  }
  document.getElementById('ap-photo-opacity')?.addEventListener('input',function(){document.getElementById('ap-opacity-val').textContent=this.value+'%';updatePhotoSettings();});
  document.getElementById('ap-photo-blur')?.addEventListener('input',function(){document.getElementById('ap-blur-val').textContent=this.value+'px';updatePhotoSettings();});

  panel.querySelectorAll('.ap-ai-preset').forEach(btn=>{btn.onclick=()=>{const i=document.getElementById('ap-ai-prompt');if(i)i.value=btn.dataset.prompt;};});
  document.getElementById('ap-ai-gen-btn')?.addEventListener('click',()=>{const p=document.getElementById('ap-ai-prompt')?.value;if(p)generateAIBackground(p);});

  /* ── TEMA ── */
  panel.querySelectorAll('#ap-theme-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('#ap-theme-page-tabs .ap-page-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      _activeThemePage = btn.dataset.page;
      const ps = getPS(_activeThemePage);
      panel.querySelectorAll('.ap-theme-card').forEach(c=>c.classList.toggle('active',c.dataset.theme===(ps.theme||'nocturne')));
    };
  });
  panel.querySelectorAll('.ap-theme-card').forEach(c=>{c.onclick=()=>selectTheme(c.dataset.theme);});

  /* ── SUPERFICIE ── */
  panel.querySelectorAll('#ap-surface-page-tabs .ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('#ap-surface-page-tabs .ap-page-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeSurfacePage = btn.dataset.page;
      cancelSurface();
      syncSurfaceCards();
    };
  });
  panel.querySelectorAll('.ap-surface-card').forEach(card => {
    card.onclick = () => previewSurface(card.dataset.surface);
  });
  document.getElementById('ap-surface-confirm')?.addEventListener('click', confirmSurface);
  document.getElementById('ap-surface-cancel')?.addEventListener('click', cancelSurface);

  /* Expandir / export / reset */
  document.getElementById('ap-expand-btn')?.addEventListener('click',toggleExpand);
  document.getElementById('ap-export-btn')?.addEventListener('click',exportAppearance);
  document.getElementById('ap-reset-btn')?.addEventListener('click',resetAppearance);

  updateGradPreview();
  syncPanel();
}

/* ━━ INIT ━━ */
document.addEventListener('DOMContentLoaded', () => {
  loadState(); applyAll();
  document.querySelectorAll('[data-open-appearance], #settingsBtn, .settings-btn').forEach(btn => {
    btn.addEventListener('click', openPanel);
  });
});

window._onAppearancePanelLoaded = function() {
  buildPanel();
  loadFontGrid('', 'all');
};
