import { motion } from 'framer-motion';
import { ALL_MODULES } from '../modules/calculators';
import { RenderIcon } from './Icons';

// Agrupación de módulos por categoría
const SIDEBAR_GROUPS = [
  {
    id: 'instalaciones',
    label: 'Instalaciones',
    moduleIds: ['agua', 'cloacal', 'gas', 'termo', 'electrico'],
    primaryRoles: ['instalador'],
  },
  {
    id: 'estructura',
    label: 'Estructura y Seco',
    moduleIds: ['seco', 'estruct'],
    primaryRoles: ['empresa', 'profesional'],
  },
  {
    id: 'gestion',
    label: 'Gestión y Costos',
    moduleIds: ['presup', 'gantt'],
    primaryRoles: ['profesional', 'empresa'],
  },
];

export default function Sidebar({ activeId, onSelect, user }) {
  const role = user?.role;

  // El grupo primario del usuario va arriba
  const sortedGroups = [...SIDEBAR_GROUPS].sort((a, b) => {
    const aP = a.primaryRoles.includes(role) ? -1 : 1;
    const bP = b.primaryRoles.includes(role) ? -1 : 1;
    return aP - bP;
  });

  return (
    <nav className="side">
      {sortedGroups.map((group) => {
        const mods = group.moduleIds
          .map(id => ALL_MODULES.find(m => m.id === id))
          .filter(Boolean);
        const isPrimary = group.primaryRoles.includes(role);

        return (
          <div key={group.id} className="side-group">
            <div className={`side-label ${isPrimary ? 'side-label-primary' : ''}`}>
              {group.label}
            </div>
            {mods.map((m) => (
              <motion.div
                key={m.id}
                className={`side-item ${activeId === m.id ? "act" : ""}`}
                onClick={() => onSelect(m)}
                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="side-icon" style={{ background: `${m.color}12` }}>
                  <RenderIcon name={m.icon} size={20} color={m.color} />
                </div>
                <div className="side-txt">
                  <h3>{m.name}</h3>
                  <p>{m.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
