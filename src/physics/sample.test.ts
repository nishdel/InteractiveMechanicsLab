import { describe, expect, it } from 'vitest';
import { sampleBeam } from './sample';
import { calculateBeam } from './beam';
const input = { loadN: 500, lengthM: 0.3, outerDiameterM: 0.03, wallThicknessM: 0.002 };
const material = { elasticModulusPa: 68.3e9, densityKgM3: 2700, yieldStrengthPa: 276e6 };
function valid() {
  const result = calculateBeam(input, material);
  if (!result.ok) throw new Error('Invalid independent benchmark fixture');
  return result;
}
function near(actual: number, expected: number) {
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThanOrEqual(1e-8);
}
describe('independent spatial beam-field acceptance', () => {
  it('satisfies clamp/free-end conditions and identifies tension by sign', () => {
    const r = valid().results;
    const clamp = sampleBeam(input, material, r, 0, 0.015);
    expect(Object.isFrozen(clamp)).toBe(true);
    expect(clamp.momentNm).toBe(150);
    expect(clamp.downwardM).toBe(0);
    expect(clamp.slope).toBe(0);
    near(clamp.stressPa, 129839964.451329);
    near(sampleBeam(input, material, r, 0, -0.015).stressPa, -129839964.451329);
    expect(sampleBeam(input, material, r, 0, 0).stressPa).toBe(0);
    const tip = sampleBeam(input, material, r, 0.3);
    expect(tip.momentNm).toBe(0);
    expect(tip.stressPa).toBe(0);
    near(tip.downwardM, 0.00380204873942397);
    near(tip.slope, 0.0190102436971199);
    near(sampleBeam(input, material, r, 0.15).downwardM, 0.00118814023106999);
  });
  it.each([
    [-0.01, 0],
    [0.31, 0],
    [0, 0.016],
    [0, -0.016],
    [NaN, 0],
    [0, Infinity],
  ])('rejects sampling outside the represented beam/fibre domain', (x, y) => {
    expect(() => sampleBeam(input, material, valid().results, x, y)).toThrow(RangeError);
  });
});
