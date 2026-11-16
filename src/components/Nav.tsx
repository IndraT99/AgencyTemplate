export function Nav() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <a href="#top" className="nav-logo">
        Kolibrie
      </a>

      <div className="nav-pill">
        <a href="#team" className="nav-link">
          <span>About</span>
          <span className="draw-line" data-draw-line="" aria-hidden="true" />
        </a>
        <a href="#work" className="nav-link">
          <span>Work</span>
          <span className="draw-line" data-draw-line="" aria-hidden="true" />
        </a>
        <a href="#work" className="nav-link">
          <span>Services</span>
          <span className="draw-line" data-draw-line="" aria-hidden="true" />
        </a>
      </div>

      <a href="#team" className="nav-contact">
        <span className="nav-dot" aria-hidden="true" />
        <span>Contact</span>
      </a>
    </nav>
  );
}
