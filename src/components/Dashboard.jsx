import { ALL_MODULES } from '../modules/calculators';

export default function Dashboard({ onOpen }) {
  return (
    <div className="dash">
      <div className="dash-greeting">Panel de Control</div>
      <div className="dash-sub">Seleccioná un módulo para calcular</div>
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
      <div className="mod-grid">
        {ALL_MODULES.map((m) => (
          <div key={m.id} className="mod-card" onClick={() => onOpen(m)}>
            <div className="mc-bar" style={{ background: m.color }} />
            <div className="mc-icon" style={{ background: `${m.color}0A` }}>{m.icon}</div>
            <div className="mc-name">{m.name}</div>
            <div className="mc-sub">{m.sub}</div>
            <div className="mc-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
