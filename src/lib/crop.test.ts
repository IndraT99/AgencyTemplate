import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCropLayout, SHEETS } from './crop';

test('computeCropLayout insets work1 cell 0 by 4px on every side', () => {
  const layout = computeCropLayout('work1:0');
  // Raw: 0, 0, 1336, 752 -> Inset: 4, 4, 1328, 744
  assert.equal(layout.url, SHEETS.work1.url);
  assert.ok(Math.abs(layout.aspectRatio - 1328 / 744) < 1e-6);
  assert.ok(Math.abs(layout.widthPct - (2688 / 1328) * 100) < 1e-6);
  assert.ok(Math.abs(layout.heightPct - (1520 / 744) * 100) < 1e-6);
  assert.ok(Math.abs(layout.leftPct - (-4 / 1328) * 100) < 1e-6);
  assert.ok(Math.abs(layout.topPct - (-4 / 744) * 100) < 1e-6);
});

test('computeCropLayout handles bottom-right cell of team2', () => {
  const layout = computeCropLayout('team2:3');
  // Raw: 880, 1176, 864, 1160 -> Inset: 884, 1180, 856, 1152
  assert.ok(Math.abs(layout.aspectRatio - 856 / 1152) < 1e-6);
  assert.ok(Math.abs(layout.leftPct - (-884 / 856) * 100) < 1e-6);
  assert.ok(Math.abs(layout.topPct - (-1180 / 1152) * 100) < 1e-6);
});

test('computeCropLayout throws on unknown sheet or cell', () => {
  assert.throws(() => computeCropLayout('unknown:0'));
  assert.throws(() => computeCropLayout('bts:9'));
});
