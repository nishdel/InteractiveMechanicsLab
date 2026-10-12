import type { BeamInputsSI, MaterialProperties, InputIssue } from './types';

export function validateInputs(
  input: BeamInputsSI,
  material: MaterialProperties,
): readonly InputIssue[] {
  const issues: InputIssue[] = [];
  const add = (field: InputIssue['field'], message: string) =>
    issues.push(Object.freeze({ field, message }));

  const checkFinite = (v: number, field: InputIssue['field'], msg: string) => {
    if (!Number.isFinite(v)) add(field, msg);
  };

  checkFinite(input.loadN, 'loadN', 'Load must be finite.');
  checkFinite(input.lengthM, 'lengthM', 'Length must be finite.');
  checkFinite(input.outerDiameterM, 'outerDiameterM', 'Outer diameter must be finite.');
  checkFinite(input.wallThicknessM, 'wallThicknessM', 'Wall thickness must be finite.');

  if (Number.isFinite(input.loadN) && input.loadN < 0) add('loadN', 'Load must be non-negative.');
  if (Number.isFinite(input.lengthM) && input.lengthM <= 0)
    add('lengthM', 'Length must be positive.');
  if (Number.isFinite(input.outerDiameterM) && input.outerDiameterM <= 0)
    add('outerDiameterM', 'Outer diameter must be positive.');
  if (Number.isFinite(input.wallThicknessM) && input.wallThicknessM <= 0)
    add('wallThicknessM', 'Wall thickness must be positive.');
  if (
    Number.isFinite(input.wallThicknessM) &&
    Number.isFinite(input.outerDiameterM) &&
    input.wallThicknessM >= input.outerDiameterM / 2
  ) {
    add('wallThicknessM', 'Wall thickness must be less than half the outer diameter.');
  }

  const matFields: (keyof MaterialProperties)[] = [
    'elasticModulusPa',
    'densityKgM3',
    'yieldStrengthPa',
  ];
  for (const f of matFields) {
    const v = material[f];
    const label = {
      elasticModulusPa: 'Elastic modulus',
      densityKgM3: 'Density',
      yieldStrengthPa: 'Yield strength',
    }[f];
    if (!Number.isFinite(v)) add('material', `${label} must be finite.`);
    else if (v <= 0) add('material', `${label} must be positive.`);
  }

  return Object.freeze(issues);
}
