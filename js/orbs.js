/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ORBS.JS — Andy.net v3
   Sistema de orbes/blobs animados por página
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ORB_DEFAULTS = {
  index:  { count:4, blur:80, opacity:0.55, speed:'slow',  baseColor:'#9b7ab8', colors:['#9b7ab8','#5a7aaa','#c8965a','#f4a7b9'] },
  hub:    { count:3, blur:90, opacity:0.45, speed:'slow',  baseColor:'#5a7aaa', colors:['#5a7aaa','#9b7ab8','#4a8a8a'] },
  studio: { count:3, blur:85, opacity:0.45, speed:'medium',baseColor:'#c8965a', colors:['#c8965a','#9b7ab8','#5a7aaa'] },
  muse:   { count:5, blur:70, opacity:0.60, speed:'slow',  baseColor:'#9b7ab8', colors:['#9b7ab8','#f4a7b9','#c8965a','#5a7aaa','#7a9ab8'] },
};

const SPEED_MAP = { slow:28, medium:18, fast:10 };

/* ── Crear orbes en el DOM ── */
function createOrbs(pageId, config) {
  removeOrbs();
  const cfg = config || ORB_DEFAULTS[pageId] || ORB_DEFAULTS.index;

  const container = document.createElement('div');
  container.id = 'andy-orbs-container';
  container.style.cssText = `
    position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
  `;

  const style = document.createElement('style');
  style.id = 'andy-orbs-style';
  const duration = SPEED_MAP[cfg.speed] || 28;

  // Generar keyframes únicos por orbe
  let keyframes = '';
  for (let i = 0; i < cfg.count; i++) {
    const x1 = Math.random()*60-30, y1 = Math.random()*60-30;
    const x2 = Math.random()*60-30, y2 = Math.random()*60-30;
    const x3 = Math.random()*60-30, y3 = Math.random()*60-30;
    keyframes += `
      @keyframes orb-float-${i} {
        0%   { transform: translate(0,0) scale(1); }
        33%  { transform: translate(${x1}px,${y1}px) scale(1.08); }
        66%  { transform: translate(${x2}px,${y2}px) scale(0.94); }
        100% { transform: translate(0,0) scale(1); }
      }`;
  }
  style.textContent = keyframes;
  document.head.appendChild(style);

  for (let i = 0; i < cfg.count; i++) {
    const orb = document.createElement('div');
    const color = cfg.colors[i % cfg.colors.length];
    const size  = 280 + Math.random() * 300;
    const top   = Math.random() * 80;
    const left  = Math.random() * 80;
    const delay = Math.random() * -duration;
    const dur   = duration + Math.random() * 10;

    orb.className = 'andy-orb';
    orb.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      top:${top}%; left:${left}%;
      background: radial-gradient(circle at 40% 40%, ${color}cc 0%, ${color}66 40%, transparent 70%);
      border-radius:50%;
      filter: blur(${cfg.blur}px);
      opacity:${cfg.opacity};
      animation: orb-float-${i} ${dur}s ${delay}s ease-in-out infinite;
      will-change: transform;
    `;
    container.appendChild(orb);
  }

  document.body.prepend(container);
}

function removeOrbs() {
  document.getElementById('andy-orbs-container')?.remove();
  document.getElementById('andy-orbs-style')?.remove();
}

/* ── Aplicar desde estado ── */
function applyOrbs(pageId, config) {
  if (config) createOrbs(pageId, config);
  else removeOrbs();
}

/* ── Exportar para uso en appearance.js ── */
window.AndyOrbs = { createOrbs, removeOrbs, applyOrbs, ORB_DEFAULTS, SPEED_MAP };
