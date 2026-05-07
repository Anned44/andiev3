/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURSOR.JS — Andy.net v4
Punto + anillo + estela · canvas overlay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

(function() {

/* ── Canvas setup ── */
const cv = document.createElement(‘canvas’);
cv.id = ‘andy-cursor-canvas’;
cv.style.cssText = ‘position:fixed;inset:0;pointer-events:none;z-index:99999;’;
document.body.appendChild(cv);
const ctx = cv.getContext(‘2d’);

function resize() {
cv.width  = window.innerWidth;
cv.height = window.innerHeight;
}
resize();
window.addEventListener(‘resize’, resize);

/* ── Hide native cursor ── */
const style = document.createElement(‘style’);
style.textContent = ’*, *::before, *::after { cursor: none !important; }’;
document.head.appendChild(style);

/* ── State ── */
let mx = window.innerWidth  / 2;
let my = window.innerHeight / 2;
let cx = mx, cy = my;   // dot — fast
let rx = mx, ry = my;   // ring — slow
let isVisible = false;
let isHover = false;     // hovering a clickable element
const trail = [];
const MAX_TRAIL = 24;
let t = 0;

/* ── Mouse tracking ── */
document.addEventListener(‘mousemove’, e => {
mx = e.clientX;
my = e.clientY;
if (!isVisible) isVisible = true;
});

document.addEventListener(‘mouseleave’, () => { isVisible = false; });
document.addEventListener(‘mouseenter’, () => { isVisible = true; });

/* ── Hover detection on clickables ── */
document.addEventListener(‘mouseover’, e => {
const el = e.target;
isHover = !!(
el.closest(‘a, button, [onclick], .tile, .nav-btn, .ap-main-tab, .ap-role-pill, .ap-theme-card, .ap-fx-card, .ap-surface-card, .ap-font-row, .ap-filter-btn’)
);
});

/* ── Lerp ── */
function lerp(a, b, n) { return a + (b - a) * n; }

/* ── Draw loop ── */
function draw() {
t += 0.016;
ctx.clearRect(0, 0, cv.width, cv.height);

```
if (!isVisible) { requestAnimationFrame(draw); return; }

/* Smooth positions */
cx = lerp(cx, mx, 0.20);
cy = lerp(cy, my, 0.20);
rx = lerp(rx, mx, 0.08);
ry = lerp(ry, my, 0.08);

/* Trail */
trail.push({ x: cx, y: cy, t });
if (trail.length > MAX_TRAIL) trail.shift();

trail.forEach((p, i) => {
  const age   = i / trail.length;
  const size  = age * 4.5;
  const alpha = age * 0.25;
  const hue   = 265 + Math.sin(p.t * 0.5) * 30;
  ctx.beginPath();
  ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${hue}, 65%, 78%, ${alpha})`;
  ctx.fill();
});

/* Ring — slow, expands on hover */
const ringSize = isHover ? 30 : 20;
ctx.beginPath();
ctx.arc(rx, ry, ringSize, 0, Math.PI * 2);
ctx.strokeStyle = isHover
  ? 'rgba(155,122,184,0.55)'
  : 'rgba(155,122,184,0.28)';
ctx.lineWidth = isHover ? 1.5 : 1;
ctx.stroke();

/* Dot glow */
const hue = 265 + Math.sin(t * 0.8) * 35;
const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
glow.addColorStop(0, `hsla(${hue}, 60%, 72%, 0.12)`);
glow.addColorStop(1, 'transparent');
ctx.beginPath();
ctx.arc(cx, cy, 24, 0, Math.PI * 2);
ctx.fillStyle = glow;
ctx.fill();

/* Dot — fast */
const dotSize = isHover ? 3 : 4;
ctx.beginPath();
ctx.arc(cx, cy, dotSize, 0, Math.PI * 2);
ctx.fillStyle = `hsla(${hue}, 70%, 88%, 0.95)`;
ctx.fill();

requestAnimationFrame(draw);
```

}

draw();

})();