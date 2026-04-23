/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-PLANNER.JS — Andy.net v3
   Planner completo: bloques, tipos, drag&drop,
   subtareas, etiquetas, metas, proyectos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.HubPlanner = (function () {
  'use strict';

  const _core = () => window.HubCore;
  const lg = (k, f) => _core().lg(k, f);
  const ls = (k, v) => _core().ls(k, v);
  const todayKey = () => _core().todayKey();
  const showToast = (m) => _core().showToast(m);
  const triggerAutosave = () => _core().triggerAutosave();

  const MN = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const DF = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

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
  let dragSrc     = null;
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
    if (!notifPermission || !timeStr || !dateKey) return;
    const target = new Date(dateKey + 'T' + timeStr);
    const diff   = target - new Date();
    if (diff <= 0) return;
    setTimeout(() => new Notification('Andy.net', { body: text, icon: '/icon-192.png' }), diff);
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
  function goToDate(val) {
    if (!val) return;
    currentDate = val;
    ls('hub_plannerDate', currentDate);
    renderPlanner();
  }
  function saveIntencion() {
    const val = document.getElementById('plnIntencion')?.value || '';
    ls('hub_pln_int_' + currentDate, val);
    triggerAutosave();
  }

  /* ━━ HELPERS OPCIONES ━━ */
  function getMetasOptions(selectedId = '') {
    const metas = lg('hub_metas', []);
    return `<option value="">sin meta</option>` +
      metas.map(m => `<option value="${m.id}" ${String(m.id)===String(selectedId)?'selected':''}>${m.nombre}</option>`).join('');
  }
  function getProyectosOptions(selectedId = '') {
    const proyectos = lg('hub_proyectos', []);
    return `<option value="">sin proyecto</option>` +
      proyectos.map(p => `<option value="${p.id}" ${String(p.id)===String(selectedId)?'selected':''}>${p.nombre||p.name||p.title||'Proyecto'}</option>`).join('');
  }

  /* ━━ RENDER PRINCIPAL ━━ */
  function renderPlanner() {
    const saved = lg('hub_plannerDate', null);
    if (saved) currentDate = saved;

    const d = new Date(currentDate + 'T12:00:00');
    const dateEl = document.getElementById('plnNavDate');
    if (dateEl) {
      dateEl.textContent = DF[d.getDay()].toUpperCase() + ', ' + d.getDate() + ' DE ' + MN[d.getMonth()].toUpperCase() + ' ' + d.getFullYear();
      dateEl.style.color = currentDate === todayKey() ? 'var(--hub)' : 'var(--text)';
    }

    const intEl = document.getElementById('plnIntencion');
    if (intEl) intEl.value = lg('hub_pln_int_' + currentDate, '');

    updateStats();

    const container = document.getElementById('plnBlocksContainer');
    if (!container) return;
    container.innerHTML = BLOCKS.map(b => renderBlock(b)).join('');
  }

  /* ━━ REFRESH BLOQUE — solo reemplaza el card afectado ━━ */
  function refreshBlock(blockKey) {
    const b = BLOCKS.find(b => b.key === blockKey);
    if (!b) return;
    const existing = document.getElementById('block-' + blockKey);
    if (existing) {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderBlock(b);
      existing.replaceWith(tmp.firstElementChild);
    } else {
      const container = document.getElementById('plnBlocksContainer');
      if (container) container.innerHTML = BLOCKS.map(b => renderBlock(b)).join('');
    }
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
          <button class="pln-block-collapse" onclick="HubPlanner.toggleCollapse('${b.key}')">${isCol?'▸':'▾'}</button>
        </div>
      </div>
      ${!isCol ? `
        <div class="pln-items-list" id="pln-list-${b.key}"
          ondragover="HubPlanner.onDragOver(event,'${b.key}')"
          ondragleave="HubPlanner.onDragLeave(event,'${b.key}')"
          ondrop="HubPlanner.onDrop(event,'${b.key}')">
          ${!items.length
            ? '<div class="empty-state" style="padding:12px 0">sin entradas — agrega una abajo</div>'
            : items.map((it, i) => renderEntry(it, i, b.key)).join('')}
        </div>
        <div class="pln-add-form" id="pln-form-${b.key}">
          <div class="pln-add-row1">
            <input class="pln-add-input" id="pln-input-${b.key}" placeholder="agregar entrada..."
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
        <div class="pln-extra-section" id="pln-subtasks-${blockKey}" style="display:none">
          <div class="pln-extra-label">subtareas</div>
          <div id="pln-subtask-list-${blockKey}"></div>
          <div style="display:flex;gap:6px;margin-top:6px">
            <input class="pln-add-input" id="pln-subtask-input-${blockKey}" placeholder="añadir subtarea..." style="font-size:11px;padding:6px 10px"
              onkeydown="if(event.key==='Enter')HubPlanner.addSubtaskPreview('${blockKey}')">
            <button class="pln-add-submit" style="padding:6px 10px;font-size:9px" onclick="HubPlanner.addSubtaskPreview('${blockKey}')">+</button>
          </div>
        </div>
        <div class="pln-extra-section" id="pln-evento-fields-${blockKey}" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div><div class="pln-extra-label">inicio</div><input type="time" class="pln-add-input" id="pln-ev-start-${blockKey}" style="font-size:11px;padding:6px 10px"></div>
            <div><div class="pln-extra-label">fin</div><input type="time" class="pln-add-input" id="pln-ev-end-${blockKey}" style="font-size:11px;padding:6px 10px"></div>
            <div><div class="pln-extra-label">categoría</div>
              <select class="pln-add-input" id="pln-ev-cat-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);appearance:none">
                <option value="personal">personal</option><option value="trabajo">trabajo</option><option value="salud">salud</option><option value="social">social</option>
              </select>
            </div>
          </div>
          <div><div class="pln-extra-label">lugar (opcional)</div><input class="pln-add-input" id="pln-ev-lugar-${blockKey}" placeholder="lugar..." style="font-size:11px;padding:6px 10px"></div>
          <div style="margin-top:8px">
            <div class="pln-extra-label">recordatorio</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              <button class="pln-chip" data-rem="none" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">ninguno</button>
              <button class="pln-chip sel" data-rem="15" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">15 min</button>
              <button class="pln-chip" data-rem="30" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">30 min</button>
              <button class="pln-chip" data-rem="60" data-b="${blockKey}" onclick="HubPlanner.selChip(this,'rem','${blockKey}')">1 hora</button>
            </div>
          </div>
        </div>
        <div class="pln-extra-section" id="pln-recordar-fields-${blockKey}" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div><div class="pln-extra-label">hora exacta</div><input type="time" class="pln-add-input" id="pln-rec-time-${blockKey}" style="font-size:11px;padding:6px 10px"></div>
            <div><div class="pln-extra-label">repetición</div>
              <select class="pln-add-input" id="pln-rec-rep-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);appearance:none">
                <option value="once">una vez</option><option value="daily">diario</option><option value="weekly">semanal</option>
              </select>
            </div>
          </div>
        </div>
        <div style="margin-top:8px">
          <div class="pln-extra-label">etiquetas</div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px" id="pln-tags-preview-${blockKey}">
            <input class="pln-add-input" id="pln-tag-input-${blockKey}" placeholder="etiqueta..." style="font-size:11px;padding:5px 9px;width:120px"
              onkeydown="if(event.key==='Enter'||event.key===',')HubPlanner.addTagPreview('${blockKey}')">
            <span style="font-family:var(--mono);font-size:8px;color:var(--muted)">↵ para agregar</span>
          </div>
        </div>
        <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <div class="pln-extra-label">vincular meta</div>
            <select class="pln-add-input" id="pln-meta-select-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);appearance:none;margin-top:4px;width:100%">
              ${getMetasOptions()}
            </select>
          </div>
          <div>
            <div class="pln-extra-label">vincular proyecto</div>
            <select class="pln-add-input" id="pln-proy-select-${blockKey}" style="font-size:11px;padding:6px 10px;color:var(--muted2);font-family:var(--mono);appearance:none;margin-top:4px;width:100%">
              ${getProyectosOptions()}
            </select>
          </div>
        </div>
      </div>`;
  }

  /* ━━ RENDER ENTRADA ━━ */
  function renderEntry(it, idx, blockKey) {
    const type = it.type || 'tarea';
    const prio = it.prio || 'media';
    const timeStr = it.startTime ? ` · ${it.startTime}${it.endTime?'–'+it.endTime:''}` : (it.recTime ? ` · ${it.recTime}` : '');
    const tags = (it.tags||[]).map(t => `<span class="pln-tag">${t}</span>`).join('');
    const subDone = (it.subtasks||[]).filter(s=>s.done).length;
    const subTotal = (it.subtasks||[]).length;

    return `<div class="pln-entry${it.done?' done-entry':''}"
        draggable="true" data-idx="${idx}" data-block="${blockKey}"
        ondragstart="HubPlanner.onDragStart(event,'${blockKey}',${idx})"
        ondragend="HubPlanner.onDragEnd(event)"
        ondragover="HubPlanner.onDragOverEntry(event,'${blockKey}',${idx})"
        ondrop="HubPlanner.onDropEntry(event,'${blockKey}',${idx})">
      <div class="pln-entry-check${it.done?' done':''}" onclick="HubPlanner.toggleEntry('${blockKey}',${idx})">${it.done?'✓':''}</div>
      <div class="pln-entry-main">
        <div class="pln-entry-text${it.done?' done':''}" onclick="HubPlanner.openEdit('${blockKey}',${idx})" style="cursor:pointer" title="editar">${it.text}</div>
        <div class="pln-entry-meta">
          <span class="pln-entry-type" style="background:${TYPE_BG[type]||'rgba(90,122,170,.15)'};color:${TYPE_COLOR[type]||'var(--hub)'}">${type}</span>
          <div class="pln-entry-prio" style="background:${PRIO_COLOR[prio]}"></div>
          ${timeStr ? `<span class="pln-entry-time">${timeStr}</span>` : ''}
          ${it.lugar ? `<span class="pln-entry-time">📍 ${it.lugar}</span>` : ''}
          ${subTotal ? `<span class="pln-entry-time">${subDone}/${subTotal} sub</span>` : ''}
          ${it.metaNombre ? `<span class="pln-entry-time">◎ ${it.metaNombre}</span>` : ''}
          ${it.proyNombre ? `<span class="pln-entry-time">◈ ${it.proyNombre}</span>` : ''}
          ${tags}
        </div>
        ${subTotal ? renderSubtasksMini(it.subtasks, blockKey, idx) : ''}
        ${it.notes ? `<div class="pln-entry-notes">${it.notes}</div>` : ''}
      </div>
      <div class="pln-entry-actions">
        <button class="pln-entry-del" onclick="HubPlanner.deleteEntry('${blockKey}',${idx})">×</button>
      </div>
    </div>`;
  }

  function renderSubtasksMini(subtasks, blockKey, idx) {
    return `<div class="pln-subtasks-mini">
      ${subtasks.map((s,si) => `
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
      const extra = document.getElementById('pln-extra-' + block);
      if (extra) {
        extra.style.display = 'block';
        ['subtasks','evento-fields','recordar-fields'].forEach(s => {
          const el = document.getElementById(`pln-${s}-${block}`); if (el) el.style.display = 'none';
        });
        const type = btn.dataset.type;
        const show = document.getElementById(`pln-${type==='tarea'?'subtasks':type==='evento'?'evento-fields':'recordar-fields'}-${block}`);
        if (show) show.style.display = 'block';
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
    wrap.querySelectorAll('.pln-tag-preview').forEach(el => el.remove());
    (_pendingTags[blockKey]||[]).forEach(t => {
      const span = document.createElement('span');
      span.className = 'pln-tag pln-tag-preview';
      span.textContent = t;
      span.onclick = () => { _pendingTags[blockKey] = _pendingTags[blockKey].filter(x=>x!==t); renderTagsPreview(blockKey); };
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
    list.innerHTML = (_pendingSubtasks[blockKey]||[]).map((s,i) => `
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

    const entry = { id: Date.now(), text: txt, type, prio, done: false,
      tags: _pendingTags[blockKey]||[], subtasks: _pendingSubtasks[blockKey]||[], notes: '' };

    if (type === 'evento') {
      entry.startTime = document.getElementById('pln-ev-start-'+blockKey)?.value||'';
      entry.endTime   = document.getElementById('pln-ev-end-'+blockKey)?.value||'';
      entry.lugar     = document.getElementById('pln-ev-lugar-'+blockKey)?.value||'';
      entry.evCat     = document.getElementById('pln-ev-cat-'+blockKey)?.value||'personal';
      const remChip   = document.querySelector(`.pln-chip[data-rem][data-b="${blockKey}"].sel`);
      entry.reminder  = remChip?.dataset.rem||'15';
      if (entry.startTime && entry.reminder !== 'none') {
        const t = new Date(currentDate + 'T' + entry.startTime);
        t.setMinutes(t.getMinutes() - parseInt(entry.reminder));
        scheduleNotif(txt, t.toTimeString().slice(0,5), currentDate);
      }
    }
    if (type === 'recordar') {
      entry.recTime = document.getElementById('pln-rec-time-'+blockKey)?.value||'';
      entry.recRep  = document.getElementById('pln-rec-rep-'+blockKey)?.value||'once';
      if (entry.recTime) scheduleNotif(txt, entry.recTime, currentDate);
    }

    const metaSel = document.getElementById('pln-meta-select-'+blockKey);
    if (metaSel?.value) {
      entry.metaId = metaSel.value;
      const meta = lg('hub_metas',[]).find(m=>String(m.id)===String(metaSel.value));
      if (meta) entry.metaNombre = meta.nombre;
    }
    const proySel = document.getElementById('pln-proy-select-'+blockKey);
    if (proySel?.value) {
      entry.proyId = proySel.value;
      const proy = lg('hub_proyectos',[]).find(p=>String(p.id)===String(proySel.value));
      if (proy) entry.proyNombre = proy.nombre||proy.name||proy.title||'Proyecto';
    }

    const day = getDay(currentDate);
    day[blockKey].push(entry);
    saveDay(currentDate, day);

    input.value = '';
    delete _pendingTags[blockKey];
    delete _pendingSubtasks[blockKey];

    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('✓ entrada añadida');
  }

  /* ━━ TOGGLE / DELETE ━━ */
  function toggleEntry(blockKey, idx) {
    const day = getDay(currentDate);
    if (day[blockKey][idx]) day[blockKey][idx].done = !day[blockKey][idx].done;
    saveDay(currentDate, day);
    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
  }

  function deleteEntry(blockKey, idx) {
    const day = getDay(currentDate);
    day[blockKey].splice(idx, 1);
    saveDay(currentDate, day);
    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('entrada eliminada');
  }

  /* ━━ EDITOR INLINE ━━ */
  function openEdit(blockKey, idx) {
    closeEdit();
    const day = getDay(currentDate);
    const it  = day[blockKey][idx];
    if (!it) return;

    const entry = document.querySelector(`.pln-entry[data-block="${blockKey}"][data-idx="${idx}"]`);
    if (!entry) return;
    entry.classList.add('editing');

    const editor = document.createElement('div');
    editor.className = 'pln-entry-editor';
    editor.dataset.block = blockKey;
    editor.dataset.idx = idx;

    editor.innerHTML = `
      <div class="pln-editor-row">
        <input class="pln-editor-input" id="edit-text-${blockKey}-${idx}"
          value="${(it.text||'').replace(/"/g,'&quot;')}" placeholder="texto..."
          onkeydown="if(event.key==='Enter')HubPlanner.saveEdit('${blockKey}',${idx})">
      </div>
      <div class="pln-editor-chips">
        <span class="pln-chip-label">tipo:</span>
        <button class="pln-chip${(!it.type||it.type==='tarea')?' sel':''}" data-et="tarea" onclick="HubPlanner._editChip(this,'type')">☐ tarea</button>
        <button class="pln-chip${it.type==='evento'?' sel':''}" data-et="evento" onclick="HubPlanner._editChip(this,'type')">◈ evento</button>
        <button class="pln-chip${it.type==='recordar'?' sel':''}" data-et="recordar" onclick="HubPlanner._editChip(this,'type')">⏰ recordar</button>
        <span class="pln-sep">·</span>
        <span class="pln-chip-label">prio:</span>
        <button class="pln-chip prio-alta${it.prio==='alta'?' sel':''}" data-ep="alta" onclick="HubPlanner._editChip(this,'prio')">alta</button>
        <button class="pln-chip prio-media${(!it.prio||it.prio==='media')?' sel':''}" data-ep="media" onclick="HubPlanner._editChip(this,'prio')">media</button>
        <button class="pln-chip prio-baja${it.prio==='baja'?' sel':''}" data-ep="baja" onclick="HubPlanner._editChip(this,'prio')">baja</button>
      </div>
      <div class="pln-editor-row2">
        <div>
          <div class="pln-extra-label">hora inicio</div>
          <input type="time" class="pln-add-input" id="edit-start-${blockKey}-${idx}" value="${it.startTime||it.recTime||''}" style="font-size:11px;padding:6px 10px">
        </div>
        <div>
          <div class="pln-extra-label">hora fin</div>
          <input type="time" class="pln-add-input" id="edit-end-${blockKey}-${idx}" value="${it.endTime||''}" style="font-size:11px;padding:6px 10px">
        </div>
        <div style="flex:1">
          <div class="pln-extra-label">lugar</div>
          <input class="pln-add-input" id="edit-lugar-${blockKey}-${idx}" value="${it.lugar||''}" placeholder="lugar..." style="font-size:11px;padding:6px 10px;width:100%">
        </div>
      </div>
      <div>
        <div class="pln-extra-label" style="margin-bottom:6px">subtareas</div>
        <div id="edit-subtasks-${blockKey}-${idx}" class="pln-subtasks-mini" style="margin-top:0;padding-top:0;border-top:none">
          ${_renderEditSubtasks(it.subtasks||[], blockKey, idx)}
        </div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <input class="pln-add-input" id="edit-sub-input-${blockKey}-${idx}" placeholder="nueva subtarea..." style="font-size:11px;padding:6px 10px"
            onkeydown="if(event.key==='Enter')HubPlanner._editAddSub('${blockKey}',${idx})">
          <button class="pln-add-submit" style="padding:6px 10px;font-size:9px" onclick="HubPlanner._editAddSub('${blockKey}',${idx})">+</button>
        </div>
      </div>
      <div>
        <div class="pln-extra-label" style="margin-bottom:6px">etiquetas</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap" id="edit-tags-wrap-${blockKey}-${idx}">
          ${(it.tags||[]).map(t=>`<span class="pln-tag edit-tag" onclick="this.remove()">${t} ×</span>`).join('')}
          <input class="pln-add-input" id="edit-tag-input-${blockKey}-${idx}" placeholder="etiqueta..." style="font-size:11px;padding:5px 9px;width:110px"
            onkeydown="if(event.key==='Enter'||event.key===','){event.preventDefault();HubPlanner._editAddTag('${blockKey}',${idx})}">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <div class="pln-extra-label">vincular meta</div>
          <select class="pln-add-input" id="edit-meta-${blockKey}-${idx}" style="font-size:11px;padding:6px 10px;appearance:none;width:100%;margin-top:4px">
            ${getMetasOptions(it.metaId)}
          </select>
        </div>
        <div>
          <div class="pln-extra-label">vincular proyecto</div>
          <select class="pln-add-input" id="edit-proy-${blockKey}-${idx}" style="font-size:11px;padding:6px 10px;appearance:none;width:100%;margin-top:4px">
            ${getProyectosOptions(it.proyId)}
          </select>
        </div>
      </div>
      <div class="pln-editor-row">
        <div class="pln-extra-label">notas</div>
        <textarea class="pln-add-input" id="edit-notes-${blockKey}-${idx}" placeholder="notas o contexto..."
          style="resize:none;min-height:52px;line-height:1.5;font-size:12px;margin-top:4px">${it.notes||''}</textarea>
      </div>
      <div class="pln-editor-actions">
        <button class="btn-ghost" style="font-size:9px;padding:6px 12px" onclick="HubPlanner.closeEdit()">cancelar</button>
        <button class="pln-add-submit" onclick="HubPlanner.saveEdit('${blockKey}',${idx})">guardar ✓</button>
      </div>`;

    entry.after(editor);
    setTimeout(() => document.getElementById(`edit-text-${blockKey}-${idx}`)?.focus(), 60);
  }

  function _renderEditSubtasks(subtasks, blockKey, idx) {
    return subtasks.map((s,si) => `
      <div class="pln-subtask-item" style="gap:8px;padding:3px 0">
        <div class="pln-subtask-check${s.done?' done':''}" onclick="HubPlanner._editToggleSub('${blockKey}',${idx},${si})">${s.done?'✓':''}</div>
        <span class="pln-subtask-text${s.done?' done':''}" style="flex:1">${s.text}</span>
        <button onclick="HubPlanner._editDelSub('${blockKey}',${idx},${si})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px;padding:0 2px">×</button>
      </div>`).join('');
  }

  function _refreshEditSubtasks(blockKey, idx) {
    const day = getDay(currentDate);
    const container = document.getElementById(`edit-subtasks-${blockKey}-${idx}`);
    if (container) container.innerHTML = _renderEditSubtasks(day[blockKey][idx]?.subtasks||[], blockKey, idx);
  }

  function _editChip(btn, group) {
    const parent = btn.closest('.pln-editor-chips');
    if (!parent) return;
    parent.querySelectorAll(`[data-e${group==='type'?'t':'p'}]`).forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
  }

  function _editAddTag(blockKey, idx) {
    const input = document.getElementById(`edit-tag-input-${blockKey}-${idx}`);
    const tag = input?.value.replace(/,/g,'').trim();
    if (!tag) return;
    const wrap = document.getElementById(`edit-tags-wrap-${blockKey}-${idx}`);
    const span = document.createElement('span');
    span.className = 'pln-tag edit-tag';
    span.textContent = tag + ' ×';
    span.onclick = () => span.remove();
    wrap.insertBefore(span, input);
    input.value = '';
  }

  function _editAddSub(blockKey, idx) {
    const input = document.getElementById(`edit-sub-input-${blockKey}-${idx}`);
    const txt = input?.value.trim();
    if (!txt) return;
    const day = getDay(currentDate);
    if (!day[blockKey][idx].subtasks) day[blockKey][idx].subtasks = [];
    day[blockKey][idx].subtasks.push({ text: txt, done: false });
    saveDay(currentDate, day);
    _refreshEditSubtasks(blockKey, idx);
    input.value = '';
    input.focus();
  }

  function _editToggleSub(blockKey, idx, subIdx) {
    const day = getDay(currentDate);
    const sub = day[blockKey][idx]?.subtasks?.[subIdx];
    if (!sub) return;
    sub.done = !sub.done;
    saveDay(currentDate, day);
    _refreshEditSubtasks(blockKey, idx);
  }

  function _editDelSub(blockKey, idx, subIdx) {
    const day = getDay(currentDate);
    day[blockKey][idx]?.subtasks?.splice(subIdx, 1);
    saveDay(currentDate, day);
    _refreshEditSubtasks(blockKey, idx);
  }

  function saveEdit(blockKey, idx) {
    const day = getDay(currentDate);
    const it  = day[blockKey][idx];
    if (!it) return;
    const text = document.getElementById(`edit-text-${blockKey}-${idx}`)?.value.trim();
    if (!text) return;

    const typeBtn = document.querySelector(`.pln-entry.editing .pln-editor-chips [data-et].sel`);
    const prioBtn = document.querySelector(`.pln-entry.editing .pln-editor-chips [data-ep].sel`);

    it.text      = text;
    it.type      = typeBtn?.dataset.et || it.type;
    it.prio      = prioBtn?.dataset.ep || it.prio;
    it.startTime = document.getElementById(`edit-start-${blockKey}-${idx}`)?.value||'';
    it.endTime   = document.getElementById(`edit-end-${blockKey}-${idx}`)?.value||'';
    it.lugar     = document.getElementById(`edit-lugar-${blockKey}-${idx}`)?.value||'';
    it.notes     = document.getElementById(`edit-notes-${blockKey}-${idx}`)?.value||'';

    const tagEls = document.querySelectorAll(`#edit-tags-wrap-${blockKey}-${idx} .edit-tag`);
    it.tags = Array.from(tagEls).map(el=>el.textContent.replace(' ×','').trim()).filter(Boolean);

    const metaSel = document.getElementById(`edit-meta-${blockKey}-${idx}`);
    it.metaId = metaSel?.value||'';
    it.metaNombre = it.metaId ? (lg('hub_metas',[]).find(m=>String(m.id)===String(it.metaId))?.nombre||'') : '';

    const proySel = document.getElementById(`edit-proy-${blockKey}-${idx}`);
    it.proyId = proySel?.value||'';
    if (it.proyId) {
      const proy = lg('hub_proyectos',[]).find(p=>String(p.id)===String(it.proyId));
      it.proyNombre = proy?.nombre||proy?.name||proy?.title||'';
    } else { it.proyNombre = ''; }

    saveDay(currentDate, day);
    refreshBlock(blockKey);
    updateStats();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('✓ guardado');
  }

  function closeEdit() {
    document.querySelectorAll('.pln-entry-editor').forEach(el => el.remove());
    document.querySelectorAll('.pln-entry.editing').forEach(el => el.classList.remove('editing'));
  }

  /* ━━ SUBTASKS desde vista ━━ */
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

  /* ━━ DRAG & DROP — entre bloques Y reordenamiento interno ━━ */
  function onDragStart(e, blockKey, idx) {
    dragSrc = { block: blockKey, idx };
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.pln-entry.drag-target').forEach(el => el.classList.remove('drag-target'));
    dragSrc = null;
  }

  function onDragOver(e, blockKey) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));
    document.getElementById('pln-list-' + blockKey)?.classList.add('drag-over');
  }

  function onDragLeave(e, blockKey) {
    const list = document.getElementById('pln-list-' + blockKey);
    if (list && !list.contains(e.relatedTarget)) list.classList.remove('drag-over');
  }

  // Drag sobre una entrada — para reordenar
  function onDragOverEntry(e, blockKey, targetIdx) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSrc) return;
    document.querySelectorAll('.pln-entry.drag-target').forEach(el => el.classList.remove('drag-target'));
    const targetEl = document.querySelector(`.pln-entry[data-block="${blockKey}"][data-idx="${targetIdx}"]`);
    if (targetEl && !(dragSrc.block === blockKey && dragSrc.idx === targetIdx)) {
      targetEl.classList.add('drag-target');
    }
  }

  // Drop sobre una entrada — reordenar interno o mover entre bloques
  function onDropEntry(e, targetBlock, targetIdx) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSrc) return;
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.pln-entry.drag-target').forEach(el => el.classList.remove('drag-target'));

    const { block: srcBlock, idx: srcIdx } = dragSrc;
    if (srcBlock === targetBlock && srcIdx === targetIdx) { dragSrc = null; return; }

    const day = getDay(currentDate);

    if (srcBlock === targetBlock) {
      // Reordenar dentro del mismo bloque
      const items = day[srcBlock];
      const [moved] = items.splice(srcIdx, 1);
      items.splice(srcIdx < targetIdx ? targetIdx : targetIdx, 0, moved);
      saveDay(currentDate, day);
      refreshBlock(srcBlock);
      showToast('↕ reordenado');
    } else {
      // Mover entre bloques en posición específica
      const item = day[srcBlock].splice(srcIdx, 1)[0];
      if (!item) { dragSrc = null; return; }
      day[targetBlock].splice(targetIdx, 0, item);
      saveDay(currentDate, day);
      refreshBlock(srcBlock);
      refreshBlock(targetBlock);
      showToast(`→ movido a ${targetBlock}`);
    }
    updateStats();
    dragSrc = null;
  }

  // Drop en el contenedor vacío (al final del bloque)
  function onDrop(e, targetBlock) {
    e.preventDefault();
    if (!dragSrc) return;
    document.querySelectorAll('.pln-items-list').forEach(el => el.classList.remove('drag-over'));
    const { block: srcBlock, idx: srcIdx } = dragSrc;
    if (srcBlock === targetBlock) { dragSrc = null; return; }
    const day  = getDay(currentDate);
    const item = day[srcBlock].splice(srcIdx, 1)[0];
    if (!item) { dragSrc = null; return; }
    day[targetBlock].push(item);
    saveDay(currentDate, day);
    refreshBlock(srcBlock);
    refreshBlock(targetBlock);
    updateStats();
    showToast(`→ movido a ${targetBlock}`);
    dragSrc = null;
  }

  /* ━━ REFRESH / INIT ━━ */
  function refresh() { renderPlanner(); }

  function init() {
    const saved = lg('hub_plannerDate', null);
    if (saved) currentDate = saved;
    requestNotifPermission();
    renderPlanner();
  }

  return {
    init, refresh,
    navDay, goToday, goToDate, saveIntencion,
    selChip,
    addEntry, toggleEntry, deleteEntry,
    toggleSubtask, toggleCollapse,
    addTagPreview, renderTagsPreview,
    addSubtaskPreview, renderSubtasksPreview, _removeSubPreview,
    onDragStart, onDragEnd,
    onDragOver, onDragLeave,
    onDragOverEntry, onDropEntry, onDrop,
    openEdit, closeEdit, saveEdit,
    _editChip, _editAddTag,
    _editAddSub, _editToggleSub, _editDelSub,
  };
})();
