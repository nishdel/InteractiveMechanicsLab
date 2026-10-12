import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SceneBoundary } from './SceneBoundary';

it('preserves a readable fallback and allows retry after the renderer recovers', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  let available = false;
  function Renderer() {
    if (!available) throw new Error('WebGL unavailable');
    return <p>Recovered renderer</p>;
  }
  render(
    <SceneBoundary>
      <Renderer />
    </SceneBoundary>,
  );
  expect(screen.getByRole('status')).toHaveTextContent(
    'Calculations, learning activities, and failure analysis still work.',
  );
  available = true;
  await userEvent.click(screen.getByRole('button', { name: 'Retry 3D view' }));
  expect(screen.getByText('Recovered renderer')).toBeVisible();
});

it('handles a lost canvas context as a recoverable view failure', () => {
  render(
    <SceneBoundary>
      <canvas aria-label="Test renderer" />
    </SceneBoundary>,
  );
  const lost = new Event('webglcontextlost', { cancelable: true });
  fireEvent(screen.getByLabelText('Test renderer'), lost);
  expect(lost.defaultPrevented).toBe(true);
  expect(screen.getByRole('status')).toHaveTextContent('3D view unavailable');
});
