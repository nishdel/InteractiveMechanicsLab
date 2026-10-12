import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_STATE, STORAGE_KEY, loadSession, saveSession } from './session';

describe('local session boundary', () => {
  it.each(['{', 'null', '{}', '{"version":99,"state":{}}'])(
    'ignores corrupt/unrecognised storage %s',
    (value) => {
      localStorage.setItem(STORAGE_KEY, value);
      expect(loadSession()).toEqual(DEFAULT_STATE);
    },
  );
  it.each([
    { materialId: 'invented' },
    { scale: 31 },
    { scale: -1 },
    { scale: 1.5 },
    { mode: 'invented' },
    { prediction: 'invented' },
    { revealed: true, prediction: null },
    { inputs: { ...DEFAULT_STATE.inputs, wallThicknessMm: 15 } },
    { inputs: { ...DEFAULT_STATE.inputs, lengthMm: -1 } },
    { inputs: { ...DEFAULT_STATE.inputs, loadN: -1 } },
  ])('rejects structurally invalid persisted states %o', (change) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, state: { ...DEFAULT_STATE, ...change } }),
    );
    expect(loadSession()).toEqual(DEFAULT_STATE);
  });
  it('returns independent nested default objects', () => {
    const a = loadSession();
    const b = loadSession();
    expect(a).not.toBe(b);
    expect(a.inputs).not.toBe(b.inputs);
  });
  it('round trips a valid session', () => {
    const state = { ...DEFAULT_STATE, inputs: { ...DEFAULT_STATE.inputs, loadN: 750 }, scale: 0 };
    saveSession(state);
    expect(loadSession()).toEqual(state);
  });
  it('does not require storage permission', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked');
    });
    expect(loadSession()).toEqual(DEFAULT_STATE);
    expect(() => saveSession(DEFAULT_STATE)).not.toThrow();
  });
});
