/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STUDIO-PROYECTOS.JS — Andy.net v3
   Galería, detalle, kanban personalizable,
   sub-proyectos, notas, links
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.StudioProyectos = (function () {
  'use strict';

  const lg  = (k,f) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):f; } catch{return f;} };
  const ls  = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch{} };
  const save = () => { ls('hub_proyectos', _proyectos); ls('studio_proyectos', _proyectos); };

  const ESTADOS = ['idea','planificando','construyendo','pausado','terminado'];
  const PRIOS   = ['alta','media','baja'];
  const PRIO_COLOR = { alta:'#c86e8a', media:'#c8965a', baja:'#5a8a6a' };

  const DEFAULT_PROYECTOS = [
    { id:1001, emoji:'🍄', nombre:'Cultivo P. Cub', desc:'Proyecto de cultivo de hongos psilocybe cubensis.', estado:'construyendo', prio:'media', inicio:'', deadline:'', progreso:10, cat:'personal', tags:[], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'En revisión'},{id:'c4',name:'Hecho'}], cards:[], subs:[], notas:'', links:[], urgente:false },
    { id:1002, emoji:'🌿', nombre:'Botánica Adáptogens', desc:'Tienda online de adáptogens para el mercado mexicano.', estado:'construyendo', prio:'alta', inicio:'', deadline:'', progreso:20, cat:'negocio', tags:['ecommerce','salud'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'En revisión'},{id:'c4',name:'Hecho'}], cards:[], subs:[], notas:'', links:[], urgente:false },
    { id:1003, emoji:'✨', nombre:'New Age Project', desc:'Meditaciones, espiritualidad y contenido new age. Nombre por definir.', estado:'idea', prio:'baja', inicio:'', deadline:'', progreso:0, cat:'creativo', tags:['espiritual'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'Hecho'}], cards:[], subs:[], notas:'', links:[], urgente:false },
    { id:1004, emoji:'🧠', nombre:'Ecosistema Neurocientífico: Toltia', desc:'Plataforma de neurociencia aplicada y desarrollo personal.', estado:'planificando', prio:'alta', inicio:'', deadline:'', progreso:5, cat:'negocio', tags:['neurociencia','educacion'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'En revisión'},{id:'c4',name:'Hecho'}], cards:[], subs:[], notas:'', links:[], urgente:false },
    { id:1005, emoji:'⊛', nombre:'AP Studio', desc:'Diseño y desarrollo web, landing pages y proyectos digitales.', estado:'construyendo', prio:'alta', inicio:'', deadline:'', progreso:30, cat:'negocio', tags:['diseño','web'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'En revisión'},{id:'c4',name:'Hecho'}], cards:[], subs:[], notas:'', links:[], urgente:false },
    { id:1006, emoji:'✍️', nombre:'Anne — Redacción & Contenido', desc:'Redacción, copywriting y contenido creativo.', estado:'construyendo', prio:'media', inicio:'', deadline:'', progreso:15, cat:'creativo', tags:['escritura','contenido'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'Hecho'}], cards:[], subs:[], notas:'', links:[], urgente:false },
    { id:1007, emoji:'📱', nombre:'Apps', desc:'Todas las aplicaciones en desarrollo, incluyendo Andy.net v3.', estado:'construyendo', prio:'alta', inicio:'', deadline:'', progreso:40, cat:'tech', tags:['dev'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'En revisión'},{id:'c4',name:'Hecho'}], cards:[], subs:[{id:2001,nombre:'Andy.net v3',emoji:'❖',progreso:40},{id:2002,nombre:'Otra app',emoji:'📲',progreso:5}], notas:'', links:[], urgente:false },
    { id:1008, emoji:'📚', nombre:'Editorial / Libros', desc:'Editorial personal. Incluye Máscaras y la Guía de Cultivo.', estado:'construyendo', prio:'media', inicio:'', deadline:'', progreso:20, cat:'creativo', tags:['libros','escritura'], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'Revisión'},{id:'c4',name:'Publicado'}], cards:[], subs:[{id:2003,nombre:'Máscaras',emoji:'🎭',progreso:25},{id:2004,nombre:'Guía de Cultivo',emoji:'🍄',progreso:10}], notas:'', links:[], urgente:false },
  ];

  let _proyectos = [];
  let _filter    = 'all';
  let _urgent    = false;
  let _currentId = null;
  let _dragSrc   = null;

  /* ━━ DATA ━━ */
  function init() {
    _proyectos = lg('hub_proyectos', null) || lg('studio_proyectos', null) || DEFAULT_PROYECTOS;
    // Asegurar estructura completa
    _proyectos = _proyectos.map(p => ({
      cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'Revisión'},{id:'c4',name:'Hecho'}],
      cards:[], subs:[], notas:'', links:[], tags:[], urgente:false,
      ...p
    }));
    save();
    renderGallery();
  }

  function getP(id) { return _proyectos.find(p=>p.id===id); }

  /* ━━ GALERÍA ━━ */
  function renderGallery() {
    const container = document.getElementById('proyGallery');
    const detail    = document.getElementById('proyDetail');
    if (!container) return;
    container.style.display = 'block';
    if (detail) detail.style.display = 'none';
    _currentId = null;

    let items = [..._proyectos];
    if (_filter !== 'all') items = items.filter(p=>p.estado===_filter);
    if (_urgent) items = items.filter(p=>p.urgente);

    if (!items.length) {
      container.innerHTML = '<div style="padding:40px;text-align:center;font-family:var(--mono);font-size:10px;color:var(--muted)">sin proyectos</div>';
      return;
    }

    container.innerHTML = `<div class="proy-gallery">${items.map(buildCard).join('')}</div>`;

    // Animar barras de progreso
    setTimeout(() => {
      container.querySelectorAll('.proy-card-progress-fill').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 80);
  }

  function buildCard(p) {
    const estadoClass = 'estado-' + (p.estado||'idea');
    const prioClass   = 'prio-' + (p.prio||'media');
    const totalCards  = (p.cards||[]).length;
    const doneCards   = (p.cards||[]).filter(c=>c.colId===p.cols?.[p.cols.length-1]?.id).length;
    const deadlineTxt = p.deadline ? formatDate(p.deadline) : '';
    const vencido     = p.deadline && new Date(p.deadline) < new Date();

    return `<div class="proy-card${p.urgente?' urgent':''}" onclick="StudioProyectos.openDetail(${p.id})">
      <div class="proy-card-header">
        <div style="display:flex;align-items:flex-start;gap:10px;flex:1;min-width:0">
          <span class="proy-card-emoji">${p.emoji||'◈'}</span>
          <div class="proy-card-info">
            <div class="proy-card-name">${escHtml(p.nombre)}</div>
            <div class="proy-card-desc">${escHtml(p.desc||'')}</div>
          </div>
        </div>
        <span class="proy-card-estado ${estadoClass}">${p.estado||'idea'}</span>
      </div>
      ${(p.tags||[]).length ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">${p.tags.map(t=>`<span class="proy-sub-chip">${t}</span>`).join('')}</div>` : ''}
      <div class="proy-card-meta">
        ${deadlineTxt ? `<span class="proy-card-deadline${vencido?' vencido':''}">📅 ${deadlineTxt}</span>` : ''}
        <span class="proy-card-prio ${prioClass}">${p.prio||'media'}</span>
        ${p.urgente ? '<span style="font-size:11px">⚡</span>' : ''}
      </div>
      <div class="proy-card-progress">
        <div class="proy-card-progress-bar">
          <div class="proy-card-progress-fill" data-w="${p.progreso||0}" style="width:0"></div>
        </div>
        <div class="proy-card-progress-txt"><span>${p.progreso||0}%</span><span>${doneCards}/${totalCards} tareas</span></div>
      </div>
      ${(p.subs||[]).length ? `<div class="proy-card-sub">${p.subs.map(s=>`<span class="proy-sub-chip">${s.emoji||''} ${s.nombre}</span>`).join('')}</div>` : ''}
    </div>`;
  }

  /* ━━ FILTROS ━━ */
  function setFilter(btn, filter) {
    document.querySelectorAll('.proy-filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    _filter = filter;
    renderGallery();
  }

  function toggleUrgent(btn) {
    _urgent = !_urgent;
    btn.classList.toggle('active', _urgent);
    renderGallery();
  }

  /* ━━ DETALLE ━━ */
  function openDetail(id) {
    _currentId = id;
    const p = getP(id);
    if (!p) return;
    document.getElementById('proyGallery').style.display = 'none';
    const detail = document.getElementById('proyDetail');
    detail.style.display = 'block';
    renderDetail(p);
  }

  function backToGallery() {
    saveCurrentDetail();
    renderGallery();
  }

  function renderDetail(p) {
    const detail = document.getElementById('proyDetail');
    const estadoOpts = ESTADOS.map(e=>`<option value="${e}" ${p.estado===e?'selected':''}>${e}</option>`).join('');
    const prioOpts   = PRIOS.map(pr=>`<option value="${pr}" ${p.prio===pr?'selected':''}>${pr}</option>`).join('');
    const metas      = lg('hub_metas',[]);
    const metaOpts   = `<option value="">sin meta</option>${metas.map(m=>`<option value="${m.id}" ${String(p.metaId)===String(m.id)?'selected':''}>${m.nombre}</option>`).join('')}`;
    const totalCards = (p.cards||[]).length;
    const doneCards  = (p.cards||[]).filter(c=>c.colId===p.cols?.[p.cols.length-1]?.id).length;
    const diasRest   = p.deadline ? Math.max(0,Math.round((new Date(p.deadline)-new Date())/86400000)) : null;
    const bgStyle    = p.coverUrl ? `background-image:url('${p.coverUrl}')` : '';

    detail.innerHTML = `
      <button class="proy-detail-back" onclick="StudioProyectos.backToGallery()" style="margin-bottom:16px">← proyectos</button>

      <!-- HERO -->
      <div class="proy-hero">
        <div class="proy-hero-bg" id="detailHeroBg" style="${bgStyle};background-size:cover;background-position:center"></div>
        <div class="proy-hero-overlay"></div>

        <!-- Botón portada -->
        <button class="proy-hero-cover-btn" onclick="StudioProyectos.toggleCoverForm()">🖼 portada</button>
        <div class="proy-hero-cover-form" id="coverForm">
          <input class="proy-hero-cover-input" id="coverUrlInput" placeholder="https://imagen.com/foto.jpg" value="${escAttr(p.coverUrl||'')}">
          <button class="proy-hero-cover-save" onclick="StudioProyectos.saveCover()">aplicar</button>
          <button class="proy-hero-cover-save" onclick="StudioProyectos.removeCover()" style="background:rgba(200,110,138,.1);border-color:rgba(200,110,138,.3);color:var(--pink)">quitar</button>
        </div>

        <div class="proy-hero-content">
          <div class="proy-hero-top">
            <div style="flex:1">
              <span class="proy-hero-emoji" id="detailEmoji" onclick="StudioProyectos.changeEmoji()" title="cambiar emoji">${p.emoji||'◈'}</span>
              <input class="proy-hero-name" id="detailNombre" value="${escAttr(p.nombre)}" placeholder="nombre del proyecto..." oninput="StudioProyectos._autoSave()">
              <textarea class="proy-hero-desc" id="detailDesc" placeholder="descripción breve..." oninput="StudioProyectos._autoSave()">${escHtml(p.desc||'')}</textarea>
            </div>
            <div class="proy-hero-actions">
              <button class="proy-hero-btn proy-hero-urgente${p.urgente?' on':''}" onclick="StudioProyectos.toggleUrgente()" title="urgente">⚡</button>
              <button class="proy-hero-btn save" onclick="StudioProyectos.saveCurrentDetail()">guardar ✓</button>
            </div>
          </div>

          <div class="proy-hero-meta-row">
            <select class="proy-hero-estado ${('estado-'+(p.estado||'idea'))}" id="detailEstado" onchange="StudioProyectos._autoSave()">${estadoOpts}</select>
            <span class="proy-hero-meta-item">📅 <input type="date" class="proy-hero-meta-input" id="detailDeadline" value="${p.deadline||''}" oninput="StudioProyectos._autoSave()"></span>
            <span class="proy-hero-meta-item">inicio <input type="date" class="proy-hero-meta-input" id="detailInicio" value="${p.inicio||''}" oninput="StudioProyectos._autoSave()"></span>
            <span class="proy-hero-meta-item">
              prio
              <select class="proy-hero-meta-input" id="detailPrio" style="width:80px" onchange="StudioProyectos._autoSave()">${prioOpts}</select>
            </span>
            <span class="proy-hero-meta-item">
              meta
              <select class="proy-hero-meta-input" id="detailMeta" style="width:130px" onchange="StudioProyectos._autoSave()">${metaOpts}</select>
            </span>
            <span class="proy-hero-meta-item">
              cat
              <input class="proy-hero-meta-input" id="detailCat" value="${escAttr(p.cat||'')}" placeholder="negocio..." oninput="StudioProyectos._autoSave()">
            </span>
          </div>

          <div class="proy-hero-progress">
            <div class="proy-hero-progress-bar">
              <div class="proy-hero-progress-fill" id="detailProgressFill" style="width:0"></div>
            </div>
            <div class="proy-hero-progress-row">
              <input type="range" class="proy-hero-progress-range" min="0" max="100" value="${p.progreso||0}" id="detailProgreso"
                oninput="document.getElementById('detailProgressNum').textContent=this.value+'%';document.getElementById('detailProgressFill').style.width=this.value+'%';StudioProyectos._autoSave()">
              <span class="proy-hero-progress-num" id="detailProgressNum">${p.progreso||0}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="proy-kpis">
        <div class="proy-kpi protagonist">
          <span class="proy-kpi-val" id="kpiProgreso">${p.progreso||0}%</span>
          <span class="proy-kpi-lbl">progreso global</span>
        </div>
        <div class="proy-kpi">
          <span class="proy-kpi-val">${totalCards}</span>
          <span class="proy-kpi-lbl">tareas totales</span>
        </div>
        <div class="proy-kpi">
          <span class="proy-kpi-val">${doneCards}</span>
          <span class="proy-kpi-lbl">completadas</span>
        </div>
        <div class="proy-kpi">
          <span class="proy-kpi-val" style="${diasRest===0?'color:var(--pink)':diasRest!==null&&diasRest<=7?'color:var(--amber)':''}">${diasRest!==null?diasRest:'—'}</span>
          <span class="proy-kpi-lbl">días restantes</span>
        </div>
      </div>

      <!-- TAGS -->
      <div class="proy-tags-row" id="detailTagsRow" style="margin-bottom:24px">
        ${(p.tags||[]).map(t=>`<span class="proy-tag" onclick="StudioProyectos.removeTag('${t}')">${t} ×</span>`).join('')}
        <input class="proy-tag proy-tag-add" id="detailTagInput" placeholder="+ etiqueta" style="width:90px;border-style:dashed;cursor:text"
          onkeydown="if(event.key==='Enter'||event.key===','){event.preventDefault();StudioProyectos.addTag()}">
      </div>

      <!-- KANBAN -->
      <div>
        <div class="proy-kanban-header">
          <span class="proy-kanban-title">tablero kanban</span>
          <button class="proy-kanban-add-col" onclick="StudioProyectos.addCol()">+ columna</button>
        </div>
        <div class="proy-kanban" id="detailKanban"></div>
      </div>

      <!-- SUB-PROYECTOS -->
      <details class="proy-subs-section" style="margin-top:24px">
        <summary style="font-family:var(--mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <span>▶ sub-proyectos (${(p.subs||[]).length})</span>
          <button class="proy-subs-add" onclick="event.preventDefault();StudioProyectos.addSub()">+ agregar</button>
        </summary>
        <div class="proy-subs-grid" id="detailSubs"></div>
      </details>

      <!-- GRID INFERIOR -->
      <div class="proy-bottom-grid">
        <div>
          <span class="proy-section-label">notas del proyecto</span>
          <textarea class="proy-notes-area" id="detailNotas" placeholder="ideas, contexto, decisiones..." oninput="StudioProyectos._autoSaveNote()">${escHtml(p.notas||'')}</textarea>
        </div>
        <div>
          <span class="proy-section-label">archivos & links</span>
          <div id="detailLinks"></div>
          <button class="proy-link-add-card" onclick="StudioProyectos.showAddLink()">
            <span style="font-size:16px">+</span> agregar link o archivo
          </button>
          <div id="addLinkForm" style="display:none;margin-top:8px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px 14px">
            <div style="display:flex;flex-direction:column;gap:6px">
              <input class="proy-link-input" id="linkTitleInput" placeholder="título..." style="width:100%">
              <input class="proy-link-input" id="linkUrlInput" placeholder="https://... o ruta/archivo" style="width:100%"
                onkeydown="if(event.key==='Enter')StudioProyectos.addLink()">
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="proy-add-card-cancel" onclick="StudioProyectos.hideAddLink()">cancelar</button>
                <button class="proy-add-card-save" onclick="StudioProyectos.addLink()">agregar</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    renderKanban(p);
    renderSubs(p);
    renderLinks(p);

    setTimeout(() => {
      const fill = document.getElementById('detailProgressFill');
      if (fill) fill.style.width = (p.progreso||0) + '%';
    }, 80);
  }

  /* ━━ KANBAN ━━ */
  function renderKanban(p) {
    const container = document.getElementById('detailKanban');
    if (!container) return;
    container.innerHTML = (p.cols||[]).map(col => {
      const cards = (p.cards||[]).filter(c=>c.colId===col.id);
      return `<div class="proy-col" id="col-${col.id}"
          ondragover="StudioProyectos.onDragOver(event,'${col.id}')"
          ondrop="StudioProyectos.onDrop(event,'${col.id}')">
        <div class="proy-col-header">
          <input class="proy-col-name" value="${escAttr(col.name)}"
            onchange="StudioProyectos.renameCol('${col.id}',this.value)">
          <span class="proy-col-count">${cards.length}</span>
          <button class="proy-col-del" onclick="StudioProyectos.delCol('${col.id}')" title="eliminar columna">×</button>
        </div>
        <div class="proy-col-cards" id="cards-${col.id}">
          ${cards.map(c=>buildKcard(c,col.id)).join('')}
        </div>
        <div id="addform-${col.id}" style="display:none">
          <div class="proy-add-card-form">
            <textarea class="proy-add-card-input" id="cardinput-${col.id}" placeholder="descripción de la tarea..."
              onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();StudioProyectos.saveCard('${col.id}')}"></textarea>
            <div class="proy-add-card-row">
              <button class="proy-add-card-prio alta" data-prio="alta" data-col="${col.id}" onclick="StudioProyectos.selCardPrio(this,'${col.id}')">alta</button>
              <button class="proy-add-card-prio media sel" data-prio="media" data-col="${col.id}" onclick="StudioProyectos.selCardPrio(this,'${col.id}')">media</button>
              <button class="proy-add-card-prio baja" data-prio="baja" data-col="${col.id}" onclick="StudioProyectos.selCardPrio(this,'${col.id}')">baja</button>
              <input type="date" class="proy-add-card-date" id="carddate-${col.id}">
              <button class="proy-add-card-cancel" onclick="StudioProyectos.cancelCard('${col.id}')">cancelar</button>
              <button class="proy-add-card-save" onclick="StudioProyectos.saveCard('${col.id}')">agregar</button>
            </div>
          </div>
        </div>
        <button class="proy-col-add" onclick="StudioProyectos.showAddCard('${col.id}')">+ agregar tarea</button>
      </div>`;
    }).join('');
  }

  function buildKcard(c, colId) {
    return `<div class="proy-kcard" draggable="true" id="kcard-${c.id}"
        ondragstart="StudioProyectos.onDragStart(event,'${c.id}','${colId}')"
        ondragend="StudioProyectos.onDragEnd(event)">
      <div class="proy-kcard-text">${escHtml(c.text)}</div>
      <div class="proy-kcard-meta">
        <div class="proy-kcard-prio" style="background:${PRIO_COLOR[c.prio]||PRIO_COLOR.media}"></div>
        ${c.tag ? `<span class="proy-kcard-tag">${escHtml(c.tag)}</span>` : ''}
        ${c.date ? `<span class="proy-kcard-date">${formatDate(c.date)}</span>` : ''}
      </div>
      <button class="proy-kcard-del" onclick="event.stopPropagation();StudioProyectos.delCard('${c.id}','${colId}')">×</button>
    </div>`;
  }

  function showAddCard(colId) {
    document.querySelectorAll('[id^="addform-"]').forEach(f=>f.style.display='none');
    const form = document.getElementById('addform-'+colId);
    if (form) { form.style.display='block'; setTimeout(()=>document.getElementById('cardinput-'+colId)?.focus(),50); }
  }

  function cancelCard(colId) {
    const form = document.getElementById('addform-'+colId);
    if (form) form.style.display='none';
  }

  function selCardPrio(btn, colId) {
    document.querySelectorAll(`.proy-add-card-prio[data-col="${colId}"]`).forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel');
  }

  function saveCard(colId) {
    const txt = document.getElementById('cardinput-'+colId)?.value.trim();
    if (!txt) return;
    const p = getP(_currentId);
    if (!p) return;
    const prioBtn = document.querySelector(`.proy-add-card-prio[data-col="${colId}"].sel`);
    const date    = document.getElementById('carddate-'+colId)?.value || '';
    p.cards = p.cards || [];
    p.cards.push({ id: Date.now(), text: txt, colId, prio: prioBtn?.dataset.prio||'media', date, tag:'' });
    save();
    renderKanban(p);
    cancelCard(colId);
    _updateProgress(p);
  }

  function delCard(cardId, colId) {
    const p = getP(_currentId);
    if (!p) return;
    p.cards = (p.cards||[]).filter(c=>String(c.id)!==String(cardId));
    save();
    const container = document.getElementById('cards-'+colId);
    const card = document.getElementById('kcard-'+cardId);
    if (card) card.remove();
    const count = document.querySelector(`#col-${colId} .proy-col-count`);
    if (count) count.textContent = (p.cards||[]).filter(c=>c.colId===colId).length;
    _updateProgress(p);
  }

  function addCol() {
    const p = getP(_currentId);
    if (!p) return;
    const name = prompt('Nombre de la columna:');
    if (!name) return;
    p.cols = p.cols || [];
    p.cols.push({ id: 'c'+Date.now(), name });
    save();
    renderKanban(p);
  }

  function renameCol(colId, name) {
    const p = getP(_currentId);
    if (!p) return;
    const col = (p.cols||[]).find(c=>c.id===colId);
    if (col) { col.name = name; save(); }
  }

  function delCol(colId) {
    const p = getP(_currentId);
    if (!p) return;
    if ((p.cards||[]).some(c=>c.colId===colId)) {
      if (!confirm('Esta columna tiene tareas. ¿Eliminar?')) return;
    }
    p.cols  = (p.cols||[]).filter(c=>c.id!==colId);
    p.cards = (p.cards||[]).filter(c=>c.colId!==colId);
    save();
    document.getElementById('col-'+colId)?.remove();
  }

  /* ━━ DRAG & DROP KANBAN ━━ */
  function onDragStart(e, cardId, colId) {
    _dragSrc = { cardId, colId };
    document.getElementById('kcard-'+cardId)?.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd(e) {
    document.querySelectorAll('.proy-kcard.dragging').forEach(el=>el.classList.remove('dragging'));
    document.querySelectorAll('.proy-col-cards.drag-over').forEach(el=>el.classList.remove('drag-over'));
    _dragSrc = null;
  }

  function onDragOver(e, colId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.proy-col-cards').forEach(el=>el.classList.remove('drag-over'));
    document.getElementById('cards-'+colId)?.classList.add('drag-over');
  }

  function onDrop(e, targetColId) {
    e.preventDefault();
    if (!_dragSrc) return;
    document.querySelectorAll('.proy-col-cards').forEach(el=>el.classList.remove('drag-over'));
    if (_dragSrc.colId === targetColId) return;
    const p = getP(_currentId);
    if (!p) return;
    const card = (p.cards||[]).find(c=>String(c.id)===String(_dragSrc.cardId));
    if (!card) return;
    card.colId = targetColId;
    save();
    renderKanban(p);
    _updateProgress(p);
    _dragSrc = null;
  }

  function _updateProgress(p) {
    if (!p.cols?.length || !p.cards?.length) return;
    const lastCol = p.cols[p.cols.length-1];
    const done = (p.cards||[]).filter(c=>c.colId===lastCol.id).length;
    const total = (p.cards||[]).length;
    if (total > 0) {
      p.progreso = Math.round((done/total)*100);
      save();
      const fill = document.getElementById('detailProgressFill');
      const num  = document.getElementById('detailProgressNum');
      const range = document.getElementById('detailProgreso');
      if (fill)  fill.style.width = p.progreso + '%';
      if (num)   num.textContent  = p.progreso + '%';
      if (range) range.value = p.progreso;
    }
  }

  /* ━━ SUB-PROYECTOS ━━ */
  function renderSubs(p) {
    const container = document.getElementById('detailSubs');
    if (!container) return;
    const subs = p.subs || [];
    container.innerHTML = subs.map(s=>`
      <div class="proy-sub-card" onclick="StudioProyectos.openSub(${p.id},${s.id})">
        <div class="proy-sub-name"><span style="font-size:16px">${s.emoji||'◈'}</span>${escHtml(s.nombre)}</div>
        <div class="proy-sub-progress-bar"><div class="proy-sub-progress-fill" style="width:${s.progreso||0}%"></div></div>
      </div>`).join('') +
      `<div class="proy-sub-card" style="border-style:dashed;display:flex;align-items:center;justify-content:center;color:var(--muted);font-family:var(--mono);font-size:9px"
        onclick="StudioProyectos.addSub()">+ sub-proyecto</div>`;
  }

  function addSub() {
    const p = getP(_currentId);
    if (!p) return;
    const nombre = prompt('Nombre del sub-proyecto:');
    if (!nombre) return;
    const emoji = prompt('Emoji (opcional):', '◈') || '◈';
    p.subs = p.subs || [];
    p.subs.push({ id: Date.now(), nombre, emoji, progreso: 0, notas:'', links:[], cols:[{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'Hecho'}], cards:[] });
    save();
    renderSubs(p);
  }

  function openSub(proyId, subId) {
    // TODO: abrir vista detalle del sub-proyecto
    alert('Sub-proyecto próximamente con vista completa');
  }

  /* ━━ TAGS ━━ */
  function addTag() {
    const input = document.getElementById('detailTagInput');
    const tag = input?.value.replace(/,/g,'').trim();
    if (!tag) return;
    const p = getP(_currentId);
    if (!p) return;
    if (!p.tags) p.tags = [];
    if (!p.tags.includes(tag)) p.tags.push(tag);
    save();
    input.value = '';
    const row = document.getElementById('detailTagsRow');
    const span = document.createElement('span');
    span.className = 'proy-tag';
    span.textContent = tag + ' ×';
    span.onclick = () => removeTag(tag);
    row.insertBefore(span, input);
  }

  function removeTag(tag) {
    const p = getP(_currentId);
    if (!p) return;
    p.tags = (p.tags||[]).filter(t=>t!==tag);
    save();
    const row = document.getElementById('detailTagsRow');
    if (row) {
      row.querySelectorAll('.proy-tag:not(.proy-tag-add)').forEach(el => {
        if (el.textContent.replace(' ×','').trim()===tag) el.remove();
      });
    }
  }

  /* ━━ URGENTE ━━ */
  function toggleUrgente() {
    const p = getP(_currentId);
    if (!p) return;
    p.urgente = !p.urgente;
    save();
    const btn = document.querySelector('.proy-detail-header button[onclick*="toggleUrgente"]');
    if (btn) {
      btn.style.color = p.urgente ? 'var(--pink)' : 'var(--muted)';
      btn.style.borderColor = p.urgente ? 'rgba(200,110,138,.4)' : 'var(--border)';
    }
  }

  /* ━━ EMOJI ━━ */
  function changeEmoji() {
    const emoji = prompt('Nuevo emoji:');
    if (!emoji) return;
    const p = getP(_currentId);
    if (!p) return;
    p.emoji = emoji;
    save();
    document.getElementById('detailEmoji').textContent = emoji;
  }

  /* ━━ LINKS ━━ */
  /* ━━ PORTADA ━━ */
  function toggleCoverForm() {
    document.getElementById('coverForm')?.classList.toggle('open');
  }
  function saveCover() {
    const url = document.getElementById('coverUrlInput')?.value.trim();
    const p = getP(_currentId);
    if (!p) return;
    p.coverUrl = url;
    save();
    const bg = document.getElementById('detailHeroBg');
    if (bg) bg.style.backgroundImage = url ? `url('${url}')` : '';
    document.getElementById('coverForm')?.classList.remove('open');
  }
  function removeCover() {
    const p = getP(_currentId);
    if (!p) return;
    p.coverUrl = '';
    save();
    const bg = document.getElementById('detailHeroBg');
    if (bg) bg.style.backgroundImage = '';
    document.getElementById('coverForm')?.classList.remove('open');
  }

  /* ━━ AUTOSAVE GENERAL ━━ */
  let _autoSaveTimer;
  function _autoSave() {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => saveCurrentDetail(), 1200);
  }

  /* ━━ LINKS SHOW/HIDE ━━ */
  function showAddLink() {
    document.getElementById('addLinkForm').style.display = 'block';
    setTimeout(() => document.getElementById('linkTitleInput')?.focus(), 50);
  }
  function hideAddLink() {
    document.getElementById('addLinkForm').style.display = 'none';
  }

  function renderLinks(p) {
    const container = document.getElementById('detailLinks');
    if (!container) return;
    const getIco = (url) => {
      if (!url) return '📄';
      if (url.includes('figma')) return '🎨';
      if (url.includes('github')) return '📦';
      if (url.includes('notion')) return '📓';
      if (url.includes('drive.google')) return '📁';
      if (url.includes('docs.google')) return '📝';
      if (url.startsWith('http')) return '🔗';
      return '📄';
    };
    container.innerHTML = (p.links||[]).map((l,i)=>`
      <div class="proy-link-card">
        <span class="proy-link-ico">${getIco(l.url)}</span>
        <div class="proy-link-body">
          <input class="proy-link-title-edit" value="${escAttr(l.title||'')}" placeholder="título..."
            onchange="StudioProyectos.updateLink(${i},'title',this.value)">
          <input class="proy-link-url-edit" value="${escAttr(l.url||'')}" placeholder="https://..."
            onchange="StudioProyectos.updateLink(${i},'url',this.value)">
        </div>
        <button class="proy-link-card-del" onclick="StudioProyectos.delLink(${i})" title="eliminar">×</button>
      </div>`).join('');
  }

  function addLink() {
    const title = document.getElementById('linkTitleInput')?.value.trim();
    const url   = document.getElementById('linkUrlInput')?.value.trim();
    if (!url) return;
    const p = getP(_currentId);
    if (!p) return;
    p.links = p.links || [];
    p.links.push({ title: title||url, url });
    save();
    renderLinks(p);
    document.getElementById('linkTitleInput').value = '';
    document.getElementById('linkUrlInput').value = '';
    hideAddLink();
  }

  function updateLink(idx, field, val) {
    const p = getP(_currentId);
    if (!p?.links?.[idx]) return;
    p.links[idx][field] = val;
    save();
  }

  function delLink(idx) {
    const p = getP(_currentId);
    if (!p) return;
    p.links.splice(idx,1);
    save();
    renderLinks(p);
  }

  /* ━━ NOTAS AUTO-SAVE ━━ */
  let _noteTimer;
  function _autoSaveNote() {
    clearTimeout(_noteTimer);
    _noteTimer = setTimeout(() => {
      const p = getP(_currentId);
      if (!p) return;
      p.notas = document.getElementById('detailNotas')?.value || '';
      save();
    }, 800);
  }

  /* ━━ GUARDAR DETALLE ━━ */
  function saveCurrentDetail() {
    if (!_currentId) return;
    const p = getP(_currentId);
    if (!p) return;
    p.nombre   = document.getElementById('detailNombre')?.value.trim() || p.nombre;
    p.desc     = document.getElementById('detailDesc')?.value.trim() || '';
    p.estado   = document.getElementById('detailEstado')?.value || p.estado;
    p.prio     = document.getElementById('detailPrio')?.value || p.prio;
    p.inicio   = document.getElementById('detailInicio')?.value || '';
    p.deadline = document.getElementById('detailDeadline')?.value || '';
    p.cat      = document.getElementById('detailCat')?.value.trim() || '';
    p.progreso = parseInt(document.getElementById('detailProgreso')?.value||0);
    p.notas    = document.getElementById('detailNotas')?.value || '';
    const metaSel = document.getElementById('detailMeta');
    p.metaId = metaSel?.value || '';
    if (p.metaId) {
      const meta = lg('hub_metas',[]).find(m=>String(m.id)===String(p.metaId));
      p.metaNombre = meta?.nombre || '';
    }
    save();
    // Notificar al dashboard del hub
    if (window.HubDashboard?.renderDashProy) window.HubDashboard.renderDashProy();
    if (window.HubCore?.showToast) window.HubCore.showToast('✓ proyecto guardado');
    else if (window.StudioCore?.showToast) window.StudioCore.showToast('✓ proyecto guardado');
  }

  /* ━━ NUEVO PROYECTO ━━ */
  function newProyecto() {
    const nombre = prompt('Nombre del proyecto:');
    if (!nombre) return;
    const p = {
      id: Date.now(),
      emoji: '◈',
      nombre,
      desc: '',
      estado: 'idea',
      prio: 'media',
      inicio: '', deadline: '',
      progreso: 0,
      cat: '',
      tags: [],
      cols: [{id:'c1',name:'Por hacer'},{id:'c2',name:'En proceso'},{id:'c3',name:'Revisión'},{id:'c4',name:'Hecho'}],
      cards: [],
      subs: [],
      notas: '',
      links: [],
      urgente: false,
    };
    _proyectos.push(p);
    save();
    openDetail(p.id);
  }

  /* ━━ HELPERS ━━ */
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function escAttr(s) { return String(s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d+'T12:00:00');
    return isNaN(dt) ? d : dt.getDate() + '/' + (dt.getMonth()+1) + '/' + dt.getFullYear();
  }

  /* ━━ DRAWER (desde hub) ━━ */
  function renderDrawer() {
    const body = document.getElementById('proyDrawerBody');
    if (!body) return;
    const items = lg('hub_proyectos', DEFAULT_PROYECTOS).filter(p=>p.estado!=='terminado').slice(0,6);
    body.innerHTML = items.map(p=>`
      <div class="proy-drawer-card" onclick="window.location.href='studio.html'">
        <div class="proy-drawer-card-top">
          <span class="proy-drawer-card-emoji">${p.emoji||'◈'}</span>
          <span class="proy-drawer-card-name">${escHtml(p.nombre)}</span>
          <span class="proy-card-estado estado-${p.estado||'idea'}" style="font-size:7px">${p.estado||'idea'}</span>
        </div>
        <div class="proy-drawer-card-bar"><div class="proy-drawer-card-fill" style="width:${p.progreso||0}%"></div></div>
      </div>`).join('') +
      `<div style="text-align:center;padding:12px 0">
        <a href="studio.html" style="font-family:var(--mono);font-size:9px;color:var(--studio);letter-spacing:.1em;text-decoration:none">→ abrir Studio completo</a>
      </div>`;
  }

  function refresh() { init(); }

  return {
    init, refresh,
    setFilter, toggleUrgent,
    openDetail, backToGallery,
    addCol, renameCol, delCol,
    showAddCard, cancelCard, selCardPrio, saveCard, delCard,
    onDragStart, onDragEnd, onDragOver, onDrop,
    addSub, openSub,
    addTag, removeTag,
    toggleUrgente, changeEmoji,
    addLink, delLink,
    _autoSaveNote,
    saveCurrentDetail,
    newProyecto,
    renderDrawer,
    toggleCoverForm, saveCover, removeCover,
    showAddLink, hideAddLink, updateLink,
    _autoSave,
  };
})();
