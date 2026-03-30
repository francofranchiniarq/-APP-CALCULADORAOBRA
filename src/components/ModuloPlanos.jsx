import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// Mock Data — 3 planos de ejemplo
// ═══════════════════════════════════════════════════════════════
const MOCK_PLANOS = [
  {
    id: 1,
    nombre: 'PL-Instalacion-Sanitaria-PB.pdf',
    tipo: 'pdf',
    disciplina: 'Sanitaria',
    disciplinaCls: 'pl-badge-blue',
    estado: 'Aprobado',
    estadoCls: 'pl-badge-green',
    version: 'v2',
    size: '4.2 MB',
    updatedDays: 2,
  },
  {
    id: 2,
    nombre: 'PL-Arquitectura-Planta-Alta.pdf',
    tipo: 'pdf',
    disciplina: 'Arquitectura',
    disciplinaCls: 'pl-badge-accent',
    estado: 'Para Revisión',
    estadoCls: 'pl-badge-amber',
    version: 'v3',
    size: '8.7 MB',
    updatedDays: 7,
  },
  {
    id: 3,
    nombre: 'PL-Estructura-Fundaciones.png',
    tipo: 'img',
    disciplina: 'Estructura',
    disciplinaCls: 'pl-badge-amber',
    estado: 'Borrador',
    estadoCls: 'pl-badge-gray',
    version: 'v1',
    size: '1.3 MB',
    updatedDays: 12,
  },
];

// ═══════════════════════════════════════════════════════════════
// Iconos SVG inline
// ═══════════════════════════════════════════════════════════════
const PdfThumb = () => (
  <div className="pl-thumb pl-thumb-pdf">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="12" y2="17"/>
    </svg>
    <span>PDF</span>
  </div>
);

const ImgThumb = () => (
  <div className="pl-thumb pl-thumb-img">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
    <span>IMG</span>
  </div>
);

const UploadIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function versionLabel(version, days) {
  if (days === 0) return `${version} · Subido hoy`;
  if (days === 1) return `${version} · Actualizado ayer`;
  return `${version} · Actualizado hace ${days} días`;
}

// ═══════════════════════════════════════════════════════════════
// PlanCard — tarjeta individual de plano
// ═══════════════════════════════════════════════════════════════
function PlanCard({ plano, index, openMenuId, onToggleMenu, onProcessAI, onDelete, onDownload, onUpdateVersion }) {
  const isMenuOpen = openMenuId === plano.id;
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onToggleMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen, onToggleMenu]);

  return (
    <motion.div
      className="pl-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.07 }}
      layout
    >
      {/* ── Cabecera de la tarjeta: thumb + kebab ── */}
      <div className="pl-card-top">
        {plano.tipo === 'pdf' ? <PdfThumb /> : <ImgThumb />}

        <div className="pl-kebab-wrap" ref={menuRef}>
          <button
            className="pl-kebab-btn"
            onClick={() => onToggleMenu(isMenuOpen ? null : plano.id)}
            title="Más acciones"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5"  r="1.8"/>
              <circle cx="12" cy="12" r="1.8"/>
              <circle cx="12" cy="19" r="1.8"/>
            </svg>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="pl-kebab-menu"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -4,  scale: 0.97 }}
                transition={{ duration: 0.13 }}
              >
                <button className="pl-kebab-item" onClick={() => onDownload(plano)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar
                </button>
                <button className="pl-kebab-item" onClick={() => onUpdateVersion(plano)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  Actualizar Versión
                </button>
                <div className="pl-kebab-divider" />
                <button className="pl-kebab-item pl-kebab-danger" onClick={() => onDelete(plano.id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Cuerpo: nombre, badges, versión ── */}
      <div className="pl-card-body">
        <div className="pl-card-name" title={plano.nombre}>{plano.nombre}</div>

        <div className="pl-badges">
          <span className={`pl-badge ${plano.disciplinaCls}`}>{plano.disciplina}</span>
          <span className={`pl-badge ${plano.estadoCls}`}>{plano.estado}</span>
        </div>

        <div className="pl-version">{versionLabel(plano.version, plano.updatedDays)}</div>
      </div>

      {/* ── CTA principal: Procesar con IA ── */}
      <button className="pl-ai-btn" onClick={() => onProcessAI(plano)}>
        <span className="pl-ai-spark">✨</span>
        Procesar con IA
        <span className="pl-ai-sub">(Cómputo)</span>
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ModuloPlanos — componente principal
// ═══════════════════════════════════════════════════════════════
export default function ModuloPlanos({ onBack, project }) {
  const [planos, setPlanos]       = useState(MOCK_PLANOS);
  const [isDragging, setIsDragging] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef  = useRef(null);

  // ── Procesar archivos recibidos ──────────────────────────────
  const handleFiles = (files) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const validFiles = files.filter(f => validTypes.includes(f.type));
    if (!validFiles.length) return;

    const newPlanos = validFiles.map((f, i) => ({
      id: Date.now() + i,
      nombre: f.name,
      tipo: f.type === 'application/pdf' ? 'pdf' : 'img',
      disciplina: 'Sin clasificar',
      disciplinaCls: 'pl-badge-gray',
      estado: 'Borrador',
      estadoCls: 'pl-badge-gray',
      version: 'v1',
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      updatedDays: 0,
    }));
    setPlanos(prev => [...newPlanos, ...prev]);
  };

  // ── Drag & Drop handlers ─────────────────────────────────────
  const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => {
    e.preventDefault();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  // ── Acciones de tarjeta ──────────────────────────────────────
  const handleProcessAI = (plano) => {
    console.log('✨ Procesar con IA (Cómputo):', plano);
  };

  const handleDelete = (id) => {
    setPlanos(prev => prev.filter(p => p.id !== id));
    setOpenMenuId(null);
  };

  const handleDownload = (plano) => {
    console.log('Descargar:', plano.nombre);
    setOpenMenuId(null);
  };

  const handleUpdateVersion = (plano) => {
    console.log('Actualizar versión:', plano.nombre);
    setOpenMenuId(null);
  };

  return (
    <motion.div
      className="planos-wrap"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* ══ Encabezado del módulo ══════════════════════════════ */}
      <div className="planos-header">
        <button className="calc-back" onClick={onBack}>← Volver</button>

        <div className="planos-title-row">
          <div className="planos-module-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8"  y1="2"  x2="8"  y2="18"/>
              <line x1="16" y1="6"  x2="16" y2="22"/>
            </svg>
          </div>
          <div>
            <h1 className="planos-main-title">Planos y Documentación</h1>
            <p className="planos-main-sub">
              {project ? project.nombre : 'Gestión centralizada de planos del proyecto'}
            </p>
          </div>
        </div>
      </div>

      {/* ══ Zona de carga Drag & Drop ══════════════════════════ */}
      <div
        ref={dropZoneRef}
        className={`planos-dropzone${isDragging ? ' pl-dz-active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(Array.from(e.target.files))}
        />

        <div className="pl-dz-icon-wrap">
          <UploadIcon />
        </div>

        <p className="pl-dz-text">
          Arrastrá tus planos aquí o{' '}
          <span className="pl-dz-link">hacé clic para explorar</span>
        </p>
        <p className="pl-dz-sub">PDF, JPG, PNG · Máximo 50 MB por archivo</p>

        <div className="pl-dz-types">
          <span>PDF</span>
          <span>JPG</span>
          <span>PNG</span>
        </div>
      </div>

      {/* ══ Grilla de planos ═══════════════════════════════════ */}
      {planos.length > 0 && (
        <>
          <div className="dash-section-label" style={{ marginTop: 20 }}>
            {planos.length} plano{planos.length !== 1 ? 's' : ''} cargado{planos.length !== 1 ? 's' : ''}
          </div>

          <motion.div className="planos-grid" layout>
            {planos.map((plano, i) => (
              <PlanCard
                key={plano.id}
                plano={plano}
                index={i}
                openMenuId={openMenuId}
                onToggleMenu={setOpenMenuId}
                onProcessAI={handleProcessAI}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onUpdateVersion={handleUpdateVersion}
              />
            ))}
          </motion.div>
        </>
      )}

      {/* ══ Estado vacío ═══════════════════════════════════════ */}
      {planos.length === 0 && (
        <motion.div
          className="planos-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="planos-empty-icon">🗂️</div>
          <div className="planos-empty-text">Ningún plano cargado todavía</div>
          <div className="planos-empty-sub">Subí el primer plano del proyecto usando el área de arriba.</div>
        </motion.div>
      )}
    </motion.div>
  );
}
