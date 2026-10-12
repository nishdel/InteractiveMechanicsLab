import { describe, expect, it } from 'vitest';
import { Color, Vector3, type BufferGeometry } from 'three';
import { buildTubeGeometry } from './tubeGeometry';
import { calculateBeam } from '../physics/beam';

const input = { loadN: 500, lengthM: 0.3, outerDiameterM: 0.03, wallThicknessM: 0.002 };
const material = { elasticModulusPa: 68.3e9, densityKgM3: 2700, yieldStrengthPa: 276e6 };
function mesh(scale = 0, visible = true, loadN = 500) {
  const i = { ...input, loadN };
  const outcome = calculateBeam(i, material);
  if (!outcome.ok) throw new Error('Invalid geometry fixture');
  return buildTubeGeometry(i, material, outcome.results, scale, visible);
}
function closest(g: BufferGeometry, point: Vector3) {
  const p = g.getAttribute('position');
  let best = -1;
  let distance = Infinity;
  for (let i = 0; i < p.count; i++) {
    const d = new Vector3().fromBufferAttribute(p, i).distanceTo(point);
    if (d < distance) {
      distance = d;
      best = i;
    }
  }
  expect(distance).toBeLessThan(1e-7);
  return best;
}

describe('analytical rendering geometry', () => {
  it('keeps a section perpendicular to the exaggerated centreline tangent', () => {
    const original = mesh(0);
    const deformed = mesh(10);
    const top = closest(original, new Vector3(0.3, 0.015, 0));
    const radius = new Vector3()
      .fromBufferAttribute(deformed.getAttribute('position'), top)
      .sub(new Vector3(0.3, -0.03802048739423973, 0));
    // Independent benchmark slope: 0.0190102436971198656 before display scaling.
    const tangent = new Vector3(1, -0.19010243697119866, 0).normalize();
    // The graphics positions are Float32, unlike the double-precision calculation engine.
    expect(Math.abs(radius.normalize().dot(tangent))).toBeLessThan(3e-6);
    original.dispose();
    deformed.dispose();
  });

  it('places positive/negative peak stress at the root and zero stress at the free end', () => {
    const g = mesh();
    const stress = g.getAttribute('stressPa');
    const top = closest(g, new Vector3(0, 0.015, 0));
    const bottom = closest(g, new Vector3(0, -0.015, 0));
    const tip = closest(g, new Vector3(0.3, 0.015, 0));
    expect(stress.getX(top)).toBeCloseTo(129839964.45132868, -1);
    expect(stress.getX(bottom)).toBeCloseTo(-129839964.45132868, -1);
    expect(stress.getX(tip)).toBe(0);
    g.dispose();
  });
  it('changes geometry but never the stress field when visual scale changes', () => {
    const a = mesh(0);
    const b = mesh(10);
    expect(Array.from(a.getAttribute('stressPa').array)).toEqual(
      Array.from(b.getAttribute('stressPa').array),
    );
    expect(Array.from(a.getAttribute('position').array)).not.toEqual(
      Array.from(b.getAttribute('position').array),
    );
    const p = b.getAttribute('position');
    // Mean of the deformed free-end ring is the independent tip displacement times ten.
    // Locate the axial extreme end by the original undeformed vertex positions.
    const original = a.getAttribute('position');
    let sum = 0;
    let count = 0;
    for (let i = 0; i < original.count; i++)
      if (Math.abs(original.getX(i) - 0.3) < 1e-7) {
        sum += p.getY(i);
        count++;
      }
    expect(sum / count).toBeCloseTo(-0.03802048739423973, 7);
    a.dispose();
    b.dispose();
  });
  it('uses neutral colour for unrevealed or unloaded cases', () => {
    const neutral = new Color('#a6b1c2');
    for (const g of [mesh(10, false), mesh(10, true, 0)]) {
      const c = g.getAttribute('color');
      for (let i = 0; i < c.count; i++) {
        expect(c.getX(i)).toBeCloseTo(neutral.r, 6);
        expect(c.getY(i)).toBeCloseTo(neutral.g, 6);
        expect(c.getZ(i)).toBeCloseTo(neutral.b, 6);
      }
      g.dispose();
    }
  });
  it('has outward outer faces, inward bore faces, and annular caps with no centre triangles', () => {
    const g = mesh();
    const p = g.getAttribute('position');
    const index = g.index;
    if (!index) throw new Error('Expected indexed tube');
    let outer = 0;
    let inner = 0;
    let cap = 0;
    for (let i = 0; i < index.count; i += 3) {
      const points = [0, 1, 2].map((n) => new Vector3().fromBufferAttribute(p, index.getX(i + n)));
      const [a, b, c] = points;
      const normal = b.clone().sub(a).cross(c.clone().sub(a));
      const middle = a.clone().add(b).add(c).divideScalar(3);
      expect(normal.length()).toBeGreaterThan(1e-10);
      if (Math.max(...points.map((v) => v.x)) - Math.min(...points.map((v) => v.x)) < 1e-7) {
        cap++;
        expect(normal.x * (middle.x < 0.15 ? -1 : 1)).toBeGreaterThan(0);
        // A flat polygon approximates the bore; allow its known angular chord error.
        expect(Math.hypot(middle.y, middle.z)).toBeGreaterThan(
          0.013 * Math.cos(Math.PI / 32) - 1e-7,
        );
        expect(points.every((v) => Math.hypot(v.y, v.z) >= 0.013 - 1e-7)).toBe(true);
      } else {
        const radii = points.map((v) => Math.hypot(v.y, v.z));
        const radialDot = normal.dot(new Vector3(0, middle.y, middle.z));
        if (Math.abs(radii[0] - 0.015) < 1e-7) {
          outer++;
          expect(radialDot).toBeGreaterThan(0);
        } else {
          inner++;
          expect(radialDot).toBeLessThan(0);
        }
      }
    }
    expect(outer).toBeGreaterThan(0);
    expect(inner).toBeGreaterThan(0);
    expect(cap).toBeGreaterThan(0);
    expect(Array.from(p.array).every(Number.isFinite)).toBe(true);
    g.dispose();
  });
});
