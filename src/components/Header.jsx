import { useState, useRef, useEffect } from 'react';
import { getUserPlan } from '../modules/plans';

const ROLE_LABELS = {
  instalador: 'Instalador',
  profesional: 'Profesional',
  empresa: 'Empresa',
};

export default function Header({ onLogoClick, user, onLogout, onUpdateUser, role, onToggleRole }) {
  const roleLabel = ROLE_LABELS[role] || 'PRO';
  const nextRole  = role === 'instalador' ? 'Profesional' : 'Instalador';
  const plan = getUserPlan(user);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || '';
  const userInitial = (userName[0] || 'U').toUpperCase();

  return (
    <header className="hdr">
      <div className="hdr-l" onClick={onLogoClick}>
        <div className="hdr-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 21V8l9-5 9 5v13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21v-6h6v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12h10M7 15.5h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </div>
        <div className="hdr-name">METR<span>IQ</span></div>
      </div>

      <div className="hdr-r">
        {/* Toggle temporal para testing de roles */}
        <button className="hdr-role-toggle" onClick={onToggleRole} title="Cambiar vista de rol (testing)">
          <span className="hdr-role-toggle-dot" />
          Ver como {nextRole}
        </button>

        <div className="hdr-pill">{roleLabel}</div>

        {/* User Menu */}
        {user && (
          <div className="hdr-user-menu" ref={menuRef}>
            <button
              className="hdr-avatar-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              title={userName}
            >
              <div className="hdr-avatar">
                {userInitial}
              </div>
            </button>

            {menuOpen && (
              <div className="hdr-dropdown">
                <div className="hdr-dropdown-header">
                  <div className="hdr-dropdown-avatar">{userInitial}</div>
                  <div className="hdr-dropdown-info">
                    <div className="hdr-dropdown-name">{userName}</div>
                    {userEmail && <div className="hdr-dropdown-email">{userEmail}</div>}
                  </div>
                </div>

                <div className="hdr-dropdown-divider" />

                <div className="hdr-dropdown-plan">
                  <span className="hdr-dropdown-plan-label">Plan</span>
                  <span className="hdr-dropdown-plan-badge" style={{ background: plan.bg, color: plan.color }}>
                    {plan.label}
                  </span>
                </div>

                <div className="hdr-dropdown-divider" />

                <button className="hdr-dropdown-item" onClick={() => { setMenuOpen(false); window.location.href = '/admin'; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Administración
                </button>

                <div className="hdr-dropdown-divider" />

                <button className="hdr-dropdown-item hdr-dropdown-logout" onClick={() => { setMenuOpen(false); onLogout(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
