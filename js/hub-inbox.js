/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-INBOX.JS — Andy.net v3
   Estilo basado en app original
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.HubInbox = (function () {
  'use strict';

  const _core = () => window.HubCore;
  const lg = (k, f) => _core().lg(k, f);
  const ls = (k, v) => _core().ls(k, v);
  const showToast = (m) => _core().showToast(m);
  const triggerAutosave = () => _core().triggerAutosave();

  const MN = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  const IBX_TAGS = {
    captura: { color:'#9a8aaa', border:'rgba(154,138,170,.4)', emoji:'📥' },
    idea:    { color:'#c8965a', border:'rgba(200,150,90,.4)',  emoji:'💡' },
    tarea:   { color:'#5a7aaa', border:'rgba(90,122,170,.4)', emoji:'☐'  },
    nota:    { color:'#7a9a7a', border:'rgba(122,154,122,.4)',emoji:'✎'  },
    evento:  { color:'#9b7ab8', border:'rgba(155,122,184,.4)',emoji:'◈'  },
  };

  let ibxFilter    = 'todas';
  let ibxTagFilter = 'all';

  /* ━━ DATA ━━ */
  function getInbox() { return lg('dash_inbox', []); }
  function saveInbox(data) { ls('dash_inbox', data); triggerAutosave(); }

  /* ━━ STATS ━━ */
  function updateStats() {
    const all  = getInbox();
    const pend = all.filter(i => i.status !== 'procesado').length;
    const proc = all.filter(i => i.status === 'procesado').length;
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    s('ibxNumPend', pend);
    s('ibxNumTodos', all.length);
    s('ibxNumProc', proc);
    // legacy ids
    s('istatPend', pend);
    s('istatTodos', all.length);
    s('istatProc', proc);
  }

  /* ━━ RENDER ━━ */
  function render() {
    const container = document.getElementById('inboxList');
    if (!container) return;

    let items = getInbox();
    if (ibxFilter === 'pendientes') items = items.filter(i => i.status !== 'procesado');
    if (ibxFilter === 'procesados') items = items.filter(i => i.status === 'procesado');
    if (ibxTagFilter !== 'all')     items = items.filter(i => (i.type || 'captura') === ibxTagFilter);

    if (!items.length) {
      container.innerHTML = `<div class="ibxs-empty">
        <div class="ibxs-empty-ico">📥</div>
        <div class="ibxs-empty-txt">nada aquí</div>
      </div>`;
      return;
    }

    container.innerHTML = items.map(item => {
      const tag = IBX_TAGS[item.type || 'captura'] || IBX_TAGS.captura;
      const d = new Date(item.time || Date.now());
      const dateStr = isNaN(d) ? '' : d.getDate() + ' ' + MN[d.getMonth()];
      const isDone  = item.status === 'procesado';
      return `<div class="ibxs-card${isDone ? ' processed' : ''}" id="ibxcard-${item.id}">
        <div class="ibxs-card-top">
          <span class="ibxs-card-tag" style="color:${tag.color};border-color:${tag.border}" title="tipo">${tag.emoji} ${item.type || 'captura'}</span>
          <span class="ibxs-card-text">${escHtml(item.text)}</span>
          <span class="ibxs-card-date">${dateStr}</span>
        </div>
        <div class="ibxs-card-actions">
          <button class="ibxs-act a-done" onclick="HubInbox.markDone(${item.id})">${isDone ? '↩ restaurar' : '✓ procesar'}</button>
          <button class="ibxs-act a-pln"  onclick="HubInbox.openPicker('ibxpln-${item.id}')">📅 planner</button>
          <button class="ibxs-act a-del"  onclick="HubInbox.del(${item.id})">🗑 eliminar</button>
        </div>
        <div class="ibxs-picker" id="ibxpln-${item.id}">
          <span class="ibxs-pick-label">día</span>
          <select class="ibxs-pick-sel" id="ibxDay-${item.id}">
            <option value="0">hoy</option>
            <option value="1">mañana</option>
          </select>
          <span class="ibxs-pick-label">bloque</span>
          <select class="ibxs-pick-sel" id="ibxBlock-${item.id}">
            <option value="morning">🌅 Mañana</option>
            <option value="afternoon">🌤 Tarde</option>
            <option value="night">🌙 Noche</option>
          </select>
          <button class="ibxs-pick-go" onclick="HubInbox.sendToPlanner(${item.id})">→ enviar</button>
        </div>
      </div>`;
    }).join('');
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ━━ FILTROS ━━ */
  function setStatusFilter(btn, filter) {
    document.querySelectorAll('.ibxs-stat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ibxFilter = filter;
    render();
  }

  function setTagFilter(btn, tag) {
    document.querySelectorAll('.ibxs-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ibxTagFilter = tag;
    render();
  }

  // compatibilidad con filtros viejos
  function setFilter(btn) {
    document.querySelectorAll('.ifilter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ibxTagFilter = btn.dataset.f === 'todas' ? 'all' : btn.dataset.f;
    render();
  }

  /* ━━ ACCIONES ━━ */
  function markDone(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;
    it.status = it.status === 'procesado' ? 'pendiente' : 'procesado';
    saveInbox(inbox);
    updateStats();
    render();
    window.HubDashboard?.renderDashInbox?.();
    showToast(it.status === 'procesado' ? '✓ procesado' : '↩ restaurado');
  }

  function openPicker(pickerId) {
    document.querySelectorAll('.ibxs-picker').forEach(p => p.classList.remove('open'));
    const el = document.getElementById(pickerId);
    if (el) el.classList.toggle('open');
  }

  function sendToPlanner(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;

    const dayOffset = parseInt(document.getElementById('ibxDay-' + id)?.value || '0');
    const block     = document.getElementById('ibxBlock-' + id)?.value || 'morning';
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const dateKey = d.toISOString().slice(0, 10);

    const state = lg('appState', {});
    if (!state.plannerByDate) state.plannerByDate = {};
    if (!state.plannerByDate[dateKey]) state.plannerByDate[dateKey] = { morning:[], afternoon:[], night:[] };
    state.plannerByDate[dateKey][block].push({
      id:   Date.now(),
      text: it.text,
      type: it.type === 'evento' ? 'evento' : 'tarea',
      prio: it.prio || 'media',
      done: false,
      tags: [],
      subtasks: [],
    });
    ls('appState', state);

    it.status = 'procesado';
    saveInbox(inbox);
    updateStats();
    render();
    document.querySelectorAll('.ibxs-picker').forEach(p => p.classList.remove('open'));
    window.HubDashboard?.renderDashInbox?.();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('→ enviado al planner');
  }

  function del(id) {
    const inbox = getInbox().filter(i => i.id !== id);
    saveInbox(inbox);
    updateStats();
    render();
    window.HubDashboard?.renderDashInbox?.();
    showToast('eliminado');
  }

  /* ━━ REFRESH ━━ */
  function refresh() {
    updateStats();
    render();
  }

  /* ━━ INIT ━━ */
  function init() {
    ibxFilter    = 'todas';
    ibxTagFilter = 'all';
    updateStats();
    render();
  }

  return {
    init, refresh, setFilter,
    setStatusFilter, setTagFilter,
    markDone, openPicker, sendToPlanner, del,
  };
})();
