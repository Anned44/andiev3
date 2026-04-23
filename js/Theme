/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   THEME.JS — Andy.net v3
   Sistema de tema día / noche
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.Theme = (function () {
  'use strict';

  const KEY = 'andy_theme';
  const ICONS = { night: '○', day: '◑' };
  const LABELS = { night: 'día', day: 'noche' };

  function current() {
    return localStorage.getItem(KEY) || 'night';
  }

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
    // Actualizar todos los toggles en la página
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const icon  = btn.querySelector('.theme-toggle-icon');
      const label = btn.querySelector('.theme-toggle-label');
      if (icon)  icon.textContent  = ICONS[theme];
      if (label) label.textContent = LABELS[theme];
    });
  }

  function toggle() {
    apply(current() === 'night' ? 'day' : 'night');
  }

  function init() {
    apply(current());
  }

  // HTML del botón para insertar donde sea
  function buttonHTML() {
    const t = current();
    return `<button class="theme-toggle" onclick="Theme.toggle()" title="cambiar tema">
      <span class="theme-toggle-icon">${ICONS[t]}</span>
      <span class="theme-toggle-label">${LABELS[t]}</span>
    </button>`;
  }

  return { init, toggle, apply, current, buttonHTML };
})();

// Auto-init antes de que pinte el DOM para evitar flash
(function () {
  const saved = localStorage.getItem('andy_theme');
  if (saved) document.documentElement.dataset.theme = saved;
})();
