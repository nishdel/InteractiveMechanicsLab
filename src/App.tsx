import { formatNumber } from './format';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Controls } from './components/Controls';
import { Results } from './components/Results';
import { LearnPanel } from './components/LearnPanel';
import { FailurePanel } from './components/FailurePanel';
import { SceneBoundary } from './components/SceneBoundary';
import { BeamScene } from './scene/BeamScene';
import { calculateBeam } from './physics/beam';
import { toSI, PaToMPa, PaToGPa } from './physics/units';
import { getMaterial } from './data/materials';
import { DEFAULT_STATE, loadSession, saveSession, type Mode } from './state/session';

const modes: readonly { id: Mode; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'learn', label: 'Learn' },
  { id: 'failure', label: 'Failure Analysis' },
];

function restoreLesson() {
  const saved = loadSession();
  return calculateBeam(toSI(saved.inputs), getMaterial(saved.materialId)).ok
    ? saved
    : { ...DEFAULT_STATE, inputs: { ...DEFAULT_STATE.inputs } };
}

export default function App() {
  const [state, setState] = useState(restoreLesson);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const input = useMemo(() => toSI(state.inputs), [state.inputs]);
  const material = getMaterial(state.materialId);
  const outcome = useMemo(() => calculateBeam(input, material), [input, material]);
  const hideStress =
    state.mode === 'learn' && !state.revealed && outcome.ok && outcome.results.maxStressPa > 0;
  useEffect(() => {
    if (outcome.ok) saveSession(state);
  }, [state, outcome]);
  const setMode = (mode: Mode) => setState((s) => ({ ...s, mode }));
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % modes.length
        : event.key === 'ArrowLeft'
          ? (index + modes.length - 1) % modes.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? modes.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      setMode(modes[next].id);
      tabs.current[next]?.focus();
    }
  }
  const viewPossible =
    outcome.ok &&
    input.lengthM >= 1e-6 &&
    input.lengthM <= 10 &&
    input.outerDiameterM >= 1e-6 &&
    input.outerDiameterM <= 2 &&
    outcome.results.tipDisplacementM * state.scale <= 10 &&
    Number.isFinite(Math.fround(outcome.results.maxStressPa));
  return (
    <div className="app-shell">
      <a href="#lesson-controls" className="skip-link">
        Skip to controls
      </a>
      <header className="app-header">
        <div className="brand">
          <svg className="brand-mark" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
            <path
              d="M6 25V8M6 17h21M11 8v17M16 12l8 10M24 12l-8 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="brand-name">Interactive Mechanics Lab</span>
        </div>
        <span className="app-meta">
          LOCAL LEARNING LAB <span aria-hidden="true"> / </span> 01
        </span>
      </header>
      <main>
        <div className="lesson-heading">
          <span className="eyebrow">Bicycle structures / Lesson 01</span>
          <h1>Small tube. Big mechanics.</h1>
          <p className="lesson-subtitle">
            Explore how a seatpost carries a load, bends, and approaches its limits.
          </p>
          <span className="model-badge">Analytical beam-model visualization</span>
        </div>
        <div className="workspace">
          <div id="lesson-controls" tabIndex={-1}>
            <Controls
              inputs={state.inputs}
              materialId={state.materialId}
              scale={state.scale}
              onInput={(key, value) =>
                setState((s) => ({ ...s, inputs: { ...s.inputs, [key]: value } }))
              }
              onMaterial={(materialId) => setState((s) => ({ ...s, materialId }))}
              onScale={(scale) => setState((s) => ({ ...s, scale }))}
            />
          </div>
          <section className="panel viewport" aria-labelledby="view-title">
            <div className="viewport-header">
              <div>
                <span className="eyebrow">Model / Hollow circular cantilever</span>
                <h2 id="view-title">Seatpost in bending</h2>
              </div>
              <span className="model-badge">LIVE MODEL</span>
            </div>
            <div className="canvas-wrap" data-testid="beam-viewport">
              {outcome.ok && viewPossible ? (
                <SceneBoundary>
                  <BeamScene
                    input={input}
                    material={material}
                    result={outcome.results}
                    scale={state.scale}
                    stressVisible={!hideStress}
                  />
                </SceneBoundary>
              ) : (
                <div className="empty-state" role="status">
                  <h3>{outcome.ok ? 'Outside the 3D display range' : 'Check the inputs'}</h3>
                  <p>
                    {outcome.ok
                      ? 'The renderer supports lengths from 0.001 to 10,000 mm, diameters from 0.001 to 2,000 mm, displayed displacement up to 10 m, and stress within the graphics numeric range. Numerical results remain available.'
                      : 'Correct the geometry or load to see a new model and calculated results.'}
                  </p>
                </div>
              )}
            </div>
            <div className="scene-readout">
              <span data-testid="deformation-label">
                {state.scale > 1
                  ? `Deformation visually exaggerated ${state.scale}×`
                  : state.scale === 1
                    ? 'Deformation at true scale (1×)'
                    : 'Undeformed view (0×)'}
              </span>
              <span>Numerical results always use real displacement</span>
            </div>
            {outcome.ok && !hideStress ? (
              <div className="stress-legend" aria-label="Signed bending stress scale">
                <div className="legend-labels">
                  <span>Compression (−)</span>
                  <span>Neutral axis: 0</span>
                  <span>Tension (+)</span>
                </div>
                <div className="legend-gradient" aria-hidden="true" />
                <div className="legend-labels">
                  <span>−{formatNumber(PaToMPa(outcome.results.maxStressPa), 2)} MPa</span>
                  <span>0 MPa</span>
                  <span>+{formatNumber(PaToMPa(outcome.results.maxStressPa), 2)} MPa</span>
                </div>
                <p>
                  Colours show signed axial bending stress, normalised to this case. Compare the
                  numbers when changing inputs.
                </p>
              </div>
            ) : (
              hideStress && (
                <p className="viewport-note">
                  Stress colours and peak results are hidden until you reveal your prediction in
                  Learn.
                </p>
              )
            )}
            <p className="viewport-note">
              Rotated teaching view: the tube is horizontal and the applied vertical load is
              transverse. A real seatpost also carries axial load and saddle offset effects. Dashed
              line: undeformed centreline. Cross-section line: neutral axis (zero bending stress).
              The left block is the ideal fixed clamp.
            </p>
          </section>
          <Results outcome={outcome} hideStress={hideStress} />
        </div>
        <details className="material-note">
          <summary>Material provenance &amp; model assumptions</summary>
          <div className="explore-grid">
            <div>
              <h3>{material.displayName}</h3>
              <p>
                E = {PaToGPa(material.elasticModulusPa)} GPa · density = {material.densityKgM3}{' '}
                kg/m³ · representative yield = {PaToMPa(material.yieldStrengthPa)} MPa.
              </p>
              <p>{material.provenance}</p>
              <p>
                <a href={material.sourceUrl} target="_blank" rel="noreferrer">
                  Technical source (opens online)
                </a>{' '}
                · {material.sourceLocation}
              </p>
              <p>{material.warning}</p>
            </div>
            <div>
              <h3>What this model assumes</h3>
              <p>
                Uniform isotropic tube, perfectly fixed root, static transverse point load, linear
                elastic material, and small deflection. It excludes clamp contact, stress
                concentrations, shear deformation, joint slip, axial load, buckling, and damage.
              </p>
              <p>
                Warnings identify some limits; their absence does not certify a bicycle component.
              </p>
            </div>
          </div>
        </details>
        <section className="learning-area">
          <div role="tablist" aria-label="Learning modes" className="mode-tabs">
            {modes.map((mode, index) => (
              <button
                key={mode.id}
                id={`tab-${mode.id}`}
                ref={(el) => {
                  tabs.current[index] = el;
                }}
                role="tab"
                aria-selected={state.mode === mode.id}
                aria-controls={`panel-${mode.id}`}
                tabIndex={state.mode === mode.id ? 0 : -1}
                onKeyDown={(event) => tabKey(event, index)}
                onClick={() => setMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`panel-${state.mode}`}
            aria-labelledby={`tab-${state.mode}`}
            tabIndex={0}
          >
            {state.mode === 'explore' && (
              <div className="explore-grid">
                <article className="learning-card">
                  <span className="eyebrow">Try this</span>
                  <h2>Change one thing. Understand its effect.</h2>
                  <p>
                    Double the load. Stress and displacement double. Then increase the exposed
                    length: bending stress grows with length, while displacement grows with its
                    cube.
                  </p>
                  <p>
                    Switch material with the same geometry. The stress stays the same; stiffness,
                    mass, and yield margin change.
                  </p>
                  <button className="button-primary" onClick={() => setMode('learn')}>
                    Make a prediction
                  </button>
                </article>
                <article className="learning-card">
                  <span className="eyebrow">Read the model</span>
                  <h2>Follow the load to the clamp.</h2>
                  <p>
                    The load arrow marks the free end. The clamp supplies an opposing force and a
                    reaction moment. The tube transfers this load through internal shear and
                    bending.
                  </p>
                  <p>
                    Drag to orbit, scroll to zoom, or use the view buttons. All essential meaning is
                    also provided in text and numbers.
                  </p>
                  <p>
                    Your last valid session is saved in this browser. No account or connection is
                    needed.
                  </p>
                  <button
                    onClick={() =>
                      setState({ ...DEFAULT_STATE, inputs: { ...DEFAULT_STATE.inputs } })
                    }
                  >
                    Reset lesson
                  </button>
                </article>
              </div>
            )}
            {state.mode === 'learn' &&
              (!outcome.ok ? (
                <p role="status" className="prediction-card">
                  Correct the inputs to try a prediction for the current case.
                </p>
              ) : outcome.results.maxStressPa === 0 ? (
                <div className="prediction-card" role="status">
                  <h2>No unique peak under zero load</h2>
                  <p>
                    Bending stress is zero everywhere. Apply a positive load to make a
                    highest-stress prediction.
                  </p>
                </div>
              ) : (
                <LearnPanel
                  prediction={state.prediction}
                  revealed={state.revealed}
                  onPredict={(prediction) => setState((s) => ({ ...s, prediction }))}
                  onReveal={() => setState((s) => (s.prediction ? { ...s, revealed: true } : s))}
                  onReset={() => setState((s) => ({ ...s, prediction: null, revealed: false }))}
                />
              ))}
            {state.mode === 'failure' && <FailurePanel outcome={outcome} />}
          </div>
          {modes
            .filter((mode) => mode.id !== state.mode)
            .map((mode) => (
              <div
                key={mode.id}
                hidden
                role="tabpanel"
                id={`panel-${mode.id}`}
                aria-labelledby={`tab-${mode.id}`}
              />
            ))}
        </section>
        <footer className="footer-note">
          Educational model · Representative properties · No design certification · Static yield
          margin does not predict fatigue life.
        </footer>
      </main>
    </div>
  );
}
