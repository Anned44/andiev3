/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MUSE.JS — mundo creativo Andy.net v3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.Muse = (function () {
  'use strict';

  const lg = (k,f) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):f; } catch{return f;} };
  const ls = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch{} };

  let _fabricCanvas = null;
  let _canvasHistory = [];
  let _bitMood = '🌟';
  let _editEscrituraId = null;
  let _refCat = 'all';
  let _msnry = null;

  /* ━━ INIT ━━ */
  function init() {
    setDate();
    renderStats();
    initDefaultData();
  }

  function setDate() {
    const now = new Date();
    const days = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    const el = document.getElementById('dashDate');
    if (el) el.textContent = days[now.getDay()] + ', ' + now.getDate() + ' DE ' + months[now.getMonth()] + ' DE ' + now.getFullYear();
  }

  function initDefaultData() {
    // Refs
    if (!lg('muse_refs', null)) {
      ls('muse_refs', [
        {id:1,url:'https://picsum.photos/seed/muse1/400/240',title:'Paleta pastel editorial',cat:'Color',domain:'pinterest.com'},
        {id:2,url:'https://picsum.photos/seed/muse2/400/200',title:'Tipografía serif elegante',cat:'Tipografía',domain:'dribbble.com'},
        {id:3,url:'https://picsum.photos/seed/muse3/400/280',title:'Branding Botánica ref',cat:'Branding',domain:'behance.net'},
        {id:4,url:'https://picsum.photos/seed/muse4/400/160',title:'UI minimalista AP Studio',cat:'UI',domain:'dribbble.com'},
        {id:5,url:'https://picsum.photos/seed/muse5/400/220',title:'Fotografía moodboard',cat:'Fotografía',domain:'unsplash.com'},
        {id:6,url:'https://picsum.photos/seed/muse6/400/300',title:'Ilustración orgánica',cat:'Ilustración',domain:'instagram.com'},
        {id:7,url:'https://picsum.photos/seed/muse7/400/180',title:'Color field painting',cat:'Color',domain:'artsy.net'},
        {id:8,url:'https://picsum.photos/seed/muse8/400/260',title:'Layout editorial',cat:'UI',domain:'awwwards.com'},
      ]);
    }
    // Paletas
    if (!lg('muse_paletas', null)) {
      ls('muse_paletas', [
        {id:1,nombre:'Atardecer Chihuahua',colores:['#FF6B6B','#FF8E53','#FFC842','#FFE0A3','#FFF5E4']},
        {id:2,nombre:'Jardín Botánico',    colores:['#2D6A4F','#52B788','#95D5B2','#D8F3DC','#F0FFF4']},
        {id:3,nombre:'Cosmos',             colores:['#7B2FBE','#9D4EDD','#C77DFF','#E0AAFF','#F3E8FF']},
        {id:4,nombre:'Rosa Editorial',     colores:['#FF0A54','#FF477E','#FF85A1','#FBB1BD','#FFE5EC']},
      ]);
    }
    // Bitácora
    if (!lg('muse_bitacora', null)) {
      ls('muse_bitacora', [
        {id:1,titulo:'Exploración tipográfica',texto:'Hoy experimenté con fuentes serif en composiciones para AP Studio.',mood:'🔤',tags:['diseño','tipografía'],date:'2026-04-28T10:00:00.000Z'},
        {id:2,titulo:'Paleta de la temporada',texto:'Los tonos tierra del atardecer me dieron nueva perspectiva para Botánica.',mood:'🌅',tags:['color','inspiración'],date:'2026-04-25T15:30:00.000Z'},
        {id:3,titulo:'Concepto Toltia visual',texto:'Pensando en la identidad visual del ecosistema. Morado profundo como ancla.',mood:'✦',tags:['proyecto','branding'],date:'2026-04-20T09:00:00.000Z'},
      ]);
    }
    // Escritura
    if (!lg('muse_escritura', null)) {
      ls('muse_escritura', [
        {id:1,tipo:'poema',titulo:'Raíces de luz',body:'El silencio tiene forma\ncuando lo escuchas con los ojos cerrados.',date:'2026-04-22T10:00:00.000Z'},
        {id:2,tipo:'fragmento',titulo:'Ciudad interior',body:'Hay calles en la mente que solo transitamos de noche.',date:'2026-04-18T10:00:00.000Z'},
        {id:3,tipo:'idea',titulo:'Proyecto narrativo Toltia',body:'Una historia sobre el despertar de la consciencia colectiva.',date:'2026-04-10T10:00:00.000Z'},
      ]);
    }
  }

  /* ━━ NAV ━━ */
  function navTo(idx, btn) {
    document.querySelectorAll('.muse-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + idx)?.classList.add('active');
    document.querySelectorAll('.muse-sb-icon').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else document.querySelector('[data-panel="' + idx + '"]')?.classList.add('active');

    // Render on first visit
    const renders = {
      1: renderRefs,
      2: renderPaletas,
      3: renderBitacora,
      6: renderEscritura,
    };
    if (renders[idx]) renders[idx]();
    if (idx === 7) initCanvas();
    if (idx === 1) setTimeout(initMasonry, 100);
  }

  /* ━━ THEME ━━ */
  function toggleTheme() {
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = btn.textContent.includes('día') ? '● noche' : '○ día';
  }

  /* ━━ TOAST ━━ */
  let _tt;
  function toast(msg) {
    const el = document.getElementById('museToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_tt);
    _tt = setTimeout(() => el.classList.remove('show'), 2500);
  }

  /* ━━ STATS ━━ */
  function renderStats() {
    const refs    = lg('muse_refs', []);
    const paletas = lg('muse_paletas', []);
    const bit     = lg('muse_bitacora', []);
    const mood    = lg('muse_mood', 'Flow');
    const s = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
    s('statRefs', refs.length || 12);
    s('statPaletas', paletas.length || 4);
    s('statBit', bit.length || 3);
    s('statMood', mood);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 1 — REFERENCIAS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function renderRefs() {
    const refs = lg('muse_refs', []);
    const filtered = _refCat === 'all' ? refs : refs.filter(r => r.cat === _refCat);
    const grid = document.getElementById('refGrid');
    if (!grid) return;

    const items = filtered.map(r => `
      <div class="muse-masonry-item">
        <div class="muse-card muse-ref-card">
          <img src="${r.url}" alt="${r.title}" loading="lazy" onerror="this.style.display='none'">
          <div class="muse-ref-card-body">
            <div class="muse-ref-card-title">${esc(r.title)}</div>
            <div class="muse-ref-card-meta">
              <span class="muse-ref-card-domain">${esc(r.domain||'')}</span>
              <span class="muse-ref-card-cat">${esc(r.cat||'')}</span>
            </div>
          </div>
          <button class="muse-ref-del" onclick="event.stopPropagation();Muse.delRef(${r.id})">×</button>
        </div>
      </div>`).join('');

    grid.innerHTML = items + `
      <div class="muse-masonry-item">
        <div class="muse-ref-add-card" onclick="document.getElementById('refUrlInput').focus()">
          <div style="font-size:24px;margin-bottom:8px;opacity:0.4;">+</div>
          <div>agregar referencia</div>
        </div>
      </div>
      <div style="clear:both"></div>`;

    setTimeout(initMasonry, 50);
  }

  function initMasonry() {
    const grid = document.getElementById('refGrid');
    if (!grid || typeof Masonry === 'undefined') return;
    if (_msnry) _msnry.destroy();
    _msnry = new Masonry(grid, { itemSelector:'.muse-masonry-item', columnWidth:'.muse-masonry-item', percentPosition:true, gutter:12 });
  }

  function filterRefs(btn, cat) {
    document.querySelectorAll('.muse-chip[data-cat]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _refCat = cat;
    renderRefs();
  }

  function addRefByUrl() {
    const url = document.getElementById('refUrlInput')?.value.trim();
    if (!url) return;
    let domain = '';
    try { domain = new URL(url).hostname.replace('www.',''); } catch {}
    const refs = lg('muse_refs', []);
    refs.unshift({ id:Date.now(), url, title:domain||'Referencia', cat:'general', domain });
    ls('muse_refs', refs);
    document.getElementById('refUrlInput').value = '';
    renderRefs(); renderStats();
    toast('✓ Referencia agregada');
  }

  async function handleRefFile(e) {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = '';

    // Try Cloudinary first, fallback to local
    let url = await uploadToCloudinary(file, 'referencias');
    if (!url) url = await readFileLocal(file);

    const refs = lg('muse_refs', []);
    refs.unshift({
      id: Date.now(),
      url,
      title: file.name.split('.')[0],
      cat: 'general',
      domain: url.startsWith('https://res.cloudinary') ? 'cloudinary' : 'local',
      source: url.startsWith('https://res.cloudinary') ? 'cloudinary' : 'local',
    });
    ls('muse_refs', refs);
    renderRefs(); renderStats();
    toast('✓ Imagen agregada');
  }

  function delRef(id) {
    ls('muse_refs', lg('muse_refs',[]).filter(r => r.id !== id));
    renderRefs(); renderStats();
    toast('Referencia eliminada');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 2 — PALETAS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function renderPaletas() {
    const paletas = lg('muse_paletas', []);
    const grid = document.getElementById('paletasGrid');
    if (!grid) return;
    grid.innerHTML = paletas.map(p => `
      <div class="muse-card muse-paleta-card">
        <div class="muse-paleta-circles">
          ${p.colores.map(c => `<div class="muse-color-circle" style="background:${c}" title="${c}" onclick="Muse.copyHex('${c}')"></div>`).join('')}
        </div>
        <div class="muse-paleta-body">
          <div class="muse-paleta-nombre">${esc(p.nombre)}</div>
          <div class="muse-paleta-hexes">
            ${p.colores.map(c => `<span class="muse-hex-chip" onclick="Muse.copyHex('${c}')">${c}</span>`).join('')}
          </div>
          <div class="muse-harmonia-chips">
            <button class="muse-harmonia-chip" onclick="Muse.generarArmonia(${p.id},'complementario')">complementario</button>
            <button class="muse-harmonia-chip" onclick="Muse.generarArmonia(${p.id},'analogo')">análogo</button>
            <button class="muse-harmonia-chip" onclick="Muse.generarArmonia(${p.id},'triadico')">triádico</button>
            <button class="muse-harmonia-chip" onclick="Muse.generarArmonia(${p.id},'monocromatico')">monocromático</button>
          </div>
          <div class="muse-paleta-actions">
            <button onclick="Muse.exportPaleta(${p.id})" style="flex:1;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.7);border-radius:8px;padding:6px;font-size:10px;color:var(--muse-muted);cursor:pointer;font-family:'DM Mono',monospace;">Exportar</button>
            <button onclick="Muse.delPaleta(${p.id})" style="background:rgba(219,39,119,0.08);border:1px solid rgba(219,39,119,0.2);border-radius:8px;padding:6px 10px;font-size:10px;color:#be185d;cursor:pointer;font-family:'DM Mono',monospace;">×</button>
          </div>
        </div>
      </div>`).join('');
  }

  function copyHex(hex) {
    navigator.clipboard?.writeText(hex);
    toast('✓ ' + hex + ' copiado');
  }

  function exportPaleta(id) {
    const p = lg('muse_paletas',[]).find(x => x.id===id);
    if (!p) return;
    navigator.clipboard?.writeText(p.nombre + '\n' + p.colores.join('\n'));
    toast('✓ Colores copiados');
  }

  function delPaleta(id) {
    ls('muse_paletas', lg('muse_paletas',[]).filter(p => p.id!==id));
    renderPaletas(); renderStats();
    toast('Paleta eliminada');
  }

  function savePaleta() {
    const nombre = document.getElementById('paletaNombre')?.value.trim();
    if (!nombre) { toast('Ponle nombre a la paleta'); return; }
    const inputs = document.querySelectorAll('#colorInputs input[type=color]');
    const colores = [...inputs].map(i => i.value);
    const paletas = lg('muse_paletas', []);
    paletas.unshift({ id:Date.now(), nombre, colores });
    ls('muse_paletas', paletas);
    document.getElementById('paletaNombre').value = '';
    renderPaletas(); renderStats();
    toast('✓ Paleta guardada');
  }

  /* Armonías de color */
  function hexToHsl(hex) {
    let r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{
      const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
      h/=6;
    }
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  }

  function hslToHex(h,s,l) {
    s/=100;l/=100;
    const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return '#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
  }

  function generarArmonia(id, tipo) {
    const paletas = lg('muse_paletas', []);
    const p = paletas.find(x => x.id===id);
    if (!p || !p.colores.length) return;
    const base = p.colores[0];
    const [h,s,l] = hexToHsl(base);
    let nuevos = [];
    switch(tipo) {
      case 'complementario':
        nuevos = [base, hslToHex((h+180)%360,s,l), hslToHex((h+180)%360,s,Math.min(l+15,90)), hslToHex(h,s,Math.min(l+20,90)), hslToHex((h+180)%360,Math.max(s-20,20),l)];
        break;
      case 'analogo':
        nuevos = [hslToHex((h-30+360)%360,s,l), hslToHex((h-15+360)%360,s,l), base, hslToHex((h+15)%360,s,l), hslToHex((h+30)%360,s,l)];
        break;
      case 'triadico':
        nuevos = [base, hslToHex((h+120)%360,s,l), hslToHex((h+240)%360,s,l), hslToHex((h+120)%360,s,Math.min(l+20,90)), hslToHex((h+240)%360,s,Math.min(l+20,90))];
        break;
      case 'monocromatico':
        nuevos = [hslToHex(h,s,Math.max(l-30,10)), hslToHex(h,s,Math.max(l-15,10)), base, hslToHex(h,s,Math.min(l+15,90)), hslToHex(h,s,Math.min(l+30,90))];
        break;
    }
    const nombre = p.nombre + ' · ' + tipo;
    paletas.unshift({ id:Date.now(), nombre, colores:nuevos });
    ls('muse_paletas', paletas);
    renderPaletas();
    toast('✓ Armonía "' + tipo + '" generada');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 3 — BITÁCORA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  let _bitImgData = '';

  async function handleBitImg(e) {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = '';

    // Try Cloudinary first, fallback to local
    let url = await uploadToCloudinary(file, 'bitacora');
    if (!url) url = await readFileLocal(file);

    _bitImgData = url;
    const zone = document.getElementById('bitImgZone');
    if (zone) zone.innerHTML = `<img src="${url}" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px">`;
    toast('✓ Imagen lista');
  }

  function selBitMood(btn, mood) {
    _bitMood = mood;
    document.querySelectorAll('.muse-mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function saveBitEntry() {
    const titulo = document.getElementById('bitTitulo')?.value.trim();
    const texto  = document.getElementById('bitTexto')?.value.trim();
    if (!texto) { toast('Escribe algo primero'); return; }
    const tags = document.getElementById('bitTags')?.value.split(',').map(t=>t.trim()).filter(Boolean);
    const entries = lg('muse_bitacora', []);
    entries.unshift({ id:Date.now(), titulo:titulo||'Sin título', texto, img:_bitImgData, mood:_bitMood, tags, date:new Date().toISOString() });
    ls('muse_bitacora', entries);
    document.getElementById('bitTitulo').value = '';
    document.getElementById('bitTexto').value = '';
    document.getElementById('bitTags').value = '';
    document.getElementById('bitImgZone').innerHTML = '🌿 Subir imagen (opcional)';
    _bitImgData = '';
    renderBitacora(); renderStats();
    toast('✓ Entrada guardada');
  }

  function renderBitacora() {
    const entries = lg('muse_bitacora', []);
    const list = document.getElementById('bitacoraList');
    if (!list) return;
    if (!entries.length) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muse-muted);font-family:\'DM Mono\',monospace;font-size:11px;">sin entradas aún</div>';
      return;
    }
    list.innerHTML = entries.map(e => {
      const d = new Date(e.date);
      const ds = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
      return `<div class="muse-card muse-bit-entry-card">
        ${e.img ? `<img class="muse-bit-img" src="${e.img}" alt="">` : ''}
        <div class="muse-bit-header">
          <span class="muse-bit-mood">${e.mood||'✦'}</span>
          <span class="muse-bit-titulo">${esc(e.titulo)}</span>
          <span class="muse-bit-date">${ds}</span>
        </div>
        <p class="muse-bit-texto">${esc(e.texto)}</p>
        ${e.tags?.length ? `<div class="muse-bit-tags">${e.tags.map(t=>`<span class="muse-bit-tag">${esc(t)}</span>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 4 — GENERADOR IA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function selStyle(btn) {
    btn.closest('.muse-style-chips')?.querySelectorAll('.muse-style-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function selRatio(btn) {
    btn.parentElement?.querySelectorAll('.muse-style-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  async function generateIA() {
    const prompt = document.getElementById('genPrompt')?.value.trim();
    if (!prompt) { toast('Describe lo que quieres crear'); return; }
    const result = document.getElementById('genResult');
    if (result) result.innerHTML = `<div style="font-size:32px;color:rgba(147,51,234,0.4);animation:museGlyphSpin 2s linear infinite;">✦</div><p style="font-size:13px;color:var(--muse-muted);margin-top:12px;">Anet está creando algo...</p>`;
    toast('Generando con Anet...');
    setTimeout(() => {
      if (result) result.innerHTML = `
        <div style="background:linear-gradient(135deg,#f5eeff,#fce4f0);border-radius:12px;width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:4rem;margin-bottom:16px;">🌸</div>
        <p style="font-size:12px;color:var(--muse-muted);margin-bottom:12px;">Imagen generada · próximamente con API de imágenes</p>
        <button onclick="Muse.saveGenToMoodboard()" class="muse-btn-primary">Guardar en Moodboard</button>`;
      toast('✓ Lista');
    }, 1800);
  }

  function saveGenToMoodboard() {
    toast('✓ Guardada en Moodboard');
    navTo(1, null);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 5 — MÚSICA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function selMood(el) {
    document.querySelectorAll('.muse-mood-opt').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    const mood = el.dataset.mood;
    const statMood = document.getElementById('statMood');
    if (statMood) statMood.textContent = mood;
    ls('muse_mood', mood);
    toast('Mood: ' + mood);
    renderStats();
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 6 — ESCRITURA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function renderEscritura() {
    const items = lg('muse_escritura', []);
    const list  = document.getElementById('escrituraList');
    if (!list) return;
    list.innerHTML = items.map(i => {
      const d = new Date(i.date);
      const ds = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
      return `<div class="muse-card muse-escritura-card" onclick="Muse.loadEscritura(${i.id})">
        <span class="muse-tipo-tag tipo-${i.tipo}">${i.tipo}</span>
        <div class="muse-escritura-titulo-card">${esc(i.titulo||'Sin título')}</div>
        <div class="muse-escritura-preview">${esc(i.body)}</div>
        <div class="muse-bit-date" style="margin-top:6px;">${ds}</div>
      </div>`;
    }).join('');
  }

  function loadEscritura(id) {
    const item = lg('muse_escritura',[]).find(i => i.id===id);
    if (!item) return;
    _editEscrituraId = id;
    const f = (el,v) => { const e=document.getElementById(el); if(e) e.value=v; };
    f('escrituraTitulo', item.titulo||'');
    f('escrituraBody', item.body||'');
    f('escrituraTipo', item.tipo||'poema');
    updateWordCount(document.getElementById('escrituraBody'));
  }

  function nuevaEscritura() {
    _editEscrituraId = null;
    ['escrituraTitulo','escrituraBody'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
    document.getElementById('escrituraTipo').value = 'poema';
    document.getElementById('wordCount').textContent = '0 palabras';
    document.getElementById('escrituraTitulo')?.focus();
  }

  function saveEscritura() {
    const titulo = document.getElementById('escrituraTitulo')?.value.trim();
    const body   = document.getElementById('escrituraBody')?.value.trim();
    const tipo   = document.getElementById('escrituraTipo')?.value;
    if (!body) { toast('Escribe algo primero'); return; }
    const items = lg('muse_escritura', []);
    if (_editEscrituraId) {
      const idx = items.findIndex(i => i.id===_editEscrituraId);
      if (idx >= 0) items[idx] = { ...items[idx], titulo, body, tipo };
    } else {
      items.unshift({ id:Date.now(), titulo, body, tipo, date:new Date().toISOString() });
    }
    ls('muse_escritura', items);
    renderEscritura();
    toast('✓ Guardado');
  }

  function updateWordCount(el) {
    if (!el) return;
    const words = el.value.trim().split(/\s+/).filter(Boolean).length;
    const wc = document.getElementById('wordCount');
    if (wc) wc.textContent = words + ' palabras';
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PANEL 7 — LIENZO (Fabric.js)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initCanvas() {
    if (_fabricCanvas) return;
    const el = document.getElementById('museCanvas');
    if (!el || typeof fabric === 'undefined') return;
    const wrap = el.parentElement;
    el.width  = wrap ? wrap.offsetWidth : 800;
    el.height = Math.max(500, window.innerHeight - 220);
    _fabricCanvas = new fabric.Canvas('museCanvas', { isDrawingMode:true, backgroundColor:'#ffffff' });
    _fabricCanvas.freeDrawingBrush.color = '#9333ea';
    _fabricCanvas.freeDrawingBrush.width = 3;
    _fabricCanvas.on('object:added', () => {
      if (_canvasHistory.length > 50) _canvasHistory.shift();
      _canvasHistory.push(JSON.stringify(_fabricCanvas));
    });
  }

  function setTool(tool) {
    if (!_fabricCanvas) return;
    document.querySelectorAll('.muse-canvas-tool').forEach(b => b.classList.remove('active'));
    document.getElementById('tool-' + tool)?.classList.add('active');
    _fabricCanvas.isDrawingMode = false;

    if (tool === 'pencil') {
      _fabricCanvas.isDrawingMode = true;
    } else if (tool === 'rect') {
      const s = new fabric.Rect({ left:80, top:80, width:120, height:80, fill:'transparent', stroke:document.getElementById('canvasColor')?.value||'#9333ea', strokeWidth:3 });
      _fabricCanvas.add(s); _fabricCanvas.setActiveObject(s);
    } else if (tool === 'circle') {
      const s = new fabric.Circle({ left:80, top:80, radius:50, fill:'transparent', stroke:document.getElementById('canvasColor')?.value||'#9333ea', strokeWidth:3 });
      _fabricCanvas.add(s); _fabricCanvas.setActiveObject(s);
    } else if (tool === 'line') {
      const s = new fabric.Line([50,50,200,50], { stroke:document.getElementById('canvasColor')?.value||'#9333ea', strokeWidth:3 });
      _fabricCanvas.add(s); _fabricCanvas.setActiveObject(s);
    } else if (tool === 'text') {
      const t = new fabric.IText('Escribe aquí', { left:100, top:100, fontSize:20, fill:document.getElementById('canvasColor')?.value||'#9333ea', fontFamily:'Cormorant Garamond' });
      _fabricCanvas.add(t); _fabricCanvas.setActiveObject(t); t.enterEditing();
    }
  }

  function setCanvasColor(c) {
    if (!_fabricCanvas) return;
    _fabricCanvas.freeDrawingBrush.color = c;
    const active = _fabricCanvas.getActiveObject();
    if (active) { active.set('stroke', c); active.set('fill', c); _fabricCanvas.renderAll(); }
  }

  function setBrushSize(v) {
    if (_fabricCanvas) _fabricCanvas.freeDrawingBrush.width = parseInt(v);
  }

  function setBrushOpacity(v) {
    if (!_fabricCanvas) return;
    const c = document.getElementById('canvasColor')?.value || '#9333ea';
    const col = new fabric.Color(c); col.setAlpha(parseInt(v)/100);
    _fabricCanvas.freeDrawingBrush.color = col.toRgba();
  }

  function addImgToCanvas(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      fabric.Image.fromURL(ev.target.result, img => {
        img.scaleToWidth(200);
        _fabricCanvas?.add(img);
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function canvasUndo() {
    if (!_fabricCanvas || _canvasHistory.length < 2) return;
    _canvasHistory.pop();
    const prev = _canvasHistory[_canvasHistory.length - 1];
    if (prev) _fabricCanvas.loadFromJSON(JSON.parse(prev), () => _fabricCanvas.renderAll());
  }

  function canvasClear() {
    if (!_fabricCanvas) return;
    _canvasHistory.push(JSON.stringify(_fabricCanvas));
    _fabricCanvas.clear();
    _fabricCanvas.setBackgroundColor('#ffffff', () => _fabricCanvas.renderAll());
  }

  function exportPNG() {
    if (!_fabricCanvas) { toast('Abre el lienzo primero'); return; }
    const link = document.createElement('a');
    link.download = 'muse-lienzo-' + Date.now() + '.png';
    link.href = _fabricCanvas.toDataURL({ format:'png', multiplier:2 });
    link.click();
    toast('✓ PNG exportado');
  }

  function exportSVG() {
    if (!_fabricCanvas) { toast('Abre el lienzo primero'); return; }
    const svg = _fabricCanvas.toSVG();
    const blob = new Blob([svg], { type:'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'muse-lienzo-' + Date.now() + '.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    toast('✓ SVG exportado');
  }


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CLOUDINARY UPLOAD
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  async function uploadToCloudinary(file, folder) {
    try {
      toast('Subiendo imagen...');
      const signRes = await fetch('/api/media/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'andynet/' + folder }),
      });
      const sign = await signRes.json();
      if (sign.error) { toast('Error: ' + sign.error); return null; }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', sign.signature);
      formData.append('timestamp', sign.timestamp);
      formData.append('api_key', sign.api_key);
      formData.append('folder', sign.folder);
      if (sign.tags) formData.append('tags', sign.tags);

      const uploadRes = await fetch(sign.upload_url, { method:'POST', body:formData });
      const data = await uploadRes.json();

      if (data.secure_url) {
        toast('✓ Imagen subida a Cloudinary');
        return data.secure_url;
      }
      toast('Error al subir imagen');
      return null;
    } catch(e) {
      // Fallback a FileReader local si no hay Cloudinary configurado
      return null;
    }
  }

  async function readFileLocal(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.readAsDataURL(file);
    });
  }

  /* ━━ HELPERS ━━ */
  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return {
    init, navTo, toggleTheme,
    filterRefs, addRefByUrl, handleRefFile, delRef, uploadToCloudinary,
    savePaleta, copyHex, exportPaleta, delPaleta, generarArmonia,
    handleBitImg, selBitMood, saveBitEntry,
    selStyle, selRatio, generateIA, saveGenToMoodboard,
    selMood,
    loadEscritura, nuevaEscritura, saveEscritura, updateWordCount,
    setTool, setCanvasColor, setBrushSize, setBrushOpacity,
    addImgToCanvas, canvasUndo, canvasClear, exportPNG, exportSVG,
  };
})();

window.addEventListener('load', () => Muse.init());
