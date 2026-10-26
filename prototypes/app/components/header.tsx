import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Sentinel home">
        <svg width="30" height="34" viewBox="0 0 30 34" fill="none" aria-hidden="true">
          <path d="M15 2 28 9v13L15 32 2 22V9L15 2Z" stroke="currentColor" strokeWidth="2" />
          <path d="m8 20 7-11 7 11M11 17h8M15 22v5" stroke="currentColor" strokeWidth="2" />
        </svg>
        sentinel<span className="brand-period">.</span>
      </Link>
      <span className="header-note">Built around your peace of mind</span>
      <span className="prototype-badge"><span className="tiny-dot" /> Concept preview</span>
    </header>
  );
}
