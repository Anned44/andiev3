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
    // Actualizar sidebar
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) {
      btn.classList.add('active');
    } else {
      const title = page.charAt(0).toUpperCase() + page.slice(1);
      const b = document.querySelector(`[title="${title}"]`);
      if (b) b.classList.add('active');
    }

    // Mostrar página
    document.querySelectorAll('.hub-page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');

    // Inicializar módulo
    const modules = {
      planner:  () => window.HubPlanner?.init(),
      inbox:    () => window.HubInbox?.init(),
      metas:    () => window.HubMetas?.init(),
      health:   () => window.HubHealth?.init(),
      finanzas: () => window.HubFinanzas?.init(),
    };
    if (modules[page]) modules[page]();

    // Guardar última página visitada
    ls('hub_last_page', page);
  }

  function goPortal() {
    window.location.href = 'index.html';
  }

  /* ── FAB Modal ── */
  let fabDest = 'inbox';
  let fabRecordatorio = false;

  const PLACEHOLDERS = {
    nota:     '¿Qué tienes en mente?...',
    tarea:    'Describe la tarea...',
    evento:   'Nombre del evento...',
    proyecto: 'Describe el proyecto...'
  };

  function openFab() {
    const overlay = document.getElementById('fabOverlay');
    if (overlay) overlay.classList.add('open');
    const today = todayKey();
    const fechaEl = document.getElementById('fabFecha');
    if (fechaEl) fechaEl.value = today;
    setTimeout(() => document.getElementById('fabTipo')?.focus(), 60);
  }

  function closeFab() {
    const overlay = document.getElementById('fabOverlay');
    if (overlay) overlay.classList.remove('open');
    // Reset form
    ['fabText','fabFecha','fabHora','fabProyNombre'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const tipo = document.getElementById('fabTipo');
    if (tipo) tipo.value = 'nota';
    const prio = document.getElementById('fabPrio');
    if (prio) prio.value = '';
    fabRecordatorio = false;
    const tog = document.getElementById('fabRecordatorio');
    if (tog) { tog.textContent = 'No'; tog.classList.remove('on'); }
    const hint = document.getElementById('fabRecordatorioHint');
    if (hint) hint.textContent = '';
    onTipoChange();
  }

  function closeFabIfOutside(e) {
    if (e.target === document.getElementById('fabOverlay')) closeFab();
  }

  function onTipoChange() {
    const tipo = document.getElementById('fabTipo')?.value || 'nota';
    const ta = document.getElementById('fabText');
    if (ta) ta.placeholder = PLACEHOLDERS[tipo] || PLACEHOLDERS.nota;

    const eventoFields  = document.getElementById('fabEventoFields');
    const proyFields    = document.getElementById('fabProyectoFields');
    const prioField     = document.getElementById('fabPrioField');

    if (eventoFields) eventoFields.classList.toggle('visible', tipo === 'evento');
    if (proyFields)   proyFields.classList.toggle('visible', tipo === 'proyecto');
    if (prioField)    prioField.style.display = tipo === 'evento' ? 'none' : '';
  }

  function toggleFabRecordatorio() {
    fabRecordatorio = !fabRecordatorio;
    const btn  = document.getElementById('fabRecordatorio');
    const hint = document.getElementById('fabRecordatorioHint');
    if (btn)  { btn.textContent = fabRecordatorio ? 'Sí' : 'No'; btn.classList.toggle('on', fabRecordatorio); }
    if (hint) hint.textContent = fabRecordatorio ? 'se guardará con alerta' : '';
  }

  function selectFabDest(btn) {
    document.querySelectorAll('.fab-dest-chip').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    fabDest = btn.dataset.dest;
  }

  function submitFab() {
    const txt  = document.getElementById('fabText')?.value.trim();
    if (!txt) { document.getElementById('fabText')?.focus(); return; }

    const tipo  = document.getElementById('fabTipo')?.value || 'nota';
    const prio  = document.getElementById('fabPrio')?.value || '';
    const fecha = document.getElementById('fabFecha')?.value || '';
    const hora  = document.getElementById('fabHora')?.value || '';
    const proyN = document.getElementById('fabProyNombre')?.value.trim() || '';
    const today = todayKey();

    const item = {
      id: Date.now(),
      text: txt,
      type: tipo,
      prio,
      status: 'pendiente',
      time: new Date().toISOString(),
      date: today,
      ...(tipo === 'evento' && { eventDate: fecha, eventTime: hora, recordatorio: fabRecordatorio }),
      ...(tipo === 'proyecto' && proyN && { proyNombre: proyN })
    };

    if (fabDest === 'inbox') {
      const inbox = lg('dash_inbox', []);
      inbox.unshift(item);
      ls('dash_inbox', inbox);
    } else if (fabDest === 'planner') {
      const state = lg('appState', {});
      if (!state.plannerByDate) state.plannerByDate = {};
      if (!state.plannerByDate[today]) state.plannerByDate[today] = { morning:[], afternoon:[], night:[] };
      state.plannerByDate[today].morning.push({ ...item, done: false });
      ls('appState', state);
    }

    showToast('✓ guardado en ' + fabDest);
    closeFab();

    // Refrescar módulos si están activos
    if (fabDest === 'inbox')   window.HubInbox?.refresh?.();
    if (fabDest === 'planner') window.HubPlanner?.refresh?.();
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

  /* ── API pública ── */
  return {
    init,
    navTo,
    goPortal,
    showToast,
    triggerAutosave,
    openFab,
    closeFab,
    closeFabIfOutside,
    onTipoChange,
    toggleFabRecordatorio,
    selectFabDest,
    submitFab,
    lg,
    ls,
    todayKey,
  };
})();
