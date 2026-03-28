import { useState, useEffect } from 'react';
import Ring from './Ring';
import { RenderIcon } from './Icons';
import { getObras, crearObra, guardarCalculo, getObraActiva, setObraActiva } from '../modules/obras';

export default function CalcView({ mod, vals, res, onUpdate, onBack }) {
  const [obras, setObras] = useState(() => getObras());
  const [obraSelId, setObraSelId] = useState(() => {
    const activa = getObraActiva();
    return activa ? activa.id : "";
  });
  const [nuevaObra, setNuevaObra] = useState(false);
  const [nuevaNombre, setNuevaNombre] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => { setGuardado(false); }, [vals]);

  const handleGuardar = () => {
    if (!obraSelId) return;
    guardarCalculo(obraSelId, {
      moduloId: mod.id,
      moduloName: mod.name,
      valores: { ...vals },
      resultado: { big: res.big, bigU: res.bigU, bigL: res.bigL, items: res.items, notes: res.notes },
    });
    setObraActiva(obraSelId);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleCrearObra = () => {
    if (!nuevaNombre.trim()) return;
    const o = crearObra({ nombre: nuevaNombre.trim() });
    setObras(getObras());
    setObraSelId(o.id);
    setObraActiva(o.id);
    setNuevaObra(false);
    setNuevaNombre("");
  };

  if (!res) return null;
  const first3 = res.items.slice(0, 3);

  return (
    <div>
      <button className="calc-back" onClick={onBack}>← Volver</button>

      <div className="calc-header-card">
        <div className="chc-icon" style={{ background: `${mod.color}12` }}>
          <RenderIcon name={mod.icon} size={28} color={mod.color} />
        </div>
        <div className="chc-info">
          <h1>{mod.name}</h1>
          <p>{mod.sub}</p>
        </div>
      </div>

      {/* Big number + ring */}
      <div className="big-result">
        <div className="br-left">
          <div className="br-num" style={{ color: mod.color }}>{res.big}</div>
          <div className="br-unit">{res.bigU}</div>
          <div className="br-label">{res.bigL}</div>
        </div>
        <Ring pct={res.ring} color={mod.color} size={80} stroke={7} />
      </div>

      {/* 3 mini cards */}
      {first3.length >= 3 && (
        <div className="mini-row">
          {first3.map((it, i) => (
            <div className="mini-card" key={i}>
              <div className="mini-val">{it.v}</div>
              <div className="mini-label">{it.l}</div>
              <div className="mini-ring">
                <Ring pct={30 + i * 25} color={mod.color} size={40} stroke={4} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inputs */}
      <div className="inputs-card">
        <div className="inputs-title">Parámetros</div>
        <div className="input-grid">
          {mod.fields.map((f) => (
            <div className="ig" key={f.k}>
              <label>{f.l}</label>
              {f.t === "s" ? (
                <select value={vals[f.k]} onChange={(e) => onUpdate(f.k, e.target.value, mod)}>
                  {f.o.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ) : (
                <input
                  type="number" value={vals[f.k]}
                  onChange={(e) => onUpdate(f.k, e.target.value, mod)}
                  step="any"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full results */}
      <div className="results-card">
        <div className="results-title">Resultados completos</div>
        {res.items.map((it, i) => (
          <div className="ri" key={i}>
            <span className="ril">{it.l}</span>
            <span className={`riv ${it.h ? "hl" : ""}`}>
              {it.v} <span className="riu">{it.u}</span>
            </span>
          </div>
        ))}
        <button className="exp-btn">Exportar PDF</button>
      </div>

      {/* Guardar en obra */}
      <div className="obra-save-card">
        <div className="obra-save-title">Guardar en obra</div>
        <div className="obra-save-row">
          {!nuevaObra ? (
            <>
              <select
                className="obra-select"
                value={obraSelId}
                onChange={(e) => { setObraSelId(e.target.value); setObraActiva(e.target.value); }}
              >
                <option value="">— Seleccionar obra —</option>
                {obras.map(o => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
              <button className="obra-new-btn" onClick={() => setNuevaObra(true)}>+ Nueva</button>
            </>
          ) : (
            <>
              <input
                className="obra-input"
                placeholder="Nombre de la obra..."
                value={nuevaNombre}
                onChange={(e) => setNuevaNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCrearObra()}
                autoFocus
              />
              <button className="obra-new-btn" onClick={handleCrearObra}>Crear</button>
              <button className="obra-cancel-btn" onClick={() => { setNuevaObra(false); setNuevaNombre(""); }}>✕</button>
            </>
          )}
        </div>
        <button
          className={`obra-save-btn ${guardado ? "obra-saved" : ""}`}
          onClick={handleGuardar}
          disabled={!obraSelId || guardado}
        >
          {guardado ? "✓ Guardado" : "Guardar cálculo en esta obra"}
        </button>
      </div>

      {/* Professional notes / warnings */}
      {res.notes && res.notes.length > 0 && (
        <div className="notes-card">
          <div className="notes-title">Notas profesionales</div>
          {res.notes.map((note, i) => (
            <div className="note-item" key={i}>
              <span className="note-icon">⚠</span>
              <span className="note-text">{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
