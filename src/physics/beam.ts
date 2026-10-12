import { validateInputs } from './validate';
import type {
  BeamInputsSI,
  MaterialProperties,
  BeamResults,
  InputIssue,
  ModelWarning,
  CalculationOutcome,
} from './types';

export function calculateBeam(
  input: BeamInputsSI,
  material: MaterialProperties,
): CalculationOutcome {
  const issues = validateInputs(input, material);
  if (issues.length > 0) {
    return Object.freeze({ ok: false, errors: Object.freeze(issues) });
  }

  const { loadN, lengthM, outerDiameterM, wallThicknessM } = input;
  const { elasticModulusPa, densityKgM3, yieldStrengthPa } = material;

  const innerDiameterM = outerDiameterM - 2 * wallThicknessM;
  const areaM2 = (Math.PI / 4) * (outerDiameterM ** 2 - innerDiameterM ** 2);
  const secondMomentM4 = (Math.PI / 64) * (outerDiameterM ** 4 - innerDiameterM ** 4);
  const maxMomentNm = loadN * lengthM;
  const maxStressPa = (maxMomentNm * (outerDiameterM / 2)) / secondMomentM4;
  const tipDisplacementM = (loadN * lengthM ** 3) / (3 * elasticModulusPa * secondMomentM4);
  const massKg = densityKgM3 * areaM2 * lengthM;
  const yieldSafetyFactor = loadN === 0 ? null : yieldStrengthPa / maxStressPa;

  const results: BeamResults = {
    innerDiameterM,
    areaM2,
    secondMomentM4,
    maxMomentNm,
    maxStressPa,
    tipDisplacementM,
    massKg,
    yieldSafetyFactor,
  };

  const numericFields = [
    innerDiameterM,
    areaM2,
    secondMomentM4,
    maxMomentNm,
    maxStressPa,
    tipDisplacementM,
    massKg,
  ];
  if (
    numericFields.some((v) => !Number.isFinite(v)) ||
    (yieldSafetyFactor !== null && !Number.isFinite(yieldSafetyFactor)) ||
    areaM2 <= 0 ||
    secondMomentM4 <= 0 ||
    massKg <= 0 ||
    (loadN > 0 && (maxMomentNm <= 0 || maxStressPa <= 0 || tipDisplacementM <= 0))
  ) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([
        Object.freeze({
          field: 'result',
          message:
            'These inputs exceed numerical limits. Use ordinary engineering dimensions and loads.',
        } as InputIssue),
      ]),
    });
  }

  const warnings: ModelWarning[] = [];
  if (maxStressPa >= yieldStrengthPa) {
    warnings.push(
      Object.freeze({
        code: 'yield',
        message:
          'Stress reaches or exceeds representative yield strength. The elastic model cannot predict permanent bending.',
      }),
    );
  }
  if (tipDisplacementM / lengthM > 0.05) {
    warnings.push(
      Object.freeze({
        code: 'large-displacement',
        message:
          'Tip displacement exceeds 5% of length. Small-deflection theory may be unreliable (educational heuristic).',
      }),
    );
  }
  if (lengthM / outerDiameterM < 10) {
    warnings.push(
      Object.freeze({
        code: 'short-beam',
        message:
          'Length is less than 10 outer diameters. Shear deformation and local effects may matter (educational heuristic).',
      }),
    );
  }

  return Object.freeze({
    ok: true,
    results: Object.freeze(results),
    warnings: Object.freeze(warnings),
  });
}
