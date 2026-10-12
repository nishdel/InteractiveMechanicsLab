import { describe, it, expect } from 'vitest';
import { calculateBeam } from './beam';
import type { BeamInputsSI, MaterialProperties, CalculationOutcome } from './types';

const F = 500,
  L = 0.3,
  Do = 0.03,
  t = 0.002;
const E = 68.3e9,
  rho = 2700,
  yieldStr = 276e6;
const inputs: BeamInputsSI = { loadN: F, lengthM: L, outerDiameterM: Do, wallThicknessM: t };
const mat: MaterialProperties = {
  elasticModulusPa: E,
  densityKgM3: rho,
  yieldStrengthPa: yieldStr,
};

const expDi = 0.026;
const expA = 0.000175929188601028;
const expI = 1.73290250772013e-8;
const expM = 150;
const expStress = 129839964.45132868;
const expDisp = 0.003802048739423973;
const expMass = 0.142502642766833;
const expSF = 2.125693742803359;

function assertClose(actual: number, expected: number, label: string) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
    throw new Error(`${label}: Non-finite value`);
  }
  const relErr = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-12);
  expect(relErr).toBeLessThanOrEqual(1e-8);
}

function getResults(outcome: CalculationOutcome) {
  if (!outcome.ok) throw new Error('Expected success');
  return outcome.results;
}

describe('calculateBeam', () => {
  it('computes fixed fixture F500,L.3,Do.03,t.002', () => {
    const res = getResults(calculateBeam(inputs, mat));
    assertClose(res.innerDiameterM, expDi, 'Di');
    assertClose(res.areaM2, expA, 'A');
    assertClose(res.secondMomentM4, expI, 'I');
    assertClose(res.maxMomentNm, expM, 'M');
    assertClose(res.maxStressPa, expStress, 'Stress');
    assertClose(res.tipDisplacementM, expDisp, 'Disp');
    assertClose(res.massKg, expMass, 'Mass');
    assertClose(res.yieldSafetyFactor!, expSF, 'SF');
  });

  it('handles zero force: success, null SF, no NaN', () => {
    const res = getResults(calculateBeam({ ...inputs, loadN: 0 }, mat));
    expect(res.yieldSafetyFactor).toBeNull();
    expect(res.maxStressPa).toBe(0);
    expect(res.tipDisplacementM).toBe(0);
    expect(Number.isNaN(res.massKg)).toBe(false);
  });

  it('rejects invalid geometry', () => {
    const invalids: BeamInputsSI[] = [
      { ...inputs, wallThicknessM: 0 },
      { ...inputs, wallThicknessM: -1 },
      { ...inputs, wallThicknessM: 0.015 }, // t >= Do/2
      { ...inputs, wallThicknessM: 0.016 },
      { ...inputs, lengthM: 0 },
      { ...inputs, outerDiameterM: 0 },
      { ...inputs, loadN: -1 },
      { ...inputs, loadN: NaN },
      { ...inputs, loadN: Infinity },
    ];
    for (const inv of invalids) {
      const out = calculateBeam(inv, mat);
      if (out.ok) throw new Error('Expected failure');
      expect(out.errors.length).toBeGreaterThan(0);
    }
  });

  it('material switch invariants', () => {
    // E doubled: stress same, delta halves
    const matE2 = { ...mat, elasticModulusPa: E * 2 };
    const resE2 = getResults(calculateBeam(inputs, matE2));
    assertClose(resE2.maxStressPa, expStress, 'Stress E2');
    assertClose(resE2.tipDisplacementM, expDisp / 2, 'Disp E2');

    // rho doubled: mass doubles
    const matRho2 = { ...mat, densityKgM3: rho * 2 };
    const resRho2 = getResults(calculateBeam(inputs, matRho2));
    assertClose(resRho2.massKg, expMass * 2, 'Mass Rho2');

    // yield doubled: SF doubles
    const matY2 = { ...mat, yieldStrengthPa: yieldStr * 2 };
    const resY2 = getResults(calculateBeam(inputs, matY2));
    assertClose(resY2.yieldSafetyFactor!, expSF * 2, 'SF Y2');
  });

  it('scale invariants', () => {
    // F doubled: stress/delta double, SF halves
    const resF2 = getResults(calculateBeam({ ...inputs, loadN: F * 2 }, mat));
    assertClose(resF2.maxStressPa, expStress * 2, 'Stress F2');
    assertClose(resF2.tipDisplacementM, expDisp * 2, 'Disp F2');
    assertClose(resF2.yieldSafetyFactor!, expSF / 2, 'SF F2');

    // L doubled: delta 8x (L^3)
    const resL2 = getResults(calculateBeam({ ...inputs, lengthM: L * 2 }, mat));
    assertClose(resL2.tipDisplacementM, expDisp * 8, 'Disp L2');
  });
});
