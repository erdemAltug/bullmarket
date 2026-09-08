/**
 * Score reason builder — deterministik, LLM yok, uydurma yok.
 * Eksik girdi → satır atlanır.
 */
export type ScoreReasonInput = {
  pe?: number | null;
  sectorPeMedian?: number | null;
  volume48h?: number | null;
  volume20dAvg?: number | null;
  price?: number | null;
  targetMean?: number | null;
  rsi?: number | null;
};

export function buildScoreReasons(
  input: ScoreReasonInput
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];

  if (
    input.pe != null &&
    input.sectorPeMedian != null &&
    input.sectorPeMedian > 0 &&
    input.pe > 0
  ) {
    const disc = ((input.sectorPeMedian - input.pe) / input.sectorPeMedian) * 100;
    if (Math.abs(disc) >= 5) {
      out.push({
        id: 'pe-disc',
        label:
          disc > 0
            ? `%${disc.toFixed(0)} F/K sektör iskontosu`
            : `%${Math.abs(disc).toFixed(0)} F/K sektör primi`,
      });
    }
  }

  if (
    input.volume48h != null &&
    input.volume20dAvg != null &&
    input.volume20dAvg > 0
  ) {
    const ratio = input.volume48h / input.volume20dAvg;
    if (ratio >= 1.5) {
      out.push({
        id: 'vol-break',
        label: 'Son 48 saatte hacim kırılımı',
      });
    }
  }

  if (
    input.price != null &&
    input.targetMean != null &&
    input.price > 0 &&
    input.targetMean > 0
  ) {
    const upside = ((input.targetMean - input.price) / input.price) * 100;
    if (Math.abs(upside) >= 5) {
      out.push({
        id: 'target-margin',
        label: `Konsensüs hedef fiyata göre ${upside >= 0 ? '+' : ''}%${upside.toFixed(0)} marj`,
      });
    }
  }

  if (out.length < 3 && input.rsi != null) {
    if (input.rsi <= 35) {
      out.push({ id: 'rsi-low', label: `RSI ${input.rsi.toFixed(0)} — düşük bant` });
    } else if (input.rsi >= 65) {
      out.push({ id: 'rsi-high', label: `RSI ${input.rsi.toFixed(0)} — yüksek bant` });
    }
  }

  return out.slice(0, 3);
}
