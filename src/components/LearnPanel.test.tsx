import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { LearnPanel } from './LearnPanel';
function Activity() {
  const [prediction, predict] = useState<string | null>(null);
  const [revealed, reveal] = useState(false);
  return (
    <LearnPanel
      prediction={prediction}
      revealed={revealed}
      onPredict={predict}
      onReveal={() => reveal(true)}
      onReset={() => {
        predict(null);
        reveal(false);
      }}
    />
  );
}
it('conceals answers, explains an incorrect prediction, and supports a fresh attempt', async () => {
  const user = userEvent.setup();
  render(<Activity />);
  const feedback = screen.getByRole('status');
  expect(feedback).toBeEmptyDOMElement();
  expect(screen.getByRole('button', { name: 'Reveal result' })).toBeDisabled();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: 'Free tip' }));
  await user.click(screen.getByRole('button', { name: 'Reveal result' }));
  expect(screen.getByRole('status')).toBe(feedback);
  expect(screen.getByRole('status')).toHaveTextContent('correct answer is the clamp boundary');
  expect(screen.getByRole('img', { name: /Free-body diagram/ })).toBeVisible();
  expect(screen.getByRole('radio', { name: 'Free tip' })).toBeDisabled();
  expect(screen.getByText('δ = FL³/(3EI)')).toBeVisible();
  const glossary = screen.getByRole('table', { name: 'Variable glossary' });
  expect(
    within(glossary).getByRole('row', { name: /m Represented exposed-tube mass kg/ }),
  ).toBeVisible();
  expect(within(glossary).getByRole('row', { name: /I Second moment of area/ })).toHaveTextContent(
    'm⁴',
  );
  await user.click(screen.getByRole('button', { name: 'Try prediction again' }));
  expect(screen.getByRole('status')).toBe(feedback);
  expect(feedback).toBeEmptyDOMElement();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reveal result' })).toBeDisabled();
});
