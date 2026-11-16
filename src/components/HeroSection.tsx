import { CropBox } from './CropBox';
import { MarqueeIcons } from './MarqueeIcons';
import {
  HERO_ARROW_PATH,
  HERO_CURSOR_CROPS,
  HERO_POSTER_URL,
} from '../lib/data';

export function HeroSection() {
  return (
    <section
      id="top"
      className="hero"
      data-cursor-cards=""
      data-cursor-threshold="300"
      data-testid="hero-section"
    >
      <video
        className="hero-video"
        data-hero-video=""
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        poster={HERO_POSTER_URL}
      />

      <div className="hero-card" data-cursor-card="" aria-hidden="true">
        <div className="hero-card-media" data-cursor-card-media="">
          {HERO_CURSOR_CROPS.map((item, idx) => (
            <CropBox
              key={item.crop}
              crop={item.crop}
              alt={item.alt}
              className={idx === 0 ? 'on' : ''}
            />
          ))}
        </div>
      </div>

      <div className="hero-content" data-text-reveal-group="">
        <h1
          className="t-hero"
          data-text-reveal="chars"
          data-font-weight-hover=""
          data-fw-rest="700"
          data-fw-near="200"
          data-fw-radius="400"
        >
          Stories that
          <br />
          get{' '}
          <span
            className="alt"
            data-font-weight-hover=""
            data-fw-rest="300"
            data-fw-near="800"
            data-fw-radius="400"
          >
            shared
          </span>
        </h1>

        <a href="#work" className="hero-link">
          <span className="hero-link-text">
            <span className="hero-link-label" data-text-reveal="lines">
              See the reel
            </span>
            <span
              className="draw-line"
              data-draw-line="always"
              aria-hidden="true"
            />
          </span>
          <span className="hero-arrow-box" aria-hidden="true">
            <span className="hero-arrow-copy hero-arrow-copy--top">
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d={HERO_ARROW_PATH} />
              </svg>
            </span>
            <span className="hero-arrow-copy hero-arrow-copy--base">
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d={HERO_ARROW_PATH} />
              </svg>
            </span>
          </span>
        </a>
      </div>

      <div
        className="hero-marquee"
        data-marquee=""
        data-marquee-direction="left"
        data-marquee-speed="30"
        data-marquee-scroll-speed="10"
        data-marquee-duplicate="2"
        aria-hidden="true"
      >
        <div className="hero-marquee-scroll" data-marquee-scroll="">
          <MarqueeIcons />
        </div>
      </div>
    </section>
  );
}
