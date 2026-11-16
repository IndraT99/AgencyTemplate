import { computeCropLayout } from './crop';
import { DRAW_LINE_PATHS, HERO_VIDEO_URL } from './data';
import {
  computeFontWeightTarget,
  computeHeroCounterDrift,
  computeInertiaImpulse,
  computeMarqueeDuration,
  computeStackTilt,
  rewriteVariationSettings,
  stepHeroCardTravel,
} from './motionMath';

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    SplitText?: any;
    DrawSVGPlugin?: any;
    InertiaPlugin?: any;
    Lenis?: any;
  }
}

export function initKolibrie(): () => void {
  const cleanups: Array<() => void> = [];
  const docEl = document.documentElement;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineHoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  const revealEverythingFallback = () => {
    docEl.setAttribute('data-page-ready', '');
    const main = document.querySelector('main') as HTMLElement | null;
    if (main) {
      main.style.visibility = 'visible';
      main.style.opacity = '1';
    }
    document
      .querySelectorAll<HTMLElement>('[data-text-reveal], [data-scroll-reveal]')
      .forEach((el) => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
    document
      .querySelector('[data-load-wipe]')
      ?.setAttribute('data-transition-ready', '');
  };

  // Failsafe 4 seconds
  const failsafeTimer = window.setTimeout(revealEverythingFallback, 4000);
  cleanups.push(() => window.clearTimeout(failsafeTimer));

  // Populate any plain [data-crop] element lacking .cell (ensures script-driven support as well)
  document.querySelectorAll<HTMLElement>('[data-crop]').forEach((box) => {
    if (!box.querySelector('.cell')) {
      const spec = box.getAttribute('data-crop');
      if (!spec) return;
      const layout = computeCropLayout(spec);
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.setProperty('--ar', String(layout.aspectRatio));
      const img = document.createElement('img');
      img.src = layout.url;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.style.width = `${layout.widthPct}%`;
      img.style.height = `${layout.heightPct}%`;
      img.style.left = `${layout.leftPct}%`;
      img.style.top = `${layout.topPct}%`;
      cell.appendChild(img);
      box.appendChild(cell);
    }
  });

  // Hero video reduced-motion toggle
  const heroVideo = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  const syncHeroVideo = () => {
    if (!heroVideo) return;
    if (reducedMotionQuery.matches) {
      if (heroVideo.hasAttribute('src')) {
        heroVideo.removeAttribute('src');
        heroVideo.load();
      }
    } else {
      if (heroVideo.getAttribute('src') !== HERO_VIDEO_URL) {
        heroVideo.src = HERO_VIDEO_URL;
      }
      heroVideo.play().catch(() => {});
    }
  };
  syncHeroVideo();
  reducedMotionQuery.addEventListener('change', syncHeroVideo);
  cleanups.push(() => reducedMotionQuery.removeEventListener('change', syncHeroVideo));

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  const DrawSVGPlugin = window.DrawSVGPlugin;
  const InertiaPlugin = window.InertiaPlugin;
  const Lenis = window.Lenis;

  // If GSAP fails to load, make everything visible immediately
  if (!gsap || !ScrollTrigger) {
    revealEverythingFallback();
    return () => cleanups.forEach((fn) => fn());
  }

  gsap.registerPlugin(
    ...[ScrollTrigger, SplitText, DrawSVGPlugin, InertiaPlugin].filter(Boolean),
  );

  let lenis: any = null;
  const splitMap = new WeakMap<Element, any>();
  let systemsInitialized = false;

  // 6.1 Smooth scroll (Lenis)
  if (Lenis && !reducedMotionQuery.matches) {
    lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    lenis.on('scroll', ScrollTrigger.update);
    const tickLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(tickLenis);
      lenis.destroy();
    });
  }

  // Smooth anchor scrolling
  const onAnchorClick = (e: Event) => {
    const anchor = (e.target as Element | null)?.closest('a[href^="#"]') as
      | HTMLAnchorElement
      | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    if (lenis && !reducedMotionQuery.matches) {
      lenis.scrollTo(target, { duration: 1.4 });
    } else {
      target.scrollIntoView({
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
      });
    }
  };
  document.addEventListener('click', onAnchorClick);
  cleanups.push(() => document.removeEventListener('click', onAnchorClick));

  // 6.5 Draw underline helper
  let drawVariantIdx = Math.floor(Math.random() * DRAW_LINE_PATHS.length);
  const nextDrawPath = () => {
    const d = DRAW_LINE_PATHS[drawVariantIdx % DRAW_LINE_PATHS.length];
    drawVariantIdx += 1;
    return d;
  };

  const createDrawSvg = (d: string) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 310 40');
    svg.setAttribute('preserveAspectRatio', 'none');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '10');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return { svg, path };
  };

  const initDrawLines = () => {
    document.querySelectorAll<HTMLElement>('[data-draw-line]').forEach((box) => {
      const mode = box.getAttribute('data-draw-line');
      if (mode === 'always') {
        const triggerAlways = () => {
          if (box.querySelector('svg')) return;
          const { svg, path } = createDrawSvg(nextDrawPath());
          box.appendChild(svg);
          if (DrawSVGPlugin && !reducedMotionQuery.matches) {
            gsap.fromTo(
              path,
              { drawSVG: '0%' },
              { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' },
            );
          }
        };
        if (reducedMotionQuery.matches) {
          triggerAlways();
        } else {
          const timer = gsap.delayedCall(1.3, triggerAlways);
          cleanups.push(() => timer.kill());
        }
        return;
      }

      const host = box.parentElement;
      if (!host) return;
      let currentSvg: SVGSVGElement | null = null;
      let drawInTween: any = null;
      let pendingLeave = false;

      const startErase = (svg: SVGSVGElement, path: SVGPathElement) => {
        if (!DrawSVGPlugin) {
          svg.remove();
          if (currentSvg === svg) currentSvg = null;
          return;
        }
        gsap.to(path, {
          drawSVG: '100% 100%',
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            svg.remove();
            if (currentSvg === svg) currentSvg = null;
          },
        });
      };

      const onEnter = () => {
        pendingLeave = false;
        if (currentSvg) {
          currentSvg.remove();
          currentSvg = null;
        }
        const { svg, path } = createDrawSvg(nextDrawPath());
        box.appendChild(svg);
        currentSvg = svg;

        if (DrawSVGPlugin) {
          drawInTween = gsap.fromTo(
            path,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: () => {
                drawInTween = null;
                if (pendingLeave && currentSvg === svg) {
                  pendingLeave = false;
                  startErase(svg, path);
                }
              },
            },
          );
        }
      };

      const onLeave = () => {
        if (!currentSvg) return;
        const svg = currentSvg;
        const path = svg.querySelector('path');
        if (!path) return;
        if (drawInTween && drawInTween.isActive()) {
          pendingLeave = true;
        } else {
          startErase(svg, path);
        }
      };

      host.addEventListener('mouseenter', onEnter);
      host.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        host.removeEventListener('mouseenter', onEnter);
        host.removeEventListener('mouseleave', onLeave);
      });
    });
  };

  // 6.3 Load text reveal
  const runTextReveals = (baseDelay: number) => {
    if (!SplitText) {
      document.querySelectorAll<HTMLElement>('[data-text-reveal]').forEach((el) => {
        el.style.visibility = 'visible';
        el.dispatchEvent(new CustomEvent('reveal:done', { bubbles: true }));
      });
      return;
    }

    const handled = new Set<Element>();
    const revealEl = (el: HTMLElement, delay: number) => {
      handled.add(el);
      const mode = el.getAttribute('data-text-reveal') === 'chars' ? 'chars' : 'lines';
      const hasFwHover = el.hasAttribute('data-font-weight-hover');
      const split = SplitText.create(el, {
        type: mode === 'chars' ? 'chars,words,lines' : 'lines,words',
        linesClass: 'line',
        charsClass: 'char',
        mask: 'lines',
        autoSplit: !hasFwHover,
      });
      splitMap.set(el, split);
      el.style.visibility = 'visible';

      const targets = mode === 'chars' ? split.chars : split.lines;
      gsap.from(targets, {
        yPercent: 135,
        duration: 1,
        ease: 'expo.out',
        stagger: mode === 'chars' ? 0.0175 : 0.07,
        delay,
        onComplete: () => {
          el.dispatchEvent(new CustomEvent('reveal:done', { bubbles: true }));
        },
      });
    };

    document.querySelectorAll<HTMLElement>('[data-text-reveal-group]').forEach((group) => {
      const els = group.querySelectorAll<HTMLElement>('[data-text-reveal]');
      els.forEach((el, idx) => {
        revealEl(el, baseDelay + idx * 0.12);
      });
    });

    document.querySelectorAll<HTMLElement>('[data-text-reveal]').forEach((el) => {
      if (!handled.has(el)) {
        revealEl(el, baseDelay);
      }
    });
  };

  // 6.4 Scroll reveal
  const initScrollReveals = () => {
    if (reducedMotionQuery.matches || !SplitText) {
      document.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((el) => {
        el.style.visibility = 'visible';
      });
      return;
    }

    const handled = new Set<Element>();

    const prepareScrollTween = (el: HTMLElement) => {
      const mode = el.getAttribute('data-scroll-reveal') || 'lines';
      if (mode === 'element') {
        gsap.set(el, { y: 24, autoAlpha: 0 });
        return gsap.to(el, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'expo.out',
        });
      }

      const hasFwHover = el.hasAttribute('data-font-weight-hover');
      const split = SplitText.create(el, {
        type: mode === 'chars' ? 'chars,words,lines' : 'lines,words',
        linesClass: 'line',
        charsClass: 'char',
        mask: 'lines',
        autoSplit: !hasFwHover,
      });
      splitMap.set(el, split);
      el.style.visibility = 'visible';
      const targets = mode === 'chars' ? split.chars : split.lines;
      return gsap.from(targets, {
        yPercent: 135,
        duration: 1,
        ease: 'expo.out',
        stagger: mode === 'chars' ? 0.0175 : 0.07,
      });
    };

    document.querySelectorAll<HTMLElement>('[data-scroll-reveal-group]').forEach((group) => {
      const els = group.querySelectorAll<HTMLElement>('[data-scroll-reveal]');
      if (!els.length) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          once: true,
        },
      });
      els.forEach((el, idx) => {
        handled.add(el);
        tl.add(prepareScrollTween(el), idx * 0.12);
      });
    });

    document.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((el) => {
      if (handled.has(el)) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
      tl.add(prepareScrollTween(el), 0);
    });
  };

  // 6.6 Font weight follows cursor
  const initFontWeightHover = () => {
    if (reducedMotionQuery.matches || !fineHoverQuery.matches || !SplitText) return;

    interface CharEntry {
      el: HTMLElement;
      rest: number;
      near: number;
      radius: number;
      cx: number;
      cy: number;
      lastTarget: number;
      quickTo: (val: number) => void;
    }

    const entries: CharEntry[] = [];
    let pointerPageX = 0;
    let pointerPageY = 0;
    let pointerActive = false;
    let lastScrollY = window.scrollY;

    const measureAll = () => {
      const sx = window.scrollX;
      const sy = window.scrollY;
      for (const entry of entries) {
        const rect = entry.el.getBoundingClientRect();
        entry.cx = rect.left + rect.width / 2 + sx;
        entry.cy = rect.top + rect.height / 2 + sy;
      }
    };

    const setupElement = (topEl: HTMLElement) => {
      let split = splitMap.get(topEl);
      if (!split) {
        split = SplitText.create(topEl, {
          type: 'chars,words',
          charsClass: 'char',
          autoSplit: false,
        });
        splitMap.set(topEl, split);
      }

      const chars: HTMLElement[] = split.chars || [];
      for (const ch of chars) {
        const owner =
          (ch.closest('[data-font-weight-hover]') as HTMLElement | null) || topEl;
        const rest = Number(owner.getAttribute('data-fw-rest') ?? 700);
        const near = Number(owner.getAttribute('data-fw-near') ?? 200);
        const radius = Number(owner.getAttribute('data-fw-radius') ?? 400);

        const existingFvs = window.getComputedStyle(ch).fontVariationSettings;
        ch.style.setProperty('--wght', String(rest));
        ch.style.fontVariationSettings = rewriteVariationSettings(existingFvs);

        const rect = ch.getBoundingClientRect();
        entries.push({
          el: ch,
          rest,
          near,
          radius,
          cx: rect.left + rect.width / 2 + window.scrollX,
          cy: rect.top + rect.height / 2 + window.scrollY,
          lastTarget: rest,
          quickTo: gsap.quickTo(ch, '--wght', { duration: 0.4, ease: 'power2.out' }),
        });
      }
    };

    document.querySelectorAll<HTMLElement>('[data-font-weight-hover]').forEach((el) => {
      if (el.parentElement?.closest('[data-font-weight-hover]')) return;
      if (el.hasAttribute('data-text-reveal')) {
        const onRevealDone = () => {
          el.removeEventListener('reveal:done', onRevealDone);
          setupElement(el);
        };
        if (el.style.visibility === 'visible' && splitMap.has(el)) {
          // Wait for reveal:done so Y transform finishes before measuring
          el.addEventListener('reveal:done', onRevealDone);
        } else {
          el.addEventListener('reveal:done', onRevealDone);
        }
        cleanups.push(() => el.removeEventListener('reveal:done', onRevealDone));
      } else {
        setupElement(el);
      }
    });

    const onPointerMove = (e: PointerEvent) => {
      pointerActive = true;
      pointerPageX = e.clientX + window.scrollX;
      pointerPageY = e.clientY + window.scrollY;
    };

    const onScroll = () => {
      const curY = window.scrollY;
      const dy = curY - lastScrollY;
      lastScrollY = curY;
      if (pointerActive) {
        pointerPageY += dy;
      }
      measureAll();
    };

    const onTick = () => {
      if (!pointerActive || entries.length === 0) return;
      for (const entry of entries) {
        const d = Math.hypot(pointerPageX - entry.cx, pointerPageY - entry.cy);
        const target = computeFontWeightTarget(d, entry.rest, entry.near, entry.radius);
        if (Math.abs(target - entry.lastTarget) >= 1) {
          entry.lastTarget = target;
          entry.quickTo(target);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureAll, { passive: true });
    gsap.ticker.add(onTick);

    cleanups.push(() => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measureAll);
      gsap.ticker.remove(onTick);
    });
  };

  // 6.7 Hero cursor card
  const initHeroCursorCard = () => {
    const hero = document.querySelector<HTMLElement>('[data-cursor-cards]');
    const card = hero?.querySelector<HTMLElement>('[data-cursor-card]');
    const media = hero?.querySelector<HTMLElement>('[data-cursor-card-media]');
    if (!hero || !card || !media) return;

    const crops = Array.from(media.querySelectorAll<HTMLElement>('.crop'));
    if (!crops.length) return;

    const threshold = Number(hero.getAttribute('data-cursor-threshold') || 300);
    const desktopQuery = window.matchMedia('(min-width: 992px)');

    const cardX = gsap.quickTo(card, 'x', { duration: 1, ease: 'power4' });
    const cardY = gsap.quickTo(card, 'y', { duration: 1, ease: 'power4' });
    const cardRot = gsap.quickTo(card, 'rotation', { duration: 1, ease: 'power4' });
    const mediaX = gsap.quickTo(media, 'xPercent', { duration: 0.6, ease: 'power2' });
    const mediaY = gsap.quickTo(media, 'yPercent', { duration: 0.7, ease: 'power2' });

    let hasMoved = false;
    let lastX = 0;
    let lastY = 0;
    let travelState = { travel: 0, activeIndex: 0 };
    let settleTimer: number | null = null;

    const setActiveCrop = (index: number) => {
      crops.forEach((c, idx) => c.classList.toggle('on', idx === index));
    };

    setActiveCrop(0);

    const isEnabled = () => desktopQuery.matches && fineHoverQuery.matches;

    if (isEnabled()) {
      gsap.set(card, { autoAlpha: 0 });
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isEnabled()) return;

      const overInteractive = (e.target as Element | null)?.closest('a, button');
      if (overInteractive) {
        gsap.to(card, {
          autoAlpha: 0,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        return;
      }

      const heroTop = hero.getBoundingClientRect().top;
      const targetX = e.clientX - window.innerWidth / 2;
      const targetY = e.clientY - window.innerHeight / 2 - heroTop;

      if (!hasMoved) {
        hasMoved = true;
        lastX = targetX;
        lastY = targetY;
        gsap.set(card, { x: targetX, y: targetY, rotation: 0 });
        gsap.to(card, {
          autoAlpha: 1,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        return;
      }

      gsap.to(card, {
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      const dx = (targetX - lastX) / 2;
      const dy = (targetY - lastY) / 2;
      const rotation = (targetX - lastX) / 4;
      lastX = targetX;
      lastY = targetY;

      cardX(targetX);
      cardY(targetY);
      cardRot(rotation);

      const drift = computeHeroCounterDrift(dx, dy);
      mediaX(drift.xPercent);
      mediaY(drift.yPercent);

      const prevIndex = travelState.activeIndex;
      travelState = stepHeroCardTravel(travelState, dx, dy, crops.length, threshold);
      if (travelState.activeIndex !== prevIndex) {
        setActiveCrop(travelState.activeIndex);
      }

      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        cardRot(0);
        mediaX(0);
        mediaY(0);
      }, 66);
    };

    const onMouseLeave = () => {
      if (!isEnabled()) return;
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
        settleTimer = null;
      }
      hasMoved = false;
      travelState.travel = 0;
      cardRot(0);
      mediaX(0);
      mediaY(0);
      gsap.to(card, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);
    cleanups.push(() => {
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      hero.removeEventListener('mousemove', onMouseMove);
      hero.removeEventListener('mouseleave', onMouseLeave);
    });
  };

  // 6.8 Client marquee
  const initClientMarquee = () => {
    const marquee = document.querySelector<HTMLElement>('[data-marquee]');
    const scrollWrap = marquee?.querySelector<HTMLElement>('[data-marquee-scroll]');
    const baseCollection = marquee?.querySelector<HTMLElement>('[data-marquee-collection]');
    if (!marquee || !scrollWrap || !baseCollection) return;

    const duplicateCount = Number(marquee.getAttribute('data-marquee-duplicate') || 2);
    const speed = Number(marquee.getAttribute('data-marquee-speed') || 30);
    const direction = marquee.getAttribute('data-marquee-direction') === 'right' ? 1 : -1;

    // Append clones if not already present
    const existingCount = scrollWrap.querySelectorAll('[data-marquee-collection]').length;
    for (let i = existingCount; i < 1 + duplicateCount; i += 1) {
      const clone = baseCollection.cloneNode(true) as HTMLElement;
      scrollWrap.appendChild(clone);
    }

    if (reducedMotionQuery.matches) return;

    const collections = Array.from(
      scrollWrap.querySelectorAll<HTMLElement>('[data-marquee-collection]'),
    );

    const collectionWidth = baseCollection.getBoundingClientRect().width || window.innerWidth;
    const duration = computeMarqueeDuration(speed, collectionWidth, window.innerWidth);

    gsap.set(collections, { xPercent: -100 });
    const loopTween = gsap
      .to(collections, {
        xPercent: -200,
        duration,
        ease: 'none',
        repeat: -1,
      })
      .totalProgress(0.5);

    const dirTrigger = ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self: any) => {
        const nextScale = self.direction === 1 ? -direction : direction;
        loopTween.timeScale(nextScale);
      },
    });

    const scrubTween = gsap.fromTo(
      scrollWrap,
      { x: '10vw' },
      {
        x: '-10vw',
        ease: 'none',
        scrollTrigger: {
          trigger: marquee,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0,
        },
      },
    );

    cleanups.push(() => {
      loopTween.kill();
      dirTrigger.kill();
      scrubTween.kill();
    });
  };

  // 6.9 Latest drops 3D stack
  const initWorkStack = () => {
    const section = document.querySelector<HTMLElement>('[data-featured-stack]');
    const pinEl = section?.querySelector<HTMLElement>('[data-featured-pin]');
    const stackRoot = section?.querySelector<HTMLElement>('[data-stack-root]');
    const badge = section?.querySelector<HTMLElement>('[data-stack-badge]');
    const slides = Array.from(section?.querySelectorAll<HTMLElement>('[data-stack-slide]') || []);
    if (!section || !pinEl || !stackRoot || slides.length < 2) return;

    const depth = 120;
    const offset = 40;
    const tiltX = 6;
    const tiltY = 10;
    const badgeSpin = 180;
    const count = slides.length;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', () => {
      slides.forEach((slide, b) => {
        gsap.set(slide, {
          z: -b * depth,
          y: -b * offset,
          zIndex: count - b,
          autoAlpha: 1,
        });
      });

      const tl = gsap.timeline({ paused: true });

      for (let b = 0; b < count - 1; b += 1) {
        tl.to(
          slides[b],
          {
            y: () => `+=${window.innerHeight * 0.9}`,
            duration: 1,
            ease: 'power2.in',
          },
          b,
        );
        tl.to(
          slides[b],
          {
            autoAlpha: 0,
            duration: 0.25,
            ease: 'none',
          },
          b + 0.7,
        );

        for (let j = b + 1; j < count; j += 1) {
          const nextStep = j - (b + 1);
          tl.to(
            slides[j],
            {
              z: -nextStep * depth,
              y: -nextStep * offset,
              duration: 1,
              ease: 'none',
            },
            b,
          );
        }
      }

      if (badge) {
        tl.fromTo(
          badge,
          { rotation: 0 },
          { rotation: badgeSpin, duration: count - 1, ease: 'none' },
          0,
        );
      }

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 1.2 * (count - 1)}`,
        pin: pinEl,
        pinSpacing: true,
        scrub: 0.3,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: (self: any) => {
          tl.progress(self.progress);
        },
      });

      let cleanupTilt = () => {};
      if (!reducedMotionQuery.matches && fineHoverQuery.matches) {
        const rotX = gsap.quickTo(stackRoot, 'rotationX', {
          duration: 0.6,
          ease: 'power3',
        });
        const rotY = gsap.quickTo(stackRoot, 'rotationY', {
          duration: 0.6,
          ease: 'power3',
        });

        const onPinMove = (e: MouseEvent) => {
          const rect = pinEl.getBoundingClientRect();
          const tilt = computeStackTilt(e.clientX, e.clientY, rect, tiltX, tiltY);
          rotX(tilt.rotationX);
          rotY(tilt.rotationY);
        };

        const onPinLeave = () => {
          rotX(0);
          rotY(0);
        };

        pinEl.addEventListener('mousemove', onPinMove);
        pinEl.addEventListener('mouseleave', onPinLeave);
        cleanupTilt = () => {
          pinEl.removeEventListener('mousemove', onPinMove);
          pinEl.removeEventListener('mouseleave', onPinLeave);
        };
      }

      return () => {
        cleanupTilt();
        st.kill();
        tl.kill();
        gsap.set(slides, { clearProps: 'transform,zIndex,autoAlpha' });
        if (badge) gsap.set(badge, { clearProps: 'transform' });
        gsap.set(stackRoot, { clearProps: 'transform' });
      };
    });

    cleanups.push(() => mm.revert());
  };

  // 6.10 "View case →" cursor marquee label
  const initCursorMarquee = () => {
    if (!fineHoverQuery.matches) return;
    const wrapper = document.querySelector<HTMLElement>('[data-cursor-marquee]');
    if (!wrapper) return;

    const copies = Array.from(
      wrapper.querySelectorAll<HTMLElement>('[data-cursor-marquee-copy]'),
    );

    const setX = gsap.quickTo(wrapper, 'x', { duration: 0.4, ease: 'power3' });
    const setY = gsap.quickTo(wrapper, 'y', { duration: 0.4, ease: 'power3' });

    let hasMoved = false;
    let lastClientX = -9999;
    let lastClientY = -9999;
    let activeTarget: Element | null = null;
    let pauseTimer: number | null = null;

    const updateHit = () => {
      if (lastClientX < 0 || lastClientY < 0) return;
      const el = document.elementFromPoint(lastClientX, lastClientY);
      const hit = el?.closest('[data-cursor-marquee-text]') || null;

      if (hit === activeTarget) return;
      activeTarget = hit;

      if (hit) {
        if (pauseTimer !== null) {
          window.clearTimeout(pauseTimer);
          pauseTimer = null;
        }
        const text = hit.getAttribute('data-cursor-marquee-text') || 'View case →';
        for (const copy of copies) {
          copy.textContent = text;
        }
        wrapper.style.setProperty('--marquee-duration', `${text.length / 5}s`);
        wrapper.setAttribute('data-cursor-marquee-running', 'true');
        wrapper.setAttribute('data-cursor-marquee-status', 'active');
      } else {
        wrapper.setAttribute('data-cursor-marquee-status', 'not-active');
        if (pauseTimer !== null) window.clearTimeout(pauseTimer);
        pauseTimer = window.setTimeout(() => {
          if (wrapper.getAttribute('data-cursor-marquee-status') !== 'active') {
            wrapper.setAttribute('data-cursor-marquee-running', 'false');
          }
        }, 400);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        gsap.set(wrapper, { x: e.clientX, y: e.clientY });
      } else {
        setX(e.clientX);
        setY(e.clientY);
      }
      updateHit();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', updateHit, { passive: true });
    cleanups.push(() => {
      if (pauseTimer !== null) window.clearTimeout(pauseTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', updateHit);
    });
  };

  // 6.11 Team photo parallax
  const initTeamParallax = () => {
    const teamSection = document.querySelector<HTMLElement>('.team-section');
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-team-parallax]'));
    if (!teamSection || !items.length) return;

    const mm = gsap.matchMedia();

    const setupFactor = (k: number) => {
      const distance = 320 * k;
      const tweens = items.map((el) => {
        const speed = Number(el.getAttribute('data-speed') || 1);
        return gsap.fromTo(
          el,
          { y: distance * speed },
          {
            y: -distance * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: teamSection,
              start: 'clamp(top bottom)',
              end: 'clamp(bottom top)',
              scrub: true,
              invalidateOnRefresh: true,
              refreshPriority: -1,
            },
          },
        );
      });
      return () => {
        tweens.forEach((t) => t.kill());
        gsap.set(items, { clearProps: 'transform' });
      };
    };

    mm.add(
      {
        desktop: '(min-width: 992px) and (prefers-reduced-motion: no-preference)',
        tablet:
          '(min-width: 480px) and (max-width: 991px) and (prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 479px) and (prefers-reduced-motion: no-preference)',
      },
      (context: any) => {
        const { desktop, tablet, mobile } = context.conditions;
        if (desktop) return setupFactor(1);
        if (tablet) return setupFactor(0.5);
        if (mobile) return setupFactor(0.3);
      },
    );

    cleanups.push(() => mm.revert());
  };

  // 6.12 Momentum hover (InertiaPlugin)
  const initMomentumHover = () => {
    if (reducedMotionQuery.matches || !fineHoverQuery.matches || !InertiaPlugin) return;
    const teamSection = document.querySelector<HTMLElement>('.team-section');
    if (!teamSection) return;

    let curX = 0;
    let curY = 0;
    let prevX = 0;
    let prevY = 0;
    let vx = 0;
    let vy = 0;
    let hasSample = false;

    const onPointerMove = (e: PointerEvent) => {
      curX = e.clientX;
      curY = e.clientY;
      if (!hasSample) {
        prevX = curX;
        prevY = curY;
        hasSample = true;
      }
    };

    const trackVelocity = () => {
      if (!hasSample) return;
      vx = curX - prevX;
      vy = curY - prevY;
      prevX = curX;
      prevY = curY;
    };

    teamSection.addEventListener('pointermove', onPointerMove, { passive: true });
    gsap.ticker.add(trackVelocity);

    const targets = Array.from(
      teamSection.querySelectorAll<HTMLElement>('[data-momentum-hover]'),
    );
    const enterHandlers: Array<() => void> = [];

    targets.forEach((target) => {
      const onEnter = (e: PointerEvent) => {
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);
        const imp = computeInertiaImpulse(offsetX, offsetY, vx, vy);

        gsap.to(target, {
          inertia: {
            x: { velocity: imp.vx, end: 0 },
            y: { velocity: imp.vy, end: 0 },
            rotation: { velocity: imp.vRot, end: 0 },
            resistance: 200,
          },
        });
      };

      target.addEventListener('pointerenter', onEnter);
      enterHandlers.push(() => target.removeEventListener('pointerenter', onEnter));
    });

    cleanups.push(() => {
      teamSection.removeEventListener('pointermove', onPointerMove);
      gsap.ticker.remove(trackVelocity);
      enterHandlers.forEach((fn) => fn());
    });
  };

  // 6.13 Page theme switch
  const initThemeSwitches = () => {
    const themedSections = document.querySelectorAll<HTMLElement>('[data-page-theme]');
    themedSections.forEach((el) => {
      const theme = el.getAttribute('data-page-theme') || 'dark';
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        refreshPriority: -1,
        onEnter: () => docEl.setAttribute('data-theme', theme),
        onEnterBack: () => docEl.setAttribute('data-theme', theme),
        onLeave: () => docEl.removeAttribute('data-theme'),
        onLeaveBack: () => docEl.removeAttribute('data-theme'),
      });
      cleanups.push(() => st.kill());
    });
  };

  const initSystems = () => {
    if (systemsInitialized) return;
    systemsInitialized = true;

    initDrawLines();
    initScrollReveals();
    initFontWeightHover();
    initHeroCursorCard();
    initClientMarquee();
    initWorkStack();
    initCursorMarquee();
    initTeamParallax();
    initMomentumHover();
    initThemeSwitches();
    ScrollTrigger.refresh();
  };

  // 6.2 Load sequence
  let cancelled = false;
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
  ]).then(() => {
    if (cancelled) return;
    window.clearTimeout(failsafeTimer);
    docEl.setAttribute('data-page-ready', '');

    const main = document.querySelector('main') as HTMLElement | null;
    const wipeOverlay = document.querySelector<HTMLElement>('[data-load-wipe]');
    const wipePath = wipeOverlay?.querySelector<SVGPathElement>('[data-wipe-path]');

    if (reducedMotionQuery.matches) {
      if (main) gsap.set(main, { autoAlpha: 1 });
      document
        .querySelectorAll<HTMLElement>('[data-text-reveal], [data-scroll-reveal]')
        .forEach((el) => {
          el.style.visibility = 'visible';
        });
      wipeOverlay?.setAttribute('data-transition-ready', '');
      initSystems();
      return;
    }

    const tl = gsap.timeline();
    if (main) {
      gsap.set(main, { autoAlpha: 0 });
    }
    if (wipePath && DrawSVGPlugin) {
      gsap.set(wipePath, { drawSVG: '0% 100%', strokeWidth: '30%' });
    }

    tl.addLabel('reveal', 0.4);
    tl.add(() => {
      if (main) gsap.set(main, { autoAlpha: 1 });
      runTextReveals(0.6);
      initSystems();
    }, 'reveal');

    if (wipePath && DrawSVGPlugin) {
      tl.to(
        wipePath,
        {
          drawSVG: '100% 100%',
          strokeWidth: '5%',
          duration: 1.25,
          ease: 'power1.inOut',
          onComplete: () => {
            wipeOverlay?.setAttribute('data-transition-ready', '');
          },
        },
        'reveal',
      );
    } else {
      wipeOverlay?.setAttribute('data-transition-ready', '');
    }

    cleanups.push(() => tl.kill());
  });

  return () => {
    cancelled = true;
    cleanups.forEach((fn) => fn());
    docEl.removeAttribute('data-theme');
  };
}
