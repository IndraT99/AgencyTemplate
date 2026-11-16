import type { CSSProperties } from 'react';
import { CropBox } from './CropBox';
import { TEAM_CARDS } from '../lib/data';

export function TeamSection() {
  return (
    <section
      id="team"
      className="team-section"
      data-page-theme="dark"
      data-testid="team-section"
    >
      <div className="team-sticky">
        <div className="team-title-wrap" data-scroll-reveal-group="">
          <div className="team-stamp" data-momentum-hover="">
            <div className="team-stamp-tilt">
              <svg viewBox="0 0 220 130" aria-hidden="true">
                <ellipse
                  cx="110"
                  cy="65"
                  rx="104"
                  ry="58"
                  fill="var(--cream)"
                  stroke="var(--tomato)"
                  strokeWidth="10"
                />
                <text
                  x="110"
                  y="81"
                  textAnchor="middle"
                  fill="var(--tomato)"
                  fontFamily="'Yellowtail', cursive"
                  fontSize="54"
                  transform="rotate(-8 110 65)"
                >
                  Kolibrie
                </text>
              </svg>
            </div>
          </div>

          <p className="t-eyebrow-m" data-scroll-reveal="lines">
            The people behind the frames
          </p>

          <h2
            className="t-section t-section--team"
            data-scroll-reveal="chars"
            data-font-weight-hover=""
            data-fw-rest="700"
            data-fw-near="200"
            data-fw-radius="400"
          >
            <span
              className="alt"
              data-font-weight-hover=""
              data-fw-rest="300"
              data-fw-near="800"
              data-fw-radius="400"
            >
              Meet
            </span>{' '}
            the{' '}
            <span
              className="alt"
              data-font-weight-hover=""
              data-fw-rest="300"
              data-fw-near="800"
              data-fw-radius="400"
            >
              flock
            </span>
          </h2>

          <p className="t-body team-body" data-scroll-reveal="lines">
            Twelve makers, one group chat. We shoot, cut and animate before the
            coffee goes cold.
          </p>
        </div>
      </div>

      <div className="team-photos">
        {TEAM_CARDS.map((card) => {
          const style: CSSProperties & Record<string, string> = {
            top: card.top,
            width: card.width,
            '--m-top': card.mobileTop,
          };
          if (card.side === 'left') {
            style.left = card.offset;
            style['--m-left'] = card.mobileEdge;
          } else {
            style.right = card.offset;
            style['--m-right'] = card.mobileEdge;
          }

          return (
            <div
              key={card.id}
              className="team-card"
              data-team-parallax=""
              data-speed={card.speed}
              style={style}
            >
              <div className="team-card-inertia" data-momentum-hover="">
                <div
                  className="team-card-tilt"
                  style={{ transform: `rotate(${card.rotate}deg)` }}
                >
                  <CropBox
                    crop={card.crop}
                    alt={card.name || card.btsCaption || 'Kolibrie team'}
                  />
                  {card.name && (
                    <span
                      className="team-name"
                      style={
                        {
                          '--name-rot': `${card.nameRotate ?? 0}deg`,
                        } as CSSProperties
                      }
                    >
                      {card.name}
                    </span>
                  )}
                  {card.btsCaption && (
                    <span className="team-bts">{card.btsCaption}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
