/** Kamuya açık TÜFE kümülatif endeks (2021=100 yaklaşık). EVDS anahtarı yokken ücretsiz fallback. */
export const TR_TUFE_MONTHLY: { month: string; index: number }[] = [
  { month: '2023-01', index: 100.0 },
  { month: '2023-02', index: 103.2 },
  { month: '2023-03', index: 105.5 },
  { month: '2023-04', index: 107.9 },
  { month: '2023-05', index: 108.3 },
  { month: '2023-06', index: 112.1 },
  { month: '2023-07', index: 122.0 },
  { month: '2023-08', index: 133.5 },
  { month: '2023-09', index: 140.2 },
  { month: '2023-10', index: 145.1 },
  { month: '2023-11', index: 149.8 },
  { month: '2023-12', index: 154.2 },
  { month: '2024-01', index: 164.5 },
  { month: '2024-02', index: 171.2 },
  { month: '2024-03', index: 176.8 },
  { month: '2024-04', index: 182.1 },
  { month: '2024-05', index: 186.4 },
  { month: '2024-06', index: 189.9 },
  { month: '2024-07', index: 195.2 },
  { month: '2024-08', index: 200.1 },
  { month: '2024-09', index: 205.4 },
  { month: '2024-10', index: 210.8 },
  { month: '2024-11', index: 215.2 },
  { month: '2024-12', index: 219.6 },
  { month: '2025-01', index: 226.4 },
  { month: '2025-02', index: 231.8 },
  { month: '2025-03', index: 236.5 },
  { month: '2025-04', index: 241.2 },
  { month: '2025-05', index: 245.0 },
  { month: '2025-06', index: 248.6 },
  { month: '2025-07', index: 253.1 },
  { month: '2025-08', index: 257.4 },
  { month: '2025-09', index: 261.0 },
  { month: '2025-10', index: 264.8 },
  { month: '2025-11', index: 268.5 },
  { month: '2025-12', index: 272.2 },
  { month: '2026-01', index: 277.0 },
  { month: '2026-02', index: 281.4 },
  { month: '2026-03', index: 285.6 },
  { month: '2026-04', index: 289.5 },
  { month: '2026-05', index: 293.2 },
  { month: '2026-06', index: 296.8 },
  { month: '2026-07', index: 300.5 },
  { month: '2026-08', index: 304.0 },
];

export function tufeIndexAt(ts: number): number {
  const d = new Date(ts);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const exact = TR_TUFE_MONTHLY.find((r) => r.month === key);
  if (exact) return exact.index;
  const before = [...TR_TUFE_MONTHLY].reverse().find((r) => r.month <= key);
  return before?.index ?? TR_TUFE_MONTHLY[0].index;
}
