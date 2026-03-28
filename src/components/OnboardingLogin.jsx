import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RenderIcon } from './Icons';
import { signUp, signIn, signInWithGoogle as sbSignInWithGoogle, saveLead } from '../services/authService.js';
import { OFFLINE_MODE } from '../lib/supabase.js';

/* ═══════════════════════════════════════════════════════════════
   ONBOARDING DATA — Rubros, problemas y opciones por perfil
   ═══════════════════════════════════════════════════════════════ */

const ROLES = [
  {
    id: "instalador", icon: "wrench", color: "#CF3055",
    title: "Instalador / Oficios",
    desc: "Gas, sanitaria, eléctrica, durlock, pintura u otros oficios.",
    label: "Instalador",
  },
  {
    id: "profesional", icon: "compass", color: "#561820",
    title: "Profesional / Estudio",
    desc: "Arquitecto, Ingeniero o Director de Obra. Gestiono proyectos.",
    label: "Profesional",
  },
  {
    id: "empresa", icon: "building", color: "#74777F",
    title: "Empresa Constructora",
    desc: "Equipo de obra, múltiples frentes, coordinación.",
    label: "Empresa",
  },
];

const RUBROS_BY_ROLE = {
  instalador: [
    { id: "seco", icon: "drywall", title: "Durlock / Steel Framing", desc: "Placas, perfilería, tornillería, aislación", color: "#CF3055" },
    { id: "sanitario", icon: "plumbing", title: "Sanitario y Gas", desc: "Cañerías, artefactos, ventilación NAG 200", color: "#561820" },
    { id: "electrico", icon: "electric", title: "Eléctrico", desc: "Conductores, protecciones, luminotecnia", color: "#74777F" },
    { id: "termomecanico", icon: "thermo", title: "Termomecánico / Climatización", desc: "Radiadores, splits, losa radiante, calderas", color: "#CF3055" },
    { id: "pintura", icon: "target", title: "Pintura y Terminaciones", desc: "Rendimiento de pintura, revestimientos, pisos", color: "#74777F" },
  ],
  profesional: [
    { id: "arquitectura", icon: "compass", title: "Arquitectura", desc: "Proyecto, dirección de obra, documentación", color: "#561820" },
    { id: "ingenieria_civil", icon: "structure", title: "Ingeniería Civil / Estructural", desc: "Cálculo, predimensionado, logística de hormigón", color: "#CF3055" },
    { id: "ingenieria_inst", icon: "plumbing", title: "Ingeniería en Instalaciones", desc: "Sanitaria, gas, eléctrica, termomecánica", color: "#74777F" },
    { id: "presupuestista", icon: "budget", title: "Presupuestos y Cómputos", desc: "Cómputo métrico, licitaciones, análisis de precios", color: "#CF3055" },
  ],
  empresa: [
    { id: "vivienda", icon: "building", title: "Viviendas", desc: "Construcción residencial, countries, edificios", color: "#561820" },
    { id: "comercial", icon: "structure", title: "Comercial / Industrial", desc: "Naves, locales, oficinas, depósitos", color: "#74777F" },
    { id: "obra_publica", icon: "budget", title: "Obra Pública", desc: "Licitaciones, certificaciones, documentación", color: "#CF3055" },
    { id: "reformas", icon: "drywall", title: "Reformas y Remodelaciones", desc: "Refacción parcial, ampliaciones, reciclajes", color: "#74777F" },
  ],
};

const PROBLEMS_BY_RUBRO = {
  // Instalador rubros
  seco: [
    { id: "desperdicio_placas", title: "Desperdicio de placas por mal cálculo de corte" },
    { id: "perfileria_kg", title: "No saber cuántos kg de perfilería pedir para el flete" },
    { id: "tornillos", title: "Error en cantidad de tornillos, cintas y masilla" },
    { id: "aislacion", title: "Calcular aislación y materiales complementarios a ojo" },
  ],
  sanitario: [
    { id: "diametros", title: "Calcular diámetros de ventilación y cañerías a ojo" },
    { id: "ud_error", title: "Error en unidades de descarga y dimensionamiento" },
    { id: "hermeticidad", title: "Prueba de hermeticidad sin parámetros de referencia" },
    { id: "accesorios_pvc", title: "Comprar accesorios PVC de más o de menos" },
  ],
  electrico: [
    { id: "seccion_cable", title: "Sección de cable incorrecta por caída de tensión" },
    { id: "protecciones", title: "No dimensionar bien térmicas y diferenciales" },
    { id: "iluminacion", title: "Calcular iluminación y lux requeridos a ojo" },
    { id: "cano_conduit", title: "Cantidad de caño conduit sin cómputo" },
  ],
  termomecanico: [
    { id: "balance", title: "Balance térmico mal calculado por zona bioclimática" },
    { id: "equipos", title: "Sobre o subdimensionar equipos de climatización" },
    { id: "consumo", title: "Estimar consumo energético sin datos precisos" },
    { id: "radiadores", title: "Cantidad de elementos/radiadores incorrecta" },
  ],
  pintura: [
    { id: "rendimiento", title: "Calcular rendimiento de pintura por superficie" },
    { id: "manos", title: "No considerar cantidad de manos y tipo de superficie" },
    { id: "material_extra", title: "Comprar material de más por falta de cómputo" },
    { id: "presupuesto_pintura", title: "Presupuestar sin desglose profesional" },
  ],
  // Profesional rubros
  arquitectura: [
    { id: "computo_gral", title: "Cómputo métrico manual que lleva horas" },
    { id: "presup_lic", title: "Presupuestos poco detallados para licitar" },
    { id: "planos_ia", title: "Extraer datos de planos manualmente" },
    { id: "rubros_multiples", title: "Coordinar cálculos de múltiples rubros" },
  ],
  ingenieria_civil: [
    { id: "dosificacion", title: "Dosificación de hormigón sin tablas a mano" },
    { id: "mixers", title: "Pedir camiones mixer de más o de menos" },
    { id: "cuantia", title: "Cuantía de acero y planilla de doblado manual" },
    { id: "encofrado", title: "Cómputo de encofrado sin herramienta" },
  ],
  ingenieria_inst: [
    { id: "multi_inst", title: "Calcular 3+ tipos de instalación por proyecto" },
    { id: "normativa", title: "Verificar cumplimiento de NAG/reglamentos" },
    { id: "dim_rapido", title: "Necesitar predimensionado rápido en reunión" },
    { id: "reportes", title: "Generar reportes técnicos profesionales" },
  ],
  presupuestista: [
    { id: "excel_lento", title: "Armar presupuestos en Excel lleva demasiado tiempo" },
    { id: "sin_desglose", title: "No tener desglose profesional (CD + indirectos)" },
    { id: "inflacion", title: "Actualizar precios por inflación manualmente" },
    { id: "comparar", title: "Comparar versiones de presupuesto es un caos" },
  ],
  // Empresa rubros
  vivienda: [
    { id: "multiples_frentes", title: "Coordinar cómputos de múltiples frentes" },
    { id: "estandarizar", title: "Estandarizar pedidos de materiales por lote" },
    { id: "control_desperdicio", title: "Sin control de desperdicio por vivienda" },
    { id: "reportes_emp", title: "Reportes consolidados para dirección" },
  ],
  comercial: [
    { id: "escala", title: "Cálculos de gran escala sin herramienta" },
    { id: "logistica_materiales", title: "Logística de materiales sin planificación" },
    { id: "equipos_coord", title: "Cada equipo calcula con su propio método" },
    { id: "trazabilidad", title: "Falta de trazabilidad en pedidos" },
  ],
  obra_publica: [
    { id: "licitacion", title: "Presupuestos de licitación requieren precisión total" },
    { id: "certificacion", title: "Certificar avance sin datos centralizados" },
    { id: "auditoria", title: "Documentación insuficiente para auditorías" },
    { id: "plazos", title: "Cumplir plazos sin herramientas de cómputo" },
  ],
  reformas: [
    { id: "variabilidad", title: "Cada reforma es distinta, no hay plantillas" },
    { id: "cotizar_rapido", title: "Necesito cotizar rápido para no perder al cliente" },
    { id: "sorpresas", title: "Materiales extra no contemplados = pérdida" },
    { id: "competencia_precio", title: "La competencia cotiza más rápido que yo" },
  ],
};

const SCALE_OPTIONS = [
  { id: "1-2", title: "1-2 proyectos por mes", desc: "Trabajo solo o con un ayudante" },
  { id: "3-5", title: "3-5 proyectos por mes", desc: "Equipo chico, ritmo constante" },
  { id: "6-10", title: "6-10 proyectos por mes", desc: "Varios frentes simultáneos" },
  { id: "10+", title: "+10 proyectos por mes", desc: "Operación a gran escala" },
];

/* ═══════════════════════════════════════════════════════════════
   PERSISTENCE — Save onboarding data to localStorage (offline fallback)
   ═══════════════════════════════════════════════════════════════ */

function saveOnboardingDataLocal(data) {
  try {
    const entry = { ...data, timestamp: new Date().toISOString(), userAgent: navigator.userAgent, screenWidth: window.innerWidth };
    const existing = JSON.parse(localStorage.getItem("metriq_leads") || "[]");
    existing.push(entry);
    localStorage.setItem("metriq_leads", JSON.stringify(existing));
  } catch {}
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

const stepVariants = {
  initial: { opacity: 0, x: 60, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -60, filter: "blur(4px)" },
};

function Spinner() {
  return (
    <div className="ob-spinner">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(224,2,78,0.12)" strokeWidth="3" />
        <circle cx="24" cy="24" r="20" fill="none" stroke="#CF3055" strokeWidth="3"
          strokeDasharray="80 126" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate"
            values="0 24 24;360 24 24" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function StepBar({ current, total }) {
  return (
    <div className="ob-step-bar">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="ob-step-bar-item">
          <div className={`ob-step-dot ${i < current ? "done" : ""} ${i === current ? "active" : ""}`}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && <div className={`ob-step-connector ${i < current ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

function OptionCard({ item, selected, onClick, showCheck = true }) {
  return (
    <motion.div
      className={`ob-role-card ${selected ? "ob-role-selected" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      animate={selected ? {
        borderColor: item.color || "#CF3055",
        boxShadow: `0 0 0 3px ${item.color || "#CF3055"}25`,
      } : {}}
    >
      {item.icon && (
        <div className="ob-role-icon" style={{ background: `${item.color || "#CF3055"}12` }}>
          <RenderIcon name={item.icon} size={24} color={item.color || "#CF3055"} />
        </div>
      )}
      <div className="ob-role-info">
        <div className="ob-role-title">{item.title}</div>
        <div className="ob-role-desc">{item.desc}</div>
      </div>
      {showCheck && (
        <div className="ob-role-check" style={selected ? { background: item.color || "#CF3055" } : {}}>
          {selected && "✓"}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN — 6 step onboarding
   Steps: 0=Role, 1=Rubro, 2=Problems, 3=Scale, 4=Analyzing, 5=Register
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_STEPS = 6;

export default function OnboardingLogin({ onComplete }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);
  const [rubro, setRubro] = useState(null);
  const [problems, setProblems] = useState([]);
  const [scale, setScale] = useState(null);
  const [analyzeIdx, setAnalyzeIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("signup"); // 'signup' | 'login'
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const roleObj = ROLES.find((r) => r.id === role);
  const rubros = role ? (RUBROS_BY_ROLE[role] || []) : [];
  const rubroObj = rubros.find((r) => r.id === rubro);
  const rubroProblems = rubro ? (PROBLEMS_BY_RUBRO[rubro] || []) : [];

  const goStep = useCallback((n) => setTimeout(() => setStep(n), 350), []);

  /* Step 0: Role */
  const handleRole = (r) => { setRole(r.id); setRubro(null); setProblems([]); goStep(1); };

  /* Step 1: Rubro */
  const handleRubro = (r) => { setRubro(r.id); setProblems([]); goStep(2); };

  /* Step 2: Problems (multi-select) */
  const toggleProblem = (id) => {
    setProblems((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  /* Step 3: Scale */
  const handleScale = (s) => { setScale(s.id); goStep(4); };

  /* Step 4: Analyzing */
  useEffect(() => {
    if (step !== 4) return;
    setAnalyzeIdx(0);
    let i = 0;
    const msgs = [0, 1, 2, 3, 4];
    const interval = setInterval(() => {
      i++;
      if (i >= msgs.length) {
        clearInterval(interval);
        setTimeout(() => setStep(5), 400);
      } else {
        setAnalyzeIdx(i);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [step]);

  const ANALYZE_MSGS = [
    "Analizando tu perfil...",
    `Configurando módulos de ${rubroObj?.title || "tu rubro"}...`,
    `Priorizando herramientas para ${roleObj?.label || "tu perfil"}...`,
    "Optimizando cálculos y reportes...",
    "Preparando tu panel personalizado...",
  ];

  /* Step 5: Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAuthError(null);
    setLoading(true);

    if (OFFLINE_MODE) {
      saveOnboardingDataLocal({ email, role, rubro, problems, scale });
      onComplete({ email, role, rubro, problems, scale });
      return;
    }

    try {
      await saveLead({ email, role, rubro, problems, scale });
      if (authMode === 'signup') {
        await signUp({ email, password, nombre: email.split('@')[0], role, rubro, scale, problems });
      } else {
        await signIn({ email, password });
      }
      // onAuthStateChange in App.jsx handles navigation to /dashboard
    } catch (err) {
      const msg = err.message || '';
      if (authMode === 'signup' && (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered'))) {
        setAuthMode('login');
        setAuthError('Ese email ya tiene una cuenta. Ingresá tu contraseña para iniciar sesión.');
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setAuthError('Email o contraseña incorrectos.');
      } else {
        setAuthError(msg || 'Error al autenticar. Revisá tus datos.');
      }
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    if (OFFLINE_MODE) {
      const data = { email: "google@user.com", role, rubro, problems, scale };
      saveOnboardingDataLocal(data);
      onComplete(data);
      return;
    }
    try {
      await saveLead({ email: '', role, rubro, problems, scale });
      await sbSignInWithGoogle();
      // Redirects to /dashboard via OAuth flow — no further action needed
    } catch (err) {
      setAuthError(err.message || 'Error al conectar con Google.');
      setLoading(false);
    }
  };

  return (
    <div className="ob">
      {/* Left — Branding */}
      <div className="ob-left">
        <div className="ob-left-content">
          <div className="ob-left-logo">
            <div className="lp-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 21V8l9-5 9 5v13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 21v-6h6v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 12h10M7 15.5h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="lp-logo-text">METR<span>IQ</span></span>
          </div>
          <h2 className="ob-left-title">Personalizamos tu Metriq en 4 pasos</h2>
          <p className="ob-left-desc">
            Respondé unas preguntas rápidas y configuramos la plataforma
            exactamente para tu rubro y tus necesidades en obra.
          </p>
          <div className="ob-left-testimonial">
            <div className="ob-left-quote">"Entré a probar y no pude parar. Es exactamente lo que necesitaba para dejar de usar Excel."</div>
            <div className="ob-left-author">— Arq. Martínez, CABA</div>
          </div>
        </div>
        <div className="ob-left-gradient" />
      </div>

      {/* Right — Questionnaire */}
      <div className="ob-right">
        <AnimatePresence mode="wait">

          {/* ═══ STEP 0: Role ═══ */}
          {step === 0 && (
            <motion.div key="s0" className="ob-form-wrap" variants={stepVariants}
              initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <StepBar current={0} total={TOTAL_STEPS} />
              <h1 className="ob-title">¿Cómo te involucrás en la obra?</h1>
              <p className="ob-subtitle">Elegí el perfil que mejor te represente</p>
              <div className="ob-roles">
                {ROLES.map((r) => (
                  <OptionCard key={r.id} item={r} selected={role === r.id} onClick={() => handleRole(r)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 1: Rubro ═══ */}
          {step === 1 && (
            <motion.div key="s1" className="ob-form-wrap" variants={stepVariants}
              initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <StepBar current={1} total={TOTAL_STEPS} />
              <h1 className="ob-title">¿A qué rubro te dedicás?</h1>
              <p className="ob-subtitle">Esto define qué módulos priorizar para vos</p>
              <div className="ob-roles ob-roles-scroll">
                {rubros.map((r) => (
                  <OptionCard key={r.id} item={r} selected={rubro === r.id} onClick={() => handleRubro(r)} />
                ))}
              </div>
              <button className="ob-back" onClick={() => { setStep(0); setRubro(null); }}>← Volver</button>
            </motion.div>
          )}

          {/* ═══ STEP 2: Problems (multi-select) ═══ */}
          {step === 2 && (
            <motion.div key="s2" className="ob-form-wrap" variants={stepVariants}
              initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <StepBar current={2} total={TOTAL_STEPS} />
              <h1 className="ob-title">¿Qué problemas enfrentás hoy?</h1>
              <p className="ob-subtitle">Podés elegir más de uno</p>
              <div className="ob-roles ob-roles-scroll">
                {rubroProblems.map((p) => (
                  <motion.div
                    key={p.id}
                    className={`ob-problem-card ${problems.includes(p.id) ? "ob-problem-selected" : ""}`}
                    onClick={() => toggleProblem(p.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`ob-problem-check ${problems.includes(p.id) ? "checked" : ""}`}>
                      {problems.includes(p.id) && "✓"}
                    </div>
                    <span>{p.title}</span>
                  </motion.div>
                ))}
              </div>
              <button
                className="ob-submit"
                onClick={() => goStep(3)}
                disabled={problems.length === 0}
                style={problems.length === 0 ? { opacity: 0.4, cursor: "not-allowed" } : {}}
              >
                Continuar ({problems.length} seleccionados)
                <span className="ob-submit-arrow">→</span>
              </button>
              <button className="ob-back" onClick={() => { setStep(1); setProblems([]); }}>← Volver</button>
            </motion.div>
          )}

          {/* ═══ STEP 3: Scale ═══ */}
          {step === 3 && (
            <motion.div key="s3" className="ob-form-wrap" variants={stepVariants}
              initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <StepBar current={3} total={TOTAL_STEPS} />
              <h1 className="ob-title">¿Cuánto volumen de trabajo manejás?</h1>
              <p className="ob-subtitle">Nos ayuda a recomendarte el plan ideal</p>
              <div className="ob-roles">
                {SCALE_OPTIONS.map((s) => (
                  <motion.div
                    key={s.id}
                    className={`ob-role-card ${scale === s.id ? "ob-role-selected" : ""}`}
                    onClick={() => handleScale(s)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    animate={scale === s.id ? {
                      borderColor: "#CF3055",
                      boxShadow: "0 0 0 3px rgba(224,2,78,0.15)",
                    } : {}}
                  >
                    <div className="ob-role-info">
                      <div className="ob-role-title">{s.title}</div>
                      <div className="ob-role-desc">{s.desc}</div>
                    </div>
                    <div className="ob-role-check" style={scale === s.id ? { background: "#CF3055" } : {}}>
                      {scale === s.id && "✓"}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button className="ob-back" onClick={() => setStep(2)}>← Volver</button>
            </motion.div>
          )}

          {/* ═══ STEP 4: Analyzing ═══ */}
          {step === 4 && (
            <motion.div key="s4" className="ob-form-wrap ob-analyzing" variants={stepVariants}
              initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <StepBar current={4} total={TOTAL_STEPS} />
              <div className="ob-analyze-center">
                <Spinner />
                <AnimatePresence mode="wait">
                  <motion.p key={analyzeIdx} className="ob-analyze-text"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {ANALYZE_MSGS[analyzeIdx]}
                  </motion.p>
                </AnimatePresence>
                <div className="ob-analyze-bar">
                  <motion.div className="ob-analyze-fill"
                    initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: 3.5, ease: "easeInOut" }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 5: Register ═══ */}
          {step === 5 && (
            <motion.div key="s5" className="ob-form-wrap" variants={stepVariants}
              initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <StepBar current={5} total={TOTAL_STEPS} />
              <h1 className="ob-title">{authMode === 'signup' ? 'Tu Metriq está listo' : 'Bienvenido de vuelta'}</h1>
              <p className="ob-subtitle">{authMode === 'signup' ? 'Solo falta crear tu cuenta' : 'Ingresá para continuar'}</p>

              {/* Summary */}
              <div className="ob-summary">
                {roleObj && (
                  <div className="ob-summary-pill" style={{ borderColor: `${roleObj.color}40` }}>
                    <RenderIcon name={roleObj.icon} size={14} color={roleObj.color} />
                    <span>{roleObj.label}</span>
                  </div>
                )}
                {rubroObj && (
                  <div className="ob-summary-pill" style={{ borderColor: `${rubroObj.color}40` }}>
                    <RenderIcon name={rubroObj.icon} size={14} color={rubroObj.color} />
                    <span>{rubroObj.title}</span>
                  </div>
                )}
                {problems.length > 0 && (
                  <div className="ob-summary-pill" style={{ borderColor: "rgba(224,2,78,0.3)" }}>
                    <span>{problems.length} problema{problems.length > 1 ? "s" : ""} identificado{problems.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                {scale && (
                  <div className="ob-summary-pill" style={{ borderColor: "rgba(116,119,127,0.3)" }}>
                    <span>{scale} proy/mes</span>
                  </div>
                )}
              </div>

              <form className="ob-form" onSubmit={handleSubmit}>
                <div className="ob-field">
                  <label className="ob-label">Email</label>
                  <input className="ob-input" type="email" placeholder="tu@email.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                    required autoComplete="email" autoFocus disabled={loading} />
                </div>
                <div className="ob-field">
                  <label className="ob-label">Contraseña</label>
                  <input className="ob-input" type="password"
                    placeholder={authMode === 'signup' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                    value={password} onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    disabled={loading} />
                </div>

                {authError && (
                  <div style={{ background: 'rgba(168,16,46,0.08)', border: '1px solid rgba(168,16,46,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A8102E', marginBottom: 4 }}>
                    {authError}
                  </div>
                )}

                <button className="ob-submit" type="submit" disabled={loading}
                  style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                  {loading ? 'Procesando…' : authMode === 'signup' ? 'Crear cuenta en Metriq' : 'Iniciar sesión'}
                  {!loading && <span className="ob-submit-arrow">→</span>}
                </button>

                <div className="ob-divider"><span>o continuá con</span></div>

                <button className="ob-social" type="button" onClick={handleGoogle} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>

                <p className="ob-footer-text">
                  {authMode === 'signup'
                    ? <>¿Ya tenés cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setAuthError(null); }}>Iniciá sesión</a></>
                    : <>¿No tenés cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('signup'); setAuthError(null); }}>Registrate gratis</a></>
                  }
                </p>
              </form>

              <button className="ob-back" onClick={() => setStep(0)}>← Cambiar respuestas</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
