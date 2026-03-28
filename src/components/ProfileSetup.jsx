import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProfile } from '../services/authService.js';

/* ── Datos de roles y rubros ─────────────────────────── */
const ROLES = [
  { id: 'profesional', emoji: '📐', title: 'Profesional / Estudio',   desc: 'Arquitecto, Ingeniero, Director de Obra' },
  { id: 'instalador',  emoji: '🔧', title: 'Instalador / Oficio',     desc: 'Gas, eléctrico, sanitario, durlock, pintura' },
  { id: 'empresa',     emoji: '🏗️', title: 'Empresa Constructora',    desc: 'Equipo de obra, múltiples proyectos' },
];

const RUBROS_BY_ROLE = {
  profesional: ['Arquitectura', 'Ingeniería Civil / Estructural', 'Ingeniería en Instalaciones', 'Presupuestos y Cómputos'],
  instalador:  ['Gas y Sanitaria', 'Eléctrico', 'Durlock / Steel Framing', 'Termomecánico / Climatización', 'Pintura y Terminaciones'],
  empresa:     ['Viviendas / Edificios', 'Comercial / Industrial', 'Obra Pública', 'Reformas y Remodelaciones'],
};

const PLAN_INFO = {
  starter:      { label: 'Starter',      color: '#74777F', desc: 'Acceso básico · Hasta 3 proyectos · Módulos esenciales' },
  pro:          { label: 'Pro',           color: '#CF3055', desc: 'Proyectos ilimitados · Todos los módulos · Gantt completo' },
  estudio:      { label: 'Estudio',       color: '#561820', desc: 'Multi-usuario · Colaboración · Reportes avanzados' },
  constructora: { label: 'Constructora',  color: '#1A1714', desc: 'Equipos · BIM ready · Certificaciones · Soporte dedicado' },
};

/* ── Componente principal ────────────────────────────── */
export default function ProfileSetup({ user, onComplete, onSkip }) {
  const [nombre,  setNombre]  = useState(user?.nombre  || '');
  const [role,    setRole]    = useState(user?.role !== 'profesional' ? user?.role || '' : '');
  const [rubro,   setRubro]   = useState(user?.rubro   || '');
  const [empresa, setEmpresa] = useState(user?.empresa || '');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const plan     = user?.plan || 'starter';
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.starter;
  const rubros   = RUBROS_BY_ROLE[role] || [];

  const canSubmit = nombre.trim() && role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await updateProfile(user.id, {
        nombre:  nombre.trim(),
        role,
        rubro:   rubro || null,
        empresa: empresa.trim() || null,
      });
      onComplete({ ...user, nombre: nombre.trim(), role, rubro, empresa: empresa.trim() || null });
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="ps-overlay">
      <motion.div
        className="ps-card"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="ps-header">
          <div className="ps-logo">
            <div className="lp-logo-mark" style={{ width: 28, height: 28 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 21V8l9-5 9 5v13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 21v-6h6v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div>
            <h2 className="ps-title">Completá tu perfil</h2>
            <p className="ps-subtitle">Solo tarda 30 segundos y nos ayuda a personalizar tu experiencia</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ps-form">

          {/* Nombre */}
          <div className="ps-field">
            <label className="ps-label">Tu nombre</label>
            <input
              className="ps-input"
              type="text"
              placeholder="Ej: Juan García"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Email — readonly, informativo */}
          {user?.email && (
            <div className="ps-field">
              <label className="ps-label">Email</label>
              <input className="ps-input ps-input-readonly" type="email" value={user.email} readOnly />
            </div>
          )}

          {/* Tipo de perfil */}
          <div className="ps-field">
            <label className="ps-label">¿Cómo participás en la obra?</label>
            <div className="ps-role-grid">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`ps-role-btn ${role === r.id ? 'ps-role-active' : ''}`}
                  onClick={() => { setRole(r.id); setRubro(''); }}
                >
                  <span className="ps-role-emoji">{r.emoji}</span>
                  <span className="ps-role-title">{r.title}</span>
                  <span className="ps-role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rubro — aparece al elegir rol */}
          {role && (
            <div className="ps-field">
              <label className="ps-label">Especialidad principal</label>
              <select
                className="ps-select"
                value={rubro}
                onChange={e => setRubro(e.target.value)}
              >
                <option value="">Seleccioná tu rubro…</option>
                {rubros.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {/* Empresa (opcional para profesional/empresa) */}
          {(role === 'profesional' || role === 'empresa') && (
            <div className="ps-field">
              <label className="ps-label">Empresa / Estudio <span className="ps-optional">(opcional)</span></label>
              <input
                className="ps-input"
                type="text"
                placeholder={role === 'empresa' ? 'Ej: Constructora Pérez S.A.' : 'Ej: Estudio García Arquitectura'}
                value={empresa}
                onChange={e => setEmpresa(e.target.value)}
              />
            </div>
          )}

          {/* Plan actual — informativo */}
          <div className="ps-plan-info">
            <div className="ps-plan-dot" style={{ background: planInfo.color }} />
            <div>
              <span className="ps-plan-name">{planInfo.label}</span>
              <span className="ps-plan-desc"> · {planInfo.desc}</span>
            </div>
          </div>

          {error && <div className="ps-error">{error}</div>}

          <div className="ps-actions">
            <button
              type="submit"
              className="ps-submit"
              disabled={!canSubmit || loading}
            >
              {loading ? 'Guardando…' : 'Guardar y continuar →'}
            </button>
            <button type="button" className="ps-skip" onClick={onSkip}>
              Completar más tarde
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
