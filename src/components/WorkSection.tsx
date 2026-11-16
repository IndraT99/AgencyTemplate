import { CropBox } from './CropBox';
import { WORK_SLIDES } from '../lib/data';

const BADGE_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export function WorkSection() {
  return (
    <section
      id="work"
      className="work-section"
      data-featured-stack=""
      data-scroll-factor="1.2"
      data-testid="work-section"
    >
      <div className="work-pin" data-featured-pin="">
        <div className="work-copy" data-scroll-reveal-group="">
          <p className="t-eyebrow-s work-eyebrow" data-scroll-reveal="lines">
            Made to be watched twice. A handful of what left our edit desk
            lately.
          </p>
          <h2
            className="t-section"
            data-scroll-reveal="chars"
            data-font-weight-hover=""
            data-fw-rest="700"
            data-fw-near="200"
            data-fw-radius="400"
          >
            Latest{' '}
            <span
              className="alt"
              data-font-weight-hover=""
              data-fw-rest="300"
              data-fw-near="800"
              data-fw-radius="400"
            >
              drops
            </span>
          </h2>
        </div>

        <div className="work-stage">
          <div className="work-stack-root" data-stack-root="">
            {WORK_SLIDES.map((slide) => (
              <a
                key={slide.id}
                href="#work"
                className="work-slide"
                data-stack-slide=""
                data-cursor-marquee-text="View case →"
                style={{ backgroundColor: slide.color }}
              >
                <CropBox crop={slide.crop} alt={slide.title} />
                <span className="work-slide-gradient" aria-hidden="true" />
                <span className="work-slide-title">{slide.title}</span>
              </a>
            ))}
          </div>

          <div className="work-badge" data-stack-badge="" aria-hidden="true">
            <svg viewBox="0 0 200 200">
              <defs>
                <path
                  id="kolibrie-badge-ring"
                  d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                />
              </defs>
              <circle cx="100" cy="100" r="98" fill="var(--tomato)" />
              <text className="work-badge-text">
                <textPath
                  href="#kolibrie-badge-ring"
                  startOffset="0%"
                  textLength="436"
                  lengthAdjust="spacing"
                >
                  SCROLL · SAVE · SHARE · REPEAT ·
                </textPath>
              </text>
              <circle
                cx="100"
                cy="100"
                r="17"
                fill="none"
                stroke="var(--cream)"
                strokeWidth="5"
              />
              {BADGE_RAYS.map((deg) => (
                <line
                  key={deg}
                  x1="100"
                  y1="73"
                  x2="100"
                  y2="62"
                  stroke="var(--cream)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
