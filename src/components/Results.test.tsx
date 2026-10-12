import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Results } from './Results';
import type { CalculationOutcome } from '../physics/types';
const valid: CalculationOutcome = {
  ok: true,
  warnings: [],
  results: {
    innerDiameterM: 0.026,
    areaM2: 0.000175929188601028,
    secondMomentM4: 1.73290250772013e-8,
    maxMomentNm: 150,
    maxStressPa: 129839964.451329,
    tipDisplacementM: 0.00380204873942397,
    massKg: 0.142502642766833,
    yieldSafetyFactor: 2.12569374280336,
  },
};
it('presents independently benchmarked values with the correct converted units', () => {
  render(<Results outcome={valid} hideStress={false} />);
  for (const [id, value] of [
    ['inner', '26.000 mm'],
    ['area', '175.929 mm²'],
    ['inertia', '17329.03 mm⁴'],
    ['moment', '150.00 N·m'],
    ['stress', '129.84 MPa'],
    ['displacement', '3.802 mm'],
    ['mass', '142.50 g'],
    ['safety', '2.126'],
  ]) {
    expect(screen.getByTestId(`result-${id}`)).toHaveTextContent(value);
  }
});
it('hides peak numerical values and the peak-location interpretation before reveal', () => {
  render(<Results outcome={valid} hideStress />);
  for (const id of ['moment', 'stress', 'safety'])
    expect(screen.getByTestId(`result-${id}`)).toHaveTextContent('Hidden until reveal');
  expect(screen.queryByText(/Peak nominal bending stress/)).not.toBeInTheDocument();
});
it('replaces valid values with an alert for invalid geometry', () => {
  const view = render(<Results outcome={valid} hideStress={false} />);
  view.rerender(
    <Results
      outcome={{
        ok: false,
        errors: [{ field: 'wallThicknessM', message: 'Wall must be thinner than the radius.' }],
      }}
      hideStress={false}
    />,
  );
  expect(screen.queryByTestId('result-stress')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Wall must be thinner than the radius.');
});
it('describes zero load without implying actual tension or a finite safety factor', () => {
  if (!valid.ok) throw new Error('Invalid fixture');
  render(
    <Results
      outcome={{
        ...valid,
        results: {
          ...valid.results,
          maxStressPa: 0,
          maxMomentNm: 0,
          tipDisplacementM: 0,
          yieldSafetyFactor: null,
        },
      }}
      hideStress={false}
    />,
  );
  expect(screen.getByTestId('result-safety')).toHaveTextContent('Unloaded');
  expect(screen.getByText(/No bending stress: no tension or compression/)).toBeVisible();
});

it('does not round small positive stress to a misleading zero', () => {
  if (!valid.ok) throw new Error('Invalid fixture');
  render(
    <Results
      outcome={{
        ...valid,
        results: { ...valid.results, maxStressPa: 1, yieldSafetyFactor: 276000000 },
      }}
      hideStress={false}
    />,
  );
  expect(screen.getByTestId('result-stress')).toHaveTextContent('1.00e-6 MPa');
  expect(screen.getByTestId('result-safety')).toHaveTextContent('2.76e+8');
});
