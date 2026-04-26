/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-INBOX.JS — Andy.net v3
   Captura directa, editor inline, date picker libre,
   notas, vincular meta/proyecto, enviar al planner
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

  /* ━━ DATA ━━ */
  function getInbox() { return lg('dash_inbox', []); }
  function saveInbox(data) { ls('dash_inbox', data); triggerAutosave(); }

  function getMetas() { return lg('hub_metas', []); }
  function getProyectos() { return lg('hub_proyectos', []); }

  function todayStr() { return new Date().toISOString().slice(0,10); }
  function tomorrowStr() {
    const d = new Date(); d.setDate(d.getDate()+1);
    return d.toISOString().slice(0,10);
  }

  /* ━━ STATS ━━ */
  function updateStats() {
    const all  = getInbox();
    const pend = all.filter(i => i.status !== 'procesado').length;
    const proc = all.filter(i => i.status === 'procesado').length;
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    s('ibxCntPend', pend); s('ibxCntTodos', all.length); s('ibxCntProc', proc);
    s('istatPend', pend);  s('istatTodos', all.length);  s('istatProc', proc);
  }

  /* ━━ RENDER FORM DE CAPTURA ━━ */
  function renderCaptureForm() {
    const el = document.getElementById('ibxCaptureForm');
    if (!el) return;
    el.innerHTML = `
      <div class="ibx-capture-wrap">
        <div class="ibx-capture-row1">
          <input class="ibx-capture-input" id="ibxCaptureText"
            placeholder="captura rápida..."
            onkeydown="if(event.key==='Enter')HubInbox.addCapture()">
          <button class="ibx-capture-btn" onclick="HubInbox.addCapture()">+ agregar</button>
        </div>
        <div class="ibx-capture-row2">
          ${TAG_CYCLE.map(t => {
            const tag = IBX_TAGS[t];
            return `<button class="ibxs-tag${t==='captura'?' active':''}" data-captype="${t}"
              style="${t==='captura'?`color:${tag.color};border-color:${tag.border};background:var(--s2)`:''}"
              onclick="HubInbox.selCaptureType(this,'${t}')">${tag.emoji} ${t}</button>`;
          }).join('')}
        </div>
      </div>`;
  }

  function selCaptureType(btn, type) {
    document.querySelectorAll('[data-captype]').forEach(b => {
      b.classList.remove('active');
      b.style.color = ''; b.style.borderColor = ''; b.style.background = '';
    });
    btn.classList.add('active');
    const tag = IBX_TAGS[type];
    btn.style.color = tag.color;
    btn.style.borderColor = tag.border;
    btn.style.background = 'var(--s2)';
  }

  function addCapture() {
    const input = document.getElementById('ibxCaptureText');
    const txt = input?.value.trim();
    if (!txt) { input?.focus(); return; }
    const typeBtn = document.querySelector('[data-captype].active');
    const type = typeBtn?.dataset.captype || 'captura';
    const inbox = getInbox();
    inbox.unshift({ id: Date.now(), text: txt, type, status: 'pendiente', time: Date.now(), notes: '' });
    saveInbox(inbox);
    input.value = '';
    updateStats();
    render();
    window.HubDashboard?.renderDashInbox?.();
    showToast('✦ capturado');
  }

  /* ━━ RENDER LISTA ━━ */
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

    container.innerHTML = items.map(item => {
      const tag    = IBX_TAGS[item.type] || IBX_TAGS.captura;
      const d      = new Date(item.time || Date.now());
      const dateStr = isNaN(d) ? '' : d.getDate() + ' ' + MN[d.getMonth()];
      const isDone  = item.status === 'procesado';
      const metaNombre = item.metaNombre ? `<span class="ibx-pill">◎ ${item.metaNombre}</span>` : '';
      const proyNombre = item.proyNombre ? `<span class="ibx-pill">◈ ${item.proyNombre}</span>` : '';
      const hasNotes   = item.notes ? `<div class="ibx-card-notes">${escHtml(item.notes)}</div>` : '';

      return `<div class="ibxs-card${isDone?' processed':''}" id="ibxcard-${item.id}">
        <div class="ibxs-card-top">
          <span class="ibxs-card-tag" style="color:${tag.color};border-color:${tag.border}"
            onclick="HubInbox.cycleTag(${item.id})" title="click para cambiar">${tag.emoji} ${item.type||'captura'}</span>
          <div class="ibx-card-body">
            <div class="ibxs-card-text" onclick="HubInbox.openEdit(${item.id})" style="cursor:pointer" title="editar">${escHtml(item.text)}</div>
            ${hasNotes}
            ${metaNombre||proyNombre ? `<div class="ibx-card-pills">${metaNombre}${proyNombre}</div>` : ''}
          </div>
          <span class="ibxs-card-date">${dateStr}</span>
        </div>
        <div class="ibxs-card-actions">
          <button class="ibxs-act a-done" onclick="HubInbox.markDone(${item.id})">${isDone?'↩ restaurar':'✓ procesar'}</button>
          <button class="ibxs-act a-pln"  onclick="HubInbox.openPicker('ibxpln-${item.id}')">📅 planner</button>
          <button class="ibxs-act a-del"  onclick="HubInbox.del(${item.id})">🗑 eliminar</button>
        </div>
        <!-- EDITOR INLINE -->
        <div class="ibx-editor" id="ibxedit-${item.id}">
          <div class="ibx-editor-row">
            <input class="ibx-editor-input" id="ibxedit-txt-${item.id}"
              value="${escAttr(item.text)}" placeholder="texto..."
              onkeydown="if(event.key==='Enter')HubInbox.saveEdit(${item.id})">
          </div>
          <div class="ibx-editor-chips">
            ${TAG_CYCLE.map(t => {
              const tg = IBX_TAGS[t];
              const sel = (item.type||'captura') === t;
              return `<button class="ibxs-tag${sel?' active':''}" data-etype-${item.id}="${t}"
                style="${sel?`color:${tg.color};border-color:${tg.border};background:var(--s2)`:''}"
                onclick="HubInbox._editSelType(this,${item.id},'${t}')">${tg.emoji} ${t}</button>`;
            }).join('')}
          </div>
          <div class="ibx-editor-row">
            <div class="ibxs-pick-label" style="margin-bottom:4px">notas</div>
            <textarea class="ibx-editor-notes" id="ibxedit-notes-${item.id}"
              placeholder="notas o contexto...">${escHtml(item.notes||'')}</textarea>
          </div>
          <div class="ibx-editor-row2">
            <div>
              <div class="ibxs-pick-label">vincular meta</div>
              <select class="ibxs-pick-sel" id="ibxedit-meta-${item.id}" style="width:100%;margin-top:4px">
                ${getMetasOptions(item.metaId)}
              </select>
            </div>
            <div>
              <div class="ibxs-pick-label">vincular proyecto</div>
              <select class="ibxs-pick-sel" id="ibxedit-proy-${item.id}" style="width:100%;margin-top:4px">
                ${getProyOptions(item.proyId)}
              </select>
            </div>
          </div>
          <div class="ibx-editor-actions">
            <button class="ibxs-act" onclick="HubInbox.closeEdit(${item.id})">cancelar</button>
            <button class="ibxs-act a-pln" onclick="HubInbox.saveEdit(${item.id})">guardar ✓</button>
          </div>
        </div>
        <!-- PLANNER PICKER -->
        <div class="ibxs-picker" id="ibxpln-${item.id}">
          <span class="ibxs-pick-label">día</span>
          <input type="date" class="ibxs-pick-sel" id="ibxDay-${item.id}" value="${todayStr()}" style="padding:5px 8px">
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

  /* ━━ HELPERS ━━ */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escAttr(str) {
    return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function getMetasOptions(selectedId='') {
    const metas = getMetas();
    return `<option value="">sin meta</option>` +
      metas.map(m => `<option value="${m.id}" ${String(m.id)===String(selectedId)?'selected':''}>${m.nombre}</option>`).join('');
  }
  function getProyOptions(selectedId='') {
    const proyectos = getProyectos();
    return `<option value="">sin proyecto</option>` +
      proyectos.map(p => `<option value="${p.id}" ${String(p.id)===String(selectedId)?'selected':''}>${p.nombre||p.name||p.title||'Proyecto'}</option>`).join('');
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
    render();
    window.HubDashboard?.renderDashInbox?.();
    showToast(it.status === 'procesado' ? '✓ procesado' : '↩ restaurado');
  }

  function openPicker(pickerId) {
    document.querySelectorAll('.ibxs-picker').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('.ibx-editor').forEach(e => e.classList.remove('open'));
    const el = document.getElementById(pickerId);
    if (el) el.classList.toggle('open');
  }

  function sendToPlanner(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;

    const dateVal = document.getElementById('ibxDay-' + id)?.value || todayStr();
    const block   = document.getElementById('ibxBlock-' + id)?.value || 'morning';

    const state = lg('appState', {});
    if (!state.plannerByDate) state.plannerByDate = {};
    if (!state.plannerByDate[dateVal]) state.plannerByDate[dateVal] = { morning:[], afternoon:[], night:[] };
    state.plannerByDate[dateVal][block].push({
      id:    Date.now(),
      text:  it.text,
      type:  it.type === 'evento' ? 'evento' : 'tarea',
      prio:  it.prio || 'media',
      done:  false,
      tags:  [],
      subtasks: [],
      notes: it.notes || '',
      metaId:    it.metaId    || '',
      metaNombre:it.metaNombre|| '',
      proyId:    it.proyId    || '',
      proyNombre:it.proyNombre|| '',
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

  /* ━━ EDITOR INLINE ━━ */
  function openEdit(id) {
    // cerrar todo lo abierto
    document.querySelectorAll('.ibx-editor.open').forEach(e => {
      if (e.id !== 'ibxedit-' + id) e.classList.remove('open');
    });
    document.querySelectorAll('.ibxs-picker.open').forEach(p => p.classList.remove('open'));
    const el = document.getElementById('ibxedit-' + id);
    if (el) {
      el.classList.toggle('open');
      if (el.classList.contains('open')) {
        setTimeout(() => document.getElementById('ibxedit-txt-' + id)?.focus(), 60);
      }
    }
  }

  function closeEdit(id) {
    const el = document.getElementById('ibxedit-' + id);
    if (el) el.classList.remove('open');
  }

  function _editSelType(btn, id, type) {
    document.querySelectorAll(`[data-etype-${id}]`).forEach(b => {
      b.classList.remove('active');
      b.style.color = ''; b.style.borderColor = ''; b.style.background = '';
    });
    btn.classList.add('active');
    const tag = IBX_TAGS[type];
    btn.style.color = tag.color;
    btn.style.borderColor = tag.border;
    btn.style.background = 'var(--s2)';
  }

  function saveEdit(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;

    const txt = document.getElementById('ibxedit-txt-' + id)?.value.trim();
    if (!txt) return;

    // Tipo seleccionado
    const typeBtn = document.querySelector(`[data-etype-${id}].active`);
    if (typeBtn) it.type = typeBtn.dataset[`etype${id}`] ||
      Object.keys(typeBtn.dataset).find(k => k.startsWith('etype'))
        ?.replace('etype', '').replace(String(id),'') || it.type;

    // Fallback: leer del atributo directo
    if (typeBtn) {
      const raw = typeBtn.getAttribute(`data-etype-${id}`);
      if (raw) it.type = raw;
    }

    it.text  = txt;
    it.notes = document.getElementById('ibxedit-notes-' + id)?.value || '';

    const metaSel = document.getElementById('ibxedit-meta-' + id);
    it.metaId = metaSel?.value || '';
    it.metaNombre = it.metaId ? (getMetas().find(m=>String(m.id)===String(it.metaId))?.nombre||'') : '';

    const proySel = document.getElementById('ibxedit-proy-' + id);
    it.proyId = proySel?.value || '';
    if (it.proyId) {
      const proy = getProyectos().find(p=>String(p.id)===String(it.proyId));
      it.proyNombre = proy?.nombre||proy?.name||proy?.title||'';
    } else { it.proyNombre = ''; }

    saveInbox(inbox);
    render();
    updateStats();
    window.HubDashboard?.renderDashInbox?.();
    showToast('✓ guardado');
  }

  /* ━━ CYCLE TAG ━━ */
  function cycleTag(id) {
    const inbox = getInbox();
    const it = inbox.find(i => i.id === id);
    if (!it) return;
    const idx = TAG_CYCLE.indexOf(it.type||'captura');
    it.type = TAG_CYCLE[(idx+1) % TAG_CYCLE.length];
    saveInbox(inbox);
    render();
  }

  /* ━━ DELETE ━━ */
  function del(id) {
    const inbox = getInbox().filter(i => i.id !== id);
    saveInbox(inbox);
    updateStats();
    render();
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
    markDone, openPicker, sendToPlanner,
    openEdit, closeEdit, saveEdit, _editSelType,
    cycleTag, del,
  };
})();
