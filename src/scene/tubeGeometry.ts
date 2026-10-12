import * as THREE from 'three';
import type { BeamInputsSI, MaterialProperties, BeamResults } from '../physics/types';
import { sampleBeam } from '../physics/sample';

export function buildTubeGeometry(
  input: BeamInputsSI,
  material: MaterialProperties,
  result: BeamResults,
  scale: number,
  stressVisible = true,
): THREE.BufferGeometry {
  const N = 40;
  const M = 32;
  const rO = input.outerDiameterM / 2;
  const rI = result.innerDiameterM / 2;
  const maxStress = result.maxStressPa || 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const stresses: number[] = [];
  const indices: number[] = [];

  const cT = new THREE.Color('#f6aa64');
  const cB = new THREE.Color('#68b7ff');
  const cN = new THREE.Color('#a6b1c2');

  for (let i = 0; i <= N; i++) {
    const x = (i / N) * input.lengthM;
    const s = sampleBeam(input, material, result, x, 0);
    const cx = x;
    const cy = -scale * s.downwardM;
    const cz = 0;

    const up = new THREE.Vector3(scale * s.slope, 1, 0).normalize();
    const bin = new THREE.Vector3(0, 0, 1);

    for (let j = 0; j < M; j++) {
      const theta = (j / M) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Outer
      const pO = new THREE.Vector3(cx, cy, cz)
        .addScaledVector(up, rO * cosT)
        .addScaledVector(bin, rO * sinT);
      const stressO = sampleBeam(input, material, result, x, rO * cosT).stressPa;
      positions.push(pO.x, pO.y, pO.z);
      stresses.push(stressO);
      const col = getCol(stressO, maxStress, cT, cB, cN, stressVisible);
      colors.push(col.r, col.g, col.b);

      // Inner
      const pI = new THREE.Vector3(cx, cy, cz)
        .addScaledVector(up, rI * cosT)
        .addScaledVector(bin, rI * sinT);
      const stressI = sampleBeam(input, material, result, x, rI * cosT).stressPa;
      positions.push(pI.x, pI.y, pI.z);
      stresses.push(stressI);
      const colI = getCol(stressI, maxStress, cT, cB, cN, stressVisible);
      colors.push(colI.r, colI.g, colI.b);
    }
  }

  // Each angular sample stores its outer vertex followed by its inner vertex.
  const g = (i: number, j: number, s: number) => i * 64 + j * 2 + s;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const j1 = (j + 1) % M;
      // Outer: outward winding
      indices.push(g(i, j, 0), g(i, j1, 0), g(i + 1, j1, 0));
      indices.push(g(i, j, 0), g(i + 1, j1, 0), g(i + 1, j, 0));
      // Inner: inward winding (reversed)
      indices.push(g(i, j, 1), g(i + 1, j, 1), g(i + 1, j1, 1));
      indices.push(g(i, j, 1), g(i + 1, j1, 1), g(i, j1, 1));
    }
  }

  // Root Cap (Annulus)
  for (let j = 0; j < M; j++) {
    const j1 = (j + 1) % M;
    indices.push(g(0, j, 0), g(0, j, 1), g(0, j1, 1));
    indices.push(g(0, j, 0), g(0, j1, 1), g(0, j1, 0));
  }

  // Tip Cap (Annulus)
  const iN = N;
  for (let j = 0; j < M; j++) {
    const j1 = (j + 1) % M;
    indices.push(g(iN, j, 0), g(iN, j1, 0), g(iN, j1, 1));
    indices.push(g(iN, j, 0), g(iN, j1, 1), g(iN, j, 1));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('stressPa', new THREE.Float32BufferAttribute(stresses, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function getCol(
  stress: number,
  max: number,
  t: THREE.Color,
  b: THREE.Color,
  n: THREE.Color,
  visible: boolean,
): THREE.Color {
  if (!visible) return n.clone();
  const ratio = Math.min(Math.abs(stress) / max, 1);
  const target = stress >= 0 ? t : b;
  return n.clone().lerp(target, ratio);
}
