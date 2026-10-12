import { formatNumber } from '../format';
import { fmeaItems } from '../data/fmea';
import type { CalculationOutcome } from '../physics/types';

export function FailurePanel({ outcome }: { outcome: CalculationOutcome }) {
  return (
    <section aria-labelledby="failure-title" className="lesson-panel">
      <div className="panel-header">
        <span className="eyebrow">03 / Failure analysis</span>
        <h2 id="failure-title">A stress result is only part of the story.</h2>
        <p>
          FEA (finite element analysis) estimates physical response using a discretised model. FMEA
          (failure mode and effects analysis) asks what can fail, why, and how a design team can
          prevent or detect it. This lab uses analytical beam equations, not FEA.
        </p>
      </div>
      <p>
        This curated design FMEA connects the bending calculation to failures it cannot fully
        assess. It has no risk score and is not an inspection schedule or riding approval.
      </p>
      <p className="model-warning" data-testid="fmea-calculation-link">
        {outcome.ok
          ? outcome.results.yieldSafetyFactor === null
            ? 'Current case is unloaded: no yield safety factor is reported.'
            : `Current analytical yield safety factor: ${formatNumber(outcome.results.yieldSafetyFactor, 3)}. This addresses nominal yielding only.`
          : 'Correct the inputs to connect a current calculation to nominal yielding.'}{' '}
        Fatigue, clamp crushing, slippage, and insertion/load transfer are not assessed by that
        number.
      </p>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Design FMEA table, scroll horizontally"
      >
        <table className="fmea-table">
          <caption>Seatpost: simplified educational design FMEA</caption>
          <thead>
            <tr>
              {[
                'Function',
                'Failure mode',
                'Effect',
                'Cause',
                'Prevention',
                'Detection',
                'Possible design action',
              ].map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fmeaItems.map((item) => (
              <tr key={item.id}>
                <td>{item.function}</td>
                <th scope="row">{item.failureMode}</th>
                <td>{item.effect}</td>
                <td>{item.cause}</td>
                <td>{item.prevention}</td>
                <td>{item.detection}</td>
                <td>{item.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
