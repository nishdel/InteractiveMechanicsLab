export type BeamInputsSI = Readonly<{
  loadN: number;
  lengthM: number;
  outerDiameterM: number;
  wallThicknessM: number;
}>;
export type MaterialProperties = Readonly<{
  elasticModulusPa: number;
  densityKgM3: number;
  yieldStrengthPa: number;
}>;
export type BeamResults = Readonly<{
  innerDiameterM: number;
  areaM2: number;
  secondMomentM4: number;
  maxMomentNm: number;
  maxStressPa: number;
  tipDisplacementM: number;
  massKg: number;
  yieldSafetyFactor: number | null;
}>;
export type InputIssue = Readonly<{
  field: keyof BeamInputsSI | 'material' | 'result';
  message: string;
}>;
export type ModelWarning = Readonly<{
  code: 'yield' | 'large-displacement' | 'short-beam';
  message: string;
}>;
export type CalculationOutcome =
  | Readonly<{ ok: true; results: BeamResults; warnings: readonly ModelWarning[] }>
  | Readonly<{ ok: false; errors: readonly InputIssue[] }>;
