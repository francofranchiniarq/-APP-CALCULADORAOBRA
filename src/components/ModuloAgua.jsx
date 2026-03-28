import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIAMETROS = ['20', '25', '32', '40', '50'];
const MATERIALES = ['PP-R', 'PEAD', 'Cobre', 'Acero'];

const newTramo = (id) => ({
  id,
  desc:      '',
  longitud:  0,
  diametro:  '20',
  material:  'PP-R',
  codos90:   0,
  tees:      0,
  llaves:    0,
});

let _id = 1;
const uid = () => _id++;

// ── Cálculo de despiece por tramo ────────────────────────────
function calcDespiece(tramo) {
  const L = parseFloat(tramo.longitud) || 0;
  const tiras   = L > 0 ? Math.ceil((L * 1.10) / 4) : 0;
  const cuplas   = L > 0 ? Math.max(0, Math.ceil(L / 4) - 1) : 0;
  return {
    tiras,
    cuplas,
    codos90: parseInt(tramo.codos90) || 0,
    tees:    parseInt(tramo.tees)    || 0,
    llaves:  parseInt(tramo.llaves)  || 0,
  };
}

// ── Agrupa y suma el despiece por [material + diámetro] ──────
function buildDespiece(tramos) {
  const map = {};
  tramos.forEach(t => {
    const key = `${t.material}|${t.diametro}`;
    const d = calcDespiece(t);
    if (!map[key]) {
      map[key] = { material: t.material, diametro: t.diametro, tiras: 0, cuplas: 0, codos90: 0, tees: 0, llaves: 0 };
    }
    map[key].tiras   += d.tiras;
    map[key].cuplas  += d.cuplas;
    map[key].codos90 += d.codos90;
    map[key].tees    += d.tees;
    map[key].llaves  += d.llaves;
  });
  return Object.values(map).filter(r =>
    r.tiras > 0 || r.cuplas > 0 || r.codos90 > 0 || r.tees > 0 || r.llaves > 0
  );
}

// ── Inputs numéricos pequeños ────────────────────────────────
function NumInput({ value, onChange, min = 0, step = 1 }) {
  return (
    <input
      type="number"
      className="tramo-num"
      value={value}
      min={min}
      step={step}
      onChange={e => onChange(e.target.value)}
    />
  );
}

export default function ModuloAgua({ project, onBack }) {
  const [tramos, setTramos] = useState(() => [newTramo(uid())]);
  const [tab, setTab] = useState('datos'); // 'datos' | 'despiece'

  const addTramo = () => setTramos(ts => [...ts, newTramo(uid())]);

  const removeTramo = (id) => {
    setTramos(ts => ts.length > 1 ? ts.filter(t => t.id !== id) : ts);
  };

  const updateTramo = (id, field, val) => {
    setTramos(ts => ts.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  const despiece = useMemo(() => buildDespiece(tramos), [tramos]);

  const totalLongitud = tramos.reduce((s, t) => s + (parseFloat(t.longitud) || 0), 0);
  const totalTiras    = despiece.reduce((s, r) => s + r.tiras, 0);
  const totalLlaves   = despiece.reduce((s, r) => s + r.llaves, 0);

  return (
    <motion.div
      className="modulo-agua"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      {/* Header */}
      <button className="calc-back" onClick={onBack}>← Volver</button>

      <div className="calc-header-card">
        <div className="calc-header-left">
          <div className="calc-header-icon" style={{ background: 'rgba(29,78,216,0.08)', color: '#1D4ED8', fontSize: 22 }}>💧</div>
          <div>
            <h1 className="calc-title">Agua Fría y Caliente</h1>
            <div className="calc-subtitle">
              {project ? `${project.name} · ` : ''}Cómputo de cañerías y accesorios
            </div>
          </div>
        </div>
        <div className="agua-summary-pills">
          <div className="agua-pill">
            <div className="agua-pill-val">{totalLongitud.toFixed(1)} m</div>
            <div className="agua-pill-label">Long. total</div>
          </div>
          <div className="agua-pill">
            <div className="agua-pill-val">{totalTiras}</div>
            <div className="agua-pill-label">Tiras (4m)</div>
          </div>
          <div className="agua-pill">
            <div className="agua-pill-val">{totalLlaves}</div>
            <div className="agua-pill-label">Llaves</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="agua-tabs">
        <button
          className={`agua-tab ${tab === 'datos' ? 'agua-tab-act' : ''}`}
          onClick={() => setTab('datos')}
        >
          Ingreso de Datos (Tramos)
        </button>
        <button
          className={`agua-tab ${tab === 'despiece' ? 'agua-tab-act' : ''}`}
          onClick={() => setTab('despiece')}
        >
          Tabla de Despiece Automático
          {despiece.length > 0 && <span className="agua-tab-badge">{despiece.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'datos' ? (
          <motion.div
            key="datos"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.18 }}
          >
            {/* Tabla de tramos */}
            <div className="tramos-wrap">
              <div className="tramos-table-container">
                <table className="tramos-table">
                  <thead>
                    <tr>
                      <th className="tramos-th-desc">Descripción / Tramo</th>
                      <th>Long. (m)</th>
                      <th>Diámetro</th>
                      <th>Material</th>
                      <th>Codos 90°</th>
                      <th>Tees</th>
                      <th>Llaves</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {tramos.map((t, i) => (
                        <motion.tr
                          key={t.id}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td>
                            <input
                              type="text"
                              className="tramo-desc"
                              value={t.desc}
                              placeholder={`Tramo ${i + 1}`}
                              onChange={e => updateTramo(t.id, 'desc', e.target.value)}
                            />
                          </td>
                          <td>
                            <NumInput
                              value={t.longitud}
                              step={0.5}
                              onChange={v => updateTramo(t.id, 'longitud', v)}
                            />
                          </td>
                          <td>
                            <select
                              className="tramo-sel"
                              value={t.diametro}
                              onChange={e => updateTramo(t.id, 'diametro', e.target.value)}
                            >
                              {DIAMETROS.map(d => (
                                <option key={d} value={d}>{d} mm</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="tramo-sel"
                              value={t.material}
                              onChange={e => updateTramo(t.id, 'material', e.target.value)}
                            >
                              {MATERIALES.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <NumInput value={t.codos90} onChange={v => updateTramo(t.id, 'codos90', v)} />
                          </td>
                          <td>
                            <NumInput value={t.tees} onChange={v => updateTramo(t.id, 'tees', v)} />
                          </td>
                          <td>
                            <NumInput value={t.llaves} onChange={v => updateTramo(t.id, 'llaves', v)} />
                          </td>
                          <td>
                            <button
                              className="tramo-del"
                              onClick={() => removeTramo(t.id)}
                              title="Eliminar tramo"
                              disabled={tramos.length === 1}
                            >
                              ×
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <div className="tramos-actions">
                <button className="tramo-add-btn" onClick={addTramo}>
                  + Agregar tramo
                </button>
                <button
                  className="tramo-calc-btn"
                  onClick={() => setTab('despiece')}
                  disabled={totalLongitud === 0}
                >
                  Ver despiece →
                </button>
              </div>
            </div>

            {/* Leyenda de cálculo */}
            <div className="agua-leyenda">
              <div className="agua-leyenda-title">Criterios de cálculo</div>
              <div className="agua-leyenda-items">
                <div className="agua-leyenda-item">
                  <span className="agua-leyenda-formula">Tiras (4 m)</span>
                  <span>= ⌈(longitud × 1.10) ÷ 4⌉ — incluye 10% desperdicio</span>
                </div>
                <div className="agua-leyenda-item">
                  <span className="agua-leyenda-formula">Cuplas</span>
                  <span>= máx(0, ⌈longitud ÷ 4⌉ - 1) — uniones entre tiras</span>
                </div>
                <div className="agua-leyenda-item">
                  <span className="agua-leyenda-formula">Codos / Tees / Llaves</span>
                  <span>= ingresados por el usuario</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="despiece"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
          >
            {despiece.length === 0 ? (
              <div className="agua-empty">
                <div className="agua-empty-icon">📋</div>
                <div className="agua-empty-text">Completá los tramos para ver el despiece</div>
                <button className="tramo-add-btn" onClick={() => setTab('datos')}>
                  ← Ingresar datos
                </button>
              </div>
            ) : (
              <>
                <div className="despiece-wrap">
                  <table className="despiece-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Diámetro</th>
                        <th>Tiras (4 m)</th>
                        <th>Cuplas</th>
                        <th>Codos 90°</th>
                        <th>Tees</th>
                        <th>Llaves</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despiece.map((row, i) => (
                        <motion.tr
                          key={`${row.material}-${row.diametro}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: i * 0.04 }}
                        >
                          <td><span className="despiece-mat">{row.material}</span></td>
                          <td><span className="despiece-diam">Ø {row.diametro} mm</span></td>
                          <td className="despiece-qty">{row.tiras}</td>
                          <td className="despiece-qty">{row.cuplas}</td>
                          <td className="despiece-qty">{row.codos90 || '—'}</td>
                          <td className="despiece-qty">{row.tees || '—'}</td>
                          <td className="despiece-qty">{row.llaves || '—'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="despiece-total-row">
                        <td colSpan={2}><strong>TOTAL</strong></td>
                        <td className="despiece-qty"><strong>{despiece.reduce((s, r) => s + r.tiras, 0)}</strong></td>
                        <td className="despiece-qty"><strong>{despiece.reduce((s, r) => s + r.cuplas, 0)}</strong></td>
                        <td className="despiece-qty"><strong>{despiece.reduce((s, r) => s + r.codos90, 0)}</strong></td>
                        <td className="despiece-qty"><strong>{despiece.reduce((s, r) => s + r.tees, 0)}</strong></td>
                        <td className="despiece-qty"><strong>{despiece.reduce((s, r) => s + r.llaves, 0)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="despiece-actions">
                  <button className="tramo-add-btn" onClick={() => setTab('datos')}>
                    ← Editar tramos
                  </button>
                  <button className="tramo-calc-btn">
                    Exportar PDF
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
