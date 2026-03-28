import { motion } from 'framer-motion';
import { ALL_MODULES } from '../modules/calculators';

// Mapeo: rubro del onboarding → IDs de módulos prioritarios
const RUBRO_MODULES = {
  seco:             ['seco'],
  sanitario:        ['agua', 'cloacal', 'gas'],
  electrico:        ['electrico'],
  termomecanico:    ['termo'],
  pintura:          [],
  arquitectura:     ['presup', 'gantt'],
  ingenieria_civil: ['estruct', 'presup'],
  ingenieria_inst:  ['agua', 'cloacal', 'gas', 'electrico', 'termo'],
  presupuestista:   ['presup', 'gantt'],
  vivienda:         ['presup', 'gantt', 'estruct'],
  comercial:        ['presup', 'estruct'],
  obra_publica:     ['presup', 'gantt'],
  reformas:         ['presup', 'seco'],
};

const ROLE_GREETINGS = {
  instalador: 'Tus módulos de instalación',
  profesional: 'Tus módulos de obra y gestión',
  empresa: 'Módulos para tu empresa',
};

function ModCard({ m, onOpen, index = 0 }) {
  return (
    <motion.div
      className="mod-card"
      onClick={() => onOpen(m)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="mc-bar" style={{ background: m.color }} />
      <div className="mc-icon" style={{ background: `${m.color}14` }}>{m.icon}</div>
      <div className="mc-name">{m.name}</div>
      <div className="mc-sub">{m.sub}</div>
      <div className="mc-arrow">→</div>
    </motion.div>
  );
}

export default function Dashboard({ onOpen, user }) {
  const rubro = user?.rubro;
  const role = user?.role;
  const primaryIds = RUBRO_MODULES[rubro] || [];

  const primaryMods = ALL_MODULES.filter(m => primaryIds.includes(m.id));
  const secondaryMods = ALL_MODULES.filter(m => !primaryIds.includes(m.id));

  const subtext = role ? (ROLE_GREETINGS[role] || 'Seleccioná un módulo para calcular') : 'Seleccioná un módulo para calcular';

  return (
    <div className="dash">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="dash-greeting">
          {user ? 'Panel de Control' : 'Panel de Control'}
        </div>
        <div className="dash-sub">{subtext}</div>
      </motion.div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--accent)" }}>9</div>
          <div className="stat-label">Módulos</div>
        </div>
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--green)" }}>IA</div>
          <div className="stat-label">Lectura planos</div>
        </div>
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--text)" }}>∞</div>
          <div className="stat-label">Cálculos</div>
        </div>
      </div>

      {primaryMods.length > 0 ? (
        <>
          <div className="dash-section-label">Mis módulos</div>
          <div className="mod-grid">
            {primaryMods.map((m, i) => (
              <ModCard key={m.id} m={m} onOpen={onOpen} index={i} />
            ))}
          </div>
          <div className="dash-section-label" style={{ marginTop: 24 }}>Todos los módulos</div>
          <div className="mod-grid">
            {secondaryMods.map((m, i) => (
              <ModCard key={m.id} m={m} onOpen={onOpen} index={primaryMods.length + i} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="dash-section-label">Módulos disponibles</div>
          <div className="mod-grid">
            {ALL_MODULES.map((m, i) => (
              <ModCard key={m.id} m={m} onOpen={onOpen} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
