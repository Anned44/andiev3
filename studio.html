/* ══════════════════════════════════════════════════════
   STUDIO-PROYECTOS.JS — Andy.net v4
   Galería: estilo mis-proyectos (cards + filtros)
   Detalle: kanban + notas vivas + archivos + progreso
   Persistencia: localStorage (hub_proyectos compatible)
══════════════════════════════════════════════════════ */

window.StudioProyectos = (function () {

  /* ── STORAGE KEY ── */
  const SK = 'studio_proyectos_v4';

  /* ── COLORES POR CATEGORÍA ── */
  const CAT_COLOR = {
    negocio:  'var(--sp-negocio)',
    app:      'var(--sp-app)',
    creativo: 'var(--sp-creativo)',
    personal: 'var(--sp-personal)',
    externo:  'var(--sp-externo)',
  };
  const STATUS_COLOR = {
    activo:  'var(--sp-activo)',
    listo:   'var(--sp-listo)',
    pausa:   'var(--sp-pausa)',
    idea:    'var(--sp-idea)',
  };

  /* ── DATOS BASE ── */
  const BASE = [
    { id:'agape', nombre:'Ágape', emoji:'🌿', cat:'negocio', catL:'Negocio / $', st:'activo', stL:'Activo',
      desc:'Tienda online de adaptógenos y hongos funcionales para el mercado mexicano. Marca propia, sin dropshipping.',
      tags:['e-commerce','adaptógenos','marca propia','wellness'],
      money:'pot', moneyL:'$ potencial alto', pri:'Alta', progreso:30,
      pend:['Definir modelo: maquiladora vs consignación vs inventario','Cerrar identidad visual (ya tienes 4 propuestas)','Contactar 3 maquiladores en México','Elegir plataforma: Shopify vs Tiendanube','Calcular inversión inicial y punto de equilibrio','Definir catálogo inicial (3-5 productos max)','Resolver relación con Akasha (¿sublínea o marca sep?)'],
      mon:'Venta directa. Margen alto con maquiladora propia. Potencial de suscripción mensual.',
      prompt:`Vamos a trabajar en Ágape, mi tienda online de adaptógenos y hongos funcionales para el mercado mexicano. Es una marca propia, no dropshipping.\n\nEstado actual:\n- Tengo 4 propuestas de landing page listas\n- Identidad visual en exploración\n- Modelo de negocio por definir (esa es la decisión más urgente)\n- Tengo también el concepto Akasha Mushrooms que podría ser sublínea o marca separada\n\nLo que necesito resolver hoy:\n1. Definir modelo de negocio: ¿maquiladora propia, consignación o inventario con proveedor?\n2. Evaluar pros/contras de cada opción para el mercado mexicano\n3. Definir catálogo inicial (qué 3-5 productos lanzar primero)\n\nContexto: estoy en Chihuahua, México. Quiero una marca con identidad fuerte, no genérica. Ayúdame de manera directa y práctica.` },

    { id:'apstudio', nombre:'AP Studio', emoji:'⊛', cat:'negocio', catL:'Negocio / $', st:'activo', stL:'Activo',
      desc:'Estudio de diseño web, desarrollo y WordPress. El camino más corto a generar dinero real.',
      tags:['freelance','diseño web','desarrollo','WordPress','ThemeForest'],
      money:'pot', moneyL:'$ inmediato posible', pri:'Alta', progreso:60,
      pend:['Activar dominio y publicar landing','Definir 3 servicios concretos con precios','Portafolio con proyectos reales','Decidir idioma principal (EN / ES / ambos)','Crear perfil en Workana o LinkedIn','Primer cliente: alguien de tu red'],
      mon:'Servicios freelance (diseño/dev/WP), venta de templates en ThemeForest, optimización de sitios.',
      prompt:`Vamos a trabajar en AP Studio, mi estudio freelance de diseño web y desarrollo.\n\nEstado actual:\n- Tengo 2 landings listas: una en inglés y una en español (LATAM)\n- Aún no tengo dominio activo ni clientes\n- Quiero agregar WordPress como línea de servicios\n- Ya tengo proyectos reales que pueden ser portafolio: Toltia, Andy.net, DyC App\n\nServicios que quiero ofrecer:\n- Diseño y desarrollo web a medida\n- WordPress: temas custom, optimización de sitios lentos\n- Templates digitales\n\nLo que necesito resolver hoy:\n1. Definir 3 servicios concretos con precios reales para el mercado LATAM\n2. Estrategia para conseguir primeros clientes\n3. Decidir si la landing va en inglés, español o ambos\n\nEstoy en Chihuahua, México. Tengo buen nivel de diseño y desarrollo vanilla JS/HTML/CSS.` },

    { id:'wp', nombre:'WordPress · AP', emoji:'⚡', cat:'negocio', catL:'Negocio / $', st:'activo', stL:'Activo',
      desc:'Línea de servicios WordPress dentro de AP Studio: custom dev, optimización de sitios lentos y templates para ThemeForest.',
      tags:['WordPress','ThemeForest','optimización','custom themes'],
      money:'pot', moneyL:'$ inmediato potencial', pri:'Alta', progreso:10,
      pend:['Aprender WordPress básico-intermedio (child themes, hooks, ACF)','Instalar LocalWP y experimentar','Auditar un sitio WP lento — practicar optimización','Definir paquetes de servicio y precios','Agregar línea WP a landing de AP Studio','Investigar qué templates venden en ThemeForest','Crear cuenta ThemeForest y leer guía de envío'],
      mon:'Optimización de sitios (servicio), temas custom a medida, plantillas premium en ThemeForest.',
      prompt:`Vamos a trabajar en la línea de servicios WordPress dentro de AP Studio.\n\nLas 3 líneas de ingreso que quiero desarrollar:\n1. Optimización de sitios WordPress lentos\n2. Diseño y código custom (temas a medida, ACF, hooks)\n3. Plantillas premium para ThemeForest\n\nMi perfil técnico:\n- Buena en HTML, CSS y vanilla JS\n- Experiencia en diseño web y frontend\n- WordPress aún lo estoy aprendiendo\n\nLo que necesito hoy:\n1. Ruta de aprendizaje práctica para ofrecer estos servicios\n2. Por dónde empezar: ¿optimización, custom dev o ThemeForest?\n3. Cómo estructurar y vender el servicio de optimización\n4. Qué nichos venden mejor en ThemeForest ahorita\n\nEstoy en México, mercado LATAM pero también apunto a inglés en ThemeForest.` },

    { id:'meditaciones', nombre:'Meditaciones', emoji:'🌙', cat:'creativo', catL:'Creativo / Diseño', st:'pausa', stL:'En pausa',
      desc:'Meditaciones guiadas con base neurocientífica. Pueden vivir dentro de Toltia o ser producto independiente.',
      tags:['meditación','neurociencia','audio','bienestar'],
      money:'pot', moneyL:'Venta / Patreon', pri:'Media', progreso:35,
      pend:['Decidir: ¿producto independiente o dentro de Toltia?','Definir las 3 primeras meditaciones (tema, duración)','Grabar primer audio (test de voz y calidad)','Elegir plataforma de distribución (Patreon / Gumroad)','Definir modelo: pago por audio vs suscripción','Diseñar identidad visual propia si va como marca'],
      mon:'Venta de audios individuales, suscripción mensual o contenido premium dentro de Toltia.',
      prompt:`Vamos a trabajar en mi proyecto de meditaciones guiadas con base neurocientífica.\n\nEstado actual:\n- Tengo 2 versiones de interfaz/script exploradas\n- Aún no he grabado ningún audio\n- Tengo conocimiento sólido de neurociencia (trabajo también en Toltia)\n- No he definido si va dentro de Toltia o es producto independiente\n\nLo que necesito resolver hoy:\n1. Decidir: ¿producto independiente o módulo premium dentro de Toltia?\n2. Definir las primeras 3 meditaciones: tema, estructura, duración\n3. Plan concreto para grabar el primer audio\n4. Evaluar plataformas: Patreon vs Gumroad vs app propia\n\nMi voz es tranquila y quiero integrar neurociencia real — no quiero que suenen genéricas.` },

    { id:'andynet', nombre:'Andy.net v3', emoji:'◈', cat:'app', catL:'App / Dev', st:'listo', stL:'Avanzado',
      desc:'App personal de productividad — Portal, Hub, Studio, Muse. Vanilla JS + Node.js en Railway.',
      tags:['productividad','vanilla JS','Railway','Firestore','Anet AI'],
      money:'no', moneyL:'Uso personal', pri:'Alta', progreso:65,
      pend:['Estabilizar Muse completo','Mejorar Anet AI assistant','Módulo Hub (finanzas, hábitos)','Performance y mobile','Pulir autenticación Martín'],
      mon:'No genera $ directo. Podría convertirse en template SaaS a futuro.',
      prompt:'' },

    { id:'toltia', nombre:'Toltia', emoji:'🧠', cat:'app', catL:'App / Dev', st:'listo', stL:'Avanzado',
      desc:'Plataforma educativa de reducción de daños en español. 4 pilares: El Cerebro, El Cuerpo, La Experiencia, La Práctica.',
      tags:['harm reduction','neurociencia','farmacología','español'],
      money:'pot', moneyL:'Grants / donaciones', pri:'Alta', progreso:60,
      pend:['Completar combinaciones de sustancias','Protocolo de emergencias unificado','Widget interactivo','Definir modelo de sostenibilidad'],
      mon:'Grants de salud pública o instituciones educativas.',
      prompt:'' },

    { id:'nemi', nombre:'Nemi Studio', emoji:'✦', cat:'negocio', catL:'Negocio / $', st:'pausa', stL:'En pausa',
      desc:'Templates digitales para personas con TDAH y neurodivergencia — agendas, planners, organizadores para vender online.',
      tags:['templates','TDAH','neurodivergencia','productos digitales'],
      money:'pot', moneyL:'$ pasivo potencial', pri:'Media', progreso:15,
      pend:['Diseñar primer template (agenda mensual)','Elegir plataforma (Gumroad / Etsy)','Investigar precio de competencia','Lanzar con 3 productos mínimo'],
      mon:'Productos digitales. Ingreso pasivo una vez creados.',
      prompt:'' },

    { id:'akasha', nombre:'Akasha Mushrooms', emoji:'🍄', cat:'negocio', catL:'Negocio / $', st:'idea', stL:'Idea',
      desc:'Marca de hongos funcionales — ¿sublínea de Ágape o proyecto separado?',
      tags:['hongos','adaptógenos','marca'],
      money:'pot', moneyL:'$ a definir', pri:'Baja', progreso:10,
      pend:['Decidir si va dentro de Ágape o es marca independiente','Evaluar diferenciación de producto'],
      mon:'Pendiente definir. Podría absorberse en Ágape.',
      prompt:'' },

    { id:'devpath', nombre:'Andinet Dev Path', emoji:'📚', cat:'negocio', catL:'Negocio / $', st:'activo', stL:'Activo',
      desc:'Curso Full Stack propio — material de estudio personal y contenido para enseñar a otros.',
      tags:['curso','full stack','educación','JS'],
      money:'pot', moneyL:'$ venta de curso', pri:'Media', progreso:40,
      pend:['Definir audiencia objetivo','Decidir plataforma (Gumroad / Teachable / standalone)','Completar contenido de módulos','Definir precio y modelo'],
      mon:'Venta de curso online. Ingreso pasivo una vez producido.',
      prompt:'' },

    { id:'studiowireframe', nombre:'Studio Wireframe', emoji:'⬡', cat:'creativo', catL:'Creativo / Diseño', st:'activo', stL:'Activo',
      desc:'Herramienta de wireframing interactiva estilo Figma/Linear. Dark/light mode, zoom, dropdowns, canvas.',
      tags:['wireframe','diseño','herramienta','canvas'],
      money:'pot', moneyL:'$ si se publica', pri:'Media', progreso:50,
      pend:['Definir scope final','Decidir: herramienta pública o interna','Integrar con Andy.net Studio o standalone'],
      mon:'Herramienta pública o template vendible.',
      prompt:'' },

    { id:'tarot', nombre:'El Grimorio · Tarot', emoji:'🔮', cat:'app', catL:'App / Dev', st:'listo', stL:'Avanzado',
      desc:'App de tarot con estética renacentista. En proceso de optimización para app pública.',
      tags:['tarot','app pública','renacentista','wellness'],
      money:'pot', moneyL:'$ app pública', pri:'Media', progreso:80,
      pend:['Optimizar para app pública','Definir funcionalidades extra (diario, spreads, luna)','Modelo: freemium o suscripción','PWA o app móvil'],
      mon:'App de tarot con suscripción o compras in-app.',
      prompt:'' },

    { id:'espacio', nombre:'Nuestro Espacio', emoji:'🌹', cat:'app', catL:'App / Dev', st:'activo', stL:'Activo',
      desc:'App de pareja para Anne y Martín — privada ahora, con potencial de app pública para parejas.',
      tags:['Martín','pareja','React','app pública'],
      money:'pot', moneyL:'$ potencial app pública', pri:'Media', progreso:50,
      pend:['Definir funcionalidades core para parejas','Evaluar si se publica o permanece privada','Diseñar onboarding','Modelo: freemium o suscripción'],
      mon:'App de pareja con suscripción. Nicho con demanda real.',
      prompt:'' },

    { id:'brandstudio', nombre:'Brand Studio', emoji:'◉', cat:'creativo', catL:'Creativo / Diseño', st:'activo', stL:'Activo',
      desc:'Herramienta propia para crear identidades de marca. Incluye colorimetría y exploración de identidad creativa.',
      tags:['branding','identidad','colorimetría'],
      money:'pot', moneyL:'$ servicio de branding', pri:'Media', progreso:40,
      pend:['Decidir: herramienta interna o servicio a clientes','Integrar en AP Studio como oferta de branding'],
      mon:'Como servicio de branding dentro de AP Studio.',
      prompt:'' },

    { id:'dyc', nombre:'DyC App', emoji:'⚙', cat:'externo', catL:'Externo / Trabajo', st:'activo', stL:'Activo',
      desc:'App de gestión para empresa de mantenimiento eléctrico de Martín. Cliente principal: Honeywell.',
      tags:['gestión','Martín','mantenimiento eléctrico'],
      money:'si', moneyL:'$ negocio existente', pri:'Media', progreso:50,
      pend:['Investigar nuevo nombre de Honeywell International','Resolver OC cerradas sin facturar','Contactar Jaime Barraza','Agregar funcionalidades a la app'],
      mon:'El negocio ya genera $. La app es herramienta interna.',
      prompt:'' },

    { id:'garden', nombre:"Anne's Garden", emoji:'🌱', cat:'personal', catL:'Personal / Vida', st:'activo', stL:'Activo',
      desc:'Tracker personal de plantas de casa — riego, cuidados, colección.',
      tags:['plantas','tracker','personal'],
      money:'no', moneyL:'Uso personal', pri:'Baja', progreso:60,
      pend:['Recordatorios de riego','Integrar con Andy.net Hub'],
      mon:'No aplica.',
      prompt:'' },

    { id:'mascaras', nombre:'Máscaras', emoji:'🎭', cat:'creativo', catL:'Creativo / Diseño', st:'idea', stL:'Idea',
      desc:'App de escritura creativa con concepto de personajes/máscaras.',
      tags:['escritura','personajes','narrativa'],
      money:'no', moneyL:'Exploración', pri:'Baja', progreso:20,
      pend:['Definir si es proyecto serio o exploración','Escribir el problema que resuelve'],
      mon:'Podría ser herramienta para escritores.',
      prompt:'' },

    { id:'sadrift', nombre:'S.A. Drift', emoji:'🌊', cat:'creativo', catL:'Creativo / Diseño', st:'idea', stL:'Idea',
      desc:'Proyecto creativo de Anne y Sebastián. Naturaleza por definir.',
      tags:['Sebas','colaboración','creativo'],
      money:'no', moneyL:'Proyecto personal', pri:'Baja', progreso:10,
      pend:['Definir qué es exactamente','Conversar con Sebas sobre dirección'],
      mon:'No planeada.',
      prompt:'' },

    { id:'fashion', nombre:'Fashion Design Studio', emoji:'👗', cat:'creativo', catL:'Creativo / Diseño', st:'idea', stL:'Idea',
      desc:'App o herramienta de diseño de moda.',
      tags:['moda','diseño','app creativa'],
      money:'pot', moneyL:'$ a explorar', pri:'Baja', progreso:15,
      pend:['Definir propósito y audiencia','Decidir si avanza o se pausa'],
      mon:'A definir.',
      prompt:'' },

    { id:'notas', nombre:'Notas · Anne', emoji:'📝', cat:'personal', catL:'Personal / Vida', st:'activo', stL:'Activo',
      desc:'App de notas personal standalone.',
      tags:['notas','escritura','personal'],
      money:'no', moneyL:'Uso personal', pri:'Baja', progreso:65,
      pend:['Decidir: fusionar con Andy.net o standalone'],
      mon:'No aplica.',
      prompt:'' },

    { id:'calendario', nombre:'Mi Mes', emoji:'📅', cat:'personal', catL:'Personal / Vida', st:'activo', stL:'Activo',
      desc:'Calendario mensual personal de Anne.',
      tags:['calendario','organización','personal'],
      money:'no', moneyL:'Uso personal', pri:'Media', progreso:70,
      pend:['Integrar con Andy.net Hub'],
      mon:'No aplica.',
      prompt:'' },
  ];

  /* ── COLS KANBAN DEFAULT ── */
  const DEFAULT_COLS = [
    { id:'todo',     label:'Por hacer' },
    { id:'doing',    label:'En proceso' },
    { id:'review',   label:'En revisión' },
    { id:'done',     label:'Hecho' },
  ];

  /* ── STATE ── */
  let _data = [];
  let _filter = 'all';
  let _currentId = null;
  let _dragCard = null;
  let _dragCol = null;

  /* ── LOAD / SAVE ── */
  function _load() {
    try {
      const raw = localStorage.getItem(SK);
      if (raw) {
        const saved = JSON.parse(raw);
        // Merge: base tiene estructura, saved tiene estado persistido
        _data = BASE.map(base => {
          const s = saved.find(x => x.id === base.id) || {};
          return {
            ...base,
            progreso: s.progreso ?? base.progreso,
            tags:     s.tags     ?? base.tags,
            pend:     s.pend     ?? base.pend,
            cols:     s.cols     || DEFAULT_COLS.map(c => ({ ...c })),
            cards:    s.cards    || [],
            notas:    s.notas    ?? '',
            archivos: s.archivos || [],
            urgente:  s.urgente  ?? false,
          };
        });
      } else {
        _data = BASE.map(b => ({
          ...b,
          cols:     DEFAULT_COLS.map(c => ({ ...c })),
          cards:    [],
          notas:    '',
          archivos: [],
          urgente:  false,
        }));
      }
    } catch (e) {
      _data = BASE.map(b => ({ ...b, cols: DEFAULT_COLS.map(c=>({...c})), cards:[], notas:'', archivos:[], urgente:false }));
    }
  }

  function _save() {
    try {
      localStorage.setItem(SK, JSON.stringify(_data.map(p => ({
        id: p.id, progreso: p.progreso, tags: p.tags, pend: p.pend,
        cols: p.cols, cards: p.cards, notas: p.notas, archivos: p.archivos, urgente: p.urgente,
      }))));
      StudioCore.triggerAutosave?.();
    } catch(e) {}
  }

  function _proj(id) { return _data.find(p => p.id === id); }

  /* ════════════════════════════════════
     GALERÍA
  ════════════════════════════════════ */
  function _renderGallery() {
    const gal = document.getElementById('proyGallery');
    const det = document.getElementById('proyDetail');
    if (!gal || !det) return;
    gal.style.display = '';
    det.style.display = 'none';
    _currentId = null;

    const CC = { negocio:'var(--sp-negocio)', app:'var(--sp-app)', creativo:'var(--sp-creativo)', personal:'var(--sp-personal)', externo:'var(--sp-externo)' };
    const SC = { activo:'var(--sp-activo)', listo:'var(--sp-listo)', pausa:'var(--sp-pausa)', idea:'var(--sp-idea)' };
    const MC = { pot:'var(--sp-negocio)', si:'var(--sp-listo)', no:'var(--muted2)' };

    let list = _data;
    if (_filter !== 'all') list = _data.filter(p => p.cat === _filter);

    // Filtros UI
    const filters = [
      { k:'all', l:'Todos' },
      { k:'negocio', l:'Negocio / $' },
      { k:'app', l:'App / Dev' },
      { k:'creativo', l:'Creativo' },
      { k:'personal', l:'Personal' },
      { k:'externo', l:'Externo' },
    ];

    // Stats
    const actN  = _data.filter(p => p.st === 'activo' || p.st === 'listo').length;
    const monN  = _data.filter(p => p.money !== 'no').length;
    const pausN = _data.filter(p => p.st === 'pausa' || p.st === 'idea').length;

    gal.innerHTML = `
      <style>
        :root {
          --sp-negocio: #c4975a;
          --sp-app:     #7ab8a0;
          --sp-creativo:#b07ab8;
          --sp-personal:#b87a7a;
          --sp-externo: #7a9ab8;
          --sp-activo:  #7ab8a0;
          --sp-listo:   #a0c47a;
          --sp-pausa:   #c4975a;
          --sp-idea:    var(--muted2);
        }
        .sp-legend{display:flex;flex-wrap:wrap;gap:6px 20px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--bord)}
        .sp-li{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
        .sp-ld{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .sp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--bord);border:1px solid var(--bord);border-radius:3px;margin-bottom:20px;overflow:hidden}
        .sp-stat{background:var(--s2);padding:14px 16px;text-align:center}
        .sp-sn{font-family:var(--serif);font-size:26px;font-weight:300;line-height:1;margin-bottom:3px}
        .sp-sl{font-family:var(--mono);font-size:8px;color:var(--muted2);letter-spacing:.12em;text-transform:uppercase}
        .sp-filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}
        .sp-fb{background:transparent;border:1px solid var(--bord2);color:var(--muted);font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;cursor:pointer;border-radius:2px;transition:all .15s}
        .sp-fb:hover,.sp-fb.active{border-color:var(--sp-negocio);color:var(--sp-negocio);background:rgba(196,151,90,.06)}
        .sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2px}
        .sp-card{background:var(--s2);border:1px solid var(--bord);padding:20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
        .sp-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--cc,var(--bord2))}
        .sp-card:hover{background:var(--s3);border-color:var(--bord2);transform:translateY(-2px)}
        .sp-ctop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
        .sp-ccat{font-family:var(--mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:var(--cc,var(--muted2))}
        .sp-cst{font-family:var(--mono);font-size:8px;letter-spacing:.07em;text-transform:uppercase;padding:2px 7px;border-radius:2px;background:rgba(255,255,255,.04);border:1px solid var(--sc,var(--bord2));color:var(--sc,var(--muted2));white-space:nowrap}
        .sp-cemoji{font-size:18px;margin-bottom:6px;display:block}
        .sp-cname{font-family:var(--serif);font-style:italic;font-size:16px;font-weight:300;margin-bottom:5px;line-height:1.2}
        .sp-cdesc{font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.6;margin-bottom:12px}
        .sp-ctags{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:12px}
        .sp-tag{font-family:var(--mono);font-size:8px;padding:2px 6px;background:rgba(255,255,255,.03);border:1px solid var(--bord);color:var(--muted2);border-radius:2px}
        .sp-cbot{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--bord)}
        .sp-cmoney{font-family:var(--mono);font-size:9px;color:var(--muted2);display:flex;align-items:center;gap:5px}
        .sp-md{width:5px;height:5px;border-radius:50%}
        .sp-cpri{font-family:var(--mono);font-size:8px;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase}
        .sp-pbar{height:2px;background:var(--bord2);border-radius:2px;margin:8px 0 0;overflow:hidden}
        .sp-pfill{height:100%;border-radius:2px;transition:width .6s ease}
      </style>

      <div class="sp-legend">
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-negocio)"></div>Negocio / $</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-app)"></div>App / Dev</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-creativo)"></div>Creativo</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-personal)"></div>Personal</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-externo)"></div>Externo</div>
        <div class="sp-li" style="margin-left:auto"><div class="sp-ld" style="background:var(--sp-activo)"></div>Activo</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-listo)"></div>Avanzado</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-pausa)"></div>Pausa</div>
        <div class="sp-li"><div class="sp-ld" style="background:var(--sp-idea)"></div>Idea</div>
      </div>

      <div class="sp-stats">
        <div class="sp-stat"><div class="sp-sn">${_data.length}</div><div class="sp-sl">Total</div></div>
        <div class="sp-stat"><div class="sp-sn" style="color:var(--sp-activo)">${actN}</div><div class="sp-sl">Activos</div></div>
        <div class="sp-stat"><div class="sp-sn" style="color:var(--sp-negocio)">${monN}</div><div class="sp-sl">Potencial $</div></div>
        <div class="sp-stat"><div class="sp-sn" style="color:var(--sp-pausa)">${pausN}</div><div class="sp-sl">Pausa / idea</div></div>
      </div>

      <div class="sp-filters">
        ${filters.map(f=>`<button class="sp-fb${_filter===f.k?' active':''}" onclick="StudioProyectos.setFilter(null,'${f.k}')">${f.l}</button>`).join('')}
      </div>

      <div class="sp-grid">
        ${list.map(p => `
          <div class="sp-card" style="--cc:${CC[p.cat]||'var(--bord2)'};--sc:${SC[p.st]||'var(--muted2)'}"
               onclick="StudioProyectos.openDetail('${p.id}')">
            <div class="sp-ctop">
              <span class="sp-ccat">${p.catL}</span>
              <span class="sp-cst">${p.stL}</span>
            </div>
            <span class="sp-cemoji">${p.emoji||'◈'}</span>
            <div class="sp-cname">${p.nombre}</div>
            <div class="sp-cdesc">${p.desc}</div>
            <div class="sp-ctags">${(p.tags||[]).map(t=>`<span class="sp-tag">${t}</span>`).join('')}</div>
            <div class="sp-cbot">
              <span class="sp-cmoney">
                <span class="sp-md" style="background:${MC[p.money]||'var(--muted2)'}"></span>
                ${p.moneyL}
              </span>
              <span class="sp-cpri">↑ ${p.pri}</span>
            </div>
            <div class="sp-pbar"><div class="sp-pfill" style="width:${p.progreso||0}%;background:${CC[p.cat]||'var(--bord2)'}"></div></div>
          </div>`).join('')}
      </div>
    `;
  }

  /* ════════════════════════════════════
     DETALLE
  ════════════════════════════════════ */
  function openDetail(id) {
    const p = _proj(id);
    if (!p) return;
    _currentId = id;

    const gal = document.getElementById('proyGallery');
    const det = document.getElementById('proyDetail');
    if (!gal || !det) return;
    gal.style.display = 'none';
    det.style.display = '';

    const CC = { negocio:'var(--sp-negocio)', app:'var(--sp-app)', creativo:'var(--sp-creativo)', personal:'var(--sp-personal)', externo:'var(--sp-externo)' };
    const accent = CC[p.cat] || 'var(--sp-negocio)';

    det.innerHTML = `
      <style>
        .det-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--bord)}
        .det-back{background:none;border:1px solid var(--bord2);color:var(--muted);font-family:var(--mono);font-size:9px;letter-spacing:.1em;padding:5px 12px;cursor:pointer;border-radius:2px;transition:all .15s;text-transform:uppercase}
        .det-back:hover{color:var(--text);border-color:var(--muted)}
        .det-emoji{font-size:28px;margin-bottom:6px;display:block}
        .det-cat{font-family:var(--mono);font-size:9px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:5px}
        .det-title{font-family:var(--serif);font-style:italic;font-size:clamp(22px,3vw,34px);font-weight:300;letter-spacing:-.01em;line-height:1}
        .det-desc{font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:6px;line-height:1.7;max-width:500px}
        .det-actions{display:flex;gap:8px;flex-wrap:wrap}
        .det-btn{background:transparent;border:1px solid ${accent};color:${accent};font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:7px 14px;cursor:pointer;border-radius:2px;transition:all .15s}
        .det-btn:hover{background:rgba(255,255,255,.04)}
        .det-btn.primary{background:${accent};color:var(--bg);border-color:${accent}}
        .det-btn.primary:hover{opacity:.85}

        .det-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:4px;margin-bottom:4px}
        .det-mbox{background:var(--s2);border:1px solid var(--bord);padding:12px 16px;border-radius:2px;font-family:var(--mono)}
        .det-ml{font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted2);margin-bottom:4px}
        .det-mv{font-size:11px;color:var(--text)}

        .det-prog{background:var(--s2);border:1px solid var(--bord);padding:16px 20px;border-radius:2px;margin-bottom:4px}
        .det-prog-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
        .det-prog-label{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2)}
        .det-prog-pct{font-family:var(--serif);font-size:22px;font-weight:300;color:${accent}}
        .det-prog-range{width:100%;height:4px;-webkit-appearance:none;appearance:none;background:var(--bord2);border-radius:2px;cursor:pointer;outline:none;border:none}
        .det-prog-range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${accent};cursor:pointer;border:2px solid var(--bg)}
        .det-prog-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:${accent};cursor:pointer;border:2px solid var(--bg)}

        .det-grid2{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px}
        .det-section{background:var(--s2);border:1px solid var(--bord);padding:18px 20px;border-radius:2px}
        .det-stitle{font-family:var(--mono);font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted2);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--bord);display:flex;justify-content:space-between;align-items:center}
        .det-stitle button{background:none;border:none;color:var(--muted);cursor:pointer;font-family:var(--mono);font-size:9px;padding:0;transition:color .15s}
        .det-stitle button:hover{color:${accent}}

        .pend-list{list-style:none}
        .pend-item{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--bord);font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.5;cursor:pointer;transition:color .15s}
        .pend-item:last-child{border-bottom:none}
        .pend-item:hover{color:var(--text)}
        .pend-item.done{text-decoration:line-through;color:var(--muted2)}
        .pend-check{width:13px;height:13px;border:1px solid var(--bord2);border-radius:2px;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .pend-item.done .pend-check{background:${accent};border-color:${accent}}
        .pend-item.done .pend-check::after{content:'✓';font-size:7px;color:var(--bg)}

        .kanban{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:4px}
        .k-col{background:var(--s2);border:1px solid var(--bord);border-radius:2px;padding:12px;min-height:140px;transition:background .15s}
        .k-col.drag-over{background:var(--s3);border-color:${accent}}
        .k-col-header{font-family:var(--mono);font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted2);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
        .k-col-n{background:var(--bord2);color:var(--muted);font-size:8px;padding:1px 5px;border-radius:10px;font-family:var(--mono)}
        .k-cards{min-height:60px}
        .k-card{background:var(--s3);border:1px solid var(--bord2);border-radius:2px;padding:8px 10px;margin-bottom:5px;font-family:var(--mono);font-size:10px;color:var(--text);cursor:grab;transition:all .15s;position:relative}
        .k-card:active{cursor:grabbing}
        .k-card:hover{border-color:${accent};transform:translateY(-1px)}
        .k-card.dragging{opacity:.4}
        .k-card-del{position:absolute;top:4px;right:6px;background:none;border:none;color:var(--muted2);cursor:pointer;font-size:10px;opacity:0;transition:opacity .15s}
        .k-card:hover .k-card-del{opacity:1}
        .k-add{background:none;border:1px dashed var(--bord2);color:var(--muted2);font-family:var(--mono);font-size:9px;width:100%;padding:6px;cursor:pointer;border-radius:2px;letter-spacing:.05em;transition:all .15s;margin-top:4px}
        .k-add:hover{border-color:${accent};color:${accent}}

        .nota-area{width:100%;background:var(--s3);border:1px solid var(--bord2);color:var(--text);font-family:var(--mono);font-size:10px;line-height:1.7;padding:12px;border-radius:2px;resize:vertical;min-height:90px;outline:none;transition:border-color .2s}
        .nota-area:focus{border-color:${accent}}
        .nota-area::placeholder{color:var(--muted2)}

        .arch-list{list-style:none;margin-bottom:10px}
        .arch-item{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--bord);font-family:var(--mono);font-size:10px;color:var(--muted)}
        .arch-item:last-child{border-bottom:none}
        .arch-del{background:none;border:none;color:var(--muted2);cursor:pointer;font-size:10px;transition:color .15s}
        .arch-del:hover{color:#e07a7a}
        .arch-add-row{display:flex;gap:6px}
        .arch-input{flex:1;background:var(--s3);border:1px solid var(--bord2);color:var(--text);font-family:var(--mono);font-size:10px;padding:6px 10px;border-radius:2px;outline:none;transition:border-color .2s}
        .arch-input:focus{border-color:${accent}}
        .arch-input::placeholder{color:var(--muted2)}
        .arch-save{background:none;border:1px solid ${accent};color:${accent};font-family:var(--mono);font-size:9px;padding:6px 12px;cursor:pointer;border-radius:2px;transition:all .15s;white-space:nowrap}
        .arch-save:hover{background:rgba(255,255,255,.04)}

        .prompt-block{background:var(--s3);border:1px solid var(--bord);border-radius:2px;padding:14px;font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.8;white-space:pre-wrap;margin-bottom:10px;max-height:200px;overflow-y:auto}
        .no-prompt{font-family:var(--mono);font-size:10px;color:var(--muted2);font-style:italic}

        @media(max-width:900px){
          .kanban{grid-template-columns:1fr 1fr}
          .det-grid2{grid-template-columns:1fr}
          .det-meta{grid-template-columns:1fr 1fr}
        }
        @media(max-width:600px){
          .kanban{grid-template-columns:1fr}
          .det-meta{grid-template-columns:1fr}
        }
      </style>

      <!-- HEADER -->
      <div class="det-header">
        <div>
          <button class="det-back" onclick="StudioProyectos.backToGallery()">← proyectos</button>
          <span class="det-emoji" style="margin-top:14px">${p.emoji||'◈'}</span>
          <div class="det-cat" style="color:${accent}">${p.catL}</div>
          <div class="det-title">${p.nombre}</div>
          <div class="det-desc">${p.desc}</div>
        </div>
        <div class="det-actions">
          ${p.prompt ? `<button class="det-btn" onclick="StudioProyectos._copyPrompt('${p.id}')">⊛ Copiar prompt</button>` : ''}
          <button class="det-btn${p.urgente?' primary':''}" onclick="StudioProyectos._toggleUrgent('${p.id}')">⚡ ${p.urgente?'Urgente':'Marcar urgente'}</button>
        </div>
      </div>

      <!-- META -->
      <div class="det-meta">
        <div class="det-mbox"><div class="det-ml">Estado</div><div class="det-mv">${p.stL}</div></div>
        <div class="det-mbox"><div class="det-ml">Prioridad</div><div class="det-mv">${p.pri}</div></div>
        <div class="det-mbox"><div class="det-ml">Ingreso</div><div class="det-mv">${p.moneyL}</div></div>
        <div class="det-mbox"><div class="det-ml">Monetización</div><div class="det-mv" style="font-size:9px">${p.mon}</div></div>
      </div>

      <!-- PROGRESO -->
      <div class="det-prog">
        <div class="det-prog-top">
          <span class="det-prog-label">Progreso global</span>
          <span class="det-prog-pct" id="det-pct-${p.id}">${p.progreso}%</span>
        </div>
        <input type="range" min="0" max="100" value="${p.progreso}" class="det-prog-range"
          oninput="StudioProyectos._setProgreso('${p.id}',this.value)">
      </div>

      <!-- PENDIENTES + MONETIZACIÓN -->
      <div class="det-grid2">
        <div class="det-section">
          <div class="det-stitle">
            Pendientes clave
            <button onclick="StudioProyectos._addPend('${p.id}')">+ agregar</button>
          </div>
          <ul class="pend-list" id="pend-list-${p.id}">
            ${p.pend.map((t,i)=>`
              <li class="pend-item${p._pendDone&&p._pendDone[i]?' done':''}" onclick="StudioProyectos._togglePend('${p.id}',${i})">
                <span class="pend-check"></span>${t}
              </li>`).join('')}
          </ul>
        </div>
        <div class="det-section">
          <div class="det-stitle">Cómo genera $</div>
          <p style="font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.7">${p.mon}</p>
          ${p.prompt ? `
            <div class="det-stitle" style="margin-top:16px">Prompt de sesión <button onclick="StudioProyectos._copyPrompt('${p.id}')">copiar</button></div>
            <div class="prompt-block">${p.prompt.slice(0,300)}${p.prompt.length>300?'…':''}</div>
          ` : '<div class="no-prompt" style="margin-top:12px">Sin prompt de sesión aún.</div>'}
        </div>
      </div>

      <!-- KANBAN -->
      <div class="det-section" style="margin-bottom:4px">
        <div class="det-stitle">
          Tablero Kanban
          <button onclick="StudioProyectos._addCol('${p.id}')">+ columna</button>
        </div>
        <div class="kanban" id="kanban-${p.id}"></div>
      </div>

      <!-- NOTAS + ARCHIVOS -->
      <div class="det-grid2">
        <div class="det-section">
          <div class="det-stitle">Notas vivas <button onclick="StudioProyectos._saveNota('${p.id}')">guardar</button></div>
          <textarea class="nota-area" id="nota-${p.id}" placeholder="Escribe aquí tus notas, decisiones, ideas..."
            onblur="StudioProyectos._saveNota('${p.id}')">${p.notas||''}</textarea>
        </div>
        <div class="det-section">
          <div class="det-stitle">Archivos & links <button onclick="StudioProyectos._showArchAdd('${p.id}')">+ agregar</button></div>
          <ul class="arch-list" id="arch-list-${p.id}">
            ${(p.archivos||[]).map((a,i)=>`
              <li class="arch-item">
                <a href="${a.url||'#'}" target="_blank" style="color:var(--muted);text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.label||a.url}</a>
                <button class="arch-del" onclick="StudioProyectos._delArch('${p.id}',${i})">×</button>
              </li>`).join('')}
          </ul>
          <div class="arch-add-row" id="arch-add-${p.id}" style="display:none">
            <input class="arch-input" id="arch-url-${p.id}" placeholder="URL o nombre de archivo" />
            <button class="arch-save" onclick="StudioProyectos._addArch('${p.id}')">+ agregar</button>
          </div>
        </div>
      </div>
    `;

    _renderKanban(p.id);
  }

  /* ── KANBAN ── */
  function _renderKanban(id) {
    const p = _proj(id);
    if (!p) return;
    const kb = document.getElementById('kanban-' + id);
    if (!kb) return;

    kb.innerHTML = p.cols.map(col => {
      const cards = (p.cards || []).filter(c => c.colId === col.id);
      return `
        <div class="k-col" id="kcol-${id}-${col.id}"
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="StudioProyectos._dropCard('${id}','${col.id}',event)">
          <div class="k-col-header">
            <span>${col.label}</span>
            <span class="k-col-n">${cards.length}</span>
          </div>
          <div class="k-cards" id="kcards-${id}-${col.id}">
            ${cards.map(c => `
              <div class="k-card" draggable="true"
                ondragstart="StudioProyectos._dragStart('${id}','${c.id}',event)"
                ondragend="this.classList.remove('dragging')">
                ${c.text}
                <button class="k-card-del" onclick="StudioProyectos._delCard('${id}','${c.id}',event)">×</button>
              </div>`).join('')}
          </div>
          <button class="k-add" onclick="StudioProyectos._addCard('${id}','${col.id}')">+ agregar tarea</button>
        </div>`;
    }).join('');
  }

  function _dragStart(projId, cardId, e) {
    _dragCard = cardId;
    _dragCol = projId;
    setTimeout(() => {
      const el = e.target.closest('.k-card');
      if (el) el.classList.add('dragging');
    }, 0);
  }

  function _dropCard(projId, colId, e) {
    e.preventDefault();
    document.querySelectorAll('.k-col').forEach(c => c.classList.remove('drag-over'));
    if (!_dragCard) return;
    const p = _proj(projId);
    if (!p) return;
    const card = p.cards.find(c => c.id === _dragCard);
    if (card) { card.colId = colId; _save(); _renderKanban(projId); }
    _dragCard = null;
  }

  function _addCard(projId, colId) {
    const text = prompt('Nueva tarea:');
    if (!text || !text.trim()) return;
    const p = _proj(projId);
    if (!p) return;
    if (!p.cards) p.cards = [];
    p.cards.push({ id: 'c' + Date.now(), colId, text: text.trim() });
    _save();
    _renderKanban(projId);
  }

  function _delCard(projId, cardId, e) {
    e.stopPropagation();
    const p = _proj(projId);
    if (!p) return;
    p.cards = p.cards.filter(c => c.id !== cardId);
    _save();
    _renderKanban(projId);
  }

  function _addCol(projId) {
    const label = prompt('Nombre de la columna:');
    if (!label || !label.trim()) return;
    const p = _proj(projId);
    if (!p) return;
    p.cols.push({ id: 'col' + Date.now(), label: label.trim() });
    _save();
    _renderKanban(projId);
  }

  /* ── PENDING ── */
  function _togglePend(projId, idx) {
    const p = _proj(projId);
    if (!p) return;
    if (!p._pendDone) p._pendDone = {};
    p._pendDone[idx] = !p._pendDone[idx];
    _save();
    const items = document.querySelectorAll(`#pend-list-${projId} .pend-item`);
    items.forEach((el, i) => el.classList.toggle('done', !!p._pendDone[i]));
  }

  function _addPend(projId) {
    const text = prompt('Nueva tarea pendiente:');
    if (!text || !text.trim()) return;
    const p = _proj(projId);
    if (!p) return;
    p.pend.push(text.trim());
    _save();
    openDetail(projId);
  }

  /* ── PROGRESO ── */
  function _setProgreso(projId, val) {
    const p = _proj(projId);
    if (!p) return;
    p.progreso = parseInt(val);
    const pctEl = document.getElementById('det-pct-' + projId);
    if (pctEl) pctEl.textContent = val + '%';
    _save();
  }

  /* ── NOTAS ── */
  function _saveNota(projId) {
    const p = _proj(projId);
    if (!p) return;
    const el = document.getElementById('nota-' + projId);
    if (el) { p.notas = el.value; _save(); }
  }

  /* ── ARCHIVOS ── */
  function _showArchAdd(projId) {
    const row = document.getElementById('arch-add-' + projId);
    if (row) row.style.display = row.style.display === 'none' ? 'flex' : 'none';
  }

  function _addArch(projId) {
    const input = document.getElementById('arch-url-' + projId);
    if (!input || !input.value.trim()) return;
    const p = _proj(projId);
    if (!p) return;
    if (!p.archivos) p.archivos = [];
    p.archivos.push({ label: input.value.trim(), url: input.value.trim() });
    input.value = '';
    _save();
    _refreshArchList(projId);
  }

  function _delArch(projId, idx) {
    const p = _proj(projId);
    if (!p) return;
    p.archivos.splice(idx, 1);
    _save();
    _refreshArchList(projId);
  }

  function _refreshArchList(projId) {
    const p = _proj(projId);
    if (!p) return;
    const el = document.getElementById('arch-list-' + projId);
    if (!el) return;
    el.innerHTML = (p.archivos || []).map((a, i) => `
      <li class="arch-item">
        <a href="${a.url || '#'}" target="_blank" style="color:var(--muted);text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.label || a.url}</a>
        <button class="arch-del" onclick="StudioProyectos._delArch('${projId}',${i})">×</button>
      </li>`).join('');
  }

  /* ── PROMPT ── */
  function _copyPrompt(projId) {
    const p = _proj(projId);
    if (!p || !p.prompt) return;
    navigator.clipboard.writeText(p.prompt).then(() => {
      StudioCore.showToast?.('Prompt copiado ✓');
    });
  }

  /* ── URGENTE ── */
  function _toggleUrgent(projId) {
    const p = _proj(projId);
    if (!p) return;
    p.urgente = !p.urgente;
    _save();
    openDetail(projId);
  }

  function toggleUrgent(btn) {
    // desde sidebar
  }

  /* ── FILTROS ── */
  function setFilter(btn, f) {
    _filter = f;
    if (btn) {
      document.querySelectorAll('.studio-nav-sub').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    _renderGallery();
  }

  /* ── BACK ── */
  function backToGallery() {
    _currentId = null;
    const gal = document.getElementById('proyGallery');
    const det = document.getElementById('proyDetail');
    if (gal) gal.style.display = '';
    if (det) det.style.display = 'none';
    _renderGallery();
  }

  /* ── NUEVO PROYECTO ── */
  function newProyecto() {
    const nombre = prompt('Nombre del proyecto:');
    if (!nombre || !nombre.trim()) return;
    const id = 'proj_' + Date.now();
    _data.push({
      id, nombre: nombre.trim(), emoji: '◈', cat: 'personal', catL: 'Personal / Vida',
      st: 'idea', stL: 'Idea', desc: '', tags: [], money: 'no', moneyL: 'Sin modelo $',
      pri: 'Media', progreso: 0, pend: [], mon: '', prompt: '',
      cols: DEFAULT_COLS.map(c => ({ ...c })), cards: [], notas: '', archivos: [], urgente: false,
    });
    _save();
    _renderGallery();
    StudioCore.showToast?.('Proyecto creado ✓');
  }

  /* ── FOCO ── */
  function _goFoco() {
    const p = _data.find(x => x.urgente) || _data.find(x => x.st === 'activo' || x.st === 'listo');
    if (p) openDetail(p.id);
  }

  /* ── INIT ── */
  function init() {
    _load();
    _renderGallery();
  }

  return {
    init, setFilter, openDetail, backToGallery, newProyecto,
    toggleUrgent, _goFoco,
    _togglePend, _addPend, _setProgreso, _saveNota,
    _addCard, _delCard, _addCol, _dragStart, _dropCard,
    _showArchAdd, _addArch, _delArch,
    _copyPrompt, _toggleUrgent,
  };

})();
