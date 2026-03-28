import { ALL_MODULES } from '../modules/calculators';
import { RenderIcon } from './Icons';

export default function Sidebar({ activeId, onSelect }) {
  return (
    <nav className="side">
      <div className="side-label">Módulos</div>
      {ALL_MODULES.map((m) => (
        <div
          key={m.id}
          className={`side-item ${activeId === m.id ? "act" : ""}`}
          onClick={() => onSelect(m)}
        >
          <div className="side-icon" style={{ background: `${m.color}12` }}>
            <RenderIcon name={m.icon} size={20} color={m.color} />
          </div>
          <div className="side-txt">
            <h3>{m.name}</h3>
            <p>{m.sub}</p>
          </div>
        </div>
      ))}
    </nav>
  );
}
