import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFontWeightTarget,
  computeHeroCounterDrift,
  computeInertiaImpulse,
  computeMarqueeDuration,
  computeStackTilt,
  rewriteVariationSettings,
  stepHeroCardTravel,
} from './motionMath';

test('computeFontWeightTarget interpolates and clamps accurately', () => {
  assert.equal(computeFontWeightTarget(0, 700, 200, 400), 200);
  assert.equal(computeFontWeightTarget(200, 700, 200, 400), 450);
  assert.equal(computeFontWeightTarget(400, 700, 200, 400), 700);
  assert.equal(computeFontWeightTarget(900, 700, 200, 400), 700);
  assert.equal(computeFontWeightTarget(0, 300, 800, 400), 800);
  assert.equal(computeFontWeightTarget(200, 300, 800, 400), 550);
});

test('rewriteVariationSettings replaces wght while preserving wdth and opsz', () => {
  assert.equal(
    rewriteVariationSettings('"wght" 300, "wdth" 87.5, "opsz" 120'),
    '"wght" var(--wght), "wdth" 87.5, "opsz" 120',
  );
  assert.equal(
    rewriteVariationSettings('"wdth" 72, "wght" 700'),
    '"wdth" 72, "wght" var(--wght)',
  );
  assert.equal(rewriteVariationSettings('normal'), '"wght" var(--wght)');
});

test('stepHeroCardTravel advances photo index after passing 300 threshold', () => {
  let state = { travel: 0, activeIndex: 0 };
  state = stepHeroCardTravel(state, 150, 100, 8, 300);
  assert.deepEqual(state, { travel: 250, activeIndex: 0 });
  state = stepHeroCardTravel(state, -40, 20, 8, 300);
  assert.deepEqual(state, { travel: 0, activeIndex: 1 });
  state = stepHeroCardTravel({ travel: 290, activeIndex: 7 }, 20, 0, 8, 300);
  assert.deepEqual(state, { travel: 0, activeIndex: 0 });
});

test('computeHeroCounterDrift clamps and negates delta', () => {
  assert.deepEqual(computeHeroCounterDrift(20, -15), { xPercent: -8, yPercent: 8 });
  assert.deepEqual(computeHeroCounterDrift(3.5, -2), { xPercent: -3.5, yPercent: 2 });
});

test('computeStackTilt computes centered tiltX=6 and tiltY=10', () => {
  const rect = { left: 100, top: 100, width: 400, height: 200 };
  assert.deepEqual(computeStackTilt(300, 200, rect, 6, 10), {
    rotationX: 0,
    rotationY: 0,
  });
  assert.deepEqual(computeStackTilt(500, 100, rect, 6, 10), {
    rotationX: 3,
    rotationY: 5,
  });
});

test('computeInertiaImpulse clamps velocities and computes torque', () => {
  const imp = computeInertiaImpulse(50, 0, 0, 10);
  assert.equal(imp.vx, 0);
  assert.equal(imp.vy, 300);
  assert.equal(imp.vRot, 60); // torque = 10 -> 200 -> clamped to 60
});

test('computeMarqueeDuration applies viewport breakpoints', () => {
  assert.equal(computeMarqueeDuration(30, 1440, 1440), 30);
  assert.equal(computeMarqueeDuration(30, 900, 900), 15);
  assert.equal(computeMarqueeDuration(30, 390, 390), 7.5);
});
