export const mmToM = (v: number): number => v / 1000;
export const mToMm = (v: number): number => v * 1000;
export const MPaToPa = (v: number): number => v * 1e6;
export const PaToMPa = (v: number): number => v / 1e6;
export const GPaToPa = (v: number): number => v * 1e9;
export const PaToGPa = (v: number): number => v / 1e9;
export const m2ToMm2 = (v: number): number => v * 1e6;
export const m4ToMm4 = (v: number): number => v * 1e12;
export const kgToG = (v: number): number => v * 1000;
export type DisplayInputs = Readonly<{
  loadN: number;
  lengthMm: number;
  outerDiameterMm: number;
  wallThicknessMm: number;
}>;
export const toSI = (input: DisplayInputs) =>
  Object.freeze({
    loadN: input.loadN,
    lengthM: mmToM(input.lengthMm),
    outerDiameterM: mmToM(input.outerDiameterMm),
    wallThicknessM: mmToM(input.wallThicknessMm),
  });
