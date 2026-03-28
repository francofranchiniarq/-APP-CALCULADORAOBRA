import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RenderIcon } from './Icons';
import IsometricScene from './IsometricScene';

const ROTATING_WORDS = [
  { text: "Presupuestos", color: "#E0024E" },
  { text: "Cómputos", color: "#561820" },
  { text: "Cronogramas", color: "#E0024E" },
  { text: "Materiales", color: "#561820" },
  { text: "Estructuras", color: "#74777F" },
  { text: "Instalaciones", color: "#E0024E" },
  { text: "Planificación", color: "#561820" },
];

// ─── Social Proof ───
const SOCIAL_PROOF_STATS = [
  { num: "1.200+", label: "profesionales registrados" },
  { num: "85.000+", label: "cálculos realizados" },
  { num: "4.8★", label: "satisfacción promedio" },
];

const TRUST_LOGOS = [
  "Constructora Patagonia", "Estudio GAF Arquitectura", "EDASA Instalaciones",
  "Grupo Malbec Desarrollos", "IEC Ingeniería",
];

// ─── Testimonials ───
const TESTIMONIALS = [
  {
    quote: "Antes tardaba 2 horas armando un presupuesto en Excel. Ahora lo hago en 10 minutos y el cliente recibe un PDF profesional. Ya recuperé la suscripción el primer mes.",
    name: "Martín Rosales",
    role: "Instalador eléctrico — Córdoba",
    stat: "12x más rápido",
  },
  {
    quote: "En una obra de 40 departamentos, Metriq me ahorró $890.000 en desperdicio de acero solo con el módulo de despiece. La dosificación de hormigón es exacta.",
    name: "Arq. Carolina Méndez",
    role: "Jefa de obra — Buenos Aires",
    stat: "$890K ahorrados",
  },
  {
    quote: "Mis competidores siguen con planillas. Yo mando el presupuesto completo desde la obra, con el celular, antes de que ellos vuelvan a la oficina.",
    name: "Diego Ferreyra",
    role: "Constructora PyME — Mendoza",
    stat: "3x más licitaciones",
  },
];

const FEATURES = [
  { icon: "computo", title: "Cómputo de materiales", desc: "Calculá cantidades exactas de cada material por rubro. Cemento, hierro, placas, caños — sin desperdicios ni faltantes." },
  { icon: "budget", title: "Presupuestos profesionales", desc: "Armá presupuestos detallados con costo unitario, mano de obra, factores de ajuste y exportación PDF al instante." },
  { icon: "gantt", title: "Cronograma y Gantt", desc: "Planificá la obra con diagramas de Gantt interactivos. Definí etapas, duraciones, dependencias y ruta crítica." },
  { icon: "materials", title: "Cálculo de materiales", desc: "Dosificación de hormigón, despiece de acero, placas de yeso, cañerías — cada rubro con su lógica específica." },
  { icon: "scan", title: "IA lectura de planos", desc: "Subí un PDF o imagen y la IA extrae medidas y cantidades automáticamente." },
  { icon: "comparator", title: "Comparador de costos", desc: "Compará alternativas de materiales y proveedores. Visualizá el impacto en el presupuesto total en tiempo real." },
  { icon: "speed", title: "Cálculo instantáneo", desc: "Resultados precisos en tiempo real mientras ajustás los parámetros desde la obra o la oficina." },
  { icon: "report", title: "Reportes y exportación", desc: "Generá reportes PDF con desglose completo, logo propio y toda la documentación lista para presentar." },
];

const MODULES_PREVIEW = [
  { name: "Cómputo y Presupuesto", icon: "budget", color: "#E0024E", desc: "Presupuesto maestro multi-rubro. Consolidá estructura, instalaciones y terminaciones en un solo PDF con tu logo." },
  { name: "Cronograma de Obra", icon: "gantt", color: "#E0024E", desc: "Diagrama de Gantt interactivo con etapas, dependencias, ruta crítica y seguimiento de avance." },
  { name: "Agua Fría y Caliente", icon: "water", color: "#3B9AE1", desc: "Caños por diámetro, accesorios, llaves de paso y lista para el corralón. Termofusión, epoxi o bronce." },
  { name: "Cloacal y Pluvial", icon: "plumbing", color: "#561820", desc: "UD automáticas, diámetros de troncal y montante, accesorios PVC, bajada pluvial y ventilación." },
  { name: "Gas", icon: "gasflame", color: "#F5A623", desc: "Renouard, NAG 200, cómputo de accesorios, ventilación, conductos de evacuación y prueba de hermeticidad." },
  { name: "Eléctrico", icon: "electric", color: "#74777F", desc: "Cargá las bocas y Metriq calcula metros de cable, caño corrugado, protecciones y la lista para el corralón." },
  { name: "Estructuras", icon: "structure", color: "#561820", desc: "Dosificación de hormigón, encofrado, despiece de acero y logística de colado." },
  { name: "Construcción en Seco", icon: "drywall", color: "#E0024E", desc: "Placas con corte optimizado, perfilería completa (montantes, soleras, rieles) y hasta el último tornillo T1/T2." },
  { name: "Termomecánico", icon: "thermo", color: "#E0024E", desc: "Balance térmico, carga frigorífica, selección y comparador de equipos." },
];

const ROI_POINTS = [
  {
    icon: "target",
    stat: "10%",
    statLabel: "de tu margen",
    title: "Ese 10% de más que pedís \"por las dudas\" no alcanza",
    desc: "Un error del 10% en acero u hormigón se come tu ganancia entera. Metriq calcula la cantidad exacta — ni un kilo de más, ni un faltante que frene la obra.",
    accent: "#E0024E",
  },
  {
    icon: "clock",
    stat: "4hs",
    statLabel: "por semana",
    title: "Esas horas en Excel no te las paga nadie",
    desc: "Son 4 horas semanales promedio que un instalador pierde armando planillas. Con Metriq, el mismo cálculo tarda 30 segundos. Desde el celular, parado en la obra.",
    accent: "#561820",
  },
  {
    icon: "trophy",
    stat: "3x",
    statLabel: "más obras ganadas",
    title: "Mientras armás la planilla, otro ya mandó el presupuesto",
    desc: "El profesional que cotiza primero con desglose profesional se lleva la obra. Metriq te arma el PDF completo en minutos, no en días.",
    accent: "#74777F",
  },
];

const TIERS = [
  {
    name: "Starter",
    price: "Gratis",
    period: "",
    priceSub: "para siempre",
    highlight: false,
    subtitle: "Probá Metriq sin compromiso. Ideal para conocer la plataforma y hacer cálculos rápidos.",
    features: [
      "3 módulos a elección",
      "3 cálculos por día",
      "Cronograma básico (1 obra)",
      "Resultados completos visibles",
      "Sin exportación PDF",
    ],
    cta: "Comenzar gratis",
  },
  {
    name: "Pro",
    price: "$10.900",
    period: "/mes",
    priceSub: "$8.500/mes facturado anual",
    highlight: true,
    badge: "Más elegido",
    subtitle: "Se paga solo con la primera hora de trabajo que te ahorramos. Para instaladores y profesionales.",
    features: [
      "Todos los módulos",
      "Cálculos ilimitados",
      "Cronograma y Gantt completo",
      "Comparador de costos",
      "Exportación PDF sin marca",
      "IA lectura de planos (15/mes)",
      "Historial de proyectos",
      "Soporte por email",
    ],
    cta: "Probar 14 días gratis",
    trial: "Sin tarjeta de crédito",
  },
  {
    name: "Team",
    price: "$34.900",
    period: "/mes",
    priceSub: "$26.500/mes facturado anual",
    highlight: false,
    subtitle: "Para estudios y constructoras. Múltiples usuarios, control total de obra.",
    features: [
      "Todo de Pro",
      "Hasta 5 usuarios",
      "Cronogramas multi-obra",
      "IA lectura ilimitada",
      "Historial ilimitado",
      "Exportación con logo propio",
      "Soporte prioritario WhatsApp",
    ],
    cta: "Probar 14 días gratis",
    trial: "Sin tarjeta de crédito",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Sirve para mi oficio específico?",
    a: "Sí. Metriq tiene módulos generales como Cómputo y Presupuesto, Cronograma de Obra y Cálculo de Materiales que le sirven a cualquier profesional. Además, módulos especializados por rubro: Estructuras, Eléctrico, Sanitario y Gas, Construcción en Seco y Termomecánico. Cada uno habla tu idioma técnico.",
  },
  {
    q: "¿Qué pasa si los precios de materiales cambian por la inflación?",
    a: "El módulo de Presupuestos tiene cotización editable en ARS y USD con un toggle en tiempo real. Podés actualizar los costos unitarios cuando quieras y el presupuesto se recalcula al instante. Además, estamos desarrollando conexión con bases de precios actualizadas del mercado argentino.",
  },
  {
    q: "¿Necesito saber usar AutoCAD para que la IA lea mis planos?",
    a: "Para nada. Solo subís una foto del plano (sacada con el celular incluso) o un PDF, y la inteligencia artificial extrae las medidas y parámetros relevantes. Vos revisás los datos, hacés click en 'Aplicar' y listo. Cero CAD, cero complicaciones.",
  },
  {
    q: "¿Puedo usarlo desde el celular en la obra sin buena conexión?",
    a: "Los cálculos corren 100% en tu navegador, no necesitás conexión para calcular. Solo necesitás internet para la lectura IA de planos y para guardar proyectos en la nube. Funciona en cualquier celular moderno, sin instalar nada.",
  },
  {
    q: "¿Cómo se compara con CYPE, InstaWin o planillas Excel?",
    a: "CYPE e InstaWin son herramientas europeas caras (300-600 USD/año) pensadas para otro mercado. Excel te resuelve, pero perdés horas armando fórmulas. Metriq combina la precisión de un software profesional con la simplicidad de una app moderna, pensada para la realidad de la obra argentina. Y empieza gratis.",
  },
  {
    q: "¿Puedo exportar los resultados para presentarle a un cliente?",
    a: "Con el plan Pro, exportás reportes completos en PDF con tu logo, desglose de materiales, presupuestos detallados y todos los cálculos respaldados. Ideal para licitar o presentar a comitentes.",
  },
];

export default function LandingPage({ onStart }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [openFaq, setOpenFaq] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  return (
    <div className="lp">
      {/* Grid background — covers entire page */}
      <div className="lp-grid-bg" />

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-left">
          <div className="lp-logo-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 21V8l9-5 9 5v13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21v-6h6v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12h10M7 15.5h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span className="lp-logo-text">METR<span>IQ</span></span>
        </div>
        <div className="lp-nav-right">
          <a href="#features" className="lp-nav-link">Funciones</a>
          <a href="#modules" className="lp-nav-link">Módulos</a>
          <a href="#pricing" className="lp-nav-link">Planes</a>
          <button className="lp-nav-cta" onClick={onStart}>Ingresar</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero" ref={heroRef} onMouseMove={handleMouseMove}>
        {/* Spotlight glow that follows cursor */}
        <div
          className="lp-spotlight"
          style={{
            background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(122,31,61,0.18), rgba(217,119,6,0.06) 50%, transparent 100%)`,
          }}
        />

        <div className="lp-hero-split">
          {/* LEFT — Text */}
          <div className="lp-hero-left">
            <motion.div
              className="lp-hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              +1.200 profesionales ya calculan con Metriq
            </motion.div>

            <motion.h1
              className="lp-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Dejá de perder plata calculando{" "}
              <span className="lp-hero-word-wrap">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    className="lp-hero-word"
                    style={{ color: ROTATING_WORDS[wordIndex].color }}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.4 }}
                  >
                    {ROTATING_WORDS[wordIndex].text}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />a ojo.
            </motion.h1>

            <motion.p
              className="lp-hero-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Cada presupuesto mal hecho te cuesta una obra. Metriq calcula materiales,
              arma cronogramas y genera presupuestos profesionales en minutos — no en días.
            </motion.p>

            <motion.div
              className="lp-hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button className="lp-btn-primary" onClick={onStart}>
                Calculá tu primer presupuesto gratis
                <span className="lp-btn-arrow">→</span>
              </button>
            </motion.div>

            <motion.div
              className="lp-hero-micro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <span className="lp-hero-micro-check">✓</span> Sin tarjeta de crédito
              <span className="lp-hero-micro-sep">·</span>
              <span className="lp-hero-micro-check">✓</span> Listo en 30 segundos
              <span className="lp-hero-micro-sep">·</span>
              <span className="lp-hero-micro-check">✓</span> Funciona desde el celular
            </motion.div>
          </div>

          {/* RIGHT — Interactive Isometric Scenes */}
          <motion.div
            className="lp-hero-right"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <IsometricScene />
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="lp-social-bar">
        <div className="lp-social-bar-inner">
          {SOCIAL_PROOF_STATS.map((s, i) => (
            <motion.div
              className="lp-social-stat"
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <span className="lp-social-num">{s.num}</span>
              <span className="lp-social-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="lp-trust-logos">
          <span className="lp-trust-label">Confían en Metriq:</span>
          {TRUST_LOGOS.map((name, i) => (
            <span key={i} className="lp-trust-logo">{name}</span>
          ))}
        </div>
      </section>

      {/* PAIN POINT — before features */}
      <section className="lp-section lp-pain-section">
        <motion.div
          className="lp-pain-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="lp-pain-left">
            <div className="lp-section-label" style={{ textAlign: 'left' }}>El problema</div>
            <h2 className="lp-pain-title">Si seguís calculando con Excel y papel, estás perdiendo obras</h2>
            <ul className="lp-pain-list">
              <li><span className="lp-pain-x">✕</span> Desperdicios del 8-15% en materiales por cómputos imprecisos</li>
              <li><span className="lp-pain-x">✕</span> 4+ horas semanales armando presupuestos en planillas</li>
              <li><span className="lp-pain-x">✕</span> Presupuestos que llegan tarde y perdés la licitación</li>
              <li><span className="lp-pain-x">✕</span> Errores de cálculo que comés de tu margen de ganancia</li>
            </ul>
          </div>
          <div className="lp-pain-right">
            <div className="lp-section-label" style={{ textAlign: 'left', color: '#059669' }}>La solución</div>
            <h2 className="lp-pain-title" style={{ color: '#059669' }}>Con Metriq, cotizás en minutos con precisión de ingeniero</h2>
            <ul className="lp-pain-list">
              <li><span className="lp-pain-check">✓</span> Cómputos exactos: ni un kilo de más, ni un faltante</li>
              <li><span className="lp-pain-check">✓</span> Presupuesto PDF profesional en 10 minutos</li>
              <li><span className="lp-pain-check">✓</span> Cotizás primero, ganás la obra</li>
              <li><span className="lp-pain-check">✓</span> Desde el celular, parado en la obra</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="lp-section" id="features">
        <div className="lp-section-label">Funcionalidades</div>
        <h2 className="lp-section-title">Cada módulo resuelve un problema real de tu obra</h2>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              className="lp-feature-card"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="lp-feature-icon"><RenderIcon name={f.icon} size={28} color="#E0024E" /></div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section className="lp-section" id="modules">
        <div className="lp-section-label">Módulos</div>
        <h2 className="lp-section-title">Todas las herramientas que tu obra necesita</h2>
        <div className="lp-modules-grid">
          {MODULES_PREVIEW.map((m, i) => (
            <motion.div
              className="lp-module-card"
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="lp-module-bar" style={{ background: m.color }} />
              <div className="lp-module-icon" style={{ background: `${m.color}12` }}>
                <RenderIcon name={m.icon} size={22} color={m.color} />
              </div>
              <div className="lp-module-name">{m.name}</div>
              <div className="lp-module-desc">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROI — VENTAJAS Y RENTABILIDAD */}
      <section className="lp-section lp-roi-section" id="roi">
        <div className="lp-section-label">Rentabilidad</div>
        <h2 className="lp-section-title">Cada cálculo mal hecho te cuesta plata</h2>
        <p className="lp-section-subtitle">
          Metriq no es un gasto — es la herramienta que recupera lo que hoy se pierde en errores, sobrantes y tiempo muerto.
        </p>
        <div className="lp-roi-grid">
          {ROI_POINTS.map((r, i) => (
            <motion.div
              className="lp-roi-card"
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="lp-roi-stat-block" style={{ background: `${r.accent}10` }}>
                <span className="lp-roi-stat" style={{ color: r.accent }}>{r.stat}</span>
                <span className="lp-roi-stat-label">{r.statLabel}</span>
              </div>
              <div className="lp-roi-content">
                <div className="lp-roi-icon"><RenderIcon name={r.icon} size={20} color={r.accent} /></div>
                <h3 className="lp-roi-title">{r.title}</h3>
                <p className="lp-roi-desc">{r.desc}</p>
              </div>
              <div className="lp-roi-accent-bar" style={{ background: r.accent }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section">
        <div className="lp-section-label">Testimonios</div>
        <h2 className="lp-section-title">Lo que dicen los que ya calculan con Metriq</h2>
        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              className="lp-testimonial-card"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="lp-testimonial-stat">{t.stat}</div>
              <p className="lp-testimonial-quote">{t.quote}</p>
              <div className="lp-testimonial-author">
                <span className="lp-testimonial-name">{t.name}</span>
                <span className="lp-testimonial-role">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section lp-pricing-section" id="pricing">
        <div className="lp-section-label">Planes</div>
        <h2 className="lp-section-title">Elegí el plan que se ajuste a tu obra</h2>
        <p className="lp-section-subtitle">
          14 días de prueba gratis. Sin tarjeta. Cancelá cuando quieras.<br/>
          <span style={{ fontSize: '12px' }}>¿Equipo de +5 personas? <a href="#contact" style={{ color: '#E0024E', fontWeight: 700, textDecoration: 'none' }}>Contactanos para un plan Enterprise a medida →</a></span>
        </p>
        <div className="lp-pricing-grid">
          {TIERS.map((t, i) => (
            <motion.div
              className={`lp-pricing-card ${t.highlight ? "lp-pricing-highlight" : ""}`}
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              {t.badge && <div className="lp-pricing-badge">{t.badge}</div>}
              <div className="lp-pricing-name">{t.name}</div>
              <div className="lp-pricing-price">
                {t.price}<span className="lp-pricing-period">{t.period}</span>
              </div>
              {t.priceSub && <div className="lp-pricing-annual">{t.priceSub}</div>}
              <p className="lp-pricing-subtitle">{t.subtitle}</p>
              <div className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                {t.features.map((f, j) => (
                  <li key={j}>
                    <span className="lp-check" style={t.highlight ? { color: '#E0024E' } : {}}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`lp-pricing-cta ${t.highlight ? "lp-pricing-cta-accent" : ""}`}
                onClick={onStart}
              >
                {t.cta}
              </button>
              {t.trial && <div className="lp-pricing-trial">{t.trial}</div>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq">
        <div className="lp-section-label">Preguntas frecuentes</div>
        <h2 className="lp-section-title">Todo lo que necesitás saber</h2>
        <div className="lp-faq-list">
          {FAQ_ITEMS.map((faq, i) => (
            <motion.div
              className={`lp-faq-item ${openFaq === i ? "lp-faq-open" : ""}`}
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                className="lp-faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <motion.span
                  className="lp-faq-chevron"
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  ▾
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    className="lp-faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-cta-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="lp-cta-title">Cada día sin Metriq es plata que perdés</h2>
          <p className="lp-cta-sub">
            Mientras leés esto, hay un competidor cotizando más rápido que vos. Empezá gratis en 30 segundos.
          </p>
          <button className="lp-btn-primary lp-btn-lg" onClick={onStart}>
            Calculá tu primer presupuesto gratis <span className="lp-btn-arrow">→</span>
          </button>
          <div className="lp-hero-micro" style={{ justifyContent: 'center', marginTop: '16px' }}>
            <span className="lp-hero-micro-check">✓</span> Sin tarjeta
            <span className="lp-hero-micro-sep">·</span>
            <span className="lp-hero-micro-check">✓</span> 14 días Pro gratis
            <span className="lp-hero-micro-sep">·</span>
            <span className="lp-hero-micro-check">✓</span> Cancelá cuando quieras
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-left">
          <div className="lp-logo-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 21V8l9-5 9 5v13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21v-6h6v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12h10M7 15.5h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span className="lp-logo-text">METR<span>IQ</span></span>
        </div>
        <div className="lp-footer-right">
          <span>© 2026 Metriq. Hecho en Argentina.</span>
        </div>
      </footer>
    </div>
  );
}
