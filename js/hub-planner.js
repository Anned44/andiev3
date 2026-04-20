/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-PLANNER.JS — Andy.net v3
   Planner completo: bloques, tipos, drag&drop,
   subtareas, etiquetas, notificaciones
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.HubPlanner = (function () {
  'use strict';

  const { lg, ls, todayKey, showToast, triggerAutosave } = window.HubCore;

  const MN = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const DF = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const DS = ['lu','ma','mi','ju','vi','sá','do'];

  const PRIO_COLOR = { alta:'#c86e8a', media:'#c8965a', baja:'#5a8a6a', '':'#5a4f70' };
  const TYPE_BG    = { tarea:'rgba(200,150,90,.2)', evento:'rgba(155,122,184,.2)', recordar:'rgba(244,167,185,.2)' };
  const TYPE_COLOR = { tarea:'var(--studio)', evento:'var(--muse)', recordar:'var(--self)' };

  const BLOCKS = [
    { key:'morning',   icon:'🌅', label:'MAÑANA', time:'6AM – 12PM' },
    { key:'afternoon', icon:'🌤', label:'TARDE',  time:'12PM – 7PM' },
    { key:'night',     icon:'🌙', label:'NOCHE',  time:'7PM – 12AM' },
  ];

  let currentDate = todayKey();
  let collapsed   = { morning: false, afternoon: false, night: false };
  let dragSrc     = null; // { block, idx }
  let notifPermission = false;

  /* ━━ STORAGE ━━ */
  function getDay(dateKey) {
    const s = lg('appState', {});
    if (!s.plannerByDate) s.plannerByDate = {};
    if (!s.plannerByDate[dateKey]) s.plannerByDate[dateKey] = { morning:[], afternoon:[], night:[] };
    return s.plannerByDate[dateKey];
  }

  function saveDay(dateKey, day) {
    const s = lg('appState', {});
    if (!s.plannerByDate) s.plannerByDate = {};
    s.plannerByDate[dateKey] = day;
    ls('appState', s);
    triggerAutosave();
  }

  /* ━━ NOTIFICACIONES ━━ */
  async function requestNotifPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') { notifPermission = true; return; }
    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      notifPermission = perm === 'granted';
    }
  }

  function scheduleNotif(text, timeStr, dateKey) {
    if (!notifPermission) return;
    if (!timeStr || !dateKey) return;
    const [h, m] = timeStr.split(':').map(Number);
    const target = new Date(dateKey + 'T' + timeStr);
    const now    = new Date();
    const diff   = target - now;
    if (diff <= 0) return;
    setTimeout(() => {
      new Notification('Andy.net — Recordatorio', {
        body: text,
        icon: '/icon-192.png'
      });
    }, diff);
  }

  /* ━━ STATS ━━ */
  function updateStats() {
    const day  = getDay(currentDate);
    const all  = [...(day.morning||[]), ...(day.afternoon||[]), ...(day.night||[])];
    const done = all.filter(i => i.done).length;
    const pct  = all.length ? Math.round((done / all.length) * 100) : 0;
    const set  = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('plnStatE', all.length);
    set('plnStatC', done);
    set('plnStatP', pct + '%');
  }

  /* ━━ NAV ━━ */
  function navDay(dir) {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    currentDate = d.toISOString().slice(0, 10);
    ls('hub_plannerDate', currentDate);
    renderPlanner();
  }

  function goToday() {
    currentDate = todayKey();
    ls('hub_plannerDate', currentDate);
    renderPlanner();
  }

  function saveIntencion() {
    const val = document.getElementById('plnIntencion')?.value || '';
    ls('hub_pln_int_' + currentDate, val);
    triggerAutosave();
  }

  /* ━━ RENDER PRINCIPAL ━━ */
  function renderPlanner() {
    // Fecha guardada
    const saved = lg('hub_plannerDate', null);
    if (saved) currentDate = saved;

    // Nav date label
    const d = new Date(currentDate + 'T12:00:00');
    const dateEl = document.getElementById('plnNavDate');
    if (dateEl) {
      const isToday = currentDate === todayKey();
      dateEl.textContent = DF[d.getDay()].toUpperCase() + ', ' + d.getDate() + ' DE ' + MN[d.getMonth()].toUpperCase() + ' ' + d.getFullYear();
      dateEl.style.color = isToday ? 'var(--hub)' : 'var(--text)';
    }

    // Intención
    const intEl = document.getElementById('plnIntencion');
    if (intEl) intEl.value = lg('hub_pln_int_' + currentDate, '');

    // Stats
    updateStats();

    // Bloques
    const container = document.getElementById('plnBlocksContainer');
    if (!container) return;
    container.innerHTML = BLOCKS.map(b => renderBlock(b)).join('');

    // Bind drag & drop
    bindDragDrop();
  }

  /* ━━ RENDER BLOQUE ━━ */
  function renderBlock(b) {
    const day   = getDay(currentDate);
    const items = day[b.key] || [];
    const pend  = items.filter(i => !i.done).length;
    const isCol = collapsed[b.key];

    return `<div class="pln-block-card" id="block-${b.key}">
      <div class="pln-block-header">
        <div class="pln-block-title">
          <span class="pln-block-icon">${b.icon}</span>
          <span class="pln-block-name">${b.label}</span>
          <span class="pln-block-time">${b.time}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="pln-block-count">${pend} pendientes</span>
          <button class="pln-block-collapse" onclick="HubPlanner.toggleCollapse('${b.key}')" title="${isCol?'expandir':'colapsar'}">
            ${isCol ? '▸' : '▾'}
          </button>
        </div>
      </div>

      ${!isCol ? `
        <div class="pln-items-list" id="pln-list-${b.key}" 
          ondragover="HubPlanner.onDragOver(event,'${b.key}')"
          ondrop="HubPlanner.onDrop(event,'${b.key}')">
          ${!items.length
            ? '<div class="empty-state" style="padding:12px 0">sin entradas — agrega una abajo</div>'
            : items.map((it, i) => renderEntry(it, i, b.key)).join('')
          }
        </div>

        <div class="pln-add-form" id="pln-form-${b.key}">
          <div class="pln-add-row1">
            <input class="pln-add-input" id="pln-input-${b.key}" 
              placeholder="agregar entrada..."
              onkeydown="if(event.key==='Enter')HubPlanner.addEntry('${b.key}')">
            <button class="pln-add-submit" onclick="HubPlanner.addEntry('${b.key}')">+</button>
          </div>
          <div class="pln-add-row2">
            <span class="pln-chip-label">tipo:</span>
            <button class="pln-chip sel" data-type="tarea" data-b="${b.key}" onclick="HubPlanner.selChip(this,'type','${b.key}')">☐ tarea</button>
            <button class="pln-chip" data-type="evento" data-b="${b.key}" onclick="HubPlanner.selChip(this,'type','${b.key}')">◈ evento</button>
            <button class="pln-chip" data-type="recordar" data-b="${b.key}" onclick="HubPlanner.selChip(this,'type','${b.key}')">⏰ recordar</button>
            <span class="pln-sep">·</span>
            <span class="pln-chip-label">prio:</span>
            <button class="pln-chip prio-alta" data-prio="alta" data-b="${b.key}" onclick="HubPlanner.selChip(this,'prio','${b.key}')">alta</button>
            <button class="pln-chip prio-media sel" data-prio="media" data-b="${b.key}" onclick="HubPlanner.selChip(this,'prio','${b.key}')">media</button>
            <button class="pln-chip prio-baja" data-prio="baja" data-b="${b.key}" onclick="HubPlanner.selChip(this,'prio','${b.key}')">baja</button>
          </div>
          ${renderExtraFields(b.key)}
        </div>
      ` : ''}
    </div>`;
  }

  function renderExtraFields(blockKey) {
    return `
      <div class="pln-extra-fields" id="pln-extra-${blockKey}" style="display:none">
        <!-- Tarea: subtareas -->
        <div class="pln-extra-section" id="pln-subtasks-${blockKey}" style="display:none">
          <div class="pln-extra-label">subtareas</div>
          <div id="pln-subtask-list-${blockKey}"></div>
          <div style="display:flex;gap:6px;margin-top:6px">
            <input class="pln-add-input" id="pln-subtask-input-${blockKey}" placeholder="añadir subtarea..." style="font-size:11px;padding:6px 10px" onkeydown="if(event.key==='Enter')HubPlanner.addSubtaskPreview('${blockKey}')">
            <button class="pln-add-submit" style="padding:6px 10px;font-size:9px" onclick="HubPlanner.addSubtaskPreview('${blockKey}')">+</button>
          </div>
        </div>

        <!-- Evento: hora + lugar + categoría -->
        <div class="pln-extra-section" id="pln-evento-fields-${blockKey}" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <div class="pln-extra-label">inicio</div>
              <input type="time" class="pln-add-input" id="pln-ev-start-${blockKey}" style="font-size:11px;padding:6px 10px">
            </div>
            <div>
              <div class="pln-extra-label">fin</div>
              <input type="time" class="pln-add-input" id="pln-ev-end-${blockKey}" style="font-size:11px;padding:6px 10px">
            </div>
            <div>
              <div class="pln-extra-label">categoría</div>
              <select class="pln-add-input" id="pln-ev-cat-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;appearance:none">
                <option value="personal">personal</option>
                <option value="trabajo">trabajo</option>
                <option value="salud">salud</option>
                <option value="social">social</option>
              </select>
            </div>
          </div>
          <div>
            <div class="pln-extra-label">lugar (opcional)</div>
            <input class="pln-add-input" id="pln-ev-lugar-${blockKey}" placeholder="lugar..." style="font-size:11px;padding:6px 10px">
          </div>
          <div style="margin-top:8px">
            <div class="pln-extra-label">recordatorio antes del evento</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              <button class="pln-chip" data-rem="none" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">ninguno</button>
              <button class="pln-chip sel" data-rem="15" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">15 min</button>
              <button class="pln-chip" data-rem="30" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">30 min</button>
              <button class="pln-chip" data-rem="60" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">1 hora</button>
            </div>
          </div>
        </div>

        <!-- Recordar: hora exacta + repetición -->
        <div class="pln-extra-section" id="pln-recordar-fields-${blockKey}" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <div class="pln-extra-label">hora exacta</div>
              <input type="time" class="pln-add-input" id="pln-rec-time-${blockKey}" style="font-size:11px;padding:6px 10px">
            </div>
            <div>
              <div class="pln-extra-label">repetición</div>
              <select class="pln-add-input" id="pln-rec-rep-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;appearance:none">
                <option value="once">una vez</option>
                <option value="daily">diario</option>
                <option value="weekly">semanal</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Etiquetas (todos los tipos) -->
        <div style="margin-top:8px">
          <div class="pln-extra-label">etiquetas</div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px" id="pln-tags-preview-${blockKey}">
            <input class="pln-add-input" id="pln-tag-input-${blockKey}" placeholder="etiqueta..." style="font-size:11px;padding:5px 9px;width:120px" onkeydown="if(event.key==='Enter'||event.key===',')HubPlanner.addTagPreview('${blockKey}')">
            <span style="font-family:var(--mono);font-size:8px;color:var(--muted)">↵ para agregar</span>
          </div>
        </div>

        <!-- Meta vinculada -->
        <div style="margin-top:8px">
          <div class="pln-extra-label">vincular meta</div>
          <select class="pln-add-input" id="pln-meta-select-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;appearance:none;margin-top:4px">
            <option value="">sin meta</option>
            ${getMetasOptions()}
          </select>
        </div>
      </div>`;
  }

  function getMetasOptions() {
    const metas = lg('hub_metas', []);
    return metas.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
  }

  /* ━━ RENDER ENTRADA ━━ */
  function renderEntry(it, idx, blockKey) {
    const type = it.type || 'tarea';
    const prio = it.prio || 'media';
    const timeStr = it.startTime ? ` · ${it.startTime}${it.endTime?'–'+it.endTime:''}` : (it.recTime ? ` · ${it.recTime}` : '');
    const tags = (it.tags||[]).map(t => `<span class="pln-tag">${t}</span>`).join('');
    const subtasksDone = (it.subtasks||[]).filter(s=>s.done).length;
    const subtasksTotal = (it.subtasks||[]).length;

    return `<div class="pln-entry${it.done?' done-entry':''}" 
        draggable="true"
        data-idx="${idx}"
        data-block="${blockKey}"
        ondragstart="HubPlanner.onDragStart(event,'${blockKey}',${idx})"
        ondragend="HubPlanner.onDragEnd(event)">
      <div class="pln-entry-check${it.done?' done':''}" 
        onclick="HubPlanner.toggleEntry('${blockKey}',${idx})">
        ${it.done?'✓':''}
      </div>
      <div class="pln-entry-main">
        <div class="pln-entry-text${it.done?' done':''}">${it.text}</div>
        <div class="pln-entry-meta">
          <span class="pln-entry-type" style="background:${TYPE_BG[type]||'rgba(90,122,170,.15)'};color:${TYPE_COLOR[type]||'var(--hub)'}">${type}</span>
          <div class="pln-entry-prio" style="background:${PRIO_COLOR[prio]}"></div>
          ${timeStr ? `<span class="pln-entry-time">${timeStr}</span>` : ''}
          ${it.lugar ? `<span class="pln-entry-time">📍 ${it.lugar}</span>` : ''}
          ${subtasksTotal ? `<span class="pln-entry-time">${subtasksDone}/${subtasksTotal} sub</span>` : ''}
          ${it.metaNombre ? `<span class="pln-entry-time">◎ ${it.metaNombre}</span>` : ''}
          ${tags}
        </div>
        ${subtasksTotal ? renderSubtasksMini(it.subtasks, blockKey, idx) : ''}
        ${it.notes ? `<div class="pln-entry-notes">${it.notes}</div>` : ''}
      </div>
      <div class="pln-entry-actions">
        <button class="pln-entry-del" onclick="HubPlanner.deleteEntry('${blockKey}',${idx})" title="eliminar">×</button>
      </div>
    </div>`;
  }

  function renderSubtasksMini(subtasks, blockKey, idx) {
    if (!subtasks || !subtasks.length) return '';
    return `<div class="pln-subtasks-mini">
      ${subtasks.map((s, si) => `
        <div class="pln-subtask-item">
          <div class="pln-subtask-check${s.done?' done':''}" onclick="HubPlanner.toggleSubtask('${blockKey}',${idx},${si})">${s.done?'✓':''}</div>
          <span class="pln-subtask-text${s.done?' done':''}">${s.text}</span>
        </div>`).join('')}
    </div>`;
  }

  /* ━━ CHIPS ━━ */
  function selChip(btn, group, block) {
    document.querySelectorAll(`.pln-chip[data-${group}][data-b="${block}"]`).forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');

    if (group === 'type') {
      // Mostrar/ocultar campos extra
      const extra = document.getElementById('pln-extra-' + block);
      if (extra) {
        const type = btn.dataset.type;
        extra.style.display = 'block';
        ['subtasks','evento-fields','recordar-fields'].forEach(s => {
          const el = document.getElementById(`pln-${s}-${block}`);
          if (el) el.style.display = 'none';
        });
        if (type === 'tarea')   { const el = document.getElementById(`pln-subtasks-${block}`); if(el) el.style.display='block'; }
        if (type === 'evento')  { const el = document.getElementById(`pln-evento-fields-${block}`); if(el) el.style.display='block'; }
        if (type === 'recordar'){ const el = document.getElementById(`pln-recordar-fields-${block}`); if(el) el.style.display='block'; }
      }
    }
  }

  /* ━━ TAGS PREVIEW ━━ */
  const _pendingTags = {};
  function addTagPreview(blockKey) {
    const input = document.getElementById('pln-tag-input-' + blockKey);
    const tag = input?.value.replace(/,/g,'').trim();
    if (!tag) return;
    if (!_pendingTags[blockKey]) _pendingTags[blockKey] = [];
    if (!_pendingTags[blockKey].includes(tag)) _pendingTags[blockKey].push(tag);
    input.value = '';
    renderTagsPreview(blockKey);
  }
  function renderTagsPreview(blockKey) {
    const wrap = document.getElementById('pln-tags-preview-' + blockKey);
    if (!wrap) return;
    const input = document.getElementById('pln-tag-input-' + blockKey);
    const tags = _pendingTags[blockKey] || [];
    // remove old tags but keep input
    wrap.querySelectorAll('.pln-tag-preview').forEach(el => el.remove());
    tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'pln-tag pln-tag-preview';
      span.textContent = t;
      span.onclick = () => {
        _pendingTags[blockKey] = _pendingTags[blockKey].filter(x => x !== t);
        renderTagsPreview(blockKey);
      };
      wrap.insertBefore(span, input);
    });
  }

  /* ━━ SUBTASKS PREVIEW ━━ */
  const _pendingSubtasks = {};
  function addSubtaskPreview(blockKey) {
    const input = document.getElementById('pln-subtask-input-' + blockKey);
    const txt = input?.value.trim();
    if (!txt) return;
    if (!_pendingSubtasks[blockKey]) _pendingSubtasks[blockKey] = [];
    _pendingSubtasks[blockKey].push({ text: txt, done: false });
    input.value = '';
    renderSubtasksPreview(blockKey);
  }
  function renderSubtasksPreview(blockKey) {
    const list = document.getElementById('pln-subtask-list-' + blockKey);
    if (!list) return;
    const subs = _pendingSubtasks[blockKey] || [];
    list.innerHTML = subs.map((s, i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:11px;color:var(--muted2)">
        <span style="font-family:var(--mono);font-size:9px">☐</span>
        <span style="flex:1">${s.text}</span>
        <button onclick="HubPlanner._removeSubPreview('${blockKey}',${i})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px">×</button>
      </div>`).join('');
  }
  function _removeSubPreview(blockKey, idx) {
    if (_pendingSubtasks[blockKey]) _pendingSubtasks[blockKey].splice(idx, 1);
    renderSubtasksPreview(blockKey);
  }

  /* ━━ ADD ENTRY ━━ */
  function addEntry(blockKey) {
    const input = document.getElementById('pln-input-' + blockKey);
    const txt = input?.value.trim();
    if (!txt) { input?.focus(); return; }

    const typeChip = document.querySelector(`.pln-chip[data-type][data-b="${blockKey}"].sel`);
    const prioChip = document.querySelector(`.pln-chip[data-prio][data-b="${blockKey}"].sel`);
    const type = typeChip?.dataset.type || 'tarea';
    const prio = prioChip?.dataset.prio || 'media';

    const entry = {
      id:   Date.now(),
      text: txt,
      type,
      prio,
      done: false,
      tags:     _pendingTags[blockKey] || [],
      subtasks: _pendingSubtasks[blockKey] || [],
      notes:    '',
    };

    // Campos de evento
    if (type === 'evento') {
      entry.startTime = document.getElementById('pln-ev-start-' + blockKey)?.value || '';
      entry.endTime   = document.getElementById('pln-ev-end-' + blockKey)?.value || '';
      entry.lugar     = document.getElementById('pln-ev-lugar-' + blockKey)?.value || '';
      entry.evCat     = document.getElementById('pln-ev-cat-' + blockKey)?.value || 'personal';
      const remChip   = document.querySelector(`.pln-chip[data-rem][data-b="${blockKey}"].sel`);
      entry.reminder  = remChip?.dataset.rem || '15';
      // Programar notificación
      if (entry.startTime && entry.reminder !== 'none') {
        const [h,m] = entry.startTime.split(':').map(Number);
        const remMins = parseInt(entry.reminder);
        const notifTime = new Date(currentDate + 'T' + entry.startTime);
        notifTime.setMinutes(notifTime.getMinutes() - remMins);
        scheduleNotif(txt, notifTime.toTimeString().slice(0,5), currentDate);
      }
    }

    // Campos de recordatorio
    if (type === 'recordar') {
      entry.recTime = document.getElementById('pln-rec-time-' + blockKey)?.value || '';
      entry.recRep  = document.getElementById('pln-rec-rep-' + blockKey)?.value || 'once';
      if (entry.recTime) scheduleNotif(txt, entry.recTime, currentDate);
    }

    // Meta vinculada
    const metaSel = document.getElementById('pln-meta-select-' + blockKey);
    if (metaSel?.value) {
      entry.metaId = metaSel.value;
      const metas = lg('hub_metas', []);
      const meta = metas.find(m => String(m.id) === String(metaSel.value));
      if (meta) entry.metaNombre = meta.nombre;
    }

    const day = getDay(currentDate);
    day[blockKey].push(entry);
    saveDay(currentDate, day);

    // Reset form
    input.value = '';
    delete _pendingTags[blockKey];
    delete _pendingSubtasks[blockKey];

    // Re-render bloque
    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('✓ entrada añadida');
  }

  /* ━━ TOGGLE ENTRY ━━ */
  function toggleEntry(blockKey, idx) {
    const day = getDay(currentDate);
    const it  = day[blockKey][idx];
    if (it) it.done = !it.done;
    saveDay(currentDate, day);
    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
  }

  /* ━━ DELETE ENTRY ━━ */
  function deleteEntry(blockKey, idx) {
    const day = getDay(currentDate);
    day[blockKey].splice(idx, 1);
    saveDay(currentDate, day);
    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('entrada eliminada');
  }

  /* ━━ SUBTASKS ━━ */
  function toggleSubtask(blockKey, entryIdx, subIdx) {
    const day = getDay(currentDate);
    const sub = day[blockKey][entryIdx]?.subtasks?.[subIdx];
    if (sub) sub.done = !sub.done;
    saveDay(currentDate, day);
    refreshBlock(blockKey);
    updateStats();
  }

  /* ━━ COLLAPSE ━━ */
  function toggleCollapse(blockKey) {
    collapsed[blockKey] = !collapsed[blockKey];
    refreshBlock(blockKey);
  }

  /* ━━ DRAG & DROP ━━ */
  function onDragStart(e, blockKey, idx) {
    dragSrc = { block: blockKey, idx };
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));
  }
  function onDragOver(e, blockKey) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));
    document.getElementById('pln-list-' + blockKey)?.classList.add('drag-over');
  }
  function onDrop(e, targetBlock) {
    e.preventDefault();
    if (!dragSrc) return;
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));

    if (dragSrc.block === targetBlock) return; // mismo bloque, no hacer nada por ahora

    const day = getDay(currentDate);
    const item = day[dragSrc.block].splice(dragSrc.idx, 1)[0];
    if (!item) return;
    day[targetBlock].push(item);
    saveDay(currentDate, day);
    refreshBlock(dragSrc.block);
    refreshBlock(targetBlock);
    updateStats();
    showToast(`→ movido a ${targetBlock}`);
    dragSrc = null;
  }

  /* ━━ BIND DRAG ━━ */
  function bindDragDrop() {
    // Ya está enlazado en el HTML via atributos
  }

  /* ━━ REFRESH BLOQUE (sin re-render todo) ━━ */
  function refreshBlock(blockKey) {
    const b = BLOCKS.find(b => b.key === blockKey);
    if (!b) return;
    const card = document.getElementById('block-' + blockKey);
    if (!card) return;
    card.outerHTML = renderBlock(b);
    // outerHTML no actualiza in place, necesitamos reemplazar
    const container = document.getElementById('plnBlocksContainer');
    if (container) {
      const blocks = BLOCKS.map(b => renderBlock(b)).join('');
      container.innerHTML = blocks;
    }
  }

  /* ━━ REFRESH GLOBAL ━━ */
  function refresh() {
    renderPlanner();
  }

  /* ━━ INIT ━━ */
  function init() {
    const saved = lg('hub_plannerDate', null);
    if (saved) currentDate = saved;
    requestNotifPermission();
    renderPlanner();
  }

  /* ━━ API PÚBLICA ━━ */
  return {
    init,
    refresh,
    navDay,
    goToday,
    saveIntencion,
    selChip,
    addEntry,
    toggleEntry,
    deleteEntry,
    toggleSubtask,
    toggleCollapse,
    addTagPreview,
    addSubtaskPreview,
    renderSubtasksPreview,
    _removeSubPreview,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
  };
})();
