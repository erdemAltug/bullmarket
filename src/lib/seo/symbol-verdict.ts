export type MoveDirection = 'down' | 'up' | 'flat';

export function asYieldPercent(raw: number | null | undefined): number | null {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
  return raw > 1 ? raw : raw * 100;
}

function num(value: number, digits = 2): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function money(value: number, currencySymbol: string): string {
  const digits = Math.abs(value) >= 100 ? 2 : 4;
  return `${currencySymbol}${value.toLocaleString('tr-TR', {
    maximumFractionDigits: digits,
  })}`;
}

export function moveDirection(changePercent: number): MoveDirection {
  if (changePercent <= -0.05) return 'down';
  if (changePercent >= 0.05) return 'up';
  return 'flat';
}

export function buildSymbolVerdict(input: {
  symbol: string;
  price: number;
  changePercent: number;
  currencySymbol: string;
  dayHigh: number | null;
  dayLow: number | null;
  bandScope: 'gün' | '24 saat';
  targetMean: number | null;
  dividendYield: number | null | undefined;
}): string {
  if (input.price <= 0) {
    return `${input.symbol} için canlı fiyat şu an yok. Bu cümle bir haber gerekçesi değildir.`;
  }

  const direction = moveDirection(input.changePercent);
  const verb =
    direction === 'down' ? 'geriledi' : direction === 'up' ? 'yükseldi' : 'yatay kaldı';
  const parts = [
    `${input.symbol} bugün %${num(input.changePercent)} ${verb}, fiyat ${money(input.price, input.currencySymbol)}.`,
  ];

  if (
    input.dayHigh != null &&
    input.dayLow != null &&
    input.dayHigh > input.dayLow
  ) {
    const pos = (input.price - input.dayLow) / (input.dayHigh - input.dayLow);
    const scope = input.bandScope === '24 saat' ? '24 saatlik bandın' : 'gün içi bandın';
    const place = pos <= 0.35 ? 'alt kısmında' : pos >= 0.65 ? 'üst kısmında' : 'ortasında';
    parts.push(`Fiyat ${scope} ${place}.`);
  }

  if (input.targetMean != null && input.targetMean > 0) {
    const gap = ((input.targetMean - input.price) / input.price) * 100;
    parts.push(
      `12 aylık konsensüs ${money(input.targetMean, input.currencySymbol)}, canlı fiyata göre %${num(gap)}.`
    );
  }

  const yieldPct = asYieldPercent(input.dividendYield);
  if (yieldPct != null) {
    parts.push(`Trailing temettü verimi %${num(yieldPct)}.`);
  }

  parts.push('Bu cümle fiyatın bugünkü hareketidir; bir haber gerekçesi değildir.');
  return parts.join(' ');
}
