/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APPEARANCE.JS — Andy.net v3
   Sistema de personalización completo
   Fuentes, fondos, temas por página
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GFONTS_KEY = 'AIzaSyAvnT97F7A73UBhB3OYClMs6RyjUpHbrAY';
const STORAGE_KEY = 'andynet_appearance';

/* ── Página actual ── */
const PAGE_ID = (() => {
  const p = location.pathname.split('/').pop().replace('.html','');
  return p || 'index';
})();

/* ── Estado global ── */
const AppState = {
  fonts: {
    display: { name: 'DM Serif Display', css: "'DM Serif Display', Georgia, serif" },
    ui:      { name: 'Inter',            css: "'Inter', system-ui, sans-serif" },
    mono:    { name: 'IBM Plex Mono',    css: "'IBM Plex Mono', monospace" },
    body:    { name: 'Inter',            css: "'Inter', system-ui, sans-serif" },
  },
  pages: {
    index:  { bgType: 'color', bgValue: '#0c0a12', theme: 'nocturne' },
    hub:    { bgType: 'color', bgValue: '#0c0a12', theme: 'nocturne' },
    studio: { bgType: 'color', bgValue: '#0c0a12', theme: 'nocturne' },
    muse:   { bgType: 'color', bgValue: '#0c0a12', theme: 'nocturne' },
  }
};

/* ── Temas ── */
const THEMES = {
  nocturne: {
    '--bg':'#0c0a12','--s1':'#120f1a','--s2':'#1a1625','--s3':'#241e30','--s4':'#2d253b',
    '--border':'rgba(180,140,220,0.08)','--bord2':'rgba(180,140,220,0.18)','--bord3':'rgba(180,140,220,0.30)',
    '--text':'#d4cfe0','--text2':'#ede5f5','--muted':'#5a4f70','--muted2':'#8a7a9a','--muted3':'#9a8aaa',
    '--hub':'#5a7aaa','--studio':'#c8965a','--muse':'#9b7ab8','--self':'#f4a7b9',
  },
  soleil: {
    '--bg':'#f5f0e8','--s1':'#ede8df','--s2':'#e4ddd3','--s3':'#d9d1c4','--s4':'#cec5b6',
    '--border':'rgba(192,180,204,0.35)','--bord2':'rgba(192,180,204,0.6)','--bord3':'rgba(192,180,204,0.85)',
    '--text':'#3a3430','--text2':'#1e1a16','--muted':'#9a8f80','--muted2':'#7a6f62','--muted3':'#6a5f54',
    '--hub':'#4f85e8','--studio':'#c0a050','--muse':'#9b7ab8','--self':'#e8a0a8',
  },
  botanical: {
    '--bg':'#0a120d','--s1':'#0f1a12','--s2':'#162018','--s3':'#1e2d20','--s4':'#263828',
    '--border':'rgba(100,180,120,0.10)','--bord2':'rgba(100,180,120,0.20)','--bord3':'rgba(100,180,120,0.35)',
    '--text':'#c8d8c0','--text2':'#e0f0d8','--muted':'#4a6a50','--muted2':'#6a8a70','--muted3':'#8aaa88',
    '--hub':'#5a9a70','--studio':'#a8b860','--muse':'#7a9ab8','--self':'#d8a8b0',
  },
  ambar: {
    '--bg':'#120a06','--s1':'#1a1008','--s2':'#22160a','--s3':'#2e1e0e','--s4':'#3a2814',
    '--border':'rgba(220,160,80,0.10)','--bord2':'rgba(220,160,80,0.20)','--bord3':'rgba(220,160,80,0.35)',
    '--text':'#e0d0b8','--text2':'#f0e0c8','--muted':'#6a5030','--muted2':'#9a7848','--muted3':'#baa068',
    '--hub':'#9a8860','--studio':'#d4a050','--muse':'#b07888','--self':'#e8b090',
  },
  editorial: {
    '--bg':'#f0eeec','--s1':'#e8e5e0','--s2':'#dedad4','--s3':'#d0ccc4','--s4':'#c4beb6',
    '--border':'rgba(80,70,60,0.12)','--bord2':'rgba(80,70,60,0.22)','--bord3':'rgba(80,70,60,0.38)',
    '--text':'#2a2420','--text2':'#100c08','--muted':'#8a8078','--muted2':'#6a6058','--muted3':'#4a4038',
    '--hub':'#4060b0','--studio':'#906820','--muse':'#7050a0','--self':'#b04060',
  },
};

/* ━━━━━━━━━━━━━━━━━━━━
   PERSISTENCIA
━━━━━━━━━━━━━━━━━━━━ */

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    if (saved.fonts) Object.assign(AppState.fonts, saved.fonts);
    if (saved.pages) {
      Object.keys(saved.pages).forEach(p => {
        if (AppState.pages[p]) Object.assign(AppState.pages[p], saved.pages[p]);
        else AppState.pages[p] = saved.pages[p];
      });
    }
  } catch(e) {}
}

/* ━━━━━━━━━━━━━━━━━━━━
   APLICAR ESTILOS
━━━━━━━━━━━━━━━━━━━━ */

function applyAll() {
  applyFonts();
  applyPageStyle(PAGE_ID);
}

function applyFonts() {
  const r = document.documentElement;
  r.style.setProperty('--serif',      AppState.fonts.display.css);
  r.style.setProperty('--font-display', AppState.fonts.display.css);
  r.style.setProperty('--sans',       AppState.fonts.ui.css);
  r.style.setProperty('--font-ui',    AppState.fonts.ui.css);
  r.style.setProperty('--mono',       AppState.fonts.mono.css);
  r.style.setProperty('--font-mono',  AppState.fonts.mono.css);
  r.style.setProperty('--font-body',  AppState.fonts.body.css);
  loadGoogleFont(AppState.fonts.display.name);
  loadGoogleFont(AppState.fonts.ui.name);
  loadGoogleFont(AppState.fonts.mono.name);
  loadGoogleFont(AppState.fonts.body.name);
}

function applyPageStyle(pageId) {
  const ps = AppState.pages[pageId];
  if (!ps) return;
  applyTheme(ps.theme || 'nocturne');
  applyBackground(ps);
}

function applyTheme(themeId) {
  const t = THEMES[themeId];
  if (!t) return;
  const r = document.documentElement;
  Object.entries(t).forEach(([k,v]) => r.style.setProperty(k, v));
}

function applyBackground(ps) {
  const body = document.body;
  // Limpiar fondo anterior
  body.style.backgroundImage = '';
  body.style.backgroundColor = '';
  const bgLayer = document.getElementById('andy-bg-layer');
  if (bgLayer) bgLayer.remove();

  switch(ps.bgType) {
    case 'color':
      body.style.backgroundColor = ps.bgValue || '#0c0a12';
      break;
    case 'gradient':
      body.style.backgroundImage = ps.bgValue;
      body.style.backgroundAttachment = 'fixed';
      break;
    case 'photo':
      const layer = createBgLayer();
      layer.style.backgroundImage = `url(${ps.bgValue})`;
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = 'center';
      layer.style.opacity = (ps.bgOpacity || 70) / 100;
      layer.style.filter = `blur(${ps.bgBlur || 0}px)`;
      break;
    case 'ai':
      const aiLayer = createBgLayer();
      aiLayer.innerHTML = ps.bgValue || '';
      break;
  }
}

function createBgLayer() {
  const layer = document.createElement('div');
  layer.id = 'andy-bg-layer';
  layer.style.cssText = `
    position:fixed;inset:0;z-index:-1;
    pointer-events:none;
  `;
  document.body.prepend(layer);
  return layer;
}

/* ━━━━━━━━━━━━━━━━━━━━
   GOOGLE FONTS
━━━━━━━━━━━━━━━━━━━━ */

const _loadedFonts = new Set();

function loadGoogleFont(name) {
  if (!name || _loadedFonts.has(name)) return;
  _loadedFonts.add(name);
  const encoded = name.replace(/ /g, '+');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap`;
  document.head.appendChild(link);
}

let _allFonts = [];
let _fontsLoaded = false;

async function fetchAllFonts() {
  if (_fontsLoaded) return _allFonts;
  try {
    const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GFONTS_KEY}&sort=popularity`);
    const data = await res.json();
    _allFonts = data.items || [];
    _fontsLoaded = true;
    return _allFonts;
  } catch(e) {
    console.warn('Google Fonts API error:', e);
    return [];
  }
}

async function searchFonts(query, category = 'all') {
  const all = await fetchAllFonts();
  return all.filter(f => {
    const matchQuery = !query || f.family.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === 'all' || f.category === category;
    return matchQuery && matchCat;
  }).slice(0, 60);
}

/* ━━━━━━━━━━━━━━━━━━━━
   PANEL UI
━━━━━━━━━━━━━━━━━━━━ */

let _panelOpen = false;
let _activeFontType = 'display';
let _activeBgType = 'color';
let _activePageId = PAGE_ID;
let _gradDir = '135deg';
let _fontSearchTimeout = null;

function openPanel() {
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;
  _panelOpen = true;
  panel.classList.add('open');
  syncPanelToState();
  loadFontGrid(_activeFontType, '');
}

function closePanel() {
  _panelOpen = false;
  document.getElementById('andy-appearance-panel')?.classList.remove('open');
}

function syncPanelToState() {
  // Sincronizar página activa
  const ps = AppState.pages[_activePageId] || AppState.pages[PAGE_ID];

  // Tabs de página
  document.querySelectorAll('.ap-page-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === _activePageId);
  });

  // Tipo de fondo
  _activeBgType = ps.bgType || 'color';
  document.querySelectorAll('.ap-bg-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === _activeBgType);
  });
  document.querySelectorAll('.ap-bg-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.type === _activeBgType);
  });

  // Tema
  document.querySelectorAll('.ap-theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === (ps.theme || 'nocturne'));
  });

  // Color picker
  if (ps.bgType === 'color') {
    const picker = document.getElementById('ap-color-picker');
    if (picker) picker.value = ps.bgValue || '#0c0a12';
    updateColorSwatch(ps.bgValue || '#0c0a12');
  }

  // Font type activo
  document.querySelectorAll('.ap-font-type-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === _activeFontType);
  });
}

/* ── Font Grid ── */
async function loadFontGrid(type, query, category = 'all') {
  _activeFontType = type;
  const grid = document.getElementById('ap-font-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="ap-font-loading">Cargando fuentes...</div>';

  const fonts = await searchFonts(query, category);
  const current = AppState.fonts[type]?.name;

  grid.innerHTML = '';
  fonts.forEach(f => {
    loadGoogleFont(f.family);
    const card = document.createElement('div');
    card.className = 'ap-font-card' + (f.family === current ? ' active' : '');
    card.dataset.family = f.family;
    card.innerHTML = `
      <div class="ap-font-sample" style="font-family:'${f.family}',serif">Aa</div>
      <div class="ap-font-name">${f.family}</div>
      <div class="ap-font-cat">${f.category}</div>
    `;
    card.onclick = () => selectFont(type, f.family);
    grid.appendChild(card);
  });
}

function selectFont(type, family) {
  AppState.fonts[type] = {
    name: family,
    css: `'${family}', ${getFontFallback(family)}`
  };
  applyFonts();
  saveState();
  // Actualizar UI
  document.querySelectorAll('.ap-font-card').forEach(c => {
    c.classList.toggle('active', c.dataset.family === family);
  });
  // Preview en el tab
  const tab = document.querySelector(`.ap-font-type-tab[data-type="${type}"]`);
  if (tab) {
    const preview = tab.querySelector('.ap-font-type-preview');
    if (preview) {
      preview.style.fontFamily = `'${family}', serif`;
      preview.textContent = family;
    }
  }
}

function getFontFallback(family) {
  const name = family.toLowerCase();
  if (name.includes('mono') || name.includes('code') || name.includes('courier')) return 'monospace';
  if (name.includes('serif') || name.includes('garamond') || name.includes('baskerville') ||
      name.includes('georgia') || name.includes('times')) return 'Georgia, serif';
  return 'system-ui, sans-serif';
}

/* ── Tema ── */
function selectTheme(themeId) {
  if (!AppState.pages[_activePageId]) AppState.pages[_activePageId] = {};
  AppState.pages[_activePageId].theme = themeId;
  applyTheme(themeId);
  saveState();
  document.querySelectorAll('.ap-theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === themeId);
  });
}

/* ── Fondo: color ── */
function updateColorSwatch(hex) {
  const swatch = document.getElementById('ap-color-swatch');
  const hexLabel = document.getElementById('ap-color-hex');
  if (swatch) swatch.style.background = hex;
  if (hexLabel) hexLabel.textContent = hex;
}

function applyColorBg(hex) {
  if (!AppState.pages[_activePageId]) AppState.pages[_activePageId] = {};
  AppState.pages[_activePageId].bgType = 'color';
  AppState.pages[_activePageId].bgValue = hex;
  if (_activePageId === PAGE_ID) applyBackground(AppState.pages[_activePageId]);
  saveState();
  updateColorSwatch(hex);
}

/* ── Fondo: gradiente ── */
function buildGradient() {
  const c1 = document.getElementById('ap-grad-1')?.value || '#1e1428';
  const c2 = document.getElementById('ap-grad-2')?.value || '#2d1b4e';
  const c3 = document.getElementById('ap-grad-3')?.value || '#0c0a12';
  if (_gradDir === 'radial') {
    return `radial-gradient(ellipse at center, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
  }
  return `linear-gradient(${_gradDir}, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
}

function updateGradPreview() {
  const preview = document.getElementById('ap-grad-preview');
  if (preview) preview.style.background = buildGradient();
}

function applyGradientBg() {
  const grad = buildGradient();
  if (!AppState.pages[_activePageId]) AppState.pages[_activePageId] = {};
  AppState.pages[_activePageId].bgType = 'gradient';
  AppState.pages[_activePageId].bgValue = grad;
  if (_activePageId === PAGE_ID) applyBackground(AppState.pages[_activePageId]);
  saveState();
}

/* ── Fondo: foto ── */
function handlePhotoUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    const opacity = document.getElementById('ap-photo-opacity')?.value || 70;
    const blur = document.getElementById('ap-photo-blur')?.value || 0;
    if (!AppState.pages[_activePageId]) AppState.pages[_activePageId] = {};
    AppState.pages[_activePageId].bgType = 'photo';
    AppState.pages[_activePageId].bgValue = dataUrl;
    AppState.pages[_activePageId].bgOpacity = parseInt(opacity);
    AppState.pages[_activePageId].bgBlur = parseInt(blur);
    if (_activePageId === PAGE_ID) applyBackground(AppState.pages[_activePageId]);
    saveState();
    // Preview thumbnail
    const thumb = document.getElementById('ap-photo-thumb');
    if (thumb) { thumb.src = dataUrl; thumb.style.display = 'block'; }
    document.getElementById('ap-photo-zone')?.classList.add('has-photo');
  };
  reader.readAsDataURL(file);
}

function updatePhotoSettings() {
  const ps = AppState.pages[_activePageId];
  if (!ps || ps.bgType !== 'photo') return;
  ps.bgOpacity = parseInt(document.getElementById('ap-photo-opacity')?.value || 70);
  ps.bgBlur = parseInt(document.getElementById('ap-photo-blur')?.value || 0);
  if (_activePageId === PAGE_ID) applyBackground(ps);
  saveState();
}

/* ── Fondo: IA ── */
async function generateAIBackground(prompt) {
  const btn = document.getElementById('ap-ai-gen-btn');
  const status = document.getElementById('ap-ai-status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Eres un experto en CSS y SVG. Crea un fondo animado para una app web basándote en esta descripción: "${prompt}".
        
        Responde SOLO con un bloque de HTML que contenga:
        1. Un <style> con animaciones CSS
        2. Un <div> o <svg> con el efecto visual
        
        El elemento debe tener position:absolute, inset:0, width:100%, height:100%, z-index:-1.
        Los colores deben ser oscuros y elegantes, paleta morada/azul oscuro por defecto.
        Máximo 50 líneas de código. Solo el HTML, sin explicaciones.`,
        system: 'Eres un generador de fondos CSS/SVG. Solo responde con código HTML limpio.'
      })
    });
    const data = await response.json();
    const html = data.response || data.content || '';

    // Mostrar opciones generadas
    const grid = document.getElementById('ap-ai-results');
    if (grid && html) {
      grid.innerHTML = '';
      // Generar 3 variaciones
      [html, html.replace(/#9333ea/g,'#2563eb').replace(/#7c3aed/g,'#1d4ed8'),
             html.replace(/#9333ea/g,'#059669').replace(/#7c3aed/g,'#065f46')]
      .forEach((variant, i) => {
        const card = document.createElement('div');
        card.className = 'ap-ai-result-card';
        card.innerHTML = `<div class="ap-ai-preview">${variant}</div><div class="ap-ai-apply-btn">Aplicar</div>`;
        card.querySelector('.ap-ai-apply-btn').onclick = () => {
          if (!AppState.pages[_activePageId]) AppState.pages[_activePageId] = {};
          AppState.pages[_activePageId].bgType = 'ai';
          AppState.pages[_activePageId].bgValue = variant;
          if (_activePageId === PAGE_ID) applyBackground(AppState.pages[_activePageId]);
          saveState();
          showToast('Fondo IA aplicado ✦');
        };
        grid.appendChild(card);
      });
    }
  } catch(e) {
    if (status) status.textContent = 'Error al generar. Intenta de nuevo.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
  }
}

/* ── Toast ── */
function showToast(msg) {
  let toast = document.getElementById('andy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'andy-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ── Exportar / Resetear ── */
function exportAppearance() {
  const json = JSON.stringify(AppState, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'andynet-appearance.json';
  a.click();
}

function resetAppearance() {
  if (!confirm('¿Resetear toda la apariencia a los valores por defecto?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

/* ━━━━━━━━━━━━━━━━━━━━
   INIT
━━━━━━━━━━━━━━━━━━━━ */

function initAppearance() {
  loadState();
  applyAll();
  buildPanel();
}

function buildPanel() {
  // El panel HTML ya debe estar en el DOM (appearance-panel.html incluido)
  // Solo bindeamos eventos
  const panel = document.getElementById('andy-appearance-panel');
  if (!panel) return;

  // Cerrar al hacer clic afuera
  panel.addEventListener('click', e => {
    if (e.target === panel) closePanel();
  });

  // Tabs principales
  panel.querySelectorAll('.ap-main-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-main-tab').forEach(b => b.classList.remove('active'));
      panel.querySelectorAll('.ap-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.querySelector(`.ap-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
    };
  });

  // Tabs de página
  panel.querySelectorAll('.ap-page-tab').forEach(btn => {
    btn.onclick = () => {
      _activePageId = btn.dataset.page;
      panel.querySelectorAll('.ap-page-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      syncPanelToState();
    };
  });

  // Tipos de fuente
  panel.querySelectorAll('.ap-font-type-tab').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-font-type-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeFontType = btn.dataset.type;
      const query = document.getElementById('ap-font-search')?.value || '';
      const cat = document.getElementById('ap-font-cat')?.value || 'all';
      loadFontGrid(_activeFontType, query, cat);
    };
  });

  // Búsqueda de fuentes
  const fontSearch = document.getElementById('ap-font-search');
  if (fontSearch) {
    fontSearch.oninput = () => {
      clearTimeout(_fontSearchTimeout);
      _fontSearchTimeout = setTimeout(() => {
        const cat = document.getElementById('ap-font-cat')?.value || 'all';
        loadFontGrid(_activeFontType, fontSearch.value, cat);
      }, 350);
    };
  }

  // Filtro por categoría
  const fontCat = document.getElementById('ap-font-cat');
  if (fontCat) {
    fontCat.onchange = () => {
      const q = document.getElementById('ap-font-search')?.value || '';
      loadFontGrid(_activeFontType, q, fontCat.value);
    };
  }

  // Tipo de fondo
  panel.querySelectorAll('.ap-bg-type-btn').forEach(btn => {
    btn.onclick = () => {
      panel.querySelectorAll('.ap-bg-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeBgType = btn.dataset.type;
      panel.querySelectorAll('.ap-bg-panel').forEach(p => p.classList.remove('active'));
      panel.querySelector(`.ap-bg-panel[data-type="${_activeBgType}"]`)?.classList.add('active');
    };
  });

  // Color picker
  const colorPicker = document.getElementById('ap-color-picker');
  if (colorPicker) {
    colorPicker.oninput = () => {
      updateColorSwatch(colorPicker.value);
      applyColorBg(colorPicker.value);
    };
  }

  // Gradiente
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
  document.getElementById('ap-grad-apply')?.addEventListener('click', applyGradientBg);

  // Foto
  const photoZone = document.getElementById('ap-photo-zone');
  const photoInput = document.getElementById('ap-photo-input');
  if (photoZone && photoInput) {
    photoZone.onclick = () => photoInput.click();
    photoZone.ondragover = e => { e.preventDefault(); photoZone.classList.add('drag'); };
    photoZone.ondragleave = () => photoZone.classList.remove('drag');
    photoZone.ondrop = e => {
      e.preventDefault();
      photoZone.classList.remove('drag');
      handlePhotoUpload(e.dataTransfer.files[0]);
    };
    photoInput.onchange = () => handlePhotoUpload(photoInput.files[0]);
  }
  document.getElementById('ap-photo-opacity')?.addEventListener('input', function() {
    document.getElementById('ap-opacity-val').textContent = this.value + '%';
    updatePhotoSettings();
  });
  document.getElementById('ap-photo-blur')?.addEventListener('input', function() {
    document.getElementById('ap-blur-val').textContent = this.value + 'px';
    updatePhotoSettings();
  });

  // IA presets
  panel.querySelectorAll('.ap-ai-preset').forEach(btn => {
    btn.onclick = () => {
      const input = document.getElementById('ap-ai-prompt');
      if (input) input.value = btn.dataset.prompt;
    };
  });
  document.getElementById('ap-ai-gen-btn')?.addEventListener('click', () => {
    const prompt = document.getElementById('ap-ai-prompt')?.value;
    if (prompt) generateAIBackground(prompt);
  });

  // Temas
  panel.querySelectorAll('.ap-theme-card').forEach(card => {
    card.onclick = () => selectTheme(card.dataset.theme);
  });

  // Export / Reset
  document.getElementById('ap-export-btn')?.addEventListener('click', exportAppearance);
  document.getElementById('ap-reset-btn')?.addEventListener('click', resetAppearance);

  updateGradPreview();
}

// Botón de apertura del panel (desde cualquier página)
document.addEventListener('DOMContentLoaded', () => {
  initAppearance();
  // Bind al botón de settings si existe
  document.querySelectorAll('[data-open-appearance], #settingsBtn, .settings-btn').forEach(btn => {
    btn.addEventListener('click', openPanel);
  });
});
