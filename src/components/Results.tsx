import { formatNumber as fmt } from '../format';
import type { CalculationOutcome, BeamResults, ModelWarning, InputIssue } from '../physics/types';
import { mToMm, m2ToMm2, m4ToMm4, PaToMPa, kgToG } from '../physics/units';

const fieldLabels: Record<InputIssue['field'], string> = {
  loadN: 'Applied load',
  lengthM: 'Exposed length',
  outerDiameterM: 'Outer diameter',
  wallThicknessM: 'Wall thickness',
  material: 'Material',
  result: 'Calculation',
};

export function Results({
  outcome,
  hideStress,
}: {
  outcome: CalculationOutcome;
  hideStress: boolean;
}) {
  if (!outcome.ok) {
    return (
      <section className="panel results" role="alert">
        <h2>Calculated results</h2>
        <p>No result — correct the inputs</p>
        <ul>
          {outcome.errors.map((e: InputIssue, i: number) => (
            <li key={i}>
              {fieldLabels[e.field]}: {e.message}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const r: BeamResults = outcome.results;
  const hidden = hideStress;

  const momentVal = hidden ? 'Hidden until reveal' : `${fmt(r.maxMomentNm, 2)} N·m`;
  const stressVal = hidden ? 'Hidden until reveal' : `${fmt(PaToMPa(r.maxStressPa), 2)} MPa`;
  const safetyVal = hidden
    ? 'Hidden until reveal'
    : r.yieldSafetyFactor === null
      ? 'Unloaded'
      : fmt(r.yieldSafetyFactor, 3);

  const stressNote = hidden
    ? ''
    : r.maxStressPa === 0
      ? 'No bending stress: no tension or compression from the applied load.'
      : 'Peak nominal bending stress: clamp boundary; upper tension (+), lower compression (-).';

  return (
    <section className="panel results">
      <div className="panel-header">
        <span className="eyebrow">analytical result</span>
        <h2>Calculated results</h2>
      </div>
      <dl className="result-grid">
        <div className="result-row">
          <dt>Inner diameter</dt>
          <dd id="result-inner" data-testid="result-inner">
            {fmt(mToMm(r.innerDiameterM), 3)} mm
          </dd>
        </div>
        <div className="result-row">
          <dt>Area</dt>
          <dd id="result-area" data-testid="result-area">
            {fmt(m2ToMm2(r.areaM2), 3)} mm²
          </dd>
        </div>
        <div className="result-row">
          <dt>Second moment</dt>
          <dd id="result-inertia" data-testid="result-inertia">
            {fmt(m4ToMm4(r.secondMomentM4), 2)} mm⁴
          </dd>
        </div>
        <div className="result-row">
          <dt>Maximum moment</dt>
          <dd id="result-moment" data-testid="result-moment">
            {momentVal}
          </dd>
        </div>
        <div className="result-row">
          <dt>Maximum bending stress</dt>
          <dd id="result-stress" data-testid="result-stress">
            {stressVal}
          </dd>
        </div>
        <div className="result-row">
          <dt>Tip displacement</dt>
          <dd id="result-displacement" data-testid="result-displacement">
            {fmt(mToMm(r.tipDisplacementM), 3)} mm
          </dd>
        </div>
        <div className="result-row">
          <dt>Represented mass</dt>
          <dd id="result-mass" data-testid="result-mass">
            {fmt(kgToG(r.massKg), 2)} g
          </dd>
        </div>
        <div className="result-row">
          <dt>Yield safety factor</dt>
          <dd id="result-safety" data-testid="result-safety">
            {safetyVal}
          </dd>
        </div>
      </dl>
      {stressNote && <p className="viewport-note">{stressNote}</p>}
      {outcome.warnings.length > 0 && (
        <div role="status" className="warning">
          {outcome.warnings.map((w: ModelWarning, i: number) => (
            <p key={i} className="model-warning">
              {w.message}
            </p>
          ))}
        </div>
      )}
      <p className="viewport-note">
        Mass covers exposed tube only. Yield safety factor is not fatigue life or a safe-to-ride
        verdict.
      </p>
    </section>
  );
}
