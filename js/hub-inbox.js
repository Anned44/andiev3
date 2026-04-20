/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-INBOX.JS — Andy.net v3
   Inbox completo: filtros, contadores,
   procesar, enviar al planner, eliminar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.HubInbox = (function () {
  'use strict';

  // Acceso lazy a HubCore para evitar problemas de orden de carga
  const _core = () => window.HubCore;
  const lg = (k, f) => _core().lg(k, f);
  const ls = (k, v) => _core().ls(k, v);
  const showToast = (m) => _core().showToast(m);
  const triggerAutosave = () => _core().triggerAutosave();

  const MN = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  let currentFilter = 'todas';

  /* ━━ STORAGE ━━ */
  function getInbox() { return lg('dash_inbox', []); }
  function saveInbox(data) { ls('dash_inbox', data); triggerAutosave(); }

  /* ━━ STATS ━━ */
  function updateStats() {
    const inbox = getInbox();
    const pend  = inbox.filter(i => i.status === 'pendiente').length;
    const proc  = inbox.filter(i => i.status === 'procesado').length;
    const set   = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('istatPend',  pend);
    set('istatTodos', inbox.length);
    set('istatProc',  proc);
  }

  /* ━━ FILTROS ━━ */
  function setFilter(btn) {
    document.querySelectorAll('.ifilter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.f;
    renderList();
  }

  /* ━━ RENDER ━━ */
  function renderList() {
    const container = document.getElementById('inboxList');
    if (!container) return;

    const inbox = getInbox();
    let items = currentFilter === 'todas'
      ? inbox
      : inbox.filter(i => (i.type || 'nota') === currentFilter);

    if (!items.length) {
      container.innerHTML = '<div class="empty-state">sin items ✓</div>';
      return;
    }

    container.innerHTML = items.map(i => renderCard(i)).join('');
  }

  function renderCard(i) {
    const d = new Date(i.time);
    const dateStr = d.getDate() + ' ' + MN[d.getMonth()].slice(0, 3);
    const isProcesado = i.status === 'procesado';

    return `<div class="inbox-card${isProcesado ? ' procesado' : ''}" id="ic-${i.id}">
      <div class="inbox-card-top">
        <span class="badge badge-${i.type||'nota'}">${i.type||'nota'}</span>
        <div class="inbox-card-body">
          <div class="inbox-card-text">${i.text}</div>
          <div class="inbox-card-meta">
            ${i.prio ? `<span class="inbox-meta-prio" style="background:${PRIO_BG[i.prio]};color:${PRIO_COLOR[i.prio]}">↑ ${i.prio}</span>` : ''}
            <span class="inbox-meta-date">${dateStr}</span>
            ${isProcesado ? '<span class="inbox-meta-done">✓ procesado</span>' : ''}
          </div>
        </div>
      </div>
      <div class="inbox-card-actions">
        ${!isProcesado ? `
          <button class="iaction procesar" onclick="HubInbox.procesar(${i.id})">✓ procesar</button>
          <button class="iaction planner"  onclick="HubInbox.toPlanner(${i.id})">◧ planner</button>
        ` : ''}
        <button class="iaction eliminar" onclick="HubInbox.eliminar(${i.id})">× eliminar</button>
      </div>

      <!-- Mini picker de planner (oculto por defecto) -->
      <div class="inbox-planner-picker" id="picker-${i.id}" style="display:none">
        <div class="picker-label">enviar a planner</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          <div>
            <div class="picker-sub-label">día</div>
            <input type="date" class="picker-input" id="picker-date-${i.id}" value="${todayKey()}">
          </div>
          <div>
            <div class="picker-sub-label">bloque</div>
            <select class="picker-input" id="picker-block-${i.id}" style="appearance:none;-webkit-appearance:none">
              <option value="morning">🌅 Mañana</option>
              <option value="afternoon">🌤 Tarde</option>
              <option value="night">🌙 Noche</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="iaction procesar" onclick="HubInbox.confirmToPlanner(${i.id})">→ enviar</button>
          <button class="iaction" onclick="HubInbox.closePicker(${i.id})">cancelar</button>
        </div>
      </div>
    </div>`;
  }

  const PRIO_BG    = { alta:'rgba(200,110,138,.15)', media:'rgba(200,150,90,.15)', baja:'rgba(90,138,106,.15)' };
  const PRIO_COLOR = { alta:'var(--pink)', media:'var(--studio)', baja:'var(--green)' };

  /* ━━ ACCIONES ━━ */
  function procesar(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (it) it.status = 'procesado';
    saveInbox(inbox);
    updateStats();
    renderList();
    window.HubDashboard?.renderDashInbox?.();
    showToast('✓ procesado');
  }

  function toPlanner(id) {
    // Mostrar mini picker
    document.querySelectorAll('.inbox-planner-picker').forEach(el => el.style.display = 'none');
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.style.display = 'block';
  }

  function closePicker(id) {
    const picker = document.getElementById('picker-' + id);
    if (picker) picker.style.display = 'none';
  }

  function confirmToPlanner(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;

    const dateKey = document.getElementById('picker-date-' + id)?.value || todayKey();
    const block   = document.getElementById('picker-block-' + id)?.value || 'morning';

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

    // Marcar como procesado
    it.status = 'procesado';
    saveInbox(inbox);
    updateStats();
    renderList();
    window.HubDashboard?.renderDashInbox?.();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('→ enviado al planner · ' + block);
  }

  function eliminar(id) {
    const inbox = getInbox().filter(i => i.id !== id);
    saveInbox(inbox);
    updateStats();
    renderList();
    window.HubDashboard?.renderDashInbox?.();
    showToast('eliminado');
  }

  /* ━━ REFRESH ━━ */
  function refresh() {
    updateStats();
    renderList();
  }

  /* ━━ INIT ━━ */
  function init() {
    currentFilter = 'todas';
    // Reset filtros UI
    document.querySelectorAll('.ifilter').forEach(b => {
      b.classList.toggle('active', b.dataset.f === 'todas');
    });
    updateStats();
    renderList();
  }

  /* ━━ API PÚBLICA ━━ */
  return {
    init,
    refresh,
    setFilter,
    procesar,
    toPlanner,
    closePicker,
    confirmToPlanner,
    eliminar,
  };
})();
