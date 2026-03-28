export default function Header({ onLogoClick }) {
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
      <div className="hdr-pill">PRO</div>
    </header>
  );
}
