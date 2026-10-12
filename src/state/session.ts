import type { DisplayInputs } from '../physics/units';

export type Mode = 'explore' | 'learn' | 'failure';
export type LabState = {
  inputs: DisplayInputs;
  materialId: string;
  scale: number;
  mode: Mode;
  prediction: string | null;
  revealed: boolean;
};

export const DEFAULT_STATE: Readonly<LabState> = Object.freeze({
  inputs: Object.freeze({ loadN: 500, lengthMm: 300, outerDiameterMm: 30, wallThicknessMm: 2 }),
  materialId: 'aluminium6061',
  scale: 10,
  mode: 'explore',
  prediction: null,
  revealed: false,
});

export const STORAGE_KEY = 'interactive-mechanics-lab:v1';

const MATERIALS = ['steel953', 'aluminium6061', 'titanium32'] as const;
const MODES = ['explore', 'learn', 'failure'] as const;
const PREDICTIONS = ['clamp', 'middle', 'tip'] as const;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isDisplayInputs(v: unknown): v is DisplayInputs {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  if (
    !isFiniteNumber(o.loadN) ||
    !isFiniteNumber(o.lengthMm) ||
    !isFiniteNumber(o.outerDiameterMm) ||
    !isFiniteNumber(o.wallThicknessMm)
  )
    return false;
  if (o.loadN < 0 || o.lengthMm <= 0 || o.outerDiameterMm <= 0 || o.wallThicknessMm <= 0)
    return false;
  if (o.wallThicknessMm >= o.outerDiameterMm / 2) return false;
  return true;
}

function isState(v: unknown): v is LabState {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  if (!isDisplayInputs(o.inputs)) return false;
  if (typeof o.materialId !== 'string' || !(MATERIALS as readonly string[]).includes(o.materialId))
    return false;
  if (typeof o.scale !== 'number' || !Number.isInteger(o.scale) || o.scale < 0 || o.scale > 30)
    return false;
  if (typeof o.mode !== 'string' || !(MODES as readonly string[]).includes(o.mode)) return false;
  if (
    o.prediction !== null &&
    (typeof o.prediction !== 'string' || !(PREDICTIONS as readonly string[]).includes(o.prediction))
  )
    return false;
  if (typeof o.revealed !== 'boolean') return false;
  if (o.revealed && o.prediction === null) return false;
  return true;
}

function cloneDefault(): LabState {
  return {
    inputs: { ...DEFAULT_STATE.inputs },
    materialId: DEFAULT_STATE.materialId,
    scale: DEFAULT_STATE.scale,
    mode: DEFAULT_STATE.mode,
    prediction: DEFAULT_STATE.prediction,
    revealed: DEFAULT_STATE.revealed,
  };
}

export function loadSession(): LabState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return cloneDefault();
    const wrapper = parsed as Record<string, unknown>;
    if (wrapper.version !== 1) return cloneDefault();
    const state = wrapper.state;
    if (!isState(state)) return cloneDefault();
    return {
      inputs: { ...state.inputs },
      materialId: state.materialId,
      scale: state.scale,
      mode: state.mode,
      prediction: state.prediction,
      revealed: state.revealed,
    };
  } catch {
    return cloneDefault();
  }
}

export function saveSession(state: LabState): void {
  if (!isState(state)) return;
  try {
    const payload = { version: 1, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage failure is non-fatal
  }
}
