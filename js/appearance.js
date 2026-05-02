/* ANDY.NET APPEARANCE V4
   - Tipografía por página
   - Fondo por página
   - Efectos por página
   - Tema por página
   - Superficie global
   - Preview temporal con Guardar / Cancelar
   - Preview expandido por iframe
*/

(() => {
  const STORAGE_KEY = "andynetv4appearance";
  const GFONTS_KEY = "AIzaSyAvnT97F7A73UBhB3OYClMs6RyjUpHbrAY";
  const PAGE_IDS = ["index", "hub", "studio", "muse"];
  const FONT_ROLES = ["display", "subtitle", "ui", "body", "mono"];
  const SURFACES = ["glass", "skeuomorphic", "neumorphism"];
  const EFFECTS = ["none", "bubbles", "constellation", "aurora", "particles", "mist"];

  const PAGE_ID = (() => {
    const p = location.pathname.split("/").pop().replace(".html", "");
    return PAGE_IDS.includes(p) ? p : "index";
  })();

  const FONT_DEFAULTS = {
    display: { name: "DM Serif Display", css: `"DM Serif Display", Georgia, serif` },
    subtitle: { name: "DM Serif Display", css: `"DM Serif Display", Georgia, serif` },
    ui: { name: "Inter", css: `Inter, system-ui, sans-serif` },
    body: { name: "Inter", css: `Inter, system-ui, sans-serif` },
    mono: { name: "IBM Plex Mono", css: `"IBM Plex Mono", monospace` }
  };

  const MUSE_FONT_DEFAULTS = {
    ...FONT_DEFAULTS,
    display: { name: "Amarante", css: `Amarante, Georgia, serif` }
  };

  const THEMES = {
    nocturne: {
      "--bg": "#0c0a12",
      "--s1": "#120f1a",
      "--s2": "#1a1625",
      "--s3": "#241e30",
      "--s4": "#2d253b",
      "--border": "rgba(180,140,220,0.08)",
      "--border2": "rgba(180,140,220,0.18)",
      "--border3": "rgba(180,140,220,0.30)",
      "--text": "#d4cfe0",
      "--text2": "#ede5f5",
      "--muted": "#5a4f70",
      "--muted2": "#8a7a9a",
      "--muted3": "#9a8aaa",
      "--hub": "#5a7aaa",
      "--studio": "#c8965a",
      "--muse": "#9b7ab8",
      "--self": "#f4a7b9"
    },
    soleil: {
      "--bg": "#f5f0e8",
      "--s1": "#ede8df",
      "--s2": "#e4ddd3",
      "--s3": "#d9d1c4",
      "--s4": "#cec5b6",
      "--border": "rgba(192,180,204,0.35)",
      "--border2": "rgba(192,180,204,0.60)",
      "--border3": "rgba(192,180,204,0.85)",
      "--text": "#3a3430",
      "--text2": "#1e1a16",
      "--muted": "#9a8f80",
      "--muted2": "#7a6f62",
      "--muted3": "#6a5f54",
      "--hub": "#4f85e8",
      "--studio": "#c0a050",
      "--muse": "#9b7ab8",
      "--self": "#e8a0a8"
    },
    botanical: {
      "--bg": "#0a120d",
      "--s1": "#0f1a12",
      "--s2": "#162018",
      "--s3": "#1e2d20",
      "--s4": "#263828",
      "--border": "rgba(100,180,120,0.10)",
      "--border2": "rgba(100,180,120,0.20)",
      "--border3": "rgba(100,180,120,0.35)",
      "--text": "#c8d8c0",
      "--text2": "#e0f0d8",
      "--muted": "#4a6a50",
      "--muted2": "#6a8a70",
      "--muted3": "#8aaa88",
      "--hub": "#5a9a70",
      "--studio": "#a8b860",
      "--muse": "#7a9ab8",
      "--self": "#d8a8b0"
    },
    ambar: {
      "--bg": "#120a06",
      "--s1": "#1a1008",
      "--s2": "#22160a",
      "--s3": "#2e1e0e",
      "--s4": "#3a2814",
      "--border": "rgba(220,160,80,0.10)",
      "--border2": "rgba(220,160,80,0.20)",
      "--border3": "rgba(220,160,80,0.35)",
      "--text": "#e0d0b8",
      "--text2": "#f0e0c8",
      "--muted": "#6a5030",
      "--muted2": "#9a7848",
      "--muted3": "#baa068",
      "--hub": "#9a8860",
      "--studio": "#d4a050",
      "--muse": "#b07888",
      "--self": "#e8b090"
    },
    editorial: {
      "--bg": "#f0eeec",
      "--s1": "#e8e5e0",
      "--s2": "#dedad4",
      "--s3": "#d0ccc4",
      "--s4": "#c4beb6",
      "--border": "rgba(80,70,60,0.12)",
      "--border2": "rgba(80,70,60,0.22)",
      "--border3": "rgba(80,70,60,0.38)",
      "--text": "#2a2420",
      "--text2": "#100c08",
      "--muted": "#8a8078",
      "--muted2": "#6a6058",
      "--muted3": "#4a4038",
      "--hub": "#4060b0",
      "--studio": "#906820",
      "--muse": "#7050a0",
      "--self": "#b04060"
    }
  };

  const EFFECT_PRESETS = {
    bubbles: {
      intensity: 50,
      speed: "slow",
      colors: ["#9b7ab8", "#5a7aaa", "#c8965a", "#f4a7b9"]
    },
    constellation: {
      intensity: 45,
      speed: "slow",
      colors: ["rgba(255,255,255,.55)", "rgba(155,122,184,.35)"]
    },
    aurora: {
      intensity: 60,
      speed: "slow",
      colors: ["#7c5cff", "#4fc3f7", "#7be495"]
    },
    particles: {
      intensity: 55,
      speed: "medium",
      colors: ["rgba(255,220,160,.8)", "rgba(255,255,255,.35)"]
    },
    mist: {
      intensity: 40,
      speed: "slow",
      colors: ["rgba(255,255,255,.06)", "rgba(155,122,184,.08)"]
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function makePageDefault(pageId) {
    return {
      theme: "nocturne",
      background: {
        type: "color",
        value: "#0c0a12",
        opacity: 70,
        blur: 0
      },
      effect: {
        type: "none",
        config: {}
      },
      fonts: clone(pageId === "muse" ? MUSE_FONT_DEFAULTS : FONT_DEFAULTS)
    };
  }

  function makeDefaultState() {
    return {
      system: {
        surface: "glass"
      },
      pages: {
        index: makePageDefault("index"),
        hub: makePageDefault("hub"),
        studio: makePageDefault("studio"),
        muse: makePageDefault("muse")
      }
    };
  }

  let AppState = makeDefaultState();
  let PreviewState = null;

  let expanded = false;
  let previewIframe = null;

  let activeFontPage = PAGE_ID;
  let activeBgPage = PAGE_ID;
  let activeFxPage = PAGE_ID;
  let activeThemePage = PAGE_ID;
  let activeFontRole = "display";
  let gradientDir = "135deg";
  let searchTimer = null;

  const loadedFonts = new Set();
  let allFonts = [];
  let fontsReady = false;

  function ensureStateShape(state) {
    const base = makeDefaultState();
    const out = state && typeof state === "object" ? state : clone(base);

    if (!out.system || typeof out.system !== "object") out.system = clone(base.system);
    if (!out.system.surface || !SURFACES.includes(out.system.surface)) out.system.surface = "glass";

    if (!out.pages || typeof out.pages !== "object") out.pages = {};
    PAGE_IDS.forEach(pageId => {
      if (!out.pages[pageId]) out.pages[pageId] = makePageDefault(pageId);
      const p = out.pages[pageId];
      const d = makePageDefault(pageId);

      if (!p.theme || !THEMES[p.theme]) p.theme = d.theme;

      if (!p.background || typeof p.background !== "object") p.background = clone(d.background);
      if (!["color", "gradient", "photo"].includes(p.background.type)) p.background.type = d.background.type;
      if (!p.background.value) p.background.value = d.background.value;
      if (typeof p.background.opacity !== "number") p.background.opacity = d.background.opacity;
      if (typeof p.background.blur !== "number") p.background.blur = d.background.blur;

      if (!p.effect || typeof p.effect !== "object") p.effect = clone(d.effect);
      if (!EFFECTS.includes(p.effect.type)) p.effect.type = "none";
      if (!p.effect.config || typeof p.effect.config !== "object") p.effect.config = {};

      if (!p.fonts || typeof p.fonts !== "object") p.fonts = clone(d.fonts);
      FONT_ROLES.forEach(role => {
        if (!p.fonts[role]) p.fonts[role] = clone(d.fonts[role]);
      });
    });

    return out;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      AppState = ensureStateShape(JSON.parse(raw));
    } catch (err) {
      console.warn("appearance v4 loadState error", err);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
    } catch (err) {
      console.warn("appearance v4 saveState error", err);
    }
  }

  function getPageState(pageId) {
    AppState = ensureStateShape(AppState);
    return AppState.pages[pageId];
  }

  function getEffectiveState() {
    const base = clone(AppState);
    if (!PreviewState) return base;

    const merged = clone(base);

    if (PreviewState.system) {
      merged.system = { ...merged.system, ...PreviewState.system };
    }

    if (PreviewState.pages) {
      Object.keys(PreviewState.pages).forEach(pageId => {
        merged.pages[pageId] = deepMerge(merged.pages[pageId] || makePageDefault(pageId), PreviewState.pages[pageId]);
      });
    }

    return merged;
  }

  function deepMerge(target, patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch;
    const out = Array.isArray(target) ? [...target] : { ...(target || {}) };
    Object.keys(patch).forEach(key => {
      const value = patch[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        out[key] = deepMerge(out[key], value);
      } else {
        out[key] = value;
      }
    });
    return out;
  }

  function applyTheme(themeId) {
    const t = THEMES[themeId];
    if (!t) return;
    Object.entries(t).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }

  function loadGFont(name) {
    if (!name || loadedFonts.has(name)) return;
    loadedFonts.add(name);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap`;
    document.head.appendChild(link);
  }

  function applyFonts(fonts) {
    if (!fonts) return;
    const root = document.documentElement;

    if (fonts.display) {
      root.style.setProperty("--serif", fonts.display.css);
      root.style.setProperty("--font-display", fonts.display.css);
      loadGFont(fonts.display.name);
    }
    if (fonts.subtitle) {
      root.style.setProperty("--font-subtitle", fonts.subtitle.css);
      loadGFont(fonts.subtitle.name);
    }
    if (fonts.ui) {
      root.style.setProperty("--sans", fonts.ui.css);
      root.style.setProperty("--font-ui", fonts.ui.css);
      loadGFont(fonts.ui.name);
    }
    if (fonts.body) {
      root.style.setProperty("--font-body", fonts.body.css);
      loadGFont(fonts.body.name);
    }
    if (fonts.mono) {
      root.style.setProperty("--mono", fonts.mono.css);
      root.style.setProperty("--font-mono", fonts.mono.css);
      loadGFont(fonts.mono.name);
    }
  }

  function getBgLayer() {
    let el = document.getElementById("andy-bg-layer");
    if (!el) {
      el = document.createElement("div");
      el.id = "andy-bg-layer";
      el.style.cssText = "position:fixed;inset:0;z-index:-2;pointer-events:none;";
      document.body.prepend(el);
    }
    return el;
  }

  function getFxLayer() {
    let el = document.getElementById("andy-fx-layer");
    if (!el) {
      el = document.createElement("div");
      el.id = "andy-fx-layer";
      el.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;";
      document.body.prepend(el);
    }
    return el;
  }

  function clearLayers() {
    document.body.style.backgroundImage = "";
    document.body.style.backgroundColor = "";
    const bg = document.getElementById("andy-bg-layer");
    const fx = document.getElementById("andy-fx-layer");
    if (bg) {
      bg.innerHTML = "";
      bg.style.cssText = "position:fixed;inset:0;z-index:-2;pointer-events:none;";
    }
    if (fx) {
      fx.innerHTML = "";
      fx.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;";
    }
  }

  function applyBackground(background) {
    clearLayers();
    const bg = getBgLayer();

    if (!background || !background.type) return;

    if (background.type === "color") {
      document.body.style.backgroundColor = background.value || "#0c0a12";
      return;
    }

    if (background.type === "gradient") {
      document.body.style.backgroundImage = background.value || "linear-gradient(135deg,#1e1428 0%, #2d1b4e 50%, #0c0a12 100%)";
      document.body.style.backgroundAttachment = "fixed";
      return;
    }

    if (background.type === "photo") {
      bg.style.backgroundImage = `url("${background.value || ""}")`;
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center";
      bg.style.backgroundRepeat = "no-repeat";
      bg.style.opacity = `${(background.opacity ?? 70) / 100}`;
      bg.style.filter = `blur(${background.blur ?? 0}px)`;
      document.body.style.backgroundColor = "var(--bg)";
    }
  }

  function applyEffect(effect) {
    const fx = getFxLayer();
    fx.innerHTML = "";

    if (!effect || !effect.type || effect.type === "none") return;

    const config = effect.config || {};
    const intensity = Number(config.intensity ?? 50);
    const speed = config.speed || "slow";
    const colors = Array.isArray(config.colors) && config.colors.length ? config.colors : ["#9b7ab8", "#5a7aaa", "#c8965a", "#f4a7b9"];

    if (effect.type === "bubbles") {
      const count = Math.max(6, Math.round(intensity / 4));
      for (let i = 0; i < count; i++) {
        const b = document.createElement("span");
        const size = 40 + Math.random() * 140;
        const left = Math.random() * 100;
        const dur = speed === "fast" ? 10 + Math.random() * 8 : speed === "medium" ? 14 + Math.random() * 10 : 18 + Math.random() * 14;
        const delay = Math.random() * -dur;
        const color = colors[i % colors.length];
        b.style.cssText = `
          position:absolute;
          left:${left}%;
          bottom:-180px;
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.35), ${hexToRgba(color, .16)} 42%, ${hexToRgba(color, .04)} 72%, transparent 100%);
          box-shadow:0 0 40px ${hexToRgba(color, .18)};
          animation:andyFxFloat ${dur}s linear infinite;
          animation-delay:${delay}s;
          filter:blur(${Math.max(2, size / 28)}px);
          opacity:${0.25 + Math.random() * 0.45};
        `;
        fx.appendChild(b);
      }
      injectFxKeyframes();
      return;
    }

    if (effect.type === "constellation") {
      const canvas = document.createElement("canvas");
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      canvas.style.cssText = "width:100%;height:100%;display:block;opacity:.8;";
      fx.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const dots = Array.from({ length: Math.max(26, Math.round(intensity)) }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.6,
        dx: (Math.random() - .5) * .2,
        dy: (Math.random() - .5) * .2
      }));
      let raf = 0;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(d => {
          d.x += d.dx;
          d.y += d.dy;
          if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
          if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
        });
        for (let i = 0; i < dots.length; i++) {
          const a = dots[i];
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,.75)";
          ctx.fill();
          for (let j = i + 1; j < dots.length; j++) {
            const b = dots[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 140) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(155,122,184,${(1 - dist / 140) * .18})`;
              ctx.lineWidth = .8;
              ctx.stroke();
            }
          }
        }
        raf = requestAnimationFrame(draw);
      };
      draw();
      fx._cleanup = () => cancelAnimationFrame(raf);
      return;
    }

    if (effect.type === "aurora") {
      fx.innerHTML = `
        <div style="position:absolute;inset:-10%;background:
          radial-gradient(circle at 20% 30%, ${hexToRgba(colors[0] || "#7c5cff", .24)} 0, transparent 40%),
          radial-gradient(circle at 70% 20%, ${hexToRgba(colors[1] || "#4fc3f7", .18)} 0, transparent 38%),
          radial-gradient(circle at 50% 80%, ${hexToRgba(colors[2] || "#7be495", .14)} 0, transparent 42%);
          filter: blur(50px);
          animation: andyFxAurora ${speed === "fast" ? 12 : speed === "medium" ? 18 : 26}s ease-in-out infinite alternate;">
        </div>
      `;
      injectFxKeyframes();
      return;
    }

    if (effect.type === "particles") {
      const count = Math.max(18, Math.round(intensity * 1.2));
      for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        const size = 2 + Math.random() * 5;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const dur = speed === "fast" ? 6 + Math.random() * 5 : speed === "medium" ? 10 + Math.random() * 8 : 14 + Math.random() * 12;
        const delay = Math.random() * -dur;
        p.style.cssText = `
          position:absolute;
          left:${left}%;
          top:${top}%;
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${colors[i % colors.length]};
          box-shadow:0 0 12px ${colors[i % colors.length]};
          opacity:${0.15 + Math.random() * 0.55};
          animation:andyFxParticle ${dur}s linear infinite;
          animation-delay:${delay}s;
        `;
        fx.appendChild(p);
      }
      injectFxKeyframes();
      return;
    }

    if (effect.type === "mist") {
      fx.innerHTML = `
        <div style="position:absolute;inset:-5%;background:
          radial-gradient(circle at 20% 30%, rgba(255,255,255,.08), transparent 30%),
          radial-gradient(circle at 80% 20%, rgba(155,122,184,.10), transparent 30%),
          radial-gradient(circle at 50% 80%, rgba(255,255,255,.06), transparent 35%);
          filter: blur(34px);
          animation: andyFxMist ${speed === "fast" ? 14 : speed === "medium" ? 20 : 28}s ease-in-out infinite alternate;">
        </div>
      `;
      injectFxKeyframes();
    }
  }

  function injectFxKeyframes() {
    if (document.getElementById("andy-fx-kf")) return;
    const style = document.createElement("style");
    style.id = "andy-fx-kf";
    style.textContent = `
      @keyframes andyFxFloat {
        0% { transform: translateY(0) translateX(0) scale(.9); }
        50% { transform: translateY(-45vh) translateX(18px) scale(1); }
        100% { transform: translateY(-95vh) translateX(-16px) scale(1.08); }
      }
      @keyframes andyFxAurora {
        0% { transform: translate3d(-2%, 0, 0) scale(1); }
        100% { transform: translate3d(2%, -2%, 0) scale(1.08); }
      }
      @keyframes andyFxParticle {
        0% { transform: translateY(0) translateX(0); opacity:.1; }
        50% { opacity:.65; }
        100% { transform: translateY(-40px) translateX(20px); opacity:.08; }
      }
      @keyframes andyFxMist {
        0% { transform: translate3d(-2%, 0, 0) scale(1); opacity:.75; }
        100% { transform: translate3d(2%, -2%, 0) scale(1.08); opacity:1; }
      }
    `;
    document.head.appendChild(style);
  }

  function applySurface(surfaceId) {
    document.documentElement.removeAttribute("data-surface");
    if (surfaceId && surfaceId !== "glass") {
      document.documentElement.setAttribute("data-surface", surfaceId);
    } else {
      document.documentElement.setAttribute("data-surface", "glass");
    }
  }

  function applyAll() {
    const state = getEffectiveState();
    const ps = state.pages[PAGE_ID];
    applyTheme(ps.theme);
    applyBackground(ps.background);
    applyEffect(ps.effect);
    applyFonts(ps.fonts);
    applySurface(state.system.surface);
  }

  function setPreviewPatch(patch) {
    PreviewState = deepMerge(PreviewState || {}, patch);
    applyAll();
    showPreviewBar();
    syncPanel();
    sendPreviewState();
  }

  function confirmPreview() {
    if (!PreviewState) return;
    AppState = deepMerge(AppState, PreviewState);
    PreviewState = null;
    saveState();
    applyAll();
    hidePreviewBar();
    syncPanel();
    showToast("Guardado");
    sendPreviewState();
  }

  function cancelPreview() {
    PreviewState = null;
    applyAll();
    hidePreviewBar();
    syncPanel();
    showToast("Cancelado");
    sendPreviewState();
  }

  window.confirmPreview = confirmPreview;
  window.cancelPreview = cancelPreview;

  function showPreviewBar() {
    document.getElementById("andy-preview-bar")?.remove();
    const bar = document.createElement("div");
    bar.id = "andy-preview-bar";
    bar.style.cssText = `
      position:fixed;left:0;right:0;bottom:0;z-index:9999;
      display:flex;align-items:center;justify-content:center;gap:12px;
      padding:12px 20px;background:rgba(12,10,18,.94);
      backdrop-filter:blur(14px);
      border-top:1px solid rgba(155,122,184,.28);
    `;
    bar.innerHTML = `
      <span style="font-family:var(--mono, monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:rgba(180,140,220,.72)">Preview activo</span>
      <button id="andy-preview-save" style="background:#9b7ab8;border:none;border-radius:8px;color:#fff;padding:8px 18px;cursor:pointer;font-family:var(--mono, monospace);font-size:10px;letter-spacing:.08em;text-transform:uppercase">Guardar</button>
      <button id="andy-preview-cancel" style="background:none;border:1px solid rgba(180,140,220,.30);border-radius:8px;color:rgba(180,140,220,.76);padding:8px 14px;cursor:pointer;font-family:var(--mono, monospace);font-size:10px;letter-spacing:.08em;text-transform:uppercase">Cancelar</button>
    `;
    document.body.appendChild(bar);
    bar.querySelector("#andy-preview-save").onclick = confirmPreview;
    bar.querySelector("#andy-preview-cancel").onclick = cancelPreview;
  }

  function hidePreviewBar() {
    document.getElementById("andy-preview-bar")?.remove();
  }

  function showToast(msg) {
    let t = document.getElementById("andy-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "andy-toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  }

  async function fetchFonts() {
    if (fontsReady) return allFonts;
    try {
      const r = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GFONTS_KEY}&sort=popularity`);
      const data = await r.json();
      allFonts = data.items || [];
      fontsReady = true;
    } catch (err) {
      console.warn("Google Fonts error", err);
    }
    return allFonts;
  }

  async function searchFonts(query = "", category = "all") {
    const fonts = await fetchFonts();
    return fonts
      .filter(f => !query || f.family.toLowerCase().includes(query.toLowerCase()))
      .filter(f => category === "all" ? true : f.category === category)
      .slice(0, 80);
  }

  async function loadFontGrid(query = "", category = "all") {
    const grid = document.getElementById("ap-font-grid");
    if (!grid) return;

    grid.innerHTML = `<div class="ap-font-loading">Cargando Google Fonts...</div>`;
    const fonts = await searchFonts(query, category);
    const current = getEffectiveState().pages[activeFontPage].fonts?.[activeFontRole]?.name;
    const samples = {
      display: "Andinet",
      subtitle: "Sección",
      ui: "Menú",
      body: "Texto",
      mono: "08:42"
    };
    const sample = samples[activeFontRole] || "Ag";

    if (!fonts.length) {
      grid.innerHTML = `<div class="ap-font-loading">Sin resultados</div>`;
      return;
    }

    grid.innerHTML = "";
    fonts.forEach(f => {
      loadGFont(f.family);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `ap-font-card ${f.family === current ? "active" : ""}`;
      card.dataset.family = f.family;
      card.innerHTML = `
        <div class="ap-font-sample" style="font-family:'${f.family}', serif">${sample}</div>
        <div class="ap-font-name">${f.family}</div>
        <div class="ap-font-cat">${f.category}</div>
      `;
      card.onclick = () => {
        const fallback =
          f.category === "monospace"
            ? "monospace"
            : (f.category === "serif" || f.category === "display")
              ? "Georgia, serif"
              : "system-ui, sans-serif";

        setPreviewPatch({
          pages: {
            [activeFontPage]: {
              fonts: {
                [activeFontRole]: {
                  name: f.family,
                  css: `"${f.family}", ${fallback}`
                }
              }
            }
          }
        });
      };
      grid.appendChild(card);
    });
  }

  function syncFontRoleButtons() {
    const state = getEffectiveState();
    const ps = state.pages[activeFontPage];
    document.querySelectorAll(".ap-font-type-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.type === activeFontRole);
      const role = btn.dataset.type;
      const preview = btn.querySelector(".ap-font-type-btn-preview");
      const f = ps.fonts?.[role];
      if (preview && f) preview.style.fontFamily = f.css;
    });
    const label = document.getElementById("ap-font-current-name");
    if (label && ps.fonts?.[activeFontRole]) {
      label.textContent = ps.fonts[activeFontRole].name;
    }
  }

  function syncThemeCards() {
    const state = getEffectiveState();
    const ps = state.pages[activeThemePage];
    document.querySelectorAll(".ap-theme-card").forEach(card => {
      card.classList.toggle("active", card.dataset.theme === ps.theme);
    });
  }

  function syncSurfaceCards() {
    const state = getEffectiveState();
    document.querySelectorAll(".ap-surface-card").forEach(card => {
      card.classList.toggle("active", card.dataset.surface === state.system.surface);
    });
  }

  function syncPageTabs(groupSelector, activePage) {
    document.querySelectorAll(`${groupSelector} .ap-page-tab`).forEach(btn => {
      btn.classList.toggle("active", btn.dataset.page === activePage);
    });
  }

  function syncBackgroundUI() {
    const state = getEffectiveState();
    const ps = state.pages[activeBgPage];
    const bg = ps.background;

    document.querySelectorAll(".ap-bg-type-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.type === bg.type);
    });
    document.querySelectorAll(".ap-bg-panel").forEach(panel => {
      panel.classList.toggle("active", panel.dataset.type === bg.type);
    });

    const colorPicker = document.getElementById("ap-color-picker");
    const colorHex = document.getElementById("ap-color-hex");
    const colorSwatch = document.getElementById("ap-color-swatch");
    if (bg.type === "color" && colorPicker) {
      colorPicker.value = normalizeHex(bg.value || "#0c0a12");
      if (colorHex) colorHex.textContent = normalizeHex(bg.value || "#0c0a12");
      if (colorSwatch) colorSwatch.style.background = normalizeHex(bg.value || "#0c0a12");
    }

    const thumb = document.getElementById("ap-photo-thumb");
    const zone = document.getElementById("ap-photo-zone");
    const opacity = document.getElementById("ap-photo-opacity");
    const blur = document.getElementById("ap-photo-blur");
    const opacityVal = document.getElementById("ap-opacity-val");
    const blurVal = document.getElementById("ap-blur-val");
    if (bg.type === "photo") {
      if (thumb && bg.value) {
        thumb.src = bg.value;
        thumb.style.display = "block";
      }
      zone?.classList.toggle("has-photo", !!bg.value);
      if (opacity) opacity.value = bg.opacity ?? 70;
      if (blur) blur.value = bg.blur ?? 0;
      if (opacityVal) opacityVal.textContent = `${bg.opacity ?? 70}`;
      if (blurVal) blurVal.textContent = `${bg.blur ?? 0}px`;
    }
  }

  function syncEffectsUI() {
    const state = getEffectiveState();
    const ps = state.pages[activeFxPage];
    const fx = ps.effect;

    document.querySelectorAll(".ap-fx-card").forEach(card => {
      card.classList.toggle("active", card.dataset.effect === fx.type);
    });

    const intensity = document.getElementById("ap-fx-intensity");
    const speed = document.getElementById("ap-fx-speed");
    const value = document.getElementById("ap-fx-intensity-val");
    if (intensity) intensity.value = fx.config?.intensity ?? EFFECT_PRESETS[fx.type]?.intensity ?? 50;
    if (speed) speed.value = fx.config?.speed ?? EFFECT_PRESETS[fx.type]?.speed ?? "slow";
    if (value) value.textContent = `${intensity?.value || 50}`;
  }

  function syncPanel() {
    syncPageTabs("#ap-font-page-tabs", activeFontPage);
    syncPageTabs("#ap-bg-page-tabs", activeBgPage);
    syncPageTabs("#ap-fx-page-tabs", activeFxPage);
    syncPageTabs("#ap-theme-page-tabs", activeThemePage);

    syncFontRoleButtons();
    syncBackgroundUI();
    syncEffectsUI();
    syncThemeCards();
    syncSurfaceCards();
  }

  function openPanel() {
    document.getElementById("andy-appearance-panel")?.classList.add("open");
    syncPanel();
    loadFontGrid(document.getElementById("ap-font-search")?.value || "", document.querySelector(".ap-filter-btn.active")?.dataset.cat || "all");
  }

  function closePanel() {
    document.getElementById("andy-appearance-panel")?.classList.remove("open");
  }

  window.closePanel = closePanel;
  window.openAppearancePanel = openPanel;

  function toggleExpand() {
    expanded = !expanded;
    const overlay = document.getElementById("andy-appearance-panel");
    const pane = document.getElementById("ap-preview-pane");
    if (!overlay || !pane) return;

    overlay.classList.toggle("ap-fullscreen", expanded);
    pane.style.display = expanded ? "flex" : "none";

    if (expanded) initPreviewIframe();
  }

  function initPreviewIframe() {
    const wrap = document.getElementById("ap-preview-iframe-wrap");
    if (!wrap || wrap.querySelector("iframe")) return;

    const iframe = document.createElement("iframe");
    iframe.src = location.href;
    iframe.style.cssText = "width:100%;height:100%;border:none;border-radius:12px;background:#0c0a12;";
    iframe.onload = () => {
      previewIframe = iframe;
      sendPreviewState();
    };
    wrap.appendChild(iframe);
  }

  function sendPreviewState() {
    if (!previewIframe || !previewIframe.contentWindow) return;
    try {
      previewIframe.contentWindow.postMessage({
        type: "andy-preview-v4",
        state: getEffectiveState(),
        pageId: PAGE_ID
      }, "*");
    } catch (err) {
      console.warn("preview postMessage error", err);
    }
  }

  window.addEventListener("message", (e) => {
    if (!e.data || e.data.type !== "andy-preview-v4" || !e.data.state) return;
    const prevApp = AppState;
    const prevPreview = PreviewState;
    AppState = ensureStateShape(e.data.state);
    PreviewState = null;
    applyTheme(AppState.pages[e.data.pageId || PAGE_ID].theme);
    applyBackground(AppState.pages[e.data.pageId || PAGE_ID].background);
    applyEffect(AppState.pages[e.data.pageId || PAGE_ID].effect);
    applyFonts(AppState.pages[e.data.pageId || PAGE_ID].fonts);
    applySurface(AppState.system.surface);
    AppState = prevApp;
    PreviewState = prevPreview;
  });

  function buildGradient() {
    const c1 = document.getElementById("ap-grad-1")?.value || "#1e1428";
    const c2 = document.getElementById("ap-grad-2")?.value || "#2d1b4e";
    const c3 = document.getElementById("ap-grad-3")?.value || "#0c0a12";
    return gradientDir === "radial"
      ? `radial-gradient(ellipse at center, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
      : `linear-gradient(${gradientDir}, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
  }

  function updateGradientPreview() {
    const p = document.getElementById("ap-grad-preview");
    if (p) p.style.background = buildGradient();
  }

  function bindPanel() {
    const panel = document.getElementById("andy-appearance-panel");
    if (!panel) return;

    panel.addEventListener("click", e => {
      if (e.target === panel) closePanel();
    });

    panel.querySelectorAll(".ap-main-tab").forEach(btn => {
      btn.onclick = () => {
        panel.querySelectorAll(".ap-main-tab").forEach(b => b.classList.remove("active"));
        panel.querySelectorAll(".ap-tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        panel.querySelector(`.ap-tab-panel[data-tab="${btn.dataset.tab}"]`)?.classList.add("active");
      };
    });

    panel.querySelectorAll("#ap-font-page-tabs .ap-page-tab").forEach(btn => {
      btn.onclick = () => {
        activeFontPage = btn.dataset.page;
        syncPanel();
        loadFontGrid(document.getElementById("ap-font-search")?.value || "", document.querySelector(".ap-filter-btn.active")?.dataset.cat || "all");
      };
    });

    panel.querySelectorAll(".ap-font-type-btn").forEach(btn => {
      btn.onclick = () => {
        activeFontRole = btn.dataset.type;
        syncFontRoleButtons();
        loadFontGrid(document.getElementById("ap-font-search")?.value || "", document.querySelector(".ap-filter-btn.active")?.dataset.cat || "all");
      };
    });

    document.getElementById("ap-font-search")?.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        loadFontGrid(this.value, document.querySelector(".ap-filter-btn.active")?.dataset.cat || "all");
      }, 300);
    });

    panel.querySelectorAll(".ap-filter-btn").forEach(btn => {
      btn.onclick = () => {
        panel.querySelectorAll(".ap-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        loadFontGrid(document.getElementById("ap-font-search")?.value || "", btn.dataset.cat || "all");
      };
    });

    panel.querySelectorAll("#ap-bg-page-tabs .ap-page-tab").forEach(btn => {
      btn.onclick = () => {
        activeBgPage = btn.dataset.page;
        syncBackgroundUI();
        syncPageTabs("#ap-bg-page-tabs", activeBgPage);
      };
    });

    panel.querySelectorAll(".ap-bg-type-btn").forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.type;
        setPreviewPatch({
          pages: {
            [activeBgPage]: {
              background: {
                ...getEffectiveState().pages[activeBgPage].background,
                type
              }
            }
          }
        });
      };
    });

    document.getElementById("ap-color-picker")?.addEventListener("input", function () {
      const hex = normalizeHex(this.value);
      const sw = document.getElementById("ap-color-swatch");
      const hx = document.getElementById("ap-color-hex");
      if (sw) sw.style.background = hex;
      if (hx) hx.textContent = hex;
      setPreviewPatch({
        pages: {
          [activeBgPage]: {
            background: {
              type: "color",
              value: hex
            }
          }
        }
      });
    });

    ["ap-grad-1", "ap-grad-2", "ap-grad-3"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", updateGradientPreview);
    });

    panel.querySelectorAll(".ap-grad-dir-btn").forEach(btn => {
      btn.onclick = () => {
        panel.querySelectorAll(".ap-grad-dir-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        gradientDir = btn.dataset.dir;
        updateGradientPreview();
      };
    });

    document.getElementById("ap-grad-apply")?.addEventListener("click", () => {
      setPreviewPatch({
        pages: {
          [activeBgPage]: {
            background: {
              type: "gradient",
              value: buildGradient()
            }
          }
        }
      });
    });

    const photoZone = document.getElementById("ap-photo-zone");
    const photoInput = document.getElementById("ap-photo-input");

    function readPhoto(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const opacity = parseInt(document.getElementById("ap-photo-opacity")?.value || "70", 10);
        const blur = parseInt(document.getElementById("ap-photo-blur")?.value || "0", 10);

        setPreviewPatch({
          pages: {
            [activeBgPage]: {
              background: {
                type: "photo",
                value: e.target.result,
                opacity,
                blur
              }
            }
          }
        });

        const thumb = document.getElementById("ap-photo-thumb");
        if (thumb) {
          thumb.src = e.target.result;
          thumb.style.display = "block";
        }
        photoZone?.classList.add("has-photo");
      };
      reader.readAsDataURL(file);
    }

    if (photoZone && photoInput) {
      photoZone.onclick = () => photoInput.click();
      photoZone.ondragover = e => {
        e.preventDefault();
        photoZone.classList.add("drag");
      };
      photoZone.ondragleave = () => photoZone.classList.remove("drag");
      photoZone.ondrop = e => {
        e.preventDefault();
        photoZone.classList.remove("drag");
        readPhoto(e.dataTransfer.files[0]);
      };
      photoInput.onchange = () => readPhoto(photoInput.files[0]);
    }

    document.getElementById("ap-photo-opacity")?.addEventListener("input", function () {
      document.getElementById("ap-opacity-val").textContent = this.value;
      const current = getEffectiveState().pages[activeBgPage].background;
      setPreviewPatch({
        pages: {
          [activeBgPage]: {
            background: {
              ...current,
              type: "photo",
              opacity: parseInt(this.value, 10)
            }
          }
        }
      });
    });

    document.getElementById("ap-photo-blur")?.addEventListener("input", function () {
      document.getElementById("ap-blur-val").textContent = `${this.value}px`;
      const current = getEffectiveState().pages[activeBgPage].background;
      setPreviewPatch({
        pages: {
          [activeBgPage]: {
            background: {
              ...current,
              type: "photo",
              blur: parseInt(this.value, 10)
            }
          }
        }
      });
    });

    panel.querySelectorAll("#ap-fx-page-tabs .ap-page-tab").forEach(btn => {
      btn.onclick = () => {
        activeFxPage = btn.dataset.page;
        syncEffectsUI();
        syncPageTabs("#ap-fx-page-tabs", activeFxPage);
      };
    });

    panel.querySelectorAll(".ap-fx-card").forEach(card => {
      card.onclick = () => {
        const type = card.dataset.effect;
        setPreviewPatch({
          pages: {
            [activeFxPage]: {
              effect: {
                type,
                config: clone(EFFECT_PRESETS[type] || {})
              }
            }
          }
        });
      };
    });

    document.getElementById("ap-fx-intensity")?.addEventListener("input", function () {
      document.getElementById("ap-fx-intensity-val").textContent = this.value;
      const current = getEffectiveState().pages[activeFxPage].effect;
      setPreviewPatch({
        pages: {
          [activeFxPage]: {
            effect: {
              ...current,
              config: {
                ...(current.config || {}),
                intensity: parseInt(this.value, 10)
              }
            }
          }
        }
      });
    });

    document.getElementById("ap-fx-speed")?.addEventListener("change", function () {
      const current = getEffectiveState().pages[activeFxPage].effect;
      setPreviewPatch({
        pages: {
          [activeFxPage]: {
            effect: {
              ...current,
              config: {
                ...(current.config || {}),
                speed: this.value
              }
            }
          }
        }
      });
    });

    panel.querySelectorAll(".ap-surface-card").forEach(card => {
      card.onclick = () => {
        setPreviewPatch({
          system: {
            surface: card.dataset.surface
          }
        });
      };
    });

    panel.querySelectorAll("#ap-theme-page-tabs .ap-page-tab").forEach(btn => {
      btn.onclick = () => {
        activeThemePage = btn.dataset.page;
        syncThemeCards();
        syncPageTabs("#ap-theme-page-tabs", activeThemePage);
      };
    });

    panel.querySelectorAll(".ap-theme-card").forEach(card => {
      card.onclick = () => {
        setPreviewPatch({
          pages: {
            [activeThemePage]: {
              theme: card.dataset.theme
            }
          }
        });
      };
    });

    document.getElementById("ap-expand-btn")?.addEventListener("click", toggleExpand);

    document.getElementById("ap-export-btn")?.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(AppState, null, 2)], { type: "application/json" }));
      a.download = "andynet-appearance-v4.json";
      a.click();
    });

    document.getElementById("ap-reset-btn")?.addEventListener("click", () => {
      if (!confirm("¿Resetear apariencia v4?")) return;
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  }

  function normalizeHex(v) {
    if (!v) return "#0c0a12";
    return v.startsWith("#") ? v : `#${v}`;
  }

  function hexToRgba(hex, alpha) {
    const h = normalizeHex(hex).replace("#", "");
    const full = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function init() {
    loadState();
    AppState = ensureStateShape(AppState);
    applyAll();

    document.querySelectorAll('[data-open-appearance], #settingsBtn, .settings-btn').forEach(btn => {
      btn.addEventListener("click", openPanel);
    });

    bindPanel();
    updateGradientPreview();
    syncPanel();
    loadFontGrid("", "all");
  }

  document.addEventListener("DOMContentLoaded", init);
  window.onAppearancePanelLoaded = init;
})();
