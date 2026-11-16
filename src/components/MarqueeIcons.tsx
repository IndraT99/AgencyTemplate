export function MarqueeIcons() {
  return (
    <div className="hero-marquee-collection" data-marquee-collection="">
      {/* 1. Six-spoke asterisk of round-capped strokes */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="8" strokeLinecap="round">
            <line x1="40" y1="10" x2="40" y2="70" />
            <line x1="14" y1="25" x2="66" y2="55" />
            <line x1="66" y1="25" x2="14" y2="55" />
          </g>
        </svg>
      </div>

      {/* 2. Two capsule "D" shapes side by side */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <path d="M12 16h12a24 24 0 0 1 0 48H12V16Z" fill="currentColor" />
          <path d="M44 16h12a24 24 0 0 1 0 48H44V16Z" fill="currentColor" />
        </svg>
      </div>

      {/* 3. Three wavy lines */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="6.5" strokeLinecap="round">
            <path d="M10 22c8-8 16-8 24 0s16 8 24 0 12-4 12-4" />
            <path d="M10 40c8-8 16-8 24 0s16 8 24 0 12-4 12-4" />
            <path d="M10 58c8-8 16-8 24 0s16 8 24 0 12-4 12-4" />
          </g>
        </svg>
      </div>

      {/* 4. Four diamonds in a diamond pattern */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <polygon points="40,8 52,20 40,32 28,20" fill="currentColor" />
          <polygon points="60,28 72,40 60,52 48,40" fill="currentColor" />
          <polygon points="40,48 52,60 40,72 28,60" fill="currentColor" />
          <polygon points="20,28 32,40 20,52 8,40" fill="currentColor" />
        </svg>
      </div>

      {/* 5. Half sun over three bars */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <path d="M16 40a24 24 0 0 1 48 0H16Z" fill="currentColor" />
          <rect x="12" y="46" width="56" height="6" rx="3" fill="currentColor" />
          <rect x="18" y="56" width="44" height="6" rx="3" fill="currentColor" />
          <rect x="26" y="66" width="28" height="6" rx="3" fill="currentColor" />
        </svg>
      </div>

      {/* 6. Two arches */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <path
            d="M12 64V38a14 14 0 0 1 28 0v26h-10V38a4 4 0 0 0-8 0v26H12Zm28 0V38a14 14 0 0 1 28 0v26h-10V38a4 4 0 0 0-8 0v26H40Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* 7. Four-point sparkle star */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <path
            d="M40 6C43 26 54 37 74 40C54 43 43 54 40 74C37 54 26 43 6 40C26 37 37 26 40 6Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* 8. Circle with a cross inside */}
      <div className="hero-marquee-item">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="7" />
          <line x1="40" y1="14" x2="40" y2="66" stroke="currentColor" strokeWidth="7" />
          <line x1="14" y1="40" x2="66" y2="40" stroke="currentColor" strokeWidth="7" />
        </svg>
      </div>
    </div>
  );
}
