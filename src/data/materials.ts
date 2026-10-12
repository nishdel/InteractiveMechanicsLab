import catalogue from './materials.v1.json';
import type { MaterialProperties } from '../physics/types';
export type Material = MaterialProperties &
  Readonly<{
    id: string;
    displayName: string;
    condition: string;
    provenance: string;
    sourceUrl: string;
    sourceLocation: string;
    accessed: string;
    warning: string;
  }>;
if (catalogue.schemaVersion !== 1) throw new Error('Unsupported material catalogue version');
for (const m of catalogue.materials) {
  if (
    ![m.elasticModulusPa, m.densityKgM3, m.yieldStrengthPa].every(
      (v) => Number.isFinite(v) && v > 0,
    ) ||
    !m.sourceUrl ||
    !m.warning
  )
    throw new Error('Invalid material catalogue record');
}
export const materials: readonly Material[] = Object.freeze(
  catalogue.materials.map((m) => Object.freeze({ ...m })),
);
export const getMaterial = (id: string): Material => {
  const material = materials.find((m) => m.id === id);
  if (!material) throw new Error('Unknown material');
  return material;
};
