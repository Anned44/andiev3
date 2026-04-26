/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-CORE.JS — Andy.net v3
   Navegación, autosave, toast, FAB, shortcuts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.HubCore = (function () {
  'use strict';

  /* ── Storage helpers ── */
  function lg(k, fallback) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function ls(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  /* ── Toast ── */
  let _toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  /* ── Autosave indicator ── */
  let _asTimer;
  function triggerAutosave() {
    clearTimeout(_asTimer);
    _asTimer = setTimeout(() => {
      const el = document.getElementById('autosaveIndicator');
      if (!el) return;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 1800);
    }, 600);
  }

  /* ── Navegación ── */
  function navTo(btn, page) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) {
      btn.classList.add('active');
    } else {
      const title = page.charAt(0).toUpperCase() + page.slice(1);
      const b = document.querySelector(`[title="${title}"]`);
      if (b) b.classList.add('active');
    }

    document.querySelectorAll('.hub-page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');

    // Auto-colapsar sidebar al navegar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.add('collapsed');
      setTimeout(() => sidebar.classList.remove('collapsed'), 800);
    }

    const modules = {
      planner:  () => window.HubPlanner?.init(),
      metas:    () => window.HubMetas?.init(),
      health:   () => window.HubHealth?.init(),
      finanzas: () => window.HubFinanzas?.init(),
    };
    if (modules[page]) modules[page]();
  }

  function goPortal() {
    window.location.href = 'index.html';
  }

  /* ── Drawer Proyectos ── */
  function openProyDrawer() {
    const overlay = document.getElementById('proyDrawerOverlay');
    if (overlay) overlay.classList.add('open');
    window.StudioProyectos?.renderDrawer?.();
  }

  function closeProyDrawer(e) {
    if (e && e.target !== document.getElementById('proyDrawerOverlay')) return;
    document.getElementById('proyDrawerOverlay')?.classList.remove('open');
  }

  /* ── FAB Modal ── */
  let fabDest = 'inbox';

  function openFab() {
    const overlay = document.getElementById('fabOverlay');
    if (overlay) overlay.classList.add('open');
    const today = todayKey();
    const fechaEl = document.getElementById('fabFecha');
    if (fechaEl) fechaEl.value = today;
    setTimeout(() => document.getElementById('fabText')?.focus(), 80);
  }

  function closeFab() {
    const overlay = document.getElementById('fabOverlay');
    if (overlay) overlay.classList.remove('open');
    const textEl = document.getElementById('fabText');
    if (textEl) textEl.value = '';
    // Reset tipo a captura
    document.querySelectorAll('.fab-chip').forEach(b => b.classList.remove('sel'));
    document.querySelector('.fab-chip[data-tipo="captura"]')?.classList.add('sel');
    // Reset destino a inbox
    document.querySelectorAll('.fab-dest-chip').forEach(b => b.classList.remove('sel'));
    document.querySelector('.fab-dest-chip[data-dest="inbox"]')?.classList.add('sel');
    fabDest = 'inbox';
    document.getElementById('fabPlannerFields')?.classList.remove('visible');
  }

  function closeFabIfOutside(e) {
    if (e.target === document.getElementById('fabOverlay')) closeFab();
  }

  function selFabTipo(btn) {
    document.querySelectorAll('.fab-chip').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
  }

  function selectFabDest(btn) {
    document.querySelectorAll('.fab-dest-chip').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    fabDest = btn.dataset.dest;
    const plannerFields = document.getElementById('fabPlannerFields');
    if (plannerFields) plannerFields.classList.toggle('visible', fabDest === 'planner');
  }

  // Compatibilidad con código viejo
  function onTipoChange() {}
  function toggleFabRecordatorio() {}

  function submitFab() {
    const txt = document.getElementById('fabText')?.value.trim();
    if (!txt) { document.getElementById('fabText')?.focus(); return; }

    const tipoBtn = document.querySelector('.fab-chip.sel');
    const tipo    = tipoBtn?.dataset.tipo || 'captura';
    const today   = todayKey();

    const item = {
      id:     Date.now(),
      text:   txt,
      type:   tipo,
      status: 'pendiente',
      time:   Date.now(),
      notes:  '',
      subtasks: [],
    };

    if (fabDest === 'inbox') {
      const inbox = lg('dash_inbox', []);
      inbox.unshift(item);
      ls('dash_inbox', inbox);
      window.HubInbox?.refresh?.();
    } else if (fabDest === 'planner') {
      const dateVal = document.getElementById('fabFecha')?.value || today;
      const block   = document.getElementById('fabBlock')?.value || 'morning';
      const state   = lg('appState', {});
      if (!state.plannerByDate) state.plannerByDate = {};
      if (!state.plannerByDate[dateVal]) state.plannerByDate[dateVal] = { morning:[], afternoon:[], night:[] };
      state.plannerByDate[dateVal][block].push({ ...item, done: false });
      ls('appState', state);
      window.HubPlanner?.refresh?.();
    }

    showToast('✓ guardado en ' + fabDest);
    closeFab();
    window.HubDashboard?.refresh?.();
  }

  /* ── Keyboard shortcuts ── */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      // Ctrl+Space → FAB
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault(); openFab();
      }
      // Escape → cerrar FAB
      if (e.key === 'Escape') closeFab();
      // Ctrl+P → Planner
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        navTo(document.querySelector('[title="Planner"]'), 'planner');
      }
      // Ctrl+I → Inbox
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        navTo(document.querySelector('[title="Inbox"]'), 'inbox');
      }
      // Ctrl+H → Health
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        navTo(document.querySelector('[title="Health"]'), 'health');
      }
      // Ctrl+M → Metas
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        navTo(document.querySelector('[title="Metas"]'), 'metas');
      }
      // Ctrl+1 → Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        navTo(document.querySelector('[title="Dashboard"]'), 'dashboard');
      }
    });
  }

  /* ── Init ── */
  function init() {
    initKeyboard();
    const fab = document.getElementById('hubFab');
    if (fab) fab.addEventListener('click', openFab);
  }

  return {
    init,
    navTo,
    goPortal,
    openProyDrawer,
    closeProyDrawer,
    showToast,
    triggerAutosave,
    openFab,
    closeFab,
    closeFabIfOutside,
    onTipoChange,
    toggleFabRecordatorio,
    selFabTipo,
    selectFabDest,
    submitFab,
    lg,
    ls,
    todayKey,
  };
})();
