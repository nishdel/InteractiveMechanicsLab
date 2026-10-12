import { useMemo, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildTubeGeometry } from './tubeGeometry';
import { sampleBeam } from '../physics/sample';
import type { BeamInputsSI, MaterialProperties, BeamResults } from '../physics/types';

type Props = {
  input: BeamInputsSI;
  material: MaterialProperties;
  result: BeamResults;
  scale: number;
  stressVisible: boolean;
};

const Control = ({
  preset,
  revision,
  heightBudget,
}: {
  preset: 'iso' | 'side';
  revision: number;
  heightBudget: number;
}) => {
  const { camera, gl, invalidate, size } = useThree();
  // Browser verification waits for a scene frame, not just an empty canvas element.
  useFrame(({ gl: renderer }) => {
    if (renderer.domElement.dataset.sceneReady !== 'true')
      renderer.domElement.dataset.sceneReady = 'true';
  });
  useEffect(() => {
    // Fill the wide desktop viewport while retaining room for tall exaggerated shapes.
    // eslint-disable-next-line react-hooks/immutability -- Three cameras are mutable renderer resources; projection changes happen in this effect, outside React rendering.
    camera.zoom = Math.min(1.5, size.width / size.height, Math.max(0.5, 1.6 / heightBudget));
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, size.width, size.height, heightBudget]);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    const onChange = () => invalidate();
    controls.addEventListener('change', onChange);

    if (preset === 'iso') {
      camera.position.set(2.2, 1.1, 2.6);
      controls.target.set(0, 0, 0);
    } else {
      camera.position.set(0, 0, 3.6);
      controls.target.set(0, 0, 0);
    }
    controls.update();

    return () => {
      controls.removeEventListener('change', onChange);
      controls.dispose();
    };
  }, [preset, revision, camera, gl, invalidate]);
  return null;
};

export const BeamScene = ({ input, material, result, scale, stressVisible }: Props) => {
  const [preset, setPreset] = useState<'iso' | 'side'>('iso');
  const [revision, setRevision] = useState(0);

  const L = input.lengthM;
  const Do = input.outerDiameterM;
  const delta = result.tipDisplacementM;

  const norm = 2 / Math.max(L + 2 * Do, scale * delta + 3 * Do, 2.5 * Do);

  const geometry = useMemo(() => {
    const geo = buildTubeGeometry(input, material, result, scale, stressVisible);
    return geo;
  }, [input, material, result, scale, stressVisible]);

  const lineGeo = useMemo(() => {
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(L, 0, 0)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const distances = new Float32Array([0, L]);
    geo.setAttribute('lineDistance', new THREE.BufferAttribute(distances, 1));
    return geo;
  }, [L]);

  const neutralGeo = useMemo(() => {
    const midDisp = sampleBeam(input, material, result, L / 2, 0).downwardM;
    const y = -scale * midDisp;
    const pts = [new THREE.Vector3(L / 2, y, -Do / 2), new THREE.Vector3(L / 2, y, Do / 2)];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [input, material, result, L, scale, Do]);

  const arrow = useMemo(() => {
    if (input.loadN === 0) return null;
    const tipY = -scale * delta;
    const start = new THREE.Vector3(L, tipY + 3 * Do, 0);
    const dir = new THREE.Vector3(0, -1, 0);
    return new THREE.ArrowHelper(dir, start, 3 * Do, 0xffd082, Do, 0.7 * Do);
  }, [input.loadN, scale, delta, Do, L]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => lineGeo.dispose(), [lineGeo]);
  useEffect(() => () => neutralGeo.dispose(), [neutralGeo]);
  useEffect(() => () => arrow?.dispose(), [arrow]);
  const tipY = -scale * delta;
  const centreY =
    (Math.min(tipY - Do / 2, -1.25 * Do) +
      Math.max(1.25 * Do, tipY + (input.loadN > 0 ? 3 * Do : 0))) /
    2;

  const resetView = (p: 'iso' | 'side') => {
    setPreset(p);
    setRevision((r) => r + 1);
  };

  return (
    <div className="scene-stage">
      <div
        className="scene-canvas"
        role="img"
        aria-label={
          input.loadN > 0
            ? 'Analytical tube with a fixed left clamp and a downward transverse load at its free end'
            : 'Unloaded analytical tube with a fixed left clamp'
        }
      >
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ fov: 36, near: 0.01, far: 100, position: [2.2, 1.1, 2.6] }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Control
            preset={preset}
            revision={revision}
            heightBudget={norm * (scale * delta + 4.5 * Do)}
          />
          <group scale={norm} position={[(-norm * (L - 2 * Do)) / 2, -norm * centreY, 0]}>
            <mesh geometry={geometry}>
              <meshStandardMaterial vertexColors roughness={0.5} />
            </mesh>

            <lineSegments>
              <edgesGeometry args={[geometry, 45]} />
              <lineBasicMaterial color="#364557" />
            </lineSegments>

            {/* Clamp */}
            <mesh position={[-Do, 0, 0]}>
              <boxGeometry args={[2 * Do, 2.5 * Do, 2.5 * Do]} />
              <meshStandardMaterial color="#888" />
            </mesh>

            {/* Undeformed line */}
            <lineSegments geometry={lineGeo} renderOrder={2}>
              <lineDashedMaterial
                color="#d9e4f3"
                dashSize={L / 24}
                gapSize={L / 48}
                depthTest={false}
              />
            </lineSegments>

            {/* Neutral axis */}
            <lineSegments geometry={neutralGeo} renderOrder={3}>
              <lineBasicMaterial color="#72e5bf" depthTest={false} />
            </lineSegments>

            {/* Load Arrow */}
            {arrow && <primitive object={arrow} />}
          </group>
        </Canvas>
      </div>
      <div className="scene-toolbar">
        <button onClick={() => resetView('iso')}>Isometric view</button>
        <button onClick={() => resetView('side')}>Side view</button>
        {stressVisible && (
          <span className="viewport-note">
            {input.loadN > 0
              ? 'Upper tension (+) · lower compression (−)'
              : 'Unloaded: zero bending stress'}
          </span>
        )}
      </div>
    </div>
  );
};
