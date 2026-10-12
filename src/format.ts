/** Keep small nonzero results distinct from zero and large values readable. */
export function formatNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return 'Outside display range';
  const magnitude = Math.abs(value);
  return magnitude !== 0 && (magnitude < 10 ** -decimals || magnitude >= 1e6)
    ? value.toExponential(2)
    : value.toFixed(decimals);
}
