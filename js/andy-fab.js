/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANDY-FAB.JS — FAB inteligente global
   Tap → Chat Anet | Long press → Menú rápido
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.AndyFab = (function () {
  'use strict';

  const lg = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const ls = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  // Estado del sheet
  let _sheetState  = 'closed'; // closed | half | expanded | peek
  let _menuOpen    = false;
  let _messages    = [];
  let _loading     = false;
  let _longPressTimer = null;
  let _dragStart   = null;
  let _dragStartH  = null;

  // Sugerencias por módulo
  function getSugerencias() {
    const path = window.location.pathname;
    if (path.includes('studio')) return [
      '¿Qué proyecto necesita atención hoy?',
      'Genera ideas para mi proyecto más urgente',
      '¿Cómo está mi carga de trabajo?',
      'Analiza mis bloqueos activos',
    ];
    if (path.includes('hub')) return [
      '¿Qué debería hacer primero hoy?',
      'Ayúdame a priorizar mi inbox',
      'Resume mis tareas del planner',
      '¿Qué tareas llevan más tiempo pendientes?',
    ];
    return [
      '¿En qué proyecto enfocarme esta semana?',
      'Genera ideas para Botánica Adáptogens',
      '¿Cómo tengo distribuida mi energía?',
      'Ayúdame a tomar una decisión pendiente',
    ];
  }

  // Contexto del sistema
  function getContext() {
    const now = new Date();
    const days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    let ctx = `FECHA: ${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}, ${now.toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})}\n\n`;

    const proyectos = lg('hub_proyectos', []);
    if (proyectos.length) {
      ctx += `PROYECTOS (${proyectos.length}):\n`;
      proyectos.forEach(p => {
        ctx += `- ${p.emoji||'◈'} ${p.nombre} [${p.estado}] ${p.progreso||0}% prio:${p.prio||'media'}${p.urgente?' ⚡':''}\n`;
        if (p.desc) ctx += `  ${p.desc}\n`;
        const pend = (p.cards||[]).filter(c=>c.colId!==p.cols?.[p.cols.length-1]?.id);
        if (pend.length) ctx += `  Pendientes: ${pend.slice(0,4).map(c=>c.text).join(' · ')}\n`;
        (p.notasVivas||[]).forEach(n => ctx += `  [${n.tipo}] ${n.texto}\n`);
        (p.proceso||[]).slice(-2).forEach(e => ctx += `  [proceso-${e.tipo}] ${e.texto}\n`);
      });
      ctx += '\n';
    }

    const todayKey = now.toISOString().slice(0,10);
    const state = lg('appState', {});
    const today = state.plannerByDate?.[todayKey];
    if (today) {
      ctx += 'PLANNER HOY:\n';
      ['morning','afternoon','night'].forEach(b => {
        const items = (today[b]||[]);
        if (items.length) ctx += `  ${b==='morning'?'Mañana':b==='afternoon'?'Tarde':'Noche'}: ${items.map(t=>(t.done?'✓':'')+t.text).join(' | ')}\n`;
      });
      ctx += '\n';
    }

    const inbox = lg('dash_inbox', []).filter(i=>i.status!=='procesado');
    if (inbox.length) ctx += `INBOX (${inbox.length} pendientes): ${inbox.slice(0,5).map(i=>i.text).join(' · ')}\n\n`;

    const metas = lg('hub_metas', []);
    if (metas.length) ctx += `METAS: ${metas.map(m=>`${m.nombre} ${m.progreso||0}%`).join(' · ')}\n`;

    return ctx;
  }

  // Contexto del módulo actual para el header
  function getModuleCtx() {
    const path = window.location.pathname;
    if (path.includes('studio')) return 'Studio';
    if (path.includes('hub')) return 'Hub';
    return 'Portal';
  }

  /* ━━ RENDER ━━ */
  function renderMessages() {
    const container = document.getElementById('andyMsgs');
    if (!container) return;

    if (!_messages.length) {
      container.innerHTML = `
        <div class="andy-welcome">
          <span class="andy-welcome-ico">✦</span>
          <div class="andy-welcome-title">Hola, Andrea</div>
          <div class="andy-welcome-sub">Soy Anet — conozco tus proyectos,<br>planner e inbox. ¿En qué te ayudo?</div>
        </div>`;
      return;
    }

    container.innerHTML = _messages.map(m => {
      const time = m.time ? new Date(m.time).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'}) : '';
      return `<div class="andy-msg ${m.role==='user'?'user':'anet'}">
        <div class="andy-msg-bubble">${fmt(m.content)}</div>
        <span class="andy-msg-time">${time}</span>
      </div>`;
    }).join('');

    if (_loading) container.innerHTML += `<div class="andy-typing"><span></span><span></span><span></span></div>`;
    container.scrollTop = container.scrollHeight;
  }

  function fmt(text) {
    return String(text)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`(.+?)`/g,'<code style="background:var(--s3);padding:1px 5px;border-radius:4px;font-family:var(--mono);font-size:11px">$1</code>')
      .replace(/\n/g,'<br>');
  }

  /* ━━ SEND ━━ */
  async function send(text) {
    const input = document.getElementById('andyInput');
    const msg = text || input?.value.trim();
    if (!msg || _loading) return;
    if (input) input.value = '';

    // Ocultar sugerencias
    const sugg = document.getElementById('andySugg');
    if (sugg) sugg.style.display = 'none';

    // Si el sheet está en peek, expandir a half
    if (_sheetState === 'peek') setSheetState('half');

    _messages.push({ role: 'user', content: msg, time: Date.now() });
    _loading = true;
    renderMessages();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: _messages.map(m => ({ role: m.role, content: m.content })),
          context: getContext(),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Sin respuesta.';
      _messages.push({ role: 'assistant', content: reply, time: Date.now() });

      // Auto-expandir si hay más de 4 mensajes
      if (_messages.length > 4 && _sheetState === 'half') setSheetState('expanded');

    } catch {
      _messages.push({ role: 'assistant', content: '⚠ Error al conectar. Verifica tu conexión.', time: Date.now() });
    }

    _loading = false;
    renderMessages();
  }

  /* ━━ ACCIONES RÁPIDAS ━━ */
  function quickCapture() {
    closeMenu();
    // Reutilizar FAB modal existente si existe (hub/studio)
    if (window.HubCore?.openFab) { HubCore.openFab(); return; }
    // Portal
    if (typeof openFab === 'function') { openFab(); return; }
    // Fallback: abrir chat
    openSheet('half');
    setTimeout(() => {
      const input = document.getElementById('andyInput');
      if (input) { input.value = 'Quiero capturar: '; input.focus(); }
    }, 300);
  }

  function quickNota() {
    closeMenu();
    const txt = prompt('Nueva nota rápida:');
    if (!txt) return;
    const inbox = lg('dash_inbox', []);
    inbox.unshift({ id: Date.now(), text: txt, type: 'nota', status: 'pendiente', time: Date.now(), notes: '', subtasks: [] });
    ls('dash_inbox', inbox);
    showToastGlobal('📝 nota guardada en inbox');
    window.HubDashboard?.renderDashInbox?.();
    window.HubInbox?.refresh?.();
  }

  function quickTarea() {
    closeMenu();
    const txt = prompt('Nueva tarea:');
    if (!txt) return;
    const inbox = lg('dash_inbox', []);
    inbox.unshift({ id: Date.now(), text: txt, type: 'tarea', status: 'pendiente', time: Date.now(), notes: '', subtasks: [] });
    ls('dash_inbox', inbox);
    showToastGlobal('📋 tarea guardada en inbox');
    window.HubDashboard?.renderDashInbox?.();
    window.HubInbox?.refresh?.();
  }

  function showToastGlobal(msg) {
    if (window.HubCore?.showToast) { HubCore.showToast(msg); return; }
    if (window.StudioCore?.showToast) { StudioCore.showToast(msg); return; }
    if (typeof showToast === 'function') { showToast(msg); return; }
  }

  /* ━━ SHEET STATE ━━ */
  function setSheetState(state) {
    _sheetState = state;
    const sheet = document.getElementById('andySheet');
    const overlay = document.getElementById('andyOverlay');
    if (!sheet) return;

    sheet.classList.remove('half','expanded','peek');
    overlay.classList.remove('open');

    if (state === 'closed') return;

    sheet.classList.add(state);
    if (state !== 'peek') overlay.classList.add('open');

    // Expand icon
    const expandBtn = document.getElementById('andyExpandBtn');
    if (expandBtn) expandBtn.textContent = state === 'expanded' ? '↓' : '↑';
  }

  function openSheet(state = 'half') {
    closeMenu();
    setSheetState(state);
    const fab = document.getElementById('andyFabBtn');
    if (fab) fab.classList.add('active');
    renderMessages();
    setTimeout(() => document.getElementById('andyInput')?.focus(), 300);
  }

  function closeSheet() {
    setSheetState('closed');
    const fab = document.getElementById('andyFabBtn');
    if (fab) fab.classList.remove('active');
  }

  function toggleExpand() {
    setSheetState(_sheetState === 'expanded' ? 'half' : 'expanded');
  }

  /* ━━ MENÚ LONG PRESS ━━ */
  function openMenu() {
    _menuOpen = true;
    const menu = document.getElementById('andyFabMenu');
    if (menu) menu.classList.add('open');
    const fab = document.getElementById('andyFabBtn');
    if (fab) fab.classList.add('active');
  }

  function closeMenu() {
    _menuOpen = false;
    const menu = document.getElementById('andyFabMenu');
    if (menu) menu.classList.remove('open');
    const fab = document.getElementById('andyFabBtn');
    if (fab && _sheetState === 'closed') fab.classList.remove('active');
  }

  /* ━━ FAB EVENTS ━━ */
  function onFabPointerDown(e) {
    _longPressTimer = setTimeout(() => {
      _longPressTimer = null;
      openMenu();
    }, 600);
  }

  function onFabPointerUp(e) {
    if (_longPressTimer) {
      clearTimeout(_longPressTimer);
      _longPressTimer = null;
      // Tap corto
      if (_menuOpen) { closeMenu(); return; }
      if (_sheetState !== 'closed') { closeSheet(); return; }
      openSheet('half');
    }
  }

  function onFabPointerLeave() {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  }

  /* ━━ DRAG SHEET ━━ */
  function onHandlePointerDown(e) {
    _dragStart = e.clientY;
    const sheet = document.getElementById('andySheet');
    _dragStartH = sheet?.getBoundingClientRect().height || 0;
    document.addEventListener('pointermove', onHandlePointerMove);
    document.addEventListener('pointerup', onHandlePointerUp);
  }

  function onHandlePointerMove(e) {
    if (_dragStart === null) return;
    const sheet = document.getElementById('andySheet');
    if (!sheet) return;
    const diff = _dragStart - e.clientY;
    const newH = Math.max(80, Math.min(window.innerHeight * 0.95, _dragStartH + diff));
    sheet.style.height = newH + 'px';
    sheet.style.transition = 'none';
  }

  function onHandlePointerUp(e) {
    document.removeEventListener('pointermove', onHandlePointerMove);
    document.removeEventListener('pointerup', onHandlePointerUp);
    if (_dragStart === null) return;

    const sheet = document.getElementById('andySheet');
    if (sheet) sheet.style.transition = '';
    const diff = _dragStart - e.clientY;
    _dragStart = null;

    const vh = window.innerHeight;
    const currentH = sheet?.getBoundingClientRect().height || 0;
    const ratio = currentH / vh;

    if (ratio < 0.15) { closeSheet(); return; }
    if (ratio < 0.45) { setSheetState('peek'); return; }
    if (ratio < 0.75) { setSheetState('half'); return; }
    setSheetState('expanded');
  }

  /* ━━ KEYBOARD ━━ */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        _sheetState !== 'closed' ? closeSheet() : openSheet('half');
      }
      if (e.key === 'Escape' && _sheetState !== 'closed') closeSheet();
      if (e.key === 'Escape' && _menuOpen) closeMenu();
    });
  }

  /* ━━ INJECT ━━ */
  function inject() {
    if (document.getElementById('andyFabBtn')) return;

    const suggs = getSugerencias().map(s =>
      `<button class="andy-sugg-chip" onclick="AndyFab.send('${s.replace(/'/g,"\\'")}')">${s}</button>`
    ).join('');

    const html = `
      <!-- Overlay -->
      <div id="andyOverlay" class="andy-sheet-overlay" onclick="AndyFab.closeSheet()"></div>

      <!-- Bottom Sheet -->
      <div id="andySheet" class="andy-sheet">
        <div class="andy-sheet-handle" id="andyHandle"></div>
        <div class="andy-sheet-header">
          <div class="andy-sheet-header-left">
            <div class="andy-sheet-avatar">✦</div>
            <div>
              <div class="andy-sheet-title">Anet</div>
              <div class="andy-sheet-ctx" id="andyCtx">${getModuleCtx()}</div>
            </div>
          </div>
          <div class="andy-sheet-actions">
            <button class="andy-sheet-expand" id="andyExpandBtn" onclick="AndyFab.toggleExpand()" title="expandir">↑</button>
            <button class="andy-sheet-close" onclick="AndyFab.closeSheet()">×</button>
          </div>
        </div>
        <div class="andy-sheet-msgs" id="andyMsgs"></div>
        <div class="andy-sheet-sugg" id="andySugg">${suggs}</div>
        <div class="andy-sheet-input">
          <textarea class="andy-input" id="andyInput" placeholder="pregúntale algo a Anet..." rows="1"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();AndyFab.send()}"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
          <button class="andy-send-btn" onclick="AndyFab.send()">→</button>
        </div>
      </div>

      <!-- FAB Menu -->
      <div id="andyFabMenu" class="andy-fab-menu">
        <div class="andy-fab-menu-item" onclick="AndyFab.openSheet('half')">
          <span class="andy-fab-menu-ico">✦</span>
          <span class="andy-fab-menu-lbl">Chat con Anet</span>
        </div>
        <div class="andy-fab-menu-item" onclick="AndyFab.quickCapture()">
          <span class="andy-fab-menu-ico">◈</span>
          <span class="andy-fab-menu-lbl">Captura rápida</span>
        </div>
        <div class="andy-fab-menu-item" onclick="AndyFab.quickNota()">
          <span class="andy-fab-menu-ico">✎</span>
          <span class="andy-fab-menu-lbl">Nueva nota</span>
        </div>
        <div class="andy-fab-menu-item" onclick="AndyFab.quickTarea()">
          <span class="andy-fab-menu-ico">◧</span>
          <span class="andy-fab-menu-lbl">Nueva tarea</span>
        </div>
      </div>

      <!-- FAB -->
      <button id="andyFabBtn" class="andy-fab" title="Anet · Ctrl+J">
        <span class="andy-fab-icon">✦</span>
      </button>`;

    document.body.insertAdjacentHTML('beforeend', html);

    // Events FAB
    const fab = document.getElementById('andyFabBtn');
    fab.addEventListener('pointerdown', onFabPointerDown);
    fab.addEventListener('pointerup', onFabPointerUp);
    fab.addEventListener('pointerleave', onFabPointerLeave);
    fab.addEventListener('contextmenu', e => e.preventDefault());

    // Events handle (drag)
    document.getElementById('andyHandle').addEventListener('pointerdown', onHandlePointerDown);

    // Cerrar menú al click fuera
    document.addEventListener('click', e => {
      if (_menuOpen && !e.target.closest('#andyFabMenu') && !e.target.closest('#andyFabBtn')) {
        closeMenu();
      }
    });

    initKeyboard();
  }

  function init() {
    inject();
    renderMessages();
  }

  return {
    init,
    send,
    openSheet,
    closeSheet,
    toggleExpand,
    closeMenu,
    quickCapture,
    quickNota,
    quickTarea,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AndyFab.init);
} else {
  AndyFab.init();
}
