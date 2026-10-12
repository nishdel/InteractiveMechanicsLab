import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { DEFAULT_STATE, STORAGE_KEY } from './state/session';

vi.mock('./scene/BeamScene', () => ({
  BeamScene: ({ scale, stressVisible }: { scale: number; stressVisible: boolean }) => (
    <div data-testid="scene" data-scale={scale} data-stress-visible={String(stressVisible)}>
      3D scene stand-in
    </div>
  ),
}));

describe('learning application integration', () => {
  it('keeps finite analytical results available when stress exceeds the graphics numeric range', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Undeformed view' }));
    fireEvent.change(screen.getByLabelText('Applied load (N)'), { target: { value: '1e35' } });
    expect(screen.getByTestId('result-stress')).toBeInTheDocument();
    expect(screen.getByText('Outside the 3D display range')).toBeVisible();
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
  });

  it('recovers from persisted finite geometry that exceeds arithmetic limits', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: { ...DEFAULT_STATE, inputs: { ...DEFAULT_STATE.inputs, lengthMm: 1e200 } },
      }),
    );
    render(<App />);
    expect(screen.getByLabelText('Exposed length (mm)')).toHaveValue(300);
    expect(screen.getByTestId('result-stress')).toHaveTextContent('129.84');
  });

  it('updates actual results when loading changes but not when visual scale changes', () => {
    render(<App />);
    expect(screen.getByTestId('result-stress')).toHaveTextContent('129.84');
    expect(screen.getByTestId('result-displacement')).toHaveTextContent('3.802');
    fireEvent.change(screen.getByLabelText('Applied load (N)'), { target: { value: '1000' } });
    expect(screen.getByTestId('result-stress')).toHaveTextContent('259.68');
    expect(screen.getByTestId('result-displacement')).toHaveTextContent('7.604');
    fireEvent.change(screen.getByLabelText('Deformation scale'), { target: { value: '20' } });
    expect(screen.getByTestId('deformation-label')).toHaveTextContent('visually exaggerated 20');
    expect(screen.getByTestId('result-displacement')).toHaveTextContent('7.604');
    fireEvent.click(screen.getByRole('button', { name: 'Undeformed view' }));
    expect(screen.getByTestId('scene')).toHaveAttribute('data-scale', '0');
    expect(screen.getByTestId('result-displacement')).toHaveTextContent('7.604');
  });
  it('switches representative material without changing geometric stress', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Material'), 'steel953');
    expect(screen.getByTestId('result-stress')).toHaveTextContent('129.84');
    expect(screen.getByTestId('result-displacement')).toHaveTextContent('1.298');
    expect(screen.getByTestId('result-safety')).toHaveTextContent('11.553');
    expect(screen.getByTestId('result-mass')).toHaveTextContent('411.15');
    await user.selectOptions(screen.getByLabelText('Material'), 'titanium32');
    expect(screen.getByTestId('result-stress')).toHaveTextContent('129.84');
    expect(screen.getByTestId('result-displacement')).toHaveTextContent('2.597');
    expect(screen.getByTestId('result-safety')).toHaveTextContent('3.720');
    expect(screen.getByTestId('result-mass')).toHaveTextContent('236.45');
  });
  it('describes an unloaded tube without a finite safety claim', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Applied load (N)'), { target: { value: '0' } });
    expect(screen.getByTestId('result-stress')).toHaveTextContent('0.00');
    expect(screen.getByTestId('result-safety')).toHaveTextContent('Unloaded');
    expect(screen.getByText(/no bending stress.*no tension or compression/i)).toBeVisible();
  });
  it('does not teach a unique clamp peak in an unloaded case', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Applied load (N)'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('tab', { name: 'Learn' }));
    expect(screen.getByText('No unique peak under zero load')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Reveal result' })).not.toBeInTheDocument();
  });
  it('removes stale results and the scene for invalid geometry and recovers', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Wall thickness (mm)'), { target: { value: '15' } });
    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.queryByTestId('result-stress')).not.toBeInTheDocument();
    expect(screen.queryByTestId('scene')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Wall thickness (mm)'), { target: { value: '2' } });
    expect(screen.getByTestId('result-stress')).toHaveTextContent('129.84');
  });
  it('keeps prediction answers hidden until a keyboard-accessible reveal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Learn' }));
    expect(screen.getByTestId('scene')).toHaveAttribute('data-stress-visible', 'false');
    expect(screen.getByTestId('result-stress')).toHaveTextContent('Hidden until reveal');
    expect(screen.getByRole('button', { name: 'Reveal result' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Free tip' }));
    await user.click(screen.getByRole('button', { name: 'Reveal result' }));
    expect(screen.getByTestId('scene')).toHaveAttribute('data-stress-visible', 'true');
    expect(screen.getByTestId('result-stress')).toHaveTextContent('129.84');
    expect(screen.getByRole('table', { name: /variable|symbol|glossary/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Try prediction again' }));
    expect(screen.getByTestId('scene')).toHaveAttribute('data-stress-visible', 'false');
  });
  it('supports arrow-key mode navigation and the five curated FMEA rows', async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByRole('tab', { name: 'Explore' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Failure Analysis' })).toHaveFocus();
    const table = screen.getByRole('table', { name: /simplified educational design FMEA/i });
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText(/This lab uses analytical beam equations/)).toBeVisible();
  });
  it('restores the last valid state while ignoring a later invalid draft', () => {
    const first = render(<App />);
    fireEvent.change(screen.getByLabelText('Applied load (N)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('Wall thickness (mm)'), { target: { value: '15' } });
    first.unmount();
    render(<App />);
    expect(screen.getByLabelText('Applied load (N)')).toHaveValue(800);
    expect(screen.getByLabelText('Wall thickness (mm)')).toHaveValue(2);
  });
});
