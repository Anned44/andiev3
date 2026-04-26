/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-INBOX.JS — Andy.net v3
   Check circular, menú ···, editor contextual por tipo
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
    captura:     { color:'#9a8aaa', border:'rgba(154,138,170,.4)', emoji:'✦'  },
    idea:        { color:'#c8965a', border:'rgba(200,150,90,.4)',  emoji:'💡' },
    tarea:       { color:'#5a7aaa', border:'rgba(90,122,170,.4)',  emoji:'📋' },
    nota:        { color:'#7a9a7a', border:'rgba(122,154,122,.4)', emoji:'📝' },
    proyecto:    { color:'#9b7ab8', border:'rgba(155,122,184,.4)', emoji:'◈'  },
    evento:      { color:'#c86e8a', border:'rgba(200,110,138,.4)', emoji:'◷'  },
    recordatorio:{ color:'#e07040', border:'rgba(224,112,64,.4)',  emoji:'⏰' },
    wishlist:    { color:'#d4a0c8', border:'rgba(212,160,200,.4)', emoji:'✦'  },
  };
  const TAG_CYCLE = ['captura','idea','tarea','nota','proyecto','evento','recordatorio','wishlist'];

  let ibxFilter    = 'pendientes';
  let ibxTagFilter = 'all';
  const _pendingSubs = {}; // subtareas pending por id

  /* ━━ DATA ━━ */
  function getInbox() { return lg('dash_inbox', []); }
  function saveInbox(data) { ls('dash_inbox', data); triggerAutosave(); }
  function getMetas() { return lg('hub_metas', []); }
  function getProyectos() { return lg('hub_proyectos', []); }
  function todayStr() { return new Date().toISOString().slice(0,10); }

  /* ━━ STATS ━━ */
  function updateStats() {
    const all  = getInbox();
    const pend = all.filter(i => i.status !== 'procesado').length;
    const proc = all.filter(i => i.status === 'procesado').length;
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    s('ibxCntPend', pend); s('ibxCntTodos', all.length); s('ibxCntProc', proc);
    s('istatPend', pend);  s('istatTodos', all.length);  s('istatProc', proc);
  }

  /* ━━ CAPTURA DIRECTA ━━ */
  function renderCaptureForm() {
    const el = document.getElementById('ibxCaptureForm');
    if (!el) return;
    el.innerHTML = `
      <div class="ibx-capture-wrap">
        <div class="ibx-capture-row1">
          <input class="ibx-capture-input" id="ibxCaptureText" placeholder="captura rápida..."
            onkeydown="if(event.key==='Enter')HubInbox.addCapture()">
          <button class="ibx-capture-btn" onclick="HubInbox.addCapture()">+ agregar</button>
        </div>
        <div class="ibx-capture-row2">
          ${TAG_CYCLE.map((t,i) => {
            const tag = IBX_TAGS[t];
            return `<button class="ibxs-tag${i===0?' active':''}" data-captype="${t}"
              style="${i===0?`color:${tag.color};border-color:${tag.border};background:var(--s2)`:''}"
              onclick="HubInbox.selCaptureType(this,'${t}')">${tag.emoji} ${t}</button>`;
          }).join('')}
        </div>
      </div>`;
  }

  function selCaptureType(btn, type) {
    document.querySelectorAll('[data-captype]').forEach(b => {
      b.classList.remove('active');
      b.style.color=''; b.style.borderColor=''; b.style.background='';
    });
    btn.classList.add('active');
    const tag = IBX_TAGS[type];
    btn.style.color=tag.color; btn.style.borderColor=tag.border; btn.style.background='var(--s2)';
  }

  function addCapture() {
    const input = document.getElementById('ibxCaptureText');
    const txt = input?.value.trim();
    if (!txt) { input?.focus(); return; }
    const typeBtn = document.querySelector('[data-captype].active');
    const type = typeBtn?.dataset.captype || 'captura';
    const inbox = getInbox();
    inbox.unshift({ id: Date.now(), text: txt, type, status: 'pendiente', time: Date.now(), notes: '', subtasks: [] });
    saveInbox(inbox);
    input.value = '';
    updateStats();
    renderCard_new(inbox[0]);
    const list = document.getElementById('ibxItemsList');
    if (list) {
      const tmp = document.createElement('div');
      tmp.innerHTML = buildCard(inbox[0]);
      list.insertBefore(tmp.firstElementChild, list.firstChild);
    }
    window.HubDashboard?.renderDashInbox?.();
    showToast('✦ capturado');
  }

  /* ━━ HELPERS ━━ */
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escAttr(s) { return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  function getMetasOpts(sel='') {
    return `<option value="">sin meta</option>` +
      getMetas().map(m=>`<option value="${m.id}" ${String(m.id)===String(sel)?'selected':''}>${m.nombre}</option>`).join('');
  }
  function getProyOpts(sel='') {
    return `<option value="">sin proyecto</option>` +
      getProyectos().map(p=>`<option value="${p.id}" ${String(p.id)===String(sel)?'selected':''}>${p.nombre||p.name||p.title||'Proyecto'}</option>`).join('');
  }

  /* ━━ BUILD CARD ━━ */
  function buildCard(item) {
    const tag    = IBX_TAGS[item.type] || IBX_TAGS.captura;
    const d      = new Date(item.time || Date.now());
    const dateStr = isNaN(d) ? '' : d.getDate() + ' ' + MN[d.getMonth()];
    const isDone  = item.status === 'procesado';
    const pills   = [
      item.metaNombre ? `<span class="ibx-pill">◎ ${escHtml(item.metaNombre)}</span>` : '',
      item.proyNombre ? `<span class="ibx-pill">◈ ${escHtml(item.proyNombre)}</span>` : '',
      item.eventDate  ? `<span class="ibx-pill">📅 ${item.eventDate}</span>` : '',
      item.eventTime  ? `<span class="ibx-pill">⏰ ${item.eventTime}</span>` : '',
      item.lugar      ? `<span class="ibx-pill">📍 ${escHtml(item.lugar)}</span>` : '',
      item.precio     ? `<span class="ibx-pill">💰 ${escHtml(item.precio)}</span>` : '',
    ].filter(Boolean).join('');
    const subTotal = (item.subtasks||[]).length;
    const subDone  = (item.subtasks||[]).filter(s=>s.done).length;

    return `<div class="ibxs-card${isDone?' processed':''}" id="ibxcard-${item.id}">
      <div class="ibxs-card-top">
        <button class="ibx-check${isDone?' done':''}" onclick="HubInbox.markDone(${item.id})" title="${isDone?'restaurar':'procesar'}">
          ${isDone ? '✓' : ''}
        </button>
        <div class="ibx-card-body" onclick="HubInbox.openEdit(${item.id})">
          <div class="ibx-card-top-row">
            <span class="ibxs-card-tag" style="color:${tag.color};border-color:${tag.border}">${tag.emoji} ${item.type||'captura'}</span>
            <span class="ibxs-card-date">${dateStr}</span>
          </div>
          <div class="ibxs-card-text${isDone?' done':''}">${escHtml(item.text)}</div>
          ${item.notes ? `<div class="ibx-card-notes">${escHtml(item.notes)}</div>` : ''}
          ${subTotal ? `<div class="ibx-subtasks-mini">${(item.subtasks||[]).map((s,si)=>`
            <div class="ibx-sub-item" onclick="event.stopPropagation();HubInbox.toggleSub(${item.id},${si})">
              <div class="ibx-sub-check${s.done?' done':''}">${s.done?'✓':''}</div>
              <span class="${s.done?'ibx-sub-done':''}">${escHtml(s.text)}</span>
            </div>`).join('')}
            <div style="font-family:var(--mono);font-size:8px;color:var(--muted);margin-top:2px">${subDone}/${subTotal} completadas</div>
          </div>` : ''}
          ${pills ? `<div class="ibx-card-pills">${pills}</div>` : ''}
        </div>
        <button class="ibx-menu-btn" onclick="event.stopPropagation();HubInbox.toggleMenu(${item.id})" title="acciones">···</button>
      </div>
      <div class="ibx-dropdown" id="ibxmenu-${item.id}">
        <button class="ibx-drop-item" onclick="HubInbox.openEdit(${item.id});HubInbox.closeMenu(${item.id})">✏ editar</button>
        <button class="ibx-drop-item del" onclick="HubInbox.del(${item.id})">🗑 eliminar</button>
      </div>
      ${buildEditor(item)}
    </div>`;
  }

  /* ━━ BUILD EDITOR CONTEXTUAL ━━ */
  function buildEditor(item) {
    const type = item.type || 'captura';

    // Campos comunes
    const txtField = `<div class="ibx-editor-row">
      <input class="ibx-editor-input" id="ibxedit-txt-${item.id}"
        value="${escAttr(item.text)}" placeholder="texto..."
        onkeydown="if(event.key==='Enter'&&!event.shiftKey)HubInbox.saveEdit(${item.id})">
    </div>`;

    const typeChips = `<div class="ibx-editor-chips">
      ${TAG_CYCLE.map(t=>{
        const tg=IBX_TAGS[t]; const sel=type===t;
        return `<button class="ibxs-tag${sel?' active':''}" data-etype="${t}" data-eid="${item.id}"
          style="${sel?`color:${tg.color};border-color:${tg.border};background:var(--s2)`:''}"
          onclick="HubInbox._editSelType(this,${item.id},'${t}')">${tg.emoji} ${t}</button>`;
      }).join('')}
    </div>`;

    const cancelSave = `<div class="ibx-editor-actions">
      <button class="ibxs-act" onclick="HubInbox.closeEdit(${item.id})">cancelar</button>
      <button class="ibxs-act a-pln" onclick="HubInbox.saveEdit(${item.id})">guardar ✓</button>
    </div>`;

    // Planner section (para tarea, evento, recordatorio)
    const plannerSection = (['tarea','evento','recordatorio'].includes(type)) ? `
      <div class="ibx-editor-section">
        <div class="ibx-editor-section-label">enviar al planner</div>
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">fecha</div>
            <input type="date" class="ibxs-pick-sel" id="ibxedit-date-${item.id}" value="${item.eventDate||todayStr()}" style="width:100%;margin-top:4px">
          </div>
          <div>
            <div class="ibxs-pick-label">bloque</div>
            <select class="ibxs-pick-sel" id="ibxedit-block-${item.id}" style="width:100%;margin-top:4px">
              <option value="morning">🌅 Mañana</option>
              <option value="afternoon">🌤 Tarde</option>
              <option value="night">🌙 Noche</option>
            </select>
          </div>
        </div>
        <button class="ibx-planner-btn" onclick="HubInbox.sendToPlanner(${item.id})">→ enviar al planner</button>
      </div>` : '';

    // Campos por tipo
    let extraFields = '';

    if (type === 'captura' || type === 'nota') {
      extraFields = `<div class="ibx-editor-row">
        <div class="ibxs-pick-label">notas</div>
        <textarea class="ibx-editor-notes" id="ibxedit-notes-${item.id}" placeholder="notas...">${escHtml(item.notes||'')}</textarea>
      </div>`;
    }

    else if (type === 'tarea') {
      extraFields = `
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">prioridad</div>
            <select class="ibxs-pick-sel" id="ibxedit-prio-${item.id}" style="width:100%;margin-top:4px">
              <option value="">sin prioridad</option>
              <option value="alta" ${item.prio==='alta'?'selected':''}>alta</option>
              <option value="media" ${item.prio==='media'?'selected':''}>media</option>
              <option value="baja" ${item.prio==='baja'?'selected':''}>baja</option>
            </select>
          </div>
          <div>
            <div class="ibxs-pick-label">notas</div>
            <textarea class="ibx-editor-notes" id="ibxedit-notes-${item.id}" placeholder="notas..." style="height:36px">${escHtml(item.notes||'')}</textarea>
          </div>
        </div>
        <div>
          <div class="ibxs-pick-label" style="margin-bottom:6px">subtareas</div>
          <div id="ibxedit-subs-${item.id}">
            ${(item.subtasks||[]).map((s,si)=>`
              <div class="ibx-sub-edit-item">
                <div class="ibx-sub-check${s.done?' done':''}" onclick="HubInbox._toggleEditSub(${item.id},${si})">${s.done?'✓':''}</div>
                <span style="flex:1;font-size:12px">${escHtml(s.text)}</span>
                <button onclick="HubInbox._delEditSub(${item.id},${si})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px">×</button>
              </div>`).join('')}
          </div>
          <div style="display:flex;gap:6px;margin-top:6px">
            <input class="ibx-editor-input" id="ibxedit-sub-input-${item.id}" placeholder="nueva subtarea..." style="font-size:11px;padding:6px 10px"
              onkeydown="if(event.key==='Enter')HubInbox._addEditSub(${item.id})">
            <button class="ibx-capture-btn" style="padding:6px 10px;font-size:9px" onclick="HubInbox._addEditSub(${item.id})">+</button>
          </div>
        </div>
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">vincular meta</div>
            <select class="ibxs-pick-sel" id="ibxedit-meta-${item.id}" style="width:100%;margin-top:4px">${getMetasOpts(item.metaId)}</select>
          </div>
          <div>
            <div class="ibxs-pick-label">vincular proyecto</div>
            <select class="ibxs-pick-sel" id="ibxedit-proy-${item.id}" style="width:100%;margin-top:4px">${getProyOpts(item.proyId)}</select>
          </div>
        </div>`;
    }

    else if (type === 'idea') {
      extraFields = `
        <div class="ibx-editor-row">
          <div class="ibxs-pick-label">notas</div>
          <textarea class="ibx-editor-notes" id="ibxedit-notes-${item.id}" placeholder="desarrolla la idea...">${escHtml(item.notes||'')}</textarea>
        </div>
        <div>
          <div class="ibxs-pick-label">vincular proyecto</div>
          <select class="ibxs-pick-sel" id="ibxedit-proy-${item.id}" style="width:100%;margin-top:4px">${getProyOpts(item.proyId)}</select>
        </div>`;
    }

    else if (type === 'evento') {
      extraFields = `
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">fecha</div>
            <input type="date" class="ibxs-pick-sel" id="ibxedit-eventDate-${item.id}" value="${item.eventDate||todayStr()}" style="width:100%;margin-top:4px">
          </div>
          <div>
            <div class="ibxs-pick-label">lugar</div>
            <input class="ibx-editor-input" id="ibxedit-lugar-${item.id}" value="${escAttr(item.lugar||'')}" placeholder="lugar..." style="margin-top:4px">
          </div>
        </div>
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">hora inicio</div>
            <input type="time" class="ibxs-pick-sel" id="ibxedit-timeStart-${item.id}" value="${item.eventTime||''}" style="width:100%;margin-top:4px">
          </div>
          <div>
            <div class="ibxs-pick-label">hora fin</div>
            <input type="time" class="ibxs-pick-sel" id="ibxedit-timeEnd-${item.id}" value="${item.timeEnd||''}" style="width:100%;margin-top:4px">
          </div>
        </div>`;
    }

    else if (type === 'recordatorio') {
      extraFields = `
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">fecha</div>
            <input type="date" class="ibxs-pick-sel" id="ibxedit-eventDate-${item.id}" value="${item.eventDate||todayStr()}" style="width:100%;margin-top:4px">
          </div>
          <div>
            <div class="ibxs-pick-label">hora exacta</div>
            <input type="time" class="ibxs-pick-sel" id="ibxedit-timeStart-${item.id}" value="${item.eventTime||''}" style="width:100%;margin-top:4px">
          </div>
        </div>
        <div>
          <div class="ibxs-pick-label">repetición</div>
          <select class="ibxs-pick-sel" id="ibxedit-rep-${item.id}" style="width:100%;margin-top:4px">
            <option value="once" ${(item.rep||'once')==='once'?'selected':''}>una vez</option>
            <option value="daily" ${item.rep==='daily'?'selected':''}>diario</option>
            <option value="weekly" ${item.rep==='weekly'?'selected':''}>semanal</option>
          </select>
        </div>`;
    }

    else if (type === 'proyecto') {
      extraFields = `
        <div class="ibx-editor-row">
          <div class="ibxs-pick-label">notas</div>
          <textarea class="ibx-editor-notes" id="ibxedit-notes-${item.id}" placeholder="descripción...">${escHtml(item.notes||'')}</textarea>
        </div>
        <div>
          <div class="ibxs-pick-label">proyecto destino</div>
          <select class="ibxs-pick-sel" id="ibxedit-proy-${item.id}" style="width:100%;margin-top:4px">${getProyOpts(item.proyId)}</select>
        </div>`;
    }

    else if (type === 'wishlist') {
      extraFields = `
        <div class="ibx-editor-row2">
          <div>
            <div class="ibxs-pick-label">precio</div>
            <input class="ibx-editor-input" id="ibxedit-precio-${item.id}" value="${escAttr(item.precio||'')}" placeholder="$0.00" style="margin-top:4px">
          </div>
          <div>
            <div class="ibxs-pick-label">link</div>
            <input class="ibx-editor-input" id="ibxedit-link-${item.id}" value="${escAttr(item.link||'')}" placeholder="https://..." style="margin-top:4px">
          </div>
        </div>
        <div class="ibx-editor-row">
          <div class="ibxs-pick-label">notas</div>
          <textarea class="ibx-editor-notes" id="ibxedit-notes-${item.id}" placeholder="notas...">${escHtml(item.notes||'')}</textarea>
        </div>`;
    }

    return `<div class="ibx-editor" id="ibxedit-${item.id}">
      ${txtField}
      ${typeChips}
      ${extraFields}
      ${plannerSection}
      ${cancelSave}
    </div>`;
  }

  /* ━━ RENDER ━━ */
  function render() {
    const container = document.getElementById('ibxItemsList');
    if (!container) return;

    let items = getInbox();
    if (ibxFilter === 'pendientes') items = items.filter(i => i.status !== 'procesado');
    if (ibxFilter === 'procesados') items = items.filter(i => i.status === 'procesado');
    if (ibxTagFilter !== 'all')     items = items.filter(i => (i.type||'captura') === ibxTagFilter);

    if (!items.length) {
      container.innerHTML = `<div class="ibxs-empty">
        <div class="ibxs-empty-ico">📥</div>
        <div class="ibxs-empty-txt">nada aquí</div>
      </div>`;
      return;
    }
    container.innerHTML = items.map(buildCard).join('');
  }

  /* ━━ REFRESH CARD (sin re-render completo) ━━ */
  function refreshCard(id) {
    const inbox = getInbox();
    const item  = inbox.find(i => i.id === id);
    const el    = document.getElementById('ibxcard-' + id);
    if (!item || !el) { render(); return; }
    const tmp = document.createElement('div');
    tmp.innerHTML = buildCard(item);
    el.replaceWith(tmp.firstElementChild);
  }

  /* ━━ FILTROS ━━ */
  function setStatusFilter(btn, filter) {
    document.querySelectorAll('.ibxs-stat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ibxFilter = filter;
    render();
  }

  function setTagFilter(btn, tag) {
    document.querySelectorAll('.ibxs-tag:not([data-captype]):not([data-etype])').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ibxTagFilter = tag;
    render();
  }

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
    refreshCard(id);
    window.HubDashboard?.renderDashInbox?.();
    showToast(it.status === 'procesado' ? '✓ procesado' : '↩ restaurado');
  }

  function toggleMenu(id) {
    const menu = document.getElementById('ibxmenu-' + id);
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.ibx-dropdown.open').forEach(m => m.classList.remove('open'));
    if (!isOpen) menu.classList.add('open');
  }

  function closeMenu(id) {
    document.getElementById('ibxmenu-' + id)?.classList.remove('open');
  }

  // Cerrar menús al click fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.ibx-dropdown.open').forEach(m => m.classList.remove('open'));
  });

  function sendToPlanner(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;

    const dateVal = document.getElementById('ibxedit-date-' + id)?.value ||
                    document.getElementById('ibxedit-eventDate-' + id)?.value || todayStr();
    const block   = document.getElementById('ibxedit-block-' + id)?.value || 'morning';

    const state = lg('appState', {});
    if (!state.plannerByDate) state.plannerByDate = {};
    if (!state.plannerByDate[dateVal]) state.plannerByDate[dateVal] = { morning:[], afternoon:[], night:[] };
    state.plannerByDate[dateVal][block].push({
      id: Date.now(), text: it.text,
      type: it.type === 'evento' ? 'evento' : 'tarea',
      prio: it.prio||'media', done: false,
      tags: [], subtasks: it.subtasks||[],
      notes: it.notes||'',
      metaId: it.metaId||'', metaNombre: it.metaNombre||'',
      proyId: it.proyId||'', proyNombre: it.proyNombre||'',
    });
    ls('appState', state);
    it.status = 'procesado';
    saveInbox(inbox);
    updateStats();
    refreshCard(id);
    window.HubDashboard?.renderDashInbox?.();
    window.HubDashboard?.renderDashPlanner?.();
    showToast('→ enviado al planner');
  }

  /* ━━ EDITOR ━━ */
  function openEdit(id) {
    document.querySelectorAll('.ibx-editor.open').forEach(e => {
      if (e.id !== 'ibxedit-'+id) e.classList.remove('open');
    });
    document.querySelectorAll('.ibx-dropdown.open').forEach(m => m.classList.remove('open'));
    const el = document.getElementById('ibxedit-' + id);
    if (el) {
      el.classList.toggle('open');
      if (el.classList.contains('open'))
        setTimeout(() => document.getElementById('ibxedit-txt-'+id)?.focus(), 50);
    }
  }

  function closeEdit(id) {
    document.getElementById('ibxedit-'+id)?.classList.remove('open');
  }

  function _editSelType(btn, id, type) {
    document.querySelectorAll(`[data-etype][data-eid="${id}"]`).forEach(b => {
      b.classList.remove('active');
      b.style.color=''; b.style.borderColor=''; b.style.background='';
    });
    btn.classList.add('active');
    const tag = IBX_TAGS[type];
    btn.style.color=tag.color; btn.style.borderColor=tag.border; btn.style.background='var(--s2)';
  }

  function _addEditSub(id) {
    const input = document.getElementById('ibxedit-sub-input-'+id);
    const txt = input?.value.trim();
    if (!txt) return;
    const inbox = getInbox();
    const it = inbox.find(i=>i.id===id);
    if (!it) return;
    if (!it.subtasks) it.subtasks = [];
    it.subtasks.push({ text: txt, done: false });
    saveInbox(inbox);
    const container = document.getElementById('ibxedit-subs-'+id);
    if (container) {
      container.innerHTML = it.subtasks.map((s,si)=>`
        <div class="ibx-sub-edit-item">
          <div class="ibx-sub-check${s.done?' done':''}" onclick="HubInbox._toggleEditSub(${id},${si})">${s.done?'✓':''}</div>
          <span style="flex:1;font-size:12px">${escHtml(s.text)}</span>
          <button onclick="HubInbox._delEditSub(${id},${si})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px">×</button>
        </div>`).join('');
    }
    input.value=''; input.focus();
  }

  function _toggleEditSub(id, si) {
    const inbox = getInbox();
    const it = inbox.find(i=>i.id===id);
    if (!it?.subtasks?.[si]) return;
    it.subtasks[si].done = !it.subtasks[si].done;
    saveInbox(inbox);
    const container = document.getElementById('ibxedit-subs-'+id);
    if (container) container.innerHTML = it.subtasks.map((s,i)=>`
      <div class="ibx-sub-edit-item">
        <div class="ibx-sub-check${s.done?' done':''}" onclick="HubInbox._toggleEditSub(${id},${i})">${s.done?'✓':''}</div>
        <span style="flex:1;font-size:12px">${escHtml(s.text)}</span>
        <button onclick="HubInbox._delEditSub(${id},${i})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px">×</button>
      </div>`).join('');
  }

  function _delEditSub(id, si) {
    const inbox = getInbox();
    const it = inbox.find(i=>i.id===id);
    if (!it?.subtasks) return;
    it.subtasks.splice(si,1);
    saveInbox(inbox);
    const container = document.getElementById('ibxedit-subs-'+id);
    if (container) container.innerHTML = it.subtasks.map((s,i)=>`
      <div class="ibx-sub-edit-item">
        <div class="ibx-sub-check${s.done?' done':''}" onclick="HubInbox._toggleEditSub(${id},${i})">${s.done?'✓':''}</div>
        <span style="flex:1;font-size:12px">${escHtml(s.text)}</span>
        <button onclick="HubInbox._delEditSub(${id},${i})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px">×</button>
      </div>`).join('');
  }

  function saveEdit(id) {
    const inbox = getInbox();
    const it = inbox.find(i=>i.id===id);
    if (!it) return;
    const txt = document.getElementById('ibxedit-txt-'+id)?.value.trim();
    if (!txt) return;

    const typeBtn = document.querySelector(`[data-etype][data-eid="${id}"].active`);
    if (typeBtn) it.type = typeBtn.dataset.etype;

    it.text  = txt;
    it.notes = document.getElementById('ibxedit-notes-'+id)?.value||'';
    it.prio  = document.getElementById('ibxedit-prio-'+id)?.value||it.prio||'';
    it.eventDate = document.getElementById('ibxedit-eventDate-'+id)?.value||it.eventDate||'';
    it.eventTime = document.getElementById('ibxedit-timeStart-'+id)?.value||it.eventTime||'';
    it.timeEnd   = document.getElementById('ibxedit-timeEnd-'+id)?.value||it.timeEnd||'';
    it.lugar     = document.getElementById('ibxedit-lugar-'+id)?.value||it.lugar||'';
    it.rep       = document.getElementById('ibxedit-rep-'+id)?.value||it.rep||'';
    it.precio    = document.getElementById('ibxedit-precio-'+id)?.value||it.precio||'';
    it.link      = document.getElementById('ibxedit-link-'+id)?.value||it.link||'';

    const metaSel = document.getElementById('ibxedit-meta-'+id);
    it.metaId = metaSel?.value||'';
    it.metaNombre = it.metaId ? (getMetas().find(m=>String(m.id)===String(it.metaId))?.nombre||'') : '';

    const proySel = document.getElementById('ibxedit-proy-'+id);
    it.proyId = proySel?.value||'';
    if (it.proyId) {
      const p = getProyectos().find(p=>String(p.id)===String(it.proyId));
      it.proyNombre = p?.nombre||p?.name||p?.title||'';
    } else { it.proyNombre=''; }

    saveInbox(inbox);
    refreshCard(id);
    updateStats();
    window.HubDashboard?.renderDashInbox?.();
    showToast('✓ guardado');
  }

  /* ━━ SUBTASKS DESDE CARD ━━ */
  function toggleSub(id, si) {
    const inbox = getInbox();
    const it = inbox.find(i=>i.id===id);
    if (!it?.subtasks?.[si]) return;
    it.subtasks[si].done = !it.subtasks[si].done;
    saveInbox(inbox);
    refreshCard(id);
  }

  /* ━━ CYCLE TAG ━━ */
  function cycleTag(id) {
    const inbox = getInbox();
    const it = inbox.find(i=>i.id===id);
    if (!it) return;
    const idx = TAG_CYCLE.indexOf(it.type||'captura');
    it.type = TAG_CYCLE[(idx+1)%TAG_CYCLE.length];
    saveInbox(inbox);
    refreshCard(id);
  }

  /* ━━ DELETE ━━ */
  function del(id) {
    const inbox = getInbox().filter(i=>i.id!==id);
    saveInbox(inbox);
    updateStats();
    const el = document.getElementById('ibxcard-'+id);
    if (el) el.remove();
    window.HubDashboard?.renderDashInbox?.();
    showToast('eliminado');
  }

  /* ━━ REFRESH / INIT ━━ */
  function refresh() { updateStats(); render(); }

  function init() {
    ibxFilter    = 'pendientes';
    ibxTagFilter = 'all';
    renderCaptureForm();
    updateStats();
    render();
  }

  return {
    init, refresh, setFilter,
    setStatusFilter, setTagFilter,
    addCapture, selCaptureType,
    markDone, toggleMenu, closeMenu,
    sendToPlanner, toggleSub, cycleTag, del,
    openEdit, closeEdit, saveEdit,
    _editSelType, _addEditSub, _toggleEditSub, _delEditSub,
  };
})();
