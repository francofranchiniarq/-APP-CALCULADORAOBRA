import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   Metriq — Panel de Administración
   /admin — Gestión de usuarios, planes y leads
   ═══════════════════════════════════════════════════════════════ */

const PLANS = [
  { id: 'free', label: 'Free', color: 'var(--text3)', bg: 'var(--bg)' },
  { id: 'pro', label: 'Pro', color: 'var(--accent)', bg: 'var(--abg)' },
  { id: 'enterprise', label: 'Enterprise', color: 'var(--blue)', bg: 'rgba(29,78,216,0.07)' },
];

const ROLE_LABELS = {
  instalador: 'Instalador',
  profesional: 'Profesional',
  empresa: 'Empresa',
};

const RUBRO_LABELS = {
  seco: 'Durlock / Steel Framing',
  sanitario: 'Sanitario y Gas',
  electrico: 'Eléctrico',
  termomecanico: 'Termomecánico',
  pintura: 'Pintura',
  arquitectura: 'Arquitectura',
  ingenieria_civil: 'Ingeniería Civil',
  ingenieria_inst: 'Ing. Instalaciones',
  presupuestista: 'Presupuestos',
  vivienda: 'Viviendas',
  comercial: 'Comercial / Industrial',
  obra_publica: 'Obra Pública',
  reformas: 'Reformas',
};

// ─── Data helpers ───

function getLeads() {
  return JSON.parse(localStorage.getItem('metriq_leads') || '[]');
}

function saveLeads(leads) {
  localStorage.setItem('metriq_leads', JSON.stringify(leads));
}

function countBy(arr, key) {
  const counts = {};
  arr.forEach(item => {
    const val = item[key] || 'N/A';
    counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ═══════════════════════════════════════════════════════════════
// TAB: Resumen
// ═══════════════════════════════════════════════════════════════

function TabResumen({ users }) {
  const total = users.length;
  const roleStats = countBy(users, 'role');
  const rubroStats = countBy(users, 'rubro');
  const planStats = countBy(users, 'plan');

  const thisWeek = users.filter(u => {
    const d = new Date(u.timestamp);
    const now = new Date();
    return (now - d) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const thisMonth = users.filter(u => {
    const d = new Date(u.timestamp);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="adm-grid">
      <div className="adm-stat-card">
        <div className="adm-stat-label">Total usuarios</div>
        <div className="adm-stat-value">{total}</div>
      </div>
      <div className="adm-stat-card">
        <div className="adm-stat-label">Esta semana</div>
        <div className="adm-stat-value" style={{ color: 'var(--green)' }}>{thisWeek}</div>
      </div>
      <div className="adm-stat-card">
        <div className="adm-stat-label">Este mes</div>
        <div className="adm-stat-value" style={{ color: 'var(--blue)' }}>{thisMonth}</div>
      </div>
      <div className="adm-stat-card">
        <div className="adm-stat-label">Planes Pro</div>
        <div className="adm-stat-value" style={{ color: 'var(--accent)' }}>
          {users.filter(u => u.plan === 'pro').length}
        </div>
      </div>

      <BreakdownCard title="Por rol" data={roleStats} total={total} labelMap={ROLE_LABELS} />
      <BreakdownCard title="Por rubro" data={rubroStats} total={total} labelMap={RUBRO_LABELS} />
      <BreakdownCard title="Por plan" data={planStats} total={total} labelMap={{ free: 'Free', pro: 'Pro', enterprise: 'Enterprise' }} />

      <div className="adm-card adm-card-wide">
        <div className="adm-card-title">Registros recientes</div>
        {users.length === 0 ? (
          <div className="adm-empty">Sin registros todavía</div>
        ) : (
          <div className="adm-mini-list">
            {users.slice(0, 8).map((u, i) => (
              <div key={i} className="adm-mini-row">
                <span className="adm-mini-email">{u.email || '—'}</span>
                <span className="adm-mini-meta">{ROLE_LABELS[u.role] || u.role || '—'}</span>
                <span className="adm-mini-date">{fmtDate(u.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownCard({ title, data, total, labelMap = {} }) {
  return (
    <div className="adm-card">
      <div className="adm-card-title">{title}</div>
      {data.length === 0 ? (
        <div className="adm-empty">Sin datos</div>
      ) : (
        data.map(([key, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} className="adm-bar-row">
              <div className="adm-bar-header">
                <span className="adm-bar-label">{labelMap[key] || key}</span>
                <span className="adm-bar-count">{count} ({pct}%)</span>
              </div>
              <div className="adm-bar-track">
                <div className="adm-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Usuarios
// ═══════════════════════════════════════════════════════════════

function TabUsuarios({ users, onUpdatePlan, onDeleteUser }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchPlan = filterPlan === 'all' || (u.plan || 'free') === filterPlan;
    return matchSearch && matchRole && matchPlan;
  });

  return (
    <div>
      {/* Filters */}
      <div className="adm-filters">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="adm-filter-sel" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">Todos los roles</option>
          <option value="instalador">Instalador</option>
          <option value="profesional">Profesional</option>
          <option value="empresa">Empresa</option>
        </select>
        <select className="adm-filter-sel" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
          <option value="all">Todos los planes</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <div className="adm-filter-count">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol</th>
              <th>Rubro</th>
              <th>Plan</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="adm-table-empty">No se encontraron usuarios</td></tr>
            ) : (
              filtered.map((u, i) => {
                const plan = PLANS.find(p => p.id === (u.plan || 'free')) || PLANS[0];
                const uid = u.timestamp + (u.email || i);
                const isExpanded = expandedId === uid;

                return (
                  <motion.tr
                    key={uid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: i * 0.02 }}
                    className={isExpanded ? 'adm-row-expanded' : ''}
                  >
                    <td>
                      <div className="adm-user-email">{u.email || '—'}</div>
                      {u.screenWidth && (
                        <div className="adm-user-device">{u.screenWidth < 768 ? 'Mobile' : 'Desktop'}</div>
                      )}
                    </td>
                    <td>
                      <span className="adm-role-badge">{ROLE_LABELS[u.role] || u.role || '—'}</span>
                    </td>
                    <td>
                      <span className="adm-rubro-text">{RUBRO_LABELS[u.rubro] || u.rubro || '—'}</span>
                    </td>
                    <td>
                      <select
                        className="adm-plan-sel"
                        value={u.plan || 'free'}
                        onChange={(e) => onUpdatePlan(i, e.target.value)}
                        style={{ color: plan.color, background: plan.bg }}
                      >
                        {PLANS.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="adm-date-cell">{fmtDateTime(u.timestamp)}</td>
                    <td>
                      <div className="adm-actions-cell">
                        <button
                          className="adm-action-btn"
                          onClick={() => setExpandedId(isExpanded ? null : uid)}
                          title="Ver detalle"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                          </svg>
                        </button>
                        <button
                          className="adm-action-btn danger"
                          onClick={() => onDeleteUser(i)}
                          title="Eliminar usuario"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expandedId && (() => {
          const u = filtered.find((u, i) => (u.timestamp + (u.email || i)) === expandedId);
          if (!u) return null;
          return (
            <motion.div
              key="detail"
              className="adm-detail-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="adm-detail-grid">
                <DetailItem label="Email" value={u.email} />
                <DetailItem label="Rol" value={ROLE_LABELS[u.role] || u.role} />
                <DetailItem label="Rubro" value={RUBRO_LABELS[u.rubro] || u.rubro} />
                <DetailItem label="Escala" value={u.scale ? `${u.scale} proy/mes` : '—'} />
                <DetailItem label="Plan" value={(u.plan || 'free').toUpperCase()} />
                <DetailItem label="Registro" value={fmtDateTime(u.timestamp)} />
                <DetailItem label="Pantalla" value={u.screenWidth ? `${u.screenWidth}px` : '—'} />
                <DetailItem label="Dispositivo" value={u.screenWidth ? (u.screenWidth < 768 ? 'Mobile' : 'Desktop') : '—'} />
              </div>
              {u.problems && u.problems.length > 0 && (
                <div className="adm-detail-section">
                  <div className="adm-detail-label">Problemas identificados</div>
                  <div className="adm-detail-chips">
                    {u.problems.map(p => (
                      <span key={p} className="adm-detail-chip">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="adm-detail-item">
      <div className="adm-detail-label">{label}</div>
      <div className="adm-detail-value">{value || '—'}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Leads (analytics raw)
// ═══════════════════════════════════════════════════════════════

function TabLeads({ users }) {
  const problemCounts = {};
  users.forEach(u => {
    (u.problems || []).forEach(p => {
      problemCounts[p] = (problemCounts[p] || 0) + 1;
    });
  });
  const problemStats = Object.entries(problemCounts).sort((a, b) => b[1] - a[1]);

  const scaleStats = countBy(users, 'scale');
  const deviceStats = countBy(
    users.map(u => ({ ...u, device: (u.screenWidth || 0) < 768 ? 'Mobile' : 'Desktop' })),
    'device'
  );

  return (
    <div className="adm-grid">
      <BreakdownCard title="Problemas más frecuentes" data={problemStats.slice(0, 10)} total={users.length} />
      <BreakdownCard title="Volumen de trabajo" data={scaleStats} total={users.length} />
      <BreakdownCard title="Dispositivos" data={deviceStats} total={users.length} />

      <div className="adm-card adm-card-wide">
        <div className="adm-card-title">Timeline de registros</div>
        {users.length === 0 ? (
          <div className="adm-empty">Sin registros</div>
        ) : (
          <div className="adm-timeline">
            {users.slice(0, 20).map((u, i) => (
              <div key={i} className="adm-timeline-row">
                <div className="adm-timeline-dot" />
                <div className="adm-timeline-content">
                  <span className="adm-timeline-email">{u.email || 'Sin email'}</span>
                  <span className="adm-timeline-meta">
                    {ROLE_LABELS[u.role] || u.role} · {RUBRO_LABELS[u.rubro] || u.rubro}
                  </span>
                </div>
                <span className="adm-timeline-date">{fmtDateTime(u.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'leads', label: 'Leads' },
];

export default function AdminPanel({ onBack }) {
  const [tab, setTab] = useState('resumen');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(getLeads());
  }, []);

  const handleUpdatePlan = (index, plan) => {
    const updated = [...users];
    updated[index] = { ...updated[index], plan };
    setUsers(updated);
    saveLeads(updated);
  };

  const handleDeleteUser = (index) => {
    const user = users[index];
    if (!window.confirm(`¿Eliminar a ${user.email || 'este usuario'}? Esta acción no se puede deshacer.`)) return;
    const updated = users.filter((_, i) => i !== index);
    setUsers(updated);
    saveLeads(updated);
  };

  const handleExportCSV = () => {
    const headers = 'Fecha,Email,Rol,Rubro,Plan,Problemas,Escala,Dispositivo\n';
    const rows = users.map(u =>
      `${u.timestamp},${u.email},"${ROLE_LABELS[u.role] || u.role}","${RUBRO_LABELS[u.rubro] || u.rubro}","${u.plan || 'free'}","${(u.problems || []).join('; ')}","${u.scale || ''}",${u.screenWidth || ''}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metriq-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="adm">
      {/* Header */}
      <div className="adm-header">
        <div className="adm-header-left">
          <button className="adm-back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </button>
          <h1 className="adm-title">Panel de Administración</h1>
          <p className="adm-subtitle">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="adm-header-actions">
          <button className="adm-btn-outline" onClick={handleExportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`adm-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="adm-content"
        >
          {tab === 'resumen' && <TabResumen users={users} />}
          {tab === 'usuarios' && (
            <TabUsuarios
              users={users}
              onUpdatePlan={handleUpdatePlan}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {tab === 'leads' && <TabLeads users={users} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
