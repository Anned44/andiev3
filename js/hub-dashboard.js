/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HUB-DASHBOARD.JS — Andy.net v3
   Welcome, clima, widgets, calendario
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

window.HubDashboard = (function () {
  'use strict';

  const _core = () => window.HubCore;
  const lg = (k, f) => _core().lg(k, f);
  const ls = (k, v) => _core().ls(k, v);
  const todayKey = () => _core().todayKey();
  const navTo = (b, p) => _core().navTo(b, p);
  const showToast = (m) => _core().showToast(m);

  const MN = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const DS = ['lu','ma','mi','ju','vi','sá','do'];
  const DF = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

  const QUOTES = [
    { text: 'El único modo de hacer un gran trabajo es amar lo que haces.', author: 'Steve Jobs' },
    { text: 'No cuentes los días. Haz que los días cuenten.', author: 'Muhammad Ali' },
    { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier' },
    { text: 'Cree que puedes y ya estás a mitad del camino.', author: 'Theodore Roosevelt' },
    { text: 'El futuro pertenece a quienes creen en la belleza de sus sueños.', author: 'Eleanor Roosevelt' },
    { text: 'No esperes. El momento nunca será el adecuado.', author: 'Napoleon Hill' },
    { text: 'Tu tiempo es limitado, no lo malgastes viviendo la vida de otro.', author: 'Steve Jobs' },
    { text: 'La creatividad es la inteligencia divirtiéndose.', author: 'Albert Einstein' },
    { text: 'Empieza donde estás. Usa lo que tienes. Haz lo que puedes.', author: 'Arthur Ashe' },
    { text: 'La acción es la clave fundamental para todo éxito.', author: 'Pablo Picasso' },
    { text: 'Sé valiente. Da el primer paso aunque no veas toda la escalera.', author: 'MLK' },
    { text: 'Lo que siembras hoy, lo cosechas mañana.', author: 'Proverbio' },
  ];

  const PRIO_COLOR = { alta:'#c86e8a', media:'#c8965a', baja:'#5a8a6a', '':'#5a4f70' };

  const DEFAULT_PROYECTOS = [
    { id:1001, emoji:'🌿', nombre:'Nemi Studio', estado:'construyendo', progreso:35 },
    { id:1002, emoji:'🍄', nombre:'Botanic Boutique', estado:'construyendo', progreso:20 },
    { id:1003, emoji:'🌾', nombre:'Cultivo p.cubensis', estado:'nuevo', progreso:0 },
  ];

  const DEFAULT_METAS = [
    { id:1, nombre:'Lanzar Nemi Studio', progreso:35, deadline:'2026-06-30', color:'#c8965a', cat:'negocio' },
    { id:2, nombre:'Botanic Boutique MVP', progreso:20, deadline:'2026-07-15', color:'#5a7aaa', cat:'negocio' },
    { id:3, nombre:'Curso Akasha', progreso:60, deadline:'2026-05-01', color:'#9b7ab8', cat:'personal' },
  ];

  let calView = 'mes';
  let calYear, calMonth;
  let _calBase = new Date();

  /* ── Welcome ── */
  function renderWelcome() {
    const now = new Date();
    const h = now.getHours();
    const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
    const greetEl = document.getElementById('hubGreeting');
    const dateEl  = document.getElementById('hubDate');
    const quoteEl = document.getElementById('hubQuote');
    if (greetEl) greetEl.textContent = saludo + ', Andrea';
    if (dateEl)  dateEl.textContent = DF[now.getDay()] + ', ' + now.getDate() + ' de ' + MN[now.getMonth()] + ' de ' + now.getFullYear();
    if (quoteEl) {
      const q = QUOTES[now.getDate() % QUOTES.length];
      quoteEl.textContent = `"${q.text}" — ${q.author}`;
    }
  }

  /* ── Clima ── */
  const CLIMA_EMOJI = {
    0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',
    51:'🌦',53:'🌦',55:'🌧',61:'🌧',63:'🌧',65:'🌧',
    71:'🌨',73:'🌨',75:'❄️',80:'🌦',81:'🌧',82:'⛈',
    95:'⛈',96:'⛈',99:'⛈'
  };
  const CLIMA_DESC = {
    0:'Despejado',1:'Casi despejado',2:'Parcialmente nublado',3:'Nublado',
    45:'Neblina',51:'Llovizna',61:'Lluvia ligera',63:'Lluvia',65:'Lluvia intensa',
    71:'Nieve ligera',75:'Nieve intensa',80:'Chubascos',95:'Tormenta'
  };

  async function fetchClima() {
    try {
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6353&longitude=-106.0889&current_weather=true&temperature_unit=celsius');
      const d = await r.json();
      const cw = d.current_weather;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('climaEmoji', CLIMA_EMOJI[cw.weathercode] || '🌡');
      set('climaTemp',  Math.round(cw.temperature) + '°C');
      set('climaDesc',  CLIMA_DESC[cw.weathercode] || 'Variable');
    } catch {
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('climaEmoji', '🌡');
      set('climaTemp',  '—°');
      set('climaDesc',  'sin conexión');
    }
  }

  /* ── Widget Planner ── */
  function renderDashPlanner() {
    const container = document.getElementById('dashPlannerBlocks');
    if (!container) return;
    const state = lg('appState', {});
    const today = todayKey();
    const day = state.plannerByDate?.[today] || { morning:[], afternoon:[], night:[] };
    const blocks = [
      { key:'morning',   icon:'🌅', label:'Mañana' },
      { key:'afternoon', icon:'🌤', label:'Tarde' },
      { key:'night',     icon:'🌙', label:'Noche' },
    ];
    container.innerHTML = blocks.map(b => {
      const items = day[b.key] || [];
      return `<div class="dash-pln-block">
        <div class="dash-pln-label"><span>${b.icon}</span>${b.label}</div>
        ${!items.length
          ? '<div class="empty-state" style="padding:8px 0">sin tareas</div>'
          : items.slice(0, 3).map((it, i) => {
            const txt  = typeof it === 'string' ? it : it.text;
            const done = typeof it === 'object' && it.done;
            const prio = typeof it === 'object' ? (it.prio || '') : '';
            return `<div class="dash-pln-item">
              <div class="dash-pln-check${done?' done':''}" onclick="HubDashboard.togglePlannerItem('${b.key}',${i})">${done?'✓':''}</div>
              <div class="dash-pln-text${done?' done':''}">${txt}</div>
              <div class="dash-pln-prio" style="background:${PRIO_COLOR[prio]}"></div>
            </div>`;
          }).join('') + (items.length > 3 ? `<div class="empty-state" style="padding:4px 0">+${items.length-3} más</div>` : '')
        }
      </div>`;
    }).join('');
  }

  function togglePlannerItem(block, idx) {
    const state = lg('appState', {});
    const today = todayKey();
    if (!state.plannerByDate) state.plannerByDate = {};
    if (!state.plannerByDate[today]) state.plannerByDate[today] = { morning:[], afternoon:[], night:[] };
    const it = state.plannerByDate[today][block][idx];
    if (it && typeof it === 'object') it.done = !it.done;
    ls('appState', state);
    renderDashPlanner();
    HubCore.triggerAutosave();
  }

  /* ── Widget Inbox ── */
  const IBX_COLORS = {
    captura:     '#9a8aaa',
    idea:        '#c8965a',
    tarea:       '#5a7aaa',
    nota:        '#7a9a7a',
    proyecto:    '#9b7ab8',
    evento:      '#c86e8a',
    recordatorio:'#e07040',
    wishlist:    '#d4a0c8',
  };

  function renderDashInbox() {
    const container = document.getElementById('dashInboxItems');
    if (!container) return;
    const inbox = lg('dash_inbox', []).filter(i => i.status === 'pendiente').slice(0, 4);
    if (!inbox.length) {
      container.innerHTML = '<div class="empty-state">inbox vacío ✓</div>';
      return;
    }
    container.innerHTML = inbox.map(i => {
      const d = new Date(i.time);
      const t = isNaN(d) ? '' : d.getDate() + ' ' + MN[d.getMonth()].slice(0, 3);
      const tipo = i.type || 'captura';
      const color = IBX_COLORS[tipo] || IBX_COLORS.captura;
      return `<div class="dash-inbox-item" onclick="HubCore.navTo(document.querySelector('[title=Inbox]'),'inbox')">
        <span class="dash-inbox-tag" style="background:${color}22;color:${color};border:1px solid ${color}44">${tipo}</span>
        <span class="dash-inbox-text">${i.text}</span>
        <span class="dash-inbox-time">${t}</span>
      </div>`;
    }).join('');
  }

  /* ── Widget Proyectos ── */
  function renderDashProy() {
    const container = document.getElementById('dashProyItems');
    if (!container) return;
    const data = lg('est_proyectos_v3', DEFAULT_PROYECTOS)
      .filter(p => p.estado !== 'terminado')
      .slice(0, 3);
    container.innerHTML = data.map(p => `
      <div class="dash-proy-item">
        <div class="dash-proy-header">
          <div class="dash-proy-name">${p.emoji} ${p.nombre}</div>
          <span class="dash-proy-estado">${p.estado}</span>
        </div>
        <div class="dash-proy-bar">
          <div class="dash-proy-fill" data-w="${p.progreso}"></div>
        </div>
      </div>`).join('');
    setTimeout(() => {
      container.querySelectorAll('.dash-proy-fill').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 80);
  }

  /* ── Widget Metas ── */
  function renderDashMetas() {
    const container = document.getElementById('dashMetasList');
    if (!container) return;
    const metas = lg('hub_metas', DEFAULT_METAS);
    container.innerHTML = metas.slice(0, 3).map(m => {
      const dias = m.deadline
        ? Math.max(0, Math.round((new Date(m.deadline) - new Date()) / 86400000))
        : null;
      return `<div class="dash-meta-item">
        <div class="dash-meta-header">
          <span class="dash-meta-name">${m.nombre}</span>
          <span class="dash-meta-pct">${m.progreso}%</span>
        </div>
        <div class="dash-meta-bar">
          <div class="dash-meta-fill" data-w="${m.progreso}" style="background:${m.color}"></div>
        </div>
        ${dias !== null ? `<div class="dash-meta-days">${dias} días restantes</div>` : ''}
      </div>`;
    }).join('');
    setTimeout(() => {
      container.querySelectorAll('.dash-meta-fill').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 100);
  }

  /* ── Widget Finanzas ── */
  function renderDashFin() {
    const container = document.getElementById('dashFinGrid');
    if (!container) return;
    const movs = lg('hub_finanzas', []);
    const now = new Date();
    const pref = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const mes = movs.filter(m => m.date && m.date.startsWith(pref));
    const gastos  = mes.filter(m => m.tipo === 'gasto').reduce((s, m) => s + Math.abs(m.amt), 0);
    const ingres  = mes.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.amt, 0);
    const fmt = n => '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 });
    container.innerHTML = `
      <div class="dash-fin-stat">
        <span class="dash-fin-val" style="color:var(--pink)">${fmt(gastos)}</span>
        <span class="dash-fin-lbl">gastos</span>
      </div>
      <div class="dash-fin-stat">
        <span class="dash-fin-val" style="color:var(--green)">${fmt(ingres)}</span>
        <span class="dash-fin-lbl">ingresos</span>
      </div>`;
  }

  /* ── Calendario ── */
  function setCalView(view, btn) {
    calView = view;
    document.querySelectorAll('.cal-vbtn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderCal();
  }

  function calNav(dir) {
    if (calView === 'mes') {
      calMonth += dir;
      if (calMonth < 0)  { calMonth = 11; calYear--; }
      if (calMonth > 11) { calMonth = 0;  calYear++; }
    } else {
      const days = calView === '3dias' ? 3 : 7;
      _calBase = new Date(_calBase.getTime() + dir * days * 86400000);
    }
    renderCal();
  }

  function hasPlannerData(key) {
    const s = lg('appState', {});
    const d = s.plannerByDate?.[key];
    return d && ((d.morning?.length || 0) + (d.afternoon?.length || 0) + (d.night?.length || 0)) > 0;
  }

  function openDay(key) {
    ls('hub_plannerDate', key);
    HubCore.navTo(document.querySelector('[title="Planner"]'), 'planner');
  }

  function renderCal() {
    const grid  = document.getElementById('hubCalGrid');
    const title = document.getElementById('hubCalTitle');
    if (!grid || !title) return;

    if (calView === 'mes') {
      title.textContent = MN[calMonth].toUpperCase() + ' ' + calYear;
      const today = new Date();
      const first = new Date(calYear, calMonth, 1);
      const dim   = new Date(calYear, calMonth + 1, 0).getDate();
      let dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;

      let h = '<div class="cal-grid7">' + DS.map(d => `<div class="cal-dow">${d}</div>`).join('');
      for (let i = 0; i < dow; i++) h += '<div class="cal-day empty"></div>';
      for (let d = 1; d <= dim; d++) {
        const key = calYear + '-' + String(calMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        const isT = today.getFullYear()===calYear && today.getMonth()===calMonth && today.getDate()===d;
        const dot = hasPlannerData(key);
        h += `<div class="cal-day${isT?' today':''}${dot?' has-dot':''}" onclick="HubDashboard.openDay('${key}')">${d}</div>`;
      }
      grid.innerHTML = h + '</div>';

    } else {
      const days = calView === '3dias' ? 3 : 7;
      const base = new Date(_calBase);
      if (calView === 'semana') {
        const dow = base.getDay() === 0 ? 6 : base.getDay() - 1;
        base.setDate(base.getDate() - dow);
      }
      const dates = Array.from({ length: days }, (_, i) => {
        const d = new Date(base); d.setDate(base.getDate() + i); return d;
      });
      title.textContent = dates[0].getDate() + ' – ' + dates[days-1].getDate() + ' ' + MN[dates[days-1].getMonth()].toUpperCase();

      const today = new Date();
      let h = `<div class="cal-week-grid" style="grid-template-columns:repeat(${days},1fr)">`;
      dates.forEach(d => {
        const key  = d.toISOString().slice(0, 10);
        const isT  = d.toDateString() === today.toDateString();
        const s    = lg('appState', {});
        const day  = s.plannerByDate?.[key];
        const tasks = [...(day?.morning||[]), ...(day?.afternoon||[]), ...(day?.night||[])];
        h += `<div>
          <div class="cal-week-header${isT?' today':''}">${DS[(d.getDay()+6)%7]} ${d.getDate()}</div>
          ${tasks.slice(0,3).map(t => `<div class="cal-week-task">${typeof t==='string'?t:t.text}</div>`).join('')}
          ${tasks.length > 3 ? `<div class="cal-week-task">+${tasks.length-3}</div>` : ''}
        </div>`;
      });
      grid.innerHTML = h + '</div>';
    }
  }

  /* ── Refresh (llamado desde FAB u otros módulos) ── */
  function refresh() {
    renderDashPlanner();
    renderDashInbox();
    renderDashMetas();
    renderDashFin();
  }

  /* ── Init ── */
  function init() {
    const now = new Date();
    calYear  = now.getFullYear();
    calMonth = now.getMonth();
    _calBase = new Date();

    renderWelcome();
    fetchClima();
    renderDashPlanner();
    renderDashInbox();
    renderDashProy();
    renderDashMetas();
    renderDashFin();
    renderCal();

    // Actualizar hora cada minuto
    setInterval(renderWelcome, 60000);
  }

  /* ── API pública ── */
  return {
    init,
    refresh,
    renderDashPlanner,
    renderDashInbox,
    renderDashMetas,
    renderDashFin,
    togglePlannerItem,
    setCalView,
    calNav,
    openDay,
  };
})();
