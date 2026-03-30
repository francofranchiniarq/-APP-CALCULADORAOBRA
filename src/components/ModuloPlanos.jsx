import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── SVG Icons ──────────────────────────────────────────────────

const IconPDF = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IconImage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const IconUploadCloud = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const IconDots = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="5" r="1.2"/>
    <circle cx="12" cy="12" r="1.2"/>
    <circle cx="12" cy="19" r="1.2"/>
  </svg>
);

const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconVersion = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const IconRefreshVersion = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconWarn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ── Badge config ───────────────────────────────────────────────

const DISC_CONFIG = {
  'Arquitectura':   { bg: 'rgba(29,78,216,0.08)',  color: '#1D4ED8' },
  'Sanitaria':      { bg: 'rgba(21,128,61,0.08)',  color: '#15803D' },
  'Estructural':    { bg: 'rgba(180,83,9,0.09)',   color: '#B45309' },
  'Eléctrica':      { bg: 'rgba(180,83,9,0.09)',   color: '#B45309' },
  'Gas':            { bg: 'rgba(168,16,46,0.07)',  color: '#A8102E' },
  'Sin clasificar': { bg: 'rgba(87,83,78,0.08)',   color: '#57534E' },
};

const ESTADO_CONFIG = {
  'Aprobado':       { bg: 'rgba(21,128,61,0.08)',  color: '#15803D' },
  'Para Revisión':  { bg: 'rgba(180,83,9,0.09)',   color: '#B45309' },
  'Borrador':       { bg: 'rgba(87,83,78,0.08)',   color: '#57534E' },
};

// ── Mock data ──────────────────────────────────────────────────

const MOCK_PLANOS = [
  {
    id: 1,
    nombre: 'PL-Arquitectura-PB.pdf',
    tipo: 'pdf',
    disciplina: 'Arquitectura',
    estado: 'Aprobado',
    version: 'v3',
    updatedAgo: 'hace 1 día',
    size: '2.4 MB',
  },
  {
    id: 2,
    nombre: 'PL-Instalacion-Sanitaria-PB.pdf',
    tipo: 'pdf',
    disciplina: 'Sanitaria',
    estado: 'Para Revisión',
    version: 'v2',
    updatedAgo: 'hace 2 días',
    size: '1.8 MB',
  },
  {
    id: 3,
    nombre: 'PL-Estructura-Metalica-PP.pdf',
    tipo: 'pdf',
    disciplina: 'Estructural',
    estado: 'Aprobado',
    version: 'v1',
    updatedAgo: 'hace 5 días',
    size: '3.1 MB',
  },
  {
    id: 4,
    nombre: 'IMG-Fachada-Principal.jpg',
    tipo: 'img',
    disciplina: 'Arquitectura',
    estado: 'Borrador',
    version: 'v1',
    updatedAgo: 'hace 1 semana',
    size: '890 KB',
  },
  {
    id: 5,
    nombre: 'PL-Instalacion-Electrica-PB.pdf',
    tipo: 'pdf',
    disciplina: 'Eléctrica',
    estado: 'Para Revisión',
    version: 'v2',
    updatedAgo: 'hace 3 días',
    size: '1.2 MB',
  },
];

let _uid = 2000;
const uid = () => ++_uid;

// ── Component ──────────────────────────────────────────────────

export default function ModuloPlanos({ project, onBack }) {
  const [planos, setPlanos] = useState(MOCK_PLANOS);
  const [isDragging, setIsDragging] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Close kebab on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const close = (e) => {
      if (!e.target.closest('.planos-kebab-wrap')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openMenuId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Drag & Drop ────────────────────────────────────────────

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileChange = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const addFiles = (files) => {
    const VALID_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
    const valid = files.filter(f => VALID_TYPES.includes(f.type));

    if (!valid.length) {
      setToast({ type: 'warn', msg: 'Formato no soportado. Usá PDF, JPG o PNG.' });
      return;
    }

    const newPlanos = valid.map(f => ({
      id: uid(),
      nombre: f.name,
      tipo: f.type === 'application/pdf' ? 'pdf' : 'img',
      disciplina: 'Sin clasificar',
      estado: 'Borrador',
      version: 'v1',
      updatedAgo: 'ahora',
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));

    setPlanos(prev => [...newPlanos, ...prev]);
    setToast({
      type: 'success',
      msg: `${valid.length} plano${valid.length > 1 ? 's' : ''} cargado${valid.length > 1 ? 's' : ''} correctamente.`,
    });
  };

  // ── Card Actions ───────────────────────────────────────────

  const handleProcesarIA = (plano) => {
    console.log('[METRIQ IA] Enviando plano al motor de cómputo:', plano);
    setToast({ type: 'ia', msg: `Procesando "${plano.nombre}" con IA...` });
    setOpenMenuId(null);
  };

  const handleDescargar = (plano) => {
    console.log('[METRIQ] Descargando:', plano.nombre);
    setOpenMenuId(null);
    setToast({ type: 'success', msg: `Descargando "${plano.nombre}"...` });
  };

  const handleActualizarVersion = (plano) => {
    console.log('[METRIQ] Actualizando versión de:', plano.nombre);
    setPlanos(prev => prev.map(p =>
      p.id === plano.id
        ? { ...p, version: `v${parseInt(p.version.slice(1)) + 1}`, updatedAgo: 'ahora' }
        : p
    ));
    setOpenMenuId(null);
    setToast({ type: 'success', msg: `Versión de "${plano.nombre}" actualizada.` });
  };

  const handleEliminar = (id) => {
    const plano = planos.find(p => p.id === id);
    setPlanos(prev => prev.filter(p => p.id !== id));
    setOpenMenuId(null);
    setToast({ type: 'warn', msg: `"${plano?.nombre}" eliminado.` });
  };

  // ── Stats ──────────────────────────────────────────────────

  const total      = planos.length;
  const aprobados  = planos.filter(p => p.estado === 'Aprobado').length;
  const pendientes = planos.filter(p => p.estado === 'Para Revisión').length;

  const projectName = project?.nombre || project?.name || null;

  return (
    <motion.div
      className="planos-root"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      {onBack && (
        <button className="calc-back" onClick={onBack}>← Volver</button>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="calc-header-card">
        <div className="planos-header-left">
          <div className="planos-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <line x1="9" y1="22" x2="9" y2="12"/>
              <line x1="15" y1="22" x2="15" y2="12"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
            </svg>
          </div>
          <div>
            <h1 className="calc-title">Planos y Documentación</h1>
            <div className="calc-subtitle">
              {projectName ? `${projectName} · ` : ''}Gestión de planos y cómputo con IA
            </div>
          </div>
        </div>

        <div className="agua-summary-pills">
          <div className="agua-pill">
            <div className="agua-pill-val">{total}</div>
            <div className="agua-pill-label">Total</div>
          </div>
          <div className="agua-pill">
            <div className="agua-pill-val planos-stat-green">{aprobados}</div>
            <div className="agua-pill-label">Aprobados</div>
          </div>
          <div className="agua-pill">
            <div className="agua-pill-val planos-stat-amber">{pendientes}</div>
            <div className="agua-pill-label">En revisión</div>
          </div>
        </div>
      </div>

      {/* ── Drop Zone ──────────────────────────────────────── */}
      <div
        className={`planos-dropzone${isDragging ? ' planos-dropzone-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className={`planos-dz-icon${isDragging ? ' planos-dz-icon-active' : ''}`}>
          <IconUploadCloud />
        </div>
        <div className="planos-dz-text">
          {isDragging
            ? 'Soltá los archivos aquí'
            : 'Arrastrá tus planos aquí o hacé clic para explorar'}
        </div>
        <div className="planos-dz-sub">PDF, JPG, PNG · Máx. 50 MB por archivo</div>
        <div className="planos-dz-pill">Seleccionar archivos</div>
      </div>

      {/* ── Grid Header ────────────────────────────────────── */}
      {planos.length > 0 && (
        <div className="planos-grid-hdr">
          <div className="planos-grid-title">Planos del Proyecto</div>
          <div className="planos-count-badge">
            {planos.length} archivo{planos.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Cards ──────────────────────────────────────────── */}
      {planos.length === 0 ? (
        <div className="planos-empty">
          <div className="planos-empty-icon">📂</div>
          <div className="planos-empty-text">No hay planos cargados aún</div>
          <div className="planos-empty-sub">Usá la zona de carga de arriba para agregar tus planos.</div>
        </div>
      ) : (
        <div className="planos-grid">
          <AnimatePresence>
            {planos.map((plano, i) => {
              const disc   = DISC_CONFIG[plano.disciplina]  || DISC_CONFIG['Sin clasificar'];
              const estado = ESTADO_CONFIG[plano.estado]    || ESTADO_CONFIG['Borrador'];
              const isPDF  = plano.tipo === 'pdf';

              return (
                <motion.div
                  key={plano.id}
                  className="planos-card"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={   { opacity: 0, scale: 0.96, x: 16 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.04, 0.2) }}
                  layout
                >
                  {/* Top: thumb + info */}
                  <div className="planos-card-top">
                    <div className={`planos-card-thumb${isPDF ? ' planos-thumb-pdf' : ' planos-thumb-img'}`}>
                      {isPDF ? <IconPDF /> : <IconImage />}
                      <span className="planos-thumb-ext">
                        {isPDF ? 'PDF' : plano.nombre.split('.').pop().toUpperCase()}
                      </span>
                    </div>

                    <div className="planos-card-info">
                      <div className="planos-card-name" title={plano.nombre}>
                        {plano.nombre}
                      </div>
                      <div className="planos-card-badges">
                        <span
                          className="planos-badge"
                          style={{ background: disc.bg, color: disc.color }}
                        >
                          {plano.disciplina}
                        </span>
                        <span
                          className="planos-badge"
                          style={{ background: estado.bg, color: estado.color }}
                        >
                          {plano.estado}
                        </span>
                      </div>
                      <div className="planos-card-meta">
                        <span className="planos-ver">
                          <IconVersion />
                          {plano.version}
                        </span>
                        <span className="planos-dot">·</span>
                        <span className="planos-meta-dim">Actualizado {plano.updatedAgo}</span>
                        <span className="planos-dot">·</span>
                        <span className="planos-meta-dim">{plano.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="planos-card-divider" />

                  {/* Bottom: actions */}
                  <div className="planos-card-actions">
                    <button
                      className="planos-btn-ia"
                      onClick={() => handleProcesarIA(plano)}
                    >
                      <span className="planos-ia-spark">✨</span>
                      Procesar con IA (Cómputo)
                    </button>

                    <div className="planos-kebab-wrap">
                      <button
                        className="planos-kebab-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === plano.id ? null : plano.id);
                        }}
                        title="Más opciones"
                        aria-label="Más opciones"
                      >
                        <IconDots />
                      </button>

                      <AnimatePresence>
                        {openMenuId === plano.id && (
                          <motion.div
                            className="planos-kebab-menu"
                            initial={{ opacity: 0, scale: 0.92, y: -4 }}
                            animate={{ opacity: 1, scale: 1,    y: 0  }}
                            exit={   { opacity: 0, scale: 0.92, y: -4 }}
                            transition={{ duration: 0.13 }}
                          >
                            <button
                              className="planos-kebab-item"
                              onClick={() => handleDescargar(plano)}
                            >
                              <IconDownload />
                              Descargar
                            </button>
                            <button
                              className="planos-kebab-item"
                              onClick={() => handleActualizarVersion(plano)}
                            >
                              <IconRefreshVersion />
                              Actualizar Versión
                            </button>
                            <div className="planos-kebab-sep" />
                            <button
                              className="planos-kebab-item planos-kebab-danger"
                              onClick={() => handleEliminar(plano.id)}
                            >
                              <IconTrash />
                              Eliminar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`planos-toast planos-toast-${toast.type}`}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={   { opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.2 }}
          >
            {toast.type === 'success' && <IconCheck />}
            {toast.type === 'warn'    && <IconWarn />}
            {toast.type === 'ia'      && <span style={{ fontSize: 13 }}>✨</span>}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
