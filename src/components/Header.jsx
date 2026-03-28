const ROLE_LABELS = {
  instalador: 'Instalador',
  profesional: 'Profesional',
  empresa: 'Empresa',
};

function UserAvatar({ user }) {
  const name = user?.nombre || user?.email || 'U';
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="hdr-avatar" title={user?.email || ''}>
      {user?.avatar_url
        ? <img src={user.avatar_url} alt={initial} className="hdr-avatar-img" referrerPolicy="no-referrer" />
        : <span>{initial}</span>
      }
    </div>
  );
}

export default function Header({ onLogoClick, user, onLogout, role, onToggleRole }) {
  const roleLabel = ROLE_LABELS[role] || 'PRO';
  const nextRole  = role === 'instalador' ? 'Profesional' : 'Instalador';

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
        <button className="hdr-role-toggle" onClick={onToggleRole} title="Cambiar vista de rol (testing)">
          <span className="hdr-role-toggle-dot" />
          Ver como {nextRole} →
        </button>

        <div className="hdr-pill">{roleLabel}</div>

        {user && (
          <>
            <UserAvatar user={user} />
            <button className="hdr-logout" onClick={onLogout} title="Cerrar sesión">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
