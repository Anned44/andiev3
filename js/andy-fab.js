/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANDY-FAB.JS — FAB inteligente global v2
   Tap → Captura rápida
   Long press → Anet chat con acciones reales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.AndyFab = (function () {
  'use strict';

  const lg = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
  const ls = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  let _mode         = 'closed'; // closed | captura | chat
  let _sheetState   = 'closed'; // closed | half | expanded
  let _messages     = [];
  let _loading      = false;
  let _longPressTimer = null;
  let _dragStart    = null;
  let _dragStartH   = null;
  let _capturaChips = { tipo: 'captura', dest: 'inbox' };

  /* ━━ CONTEXTO ━━ */
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

  function getModuleCtx() {
    const path = window.location.pathname;
    if (path.includes('studio')) return 'Studio';
    if (path.includes('hub')) return 'Hub';
    return 'Portal';
  }

  function getSugerencias() {
    const path = window.location.pathname;
    if (path.includes('studio')) return [
      '¿Qué proyecto necesita atención hoy?',
      'Ideas para mi proyecto más urgente',
      'Analiza mis bloqueos activos',
      'Registra un avance en Botánica',
    ];
    if (path.includes('hub')) return [
      '¿Qué debería hacer primero hoy?',
      'Crea una tarea para revisar mi inbox',
      'Resume mis tareas del planner',
      'Agrega una nota sobre lo que aprendí hoy',
    ];
    return [
      '¿En qué proyecto enfocarme esta semana?',
      'Ideas para Botánica Adáptogens',
      '¿Cómo tengo distribuida mi energía?',
      'Crea una tarea importante para hoy',
    ];
  }

  /* ━━ ACCIONES REALES ━━ */
  function executeActions(text) {
    const actionRegex = /\[ACCION:([^\]]+)\]/g;
    let match;
    const executed = [];

    while ((match = actionRegex.exec(text)) !== null) {
      const parts = match[1].split(':');
      const tipo  = parts[0];
      const param = parts.slice(1).join(':');
      try {
        switch(tipo) {
          case 'crear_tarea':
          case 'crear_nota':
          case 'crear_captura': {
            const inbox = lg('dash_inbox', []);
            inbox.unshift({ id: Date.now(), text: param, type: tipo.replace('crear_',''), status: 'pendiente', time: Date.now(), notes: '', subtasks: [] });
            ls('dash_inbox', inbox);
            executed.push(`✓ "${param}" → inbox`);
            window.HubDashboard?.renderDashInbox?.();
            window.HubInbox?.refresh?.();
            break;
          }
          case 'crear_evento': {
            // param: "texto|fecha|bloque"
            const [txt, fecha, bloque] = param.split('|');
            const dateKey = fecha || new Date().toISOString().slice(0,10);
            const block   = bloque || 'morning';
            const state   = lg('appState', {});
            if (!state.plannerByDate) state.plannerByDate = {};
            if (!state.plannerByDate[dateKey]) state.plannerByDate[dateKey] = { morning:[], afternoon:[], night:[] };
            state.plannerByDate[dateKey][block].push({ id: Date.now(), text: txt, done: false, type: 'evento', time: Date.now() });
            ls('appState', state);
            executed.push(`✓ "${txt}" → planner ${dateKey}`);
            window.HubPlanner?.refresh?.();
            break;
          }
          case 'nota_viva': {
            // param: "proyectoNombre|tipo|texto"
            const [proyNombre, notaTipo, notaTxt] = param.split('|');
            const proyectos = lg('hub_proyectos', []);
            const p = proyectos.find(pr => pr.nombre.toLowerCase().includes(proyNombre.toLowerCase()));
            if (p) {
              if (!p.notasVivas) p.notasVivas = [];
              p.notasVivas.unshift({ tipo: notaTipo||'idea', texto: notaTxt });
              ls('hub_proyectos', proyectos);
              ls('studio_proyectos', proyectos);
              executed.push(`✓ nota "${notaTxt}" → ${p.nombre}`);
            }
            break;
          }
          case 'registrar_avance': {
            // param: "proyectoNombre|tipo|texto"
            const [proyNombre, avanceTipo, avanceTxt] = param.split('|');
            const proyectos = lg('hub_proyectos', []);
            const p = proyectos.find(pr => pr.nombre.toLowerCase().includes(proyNombre.toLowerCase()));
            if (p) {
              if (!p.proceso) p.proceso = [];
              p.proceso.push({ tipo: avanceTipo||'nota', texto: avanceTxt, fecha: new Date().toISOString() });
              ls('hub_proyectos', proyectos);
              ls('studio_proyectos', proyectos);
              executed.push(`✓ avance → ${p.nombre}`);
            }
            break;
          }
        }
      } catch(e) { console.warn('Accion fallida:', tipo, e); }
    }

    if (executed.length) {
      _showToast(executed.join(' · '));
    }

    // Remover bloques de acción del texto visible
    return text.replace(actionRegex, '').trim();
  }

  function _showToast(msg) {
    if (window.HubCore?.showToast) { HubCore.showToast(msg); return; }
    if (window.StudioCore?.showToast) { StudioCore.showToast(msg); return; }
    if (typeof showToast === 'function') { showToast(msg); }
  }

  /* ━━ CHAT — RENDER ━━ */
  function renderMessages() {
    const container = document.getElementById('andyMsgs');
    if (!container) return;

    if (!_messages.length) {
      container.innerHTML = `
        <div class="andy-welcome">
          <span class="andy-welcome-ico">✦</span>
          <div class="andy-welcome-title">Hola, Andrea</div>
          <div class="andy-welcome-sub">Soy Anet — conozco tus proyectos,<br>planner e inbox.<br>Puedo crear tareas, notas y eventos.</div>
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

  /* ━━ CHAT — SEND ━━ */
  async function send(text) {
    const input = document.getElementById('andyInput');
    const msg = text || input?.value.trim();
    if (!msg || _loading) return;
    if (input) { input.value = ''; input.style.height = 'auto'; }

    const sugg = document.getElementById('andySugg');
    if (sugg) sugg.style.display = 'none';

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
      let reply = data.content?.[0]?.text || 'Sin respuesta.';
      reply = executeActions(reply);
      _messages.push({ role: 'assistant', content: reply, time: Date.now() });
      if (_messages.length > 4 && _sheetState === 'half') setSheetState('expanded');
    } catch {
      _messages.push({ role: 'assistant', content: '⚠ Error al conectar. Verifica tu conexión.', time: Date.now() });
    }

    _loading = false;
    renderMessages();
  }

  /* ━━ CAPTURA RÁPIDA ━━ */
  function renderCaptura() {
    const container = document.getElementById('andySheetBody');
    if (!container) return;

    const TIPOS = ['captura','idea','tarea','nota','evento','recordatorio','wishlist'];
    const ICOS  = { captura:'✦', idea:'💡', tarea:'📋', nota:'📝', evento:'◷', recordatorio:'⏰', wishlist:'★' };

    container.innerHTML = `
      <div class="andy-captura">
        <div class="andy-captura-label">tipo</div>
        <div class="andy-captura-tipos">
          ${TIPOS.map(t=>`<button class="andy-captura-chip${_capturaChips.tipo===t?' sel':''}" data-tipo="${t}" onclick="AndyFab.selTipo(this,'${t}')">${ICOS[t]||'·'} ${t}</button>`).join('')}
        </div>
        <textarea class="andy-captura-input" id="andyCapturaText" placeholder="¿qué tienes en mente?..."
          onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();AndyFab.submitCaptura()}"></textarea>
        <div class="andy-captura-label" style="margin-top:10px">destino</div>
        <div class="andy-captura-dests">
          <button class="andy-captura-dest${_capturaChips.dest==='inbox'?' sel':''}" data-dest="inbox" onclick="AndyFab.selDest(this,'inbox')">📥 inbox</button>
          <button class="andy-captura-dest${_capturaChips.dest==='planner'?' sel':''}" data-dest="planner" onclick="AndyFab.selDest(this,'planner')">📅 planner</button>
        </div>
        <div id="andyPlannerExtra" style="display:${_capturaChips.dest==='planner'?'grid':'none'};grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <div>
            <div class="andy-captura-label">fecha</div>
            <input type="date" class="andy-captura-date" id="andyCapturaFecha" value="${new Date().toISOString().slice(0,10)}">
          </div>
          <div>
            <div class="andy-captura-label">bloque</div>
            <select class="andy-captura-date" id="andyCapturaBloque">
              <option value="morning">🌅 mañana</option>
              <option value="afternoon">🌤 tarde</option>
              <option value="night">🌙 noche</option>
            </select>
          </div>
        </div>
        <div class="andy-captura-actions">
          <button class="andy-captura-cancel" onclick="AndyFab.closeSheet()">cancelar</button>
          <button class="andy-captura-save" onclick="AndyFab.submitCaptura()">guardar</button>
        </div>
      </div>`;

    setTimeout(() => document.getElementById('andyCapturaText')?.focus(), 100);
  }

  function selTipo(btn, tipo) {
    document.querySelectorAll('.andy-captura-chip').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    _capturaChips.tipo = tipo;
  }

  function selDest(btn, dest) {
    document.querySelectorAll('.andy-captura-dest').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    _capturaChips.dest = dest;
    const extra = document.getElementById('andyPlannerExtra');
    if (extra) extra.style.display = dest === 'planner' ? 'grid' : 'none';
  }

  function submitCaptura() {
    const txt = document.getElementById('andyCapturaText')?.value.trim();
    if (!txt) { document.getElementById('andyCapturaText')?.focus(); return; }

    const item = { id: Date.now(), text: txt, type: _capturaChips.tipo, status: 'pendiente', time: Date.now(), notes: '', subtasks: [] };

    if (_capturaChips.dest === 'inbox') {
      const inbox = lg('dash_inbox', []);
      inbox.unshift(item);
      ls('dash_inbox', inbox);
      _showToast('✓ guardado en inbox');
    } else {
      const fecha = document.getElementById('andyCapturaFecha')?.value || new Date().toISOString().slice(0,10);
      const bloque = document.getElementById('andyCapturaBloque')?.value || 'morning';
      const state = lg('appState', {});
      if (!state.plannerByDate) state.plannerByDate = {};
      if (!state.plannerByDate[fecha]) state.plannerByDate[fecha] = { morning:[], afternoon:[], night:[] };
      state.plannerByDate[fecha][bloque].push({ ...item, done: false });
      ls('appState', state);
      _showToast('✓ guardado en planner');
    }

    window.HubDashboard?.renderDashInbox?.();
    window.HubInbox?.refresh?.();
    window.HubPlanner?.refresh?.();
    closeSheet();
  }

  /* ━━ SHEET STATE ━━ */
  function setSheetState(state) {
    _sheetState = state;
    const sheet   = document.getElementById('andySheet');
    const overlay = document.getElementById('andyOverlay');
    const fab     = document.getElementById('andyFabBtn');
    if (!sheet) return;

    sheet.classList.remove('half','expanded','peek');
    overlay?.classList.remove('open');

    if (state === 'closed') {
      if (fab) fab.classList.remove('active');
      return;
    }

    sheet.classList.add(state);
    if (state !== 'peek') overlay?.classList.add('open');
    if (fab) fab.classList.add('active');

    const expandBtn = document.getElementById('andyExpandBtn');
    if (expandBtn) expandBtn.textContent = state === 'expanded' ? '↓' : '↑';
  }

  function openCaptura() {
    _mode = 'captura';
    setSheetState('half');
    _updateHeader();
    renderCaptura();
  }

  function openChat() {
    _mode = 'chat';
    setSheetState('half');
    _updateHeader();
    renderMessages();
    setTimeout(() => document.getElementById('andyInput')?.focus(), 300);
  }

  function closeSheet() {
    setSheetState('closed');
    _mode = 'closed';
  }

  function toggleExpand() {
    setSheetState(_sheetState === 'expanded' ? 'half' : 'expanded');
  }

  function _updateHeader() {
    const title = document.getElementById('andySheetTitle');
    const sub   = document.getElementById('andySheetSub');
    const inputArea = document.getElementById('andyChatInput');
    const body  = document.getElementById('andySheetBody');

    if (_mode === 'captura') {
      if (title) title.textContent = 'captura rápida';
      if (sub)   sub.textContent   = getModuleCtx();
      if (inputArea) inputArea.style.display = 'none';
      if (body)  body.style.display = 'flex';
    } else {
      if (title) title.textContent = 'Anet';
      if (sub)   sub.textContent   = getModuleCtx();
      if (inputArea) inputArea.style.display = 'flex';
      if (body)  body.style.display = 'flex';
    }
  }

  /* ━━ FAB EVENTS ━━ */
  function onFabPointerDown(e) {
    _longPressTimer = setTimeout(() => {
      _longPressTimer = null;
      navigator.vibrate?.(40);
      if (_mode === 'chat' && _sheetState !== 'closed') { closeSheet(); return; }
      openChat();
    }, 600);
  }

  function onFabPointerUp(e) {
    if (_longPressTimer) {
      clearTimeout(_longPressTimer);
      _longPressTimer = null;
      // Tap corto
      if (_mode === 'captura' && _sheetState !== 'closed') { closeSheet(); return; }
      if (_mode === 'chat' && _sheetState !== 'closed') { closeSheet(); return; }
      openCaptura();
    }
  }

  function onFabPointerLeave() {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  }

  /* ━━ DRAG HANDLE ━━ */
  function onHandlePointerDown(e) {
    _dragStart  = e.clientY;
    _dragStartH = document.getElementById('andySheet')?.getBoundingClientRect().height || 0;
    document.addEventListener('pointermove', onHandlePointerMove);
    document.addEventListener('pointerup', onHandlePointerUp2);
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

  function onHandlePointerUp2(e) {
    document.removeEventListener('pointermove', onHandlePointerMove);
    document.removeEventListener('pointerup', onHandlePointerUp2);
    if (_dragStart === null) return;
    const sheet = document.getElementById('andySheet');
    if (sheet) sheet.style.transition = '';
    const diff = _dragStart - e.clientY;
    _dragStart = null;
    const currentH = sheet?.getBoundingClientRect().height || 0;
    const ratio = currentH / window.innerHeight;
    if (ratio < 0.15)      { closeSheet(); return; }
    if (ratio < 0.75)      { setSheetState('half'); return; }
    setSheetState('expanded');
  }

  /* ━━ KEYBOARD ━━ */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey||e.metaKey) && e.key==='j') { e.preventDefault(); _sheetState!=='closed'?closeSheet():openCaptura(); }
      if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); _sheetState!=='closed'&&_mode==='chat'?closeSheet():openChat(); }
      if (e.key==='Escape' && _sheetState!=='closed') closeSheet();
    });
  }

  /* ━━ INJECT HTML ━━ */
  function inject() {
    if (document.getElementById('andyFabBtn')) return;

    const suggs = getSugerencias().map(s =>
      `<button class="andy-sugg-chip" onclick="AndyFab.send('${s.replace(/'/g,"\\'")}')">${s}</button>`
    ).join('');

    const html = `
      <div id="andyOverlay" class="andy-sheet-overlay" onclick="AndyFab.closeSheet()"></div>

      <div id="andySheet" class="andy-sheet">
        <div class="andy-sheet-handle" id="andyHandle"></div>
        <div class="andy-sheet-header">
          <div class="andy-sheet-header-left">
            <div class="andy-sheet-avatar">✦</div>
            <div>
              <div class="andy-sheet-title" id="andySheetTitle">captura rápida</div>
              <div class="andy-sheet-ctx" id="andySheetSub">${getModuleCtx()}</div>
            </div>
          </div>
          <div class="andy-sheet-actions">
            <button class="andy-sheet-expand" id="andyExpandBtn" onclick="AndyFab.toggleExpand()" title="expandir">↑</button>
            <button class="andy-sheet-close" onclick="AndyFab.closeSheet()">×</button>
          </div>
        </div>

        <!-- Body dinámico: captura o chat msgs -->
        <div class="andy-sheet-msgs" id="andySheetBody" style="display:flex;flex-direction:column"></div>

        <!-- Sugerencias (solo en modo chat) -->
        <div class="andy-sheet-sugg" id="andySugg">${suggs}</div>

        <!-- Input chat (oculto en captura) -->
        <div class="andy-sheet-input" id="andyChatInput" style="display:none">
          <textarea class="andy-input" id="andyInput" placeholder="pregúntale algo a Anet..." rows="1"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();AndyFab.send()}"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
          <button class="andy-send-btn" onclick="AndyFab.send()">→</button>
        </div>
      </div>

      <button id="andyFabBtn" class="andy-fab" title="Tap: captura · Long press: Anet">
        <span class="andy-fab-icon">✦</span>
      </button>`;

    document.body.insertAdjacentHTML('beforeend', html);

    const fab = document.getElementById('andyFabBtn');
    fab.addEventListener('pointerdown', onFabPointerDown);
    fab.addEventListener('pointerup',   onFabPointerUp);
    fab.addEventListener('pointerleave', onFabPointerLeave);
    fab.addEventListener('contextmenu',  e => e.preventDefault());

    document.getElementById('andyHandle').addEventListener('pointerdown', onHandlePointerDown);

    document.addEventListener('click', e => {
      if (_sheetState === 'closed') return;
      if (!e.target.closest('#andySheet') && !e.target.closest('#andyFabBtn')) closeSheet();
    });

    initKeyboard();
  }

  function init() {
    inject();
  }

  return {
    init,
    send,
    openCaptura,
    openChat,
    closeSheet,
    toggleExpand,
    selTipo,
    selDest,
    submitCaptura,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AndyFab.init);
} else {
  AndyFab.init();
}
