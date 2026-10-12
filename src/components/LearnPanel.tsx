import { learningSections, glossary } from '../data/learning';

interface LearnPanelProps {
  prediction: string | null;
  revealed: boolean;
  onPredict: (value: string) => void;
  onReveal: () => void;
  onReset: () => void;
}

const options = [
  { value: 'clamp', label: 'Clamp boundary' },
  { value: 'middle', label: 'Middle of tube' },
  { value: 'tip', label: 'Free tip' },
];

export function LearnPanel({
  prediction,
  revealed,
  onPredict,
  onReveal,
  onReset,
}: LearnPanelProps) {
  const isCorrect = prediction === 'clamp';

  return (
    <div className="lesson-panel">
      <fieldset>
        <legend>Where is the largest bending stress?</legend>
        {options.map((opt) => (
          <label key={opt.value} className="prediction-card">
            <input
              type="radio"
              name="bending-stress"
              value={opt.value}
              checked={prediction === opt.value}
              onChange={() => onPredict(opt.value)}
              disabled={revealed}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <div className="button-row">
        <button className="button-primary" onClick={onReveal} disabled={!prediction || revealed}>
          Reveal result
        </button>
        {revealed && (
          <button className="button-primary" onClick={onReset}>
            Try prediction again
          </button>
        )}
      </div>

      <p className="status" role="status" aria-atomic="true">
        {revealed && (
          <>
            {isCorrect
              ? 'Correct! The peak bending stress occurs at the clamp.'
              : 'Not quite. The correct answer is the clamp boundary.'}{' '}
            The clamp carries the full lever arm L; its reaction moment is FL.
          </>
        )}
      </p>

      {revealed && (
        <div className="result-section">
          <div className="free-body-container">
            <svg
              viewBox="0 0 200 100"
              className="free-body-diagram"
              role="img"
              fill="currentColor"
              aria-label="Free-body diagram: downward tip load, upward clamp reaction and counterclockwise reaction moment"
            >
              <defs>
                <marker
                  id="reaction-moment-arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0 0L6 3L0 6Z" fill="#72e5bf" />
                </marker>
              </defs>
              {/* Fixed support */}
              <rect x="10" y="20" width="10" height="60" fill="#69788e" />
              <line x1="10" y1="20" x2="10" y2="80" stroke="#a6b1c2" strokeWidth="2" />
              {/* Tube */}
              <rect x="20" y="40" width="120" height="20" fill="#a6b1c2" stroke="#a6b1c2" />
              <text x="78" y="34" fontSize="12">
                L
              </text>
              {/* Force F at tip */}
              <line x1="140" y1="50" x2="140" y2="80" stroke="#f6aa64" strokeWidth="2" />
              <polygon points="140,80 135,70 145,70" fill="#f6aa64" />
              <text x="145" y="75" fontSize="12">
                F
              </text>
              {/* Reaction at clamp */}
              <line x1="20" y1="50" x2="20" y2="20" stroke="#68b7ff" strokeWidth="2" />
              <polygon points="20,20 15,30 25,30" fill="#68b7ff" />
              <text x="5" y="15" fontSize="12">
                F
              </text>
              {/* Moment */}
              <path
                d="M30 90 A12 12 0 1 0 18 78"
                fill="none"
                stroke="#72e5bf"
                strokeWidth="2"
                markerEnd="url(#reaction-moment-arrow)"
              />
              <text x="47" y="90" fontSize="12">
                FL
              </text>
            </svg>
            <p className="text-equivalent">
              Fixed left support. Distance from clamp to load is L. Downward force F at tip. Upward
              reaction F at clamp. Counterclockwise reaction moment FL at the clamp balances the
              clockwise moment of the tip force.
            </p>
          </div>

          <div className="formula-grid">
            <div className="formula-card">
              <code>Di = Do − 2t</code>
            </div>
            <div className="formula-card">
              <code>A = π(Do² − Di²)/4</code>
            </div>
            <div className="formula-card">
              <code>I = π(Do⁴ − Di⁴)/64</code>
            </div>
            <div className="formula-card">
              <code>Mmax = FL</code>
            </div>
            <div className="formula-card">
              <code>σmax = Mmax·c/I</code>
            </div>
            <div className="formula-card">
              <code>δ = FL³/(3EI)</code>
            </div>
            <div className="formula-card">
              <code>m = ρAL</code>
            </div>
            <div className="formula-card">
              <code>n = σy/σmax</code>
            </div>
            <div className="formula-card">
              <code>c = Do/2</code>
            </div>
          </div>

          <table className="glossary">
            <caption>Variable glossary</caption>
            <thead>
              <tr>
                <th scope="col">Symbol</th>
                <th scope="col">Meaning</th>
                <th scope="col">SI unit</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((g) => (
                <tr key={g.symbol}>
                  <th scope="row">{g.symbol}</th>
                  <td>{g.meaning}</td>
                  <td>{g.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="learning-grid">
            {learningSections.map((section) => (
              <div key={section.id} className="learning-card">
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
