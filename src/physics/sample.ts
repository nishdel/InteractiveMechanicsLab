import type { BeamInputsSI, MaterialProperties, BeamResults } from './types';

/** Sample a matching, validated calculation; downward displacement and slope are positive magnitudes. */
export function sampleBeam(
  input: BeamInputsSI,
  material: MaterialProperties,
  result: BeamResults,
  xM: number,
  fibreYM = 0,
): Readonly<{ downwardM: number; slope: number; stressPa: number; momentNm: number }> {
  const { loadN, lengthM, outerDiameterM } = input;
  const { elasticModulusPa } = material;
  const I = result.secondMomentM4;

  if (!Number.isFinite(xM) || !Number.isFinite(fibreYM)) throw new RangeError('nonfinite');
  if (xM < 0 || xM > lengthM) throw new RangeError('x out of bounds');
  if (Math.abs(fibreYM) > outerDiameterM / 2) throw new RangeError('fibre out of bounds');

  const F = loadN;
  const L = lengthM;
  const E = elasticModulusPa;

  const downwardM = (F * xM * xM * (3 * L - xM)) / (6 * E * I);
  const slope = (F * xM * (2 * L - xM)) / (2 * E * I);
  const stressPa = (F * (L - xM) * fibreYM) / I;
  const momentNm = F * (L - xM);

  return Object.freeze({ downwardM, slope, stressPa, momentNm });
}
