export function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeFontWeightTarget(
  distance: number,
  rest: number,
  near: number,
  radius: number,
): number {
  if (radius <= 0) return rest;
  const factor = distance >= radius ? 0 : 1 - distance / radius;
  const low = Math.min(rest, near);
  const high = Math.max(rest, near);
  return clamp(low, high, rest + (near - rest) * factor);
}

export function rewriteVariationSettings(existing: string): string {
  const trimmed = existing.trim();
  const axes: string[] = [];
  let hasWght = false;

  if (trimmed && trimmed !== 'normal') {
    const parts = trimmed.split(',');
    for (const part of parts) {
      const clean = part.trim();
      if (!clean) continue;
      if (/^['"]?wght['"]?\s+/i.test(clean)) {
        axes.push(`"wght" var(--wght)`);
        hasWght = true;
      } else {
        axes.push(clean);
      }
    }
  }

  if (!hasWght) {
    axes.unshift(`"wght" var(--wght)`);
  }

  return axes.join(', ');
}

export interface HeroTravelState {
  travel: number;
  activeIndex: number;
}

export function stepHeroCardTravel(
  state: HeroTravelState,
  dx: number,
  dy: number,
  totalPhotos: number,
  threshold = 300,
): HeroTravelState {
  const nextTravel = state.travel + Math.abs(dx) + Math.abs(dy);
  if (nextTravel > threshold && totalPhotos > 0) {
    return {
      travel: 0,
      activeIndex: (state.activeIndex + 1) % totalPhotos,
    };
  }
  return {
    travel: nextTravel,
    activeIndex: state.activeIndex,
  };
}

export function computeHeroCounterDrift(dx: number, dy: number): { xPercent: number; yPercent: number } {
  return {
    xPercent: -clamp(-8, 8, dx) || 0,
    yPercent: -clamp(-8, 8, dy) || 0,
  };
}

export function computeStackTilt(
  pointerX: number,
  pointerY: number,
  rect: { left: number; top: number; width: number; height: number },
  tiltX = 6,
  tiltY = 10,
): { rotationX: number; rotationY: number } {
  if (rect.width <= 0 || rect.height <= 0) {
    return { rotationX: 0, rotationY: 0 };
  }
  const normY = (pointerY - rect.top) / rect.height - 0.5;
  const normX = (pointerX - rect.left) / rect.width - 0.5;
  return {
    rotationX: -normY * tiltX || 0,
    rotationY: normX * tiltY || 0,
  };
}

export function computeInertiaImpulse(
  offsetX: number,
  offsetY: number,
  vx: number,
  vy: number,
): { vx: number; vy: number; vRot: number } {
  const dist = Math.hypot(offsetX, offsetY);
  const torque = dist > 0 ? (offsetX * vy - offsetY * vx) / dist : 0;
  return {
    vx: clamp(-1080, 1080, vx * 30),
    vy: clamp(-1080, 1080, vy * 30),
    vRot: clamp(-60, 60, torque * 20),
  };
}

export function computeMarqueeDuration(
  speed: number,
  collectionWidth: number,
  viewportWidth: number,
): number {
  if (viewportWidth <= 0) return speed;
  const f = viewportWidth <= 479 ? 0.25 : viewportWidth <= 991 ? 0.5 : 1;
  return speed * (collectionWidth / viewportWidth) * f;
}
