import { describe, expect, it } from 'vitest';
import { calculateBeam } from './beam';
import * as units from './units';
import type { BeamInputsSI, MaterialProperties } from './types';

// Expected literals rounded to 15 significant digits from the full Decimal oracle.
// Codex-owned acceptance oracle: independently reduced in N-mm, never calculated by production code.
const input: BeamInputsSI = {
  loadN: 500,
  lengthM: 0.3,
  outerDiameterM: 0.03,
  wallThicknessM: 0.002,
};
const material: MaterialProperties = {
  elasticModulusPa: 68.3e9,
  densityKgM3: 2700,
  yieldStrengthPa: 276e6,
};
function valid(i = input, m = material) {
  const answer = calculateBeam(i, m);
  if (!answer.ok) throw new Error(JSON.stringify(answer.errors));
  return answer;
}
function near(actual: number, expected: number) {
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThanOrEqual(1e-8);
}

describe('independently protected engineering acceptance', () => {
  it('matches every intermediate/result from the N-mm hand calculation', () => {
    const r = valid().results;
    near(r.innerDiameterM, 0.026);
    near(r.areaM2, 0.000175929188601028);
    near(r.secondMomentM4, 1.73290250772013e-8);
    near(r.maxMomentNm, 150);
    near(r.maxStressPa, 129839964.451329);
    near(r.tipDisplacementM, 0.00380204873942397);
    near(r.massKg, 0.142502642766833);
    near(r.yieldSafetyFactor!, 2.12569374280336);
  });
  it('matches the independent fixed-wall diameter benchmark and retains its assumption warning', () => {
    const answer = valid({ ...input, outerDiameterM: 0.04 });
    near(answer.results.areaM2, 0.000238761041672824);
    near(answer.results.secondMomentM4, 4.32157485427812e-8);
    near(answer.results.maxStressPa, 69419137.7254559);
    near(answer.results.tipDisplacementM, 0.00152457842735262);
    near(answer.results.massKg, 0.193396443754988);
    near(answer.results.yieldSafetyFactor!, 3.97584886593587);
    expect(answer.warnings.map((w) => w.code)).toContain('short-beam');
  });
  it('does not turn unloaded stress into NaN or a finite safety claim', () => {
    const r = valid({ ...input, loadN: 0 }).results;
    expect([r.maxMomentNm, r.maxStressPa, r.tipDisplacementM]).toEqual([0, 0, 0]);
    expect(r.yieldSafetyFactor).toBeNull();
    near(r.massKg, 0.142502642766833);
  });
  it.each([
    { wallThicknessM: 0 },
    { wallThicknessM: -0.001 },
    { wallThicknessM: 0.015 },
    { wallThicknessM: 0.016 },
    { lengthM: 0 },
    { lengthM: -1 },
    { outerDiameterM: 0 },
    { outerDiameterM: -1 },
    { loadN: -1 },
    { loadN: NaN },
    { lengthM: Infinity },
    { outerDiameterM: NaN },
    { wallThicknessM: Infinity },
  ])('rejects invalid inputs without returning old values: %o', (change) => {
    const answer = calculateBeam({ ...input, ...change }, material);
    expect(answer.ok).toBe(false);
    expect('results' in answer).toBe(false);
    if (!answer.ok) expect(answer.errors.length).toBeGreaterThan(0);
  });
  it.each([{ elasticModulusPa: 0 }, { densityKgM3: -1 }, { yieldStrengthPa: NaN }])(
    'rejects unusable material properties: %o',
    (change) => {
      expect(calculateBeam(input, { ...material, ...change }).ok).toBe(false);
    },
  );
  it('rejects finite inputs whose intermediate arithmetic overflows or underflows', () => {
    expect(calculateBeam({ ...input, lengthM: 1e308 }, material).ok).toBe(false);
    expect(
      calculateBeam(
        { loadN: 0, lengthM: 1e-300, outerDiameterM: 1e-70, wallThicknessM: 1e-71 },
        material,
      ).ok,
    ).toBe(false);
    expect(calculateBeam({ ...input, loadN: Number.MIN_VALUE }, material).ok).toBe(false);
    expect(
      calculateBeam({ ...input, outerDiameterM: 1e-100, wallThicknessM: 1e-101 }, material).ok,
    ).toBe(false);
  });
  it('returns immutable results, warnings, and errors', () => {
    const answer = valid({ ...input, loadN: 2000 });
    expect(Object.isFrozen(answer)).toBe(true);
    expect(Object.isFrozen(answer.results)).toBe(true);
    expect(Object.isFrozen(answer.warnings)).toBe(true);
    expect(answer.warnings.every(Object.isFrozen)).toBe(true);
    expect(input.loadN).toBe(500);
    const invalid = calculateBeam({ ...input, loadN: -1 }, material);
    if (invalid.ok) throw new Error('Invalid fixture was accepted');
    expect(Object.isFrozen(invalid.errors)).toBe(true);
    expect(invalid.errors.every(Object.isFrozen)).toBe(true);
  });
  it('separates material stiffness, density, and strength effects', () => {
    const r = valid().results;
    const stiffer = valid(input, { ...material, elasticModulusPa: 136.6e9 }).results;
    expect(stiffer.maxStressPa).toBe(r.maxStressPa);
    near(stiffer.tipDisplacementM, r.tipDisplacementM / 2);
    near(valid(input, { ...material, densityKgM3: 5400 }).results.massKg, r.massKg * 2);
    near(
      valid(input, { ...material, yieldStrengthPa: 552e6 }).results.yieldSafetyFactor!,
      r.yieldSafetyFactor! * 2,
    );
  });
  it('has the correct length and geometrically-similar section scaling', () => {
    const r = valid().results;
    const long = valid({ ...input, lengthM: 0.6 }).results;
    near(long.tipDisplacementM, r.tipDisplacementM * 8);
    near(long.maxStressPa, r.maxStressPa * 2);
    const bigger = valid({ ...input, outerDiameterM: 0.06, wallThicknessM: 0.004 }).results;
    near(bigger.areaM2, r.areaM2 * 4);
    near(bigger.secondMomentM4, r.secondMomentM4 * 16);
  });
  it('flags model assumptions without rejecting a mathematically defined case', () => {
    expect(valid({ ...input, loadN: 5000 }).warnings.map((w) => w.code)).toEqual(
      expect.arrayContaining(['yield', 'large-displacement']),
    );
    expect(valid({ ...input, lengthM: 0.05 }).warnings.map((w) => w.code)).toContain('short-beam');
  });
});

describe('central unit boundaries', () => {
  it('converts SI/display dimensions including fourth powers', () => {
    expect(units.mmToM(1000)).toBe(1);
    expect(units.mToMm(0.3)).toBe(300);
    expect(units.MPaToPa(276)).toBe(276e6);
    expect(units.PaToMPa(276e6)).toBe(276);
    expect(units.GPaToPa(68.3)).toBe(68.3e9);
    expect(units.PaToGPa(68.3e9)).toBe(68.3);
    expect(units.m2ToMm2(1)).toBe(1e6);
    expect(units.m4ToMm4(1e-8)).toBe(1e4);
    expect(units.kgToG(0.2)).toBe(200);
    expect(
      units.toSI({ loadN: 500, lengthMm: 300, outerDiameterMm: 30, wallThicknessMm: 2 }),
    ).toEqual(input);
  });
});
