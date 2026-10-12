import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FailurePanel } from './FailurePanel';
import { calculateBeam } from '../physics/beam';
import { getMaterial } from '../data/materials';
it('connects the current nominal yield calculation to five complete curated design FMEA modes', () => {
  const outcome = calculateBeam(
    { loadN: 500, lengthM: 0.3, outerDiameterM: 0.03, wallThicknessM: 0.002 },
    getMaterial('aluminium6061'),
  );
  render(<FailurePanel outcome={outcome} />);
  expect(screen.getByTestId('fmea-calculation-link')).toHaveTextContent('2.126');
  expect(screen.getByTestId('fmea-calculation-link')).toHaveTextContent(
    'not assessed by that number',
  );
  const table = screen.getByRole('table', { name: /simplified educational design FMEA/ });
  expect(within(table).getAllByRole('columnheader')).toHaveLength(7);
  const modes = within(table)
    .getAllByRole('rowheader')
    .map((h) => h.textContent?.toLowerCase());
  for (const term of ['yielding', 'fatigue', 'crushing', 'slip', 'insertion'])
    expect(modes.some((m) => m?.includes(term))).toBe(true);
  expect(modes).toHaveLength(5);
  for (const cell of within(table).getAllByRole('cell'))
    expect(cell.textContent?.trim().length).toBeGreaterThan(0);
});
