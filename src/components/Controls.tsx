import type { DisplayInputs } from '../physics/units';
import { materials } from '../data/materials';

type Props = {
  inputs: DisplayInputs;
  materialId: string;
  scale: number;
  onInput: (key: keyof DisplayInputs, value: number) => void;
  onMaterial: (id: string) => void;
  onScale: (n: number) => void;
};

const fields: [keyof DisplayInputs, string, string, number, number, number][] = [
  ['loadN', 'Applied load', 'N', 0, 2000, 10],
  ['lengthMm', 'Exposed length', 'mm', 50, 500, 5],
  ['outerDiameterMm', 'Outer diameter', 'mm', 20, 40, 0.1],
  ['wallThicknessMm', 'Wall thickness', 'mm', 0.1, 8, 0.1],
];

export function Controls({ inputs, materialId, scale, onInput, onMaterial, onScale }: Props) {
  return (
    <aside className="panel controls" aria-labelledby="controls-title">
      <h2 id="controls-title">Set up the beam</h2>
      <div className="control-group">
        <span className="eyebrow">01 / Loading</span>
        <div className="control-row">
          <label htmlFor="loadN">Applied load (N)</label>
          <div className="input-pair">
            <input
              id="loadN"
              type="number"
              step="any"
              value={Number.isFinite(inputs.loadN) ? inputs.loadN : ''}
              onChange={(e) => onInput('loadN', e.target.valueAsNumber)}
            />
            <input
              type="range"
              min={0}
              max={2000}
              step={10}
              value={Math.min(2000, Math.max(0, Number.isFinite(inputs.loadN) ? inputs.loadN : 0))}
              onChange={(e) => onInput('loadN', Number(e.target.value))}
              aria-label="Applied load (N) slider"
            />
          </div>
        </div>
      </div>

      <div className="control-group">
        <span className="eyebrow">02 / Geometry</span>
        {fields.slice(1).map(([key, label, unit, min, max, step]) => (
          <div className="control-row" key={key}>
            <label htmlFor={key}>{`${label} (${unit})`}</label>
            <div className="input-pair">
              <input
                id={key}
                type="number"
                step="any"
                value={Number.isFinite(inputs[key]) ? inputs[key] : ''}
                onChange={(e) => onInput(key, e.target.valueAsNumber)}
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={Math.min(
                  max,
                  Math.max(min, Number.isFinite(inputs[key]) ? inputs[key] : min),
                )}
                onChange={(e) => onInput(key, Number(e.target.value))}
                aria-label={`${label} (${unit}) slider`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="control-group">
        <span className="eyebrow">03 / Material</span>
        <div className="control-row">
          <label htmlFor="material">Material</label>
          <select id="material" value={materialId} onChange={(e) => onMaterial(e.target.value)}>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="control-group">
        <span className="eyebrow">04 / View</span>
        <div className="control-row">
          <label htmlFor="scale">Deformation scale</label>
          <div className="input-pair view-scale">
            <input
              id="scale"
              type="range"
              min={0}
              max={30}
              step={1}
              value={scale}
              onChange={(e) => onScale(Number(e.target.value))}
            />
            <span>{`${scale}×`}</span>
          </div>
        </div>
        <button type="button" onClick={() => onScale(0)}>
          Undeformed view
        </button>
      </div>
      <p>
        Visual scaling changes only the shape shown. Numerical results use the real displacement.
      </p>
    </aside>
  );
}
