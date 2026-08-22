import type { PortfolioPosition, PriceAlert } from '@/types';

export type CompanionNote = {
  id: string;
  title: string;
  body: string;
  href?: string;
};

function heldSymbols(positions: PortfolioPosition[]) {
  return new Set(
    positions
      .filter((p) => p.assetClass === 'bist' || p.assetClass === 'crypto')
      .map((p) => p.symbol)
  );
}

/** Kural tabanlı kişisel özet — LLM yok, tavsiye değil. */
export function buildCompanionNotes(input: {
  positions: PortfolioPosition[];
  alerts: PriceAlert[];
  watchlist: string[];
  totalValue: number;
  depositValue: number;
  cashValue: number;
  pnlPct: number;
}): CompanionNote[] {
  const notes: CompanionNote[] = [];
  const held = heldSymbols(input.positions);
  const deposits = input.positions.filter((p) => p.assetClass === 'deposit');
  const watchOnly = input.watchlist.filter(
    (s) => !held.has(s) && !s.includes('XU')
  );

  if (!input.positions.length) {
    notes.push({
      id: 'empty',
      title: 'Envanter boş',
      body: 'Hisse, nakit veya mevduat ekle. Özet senin sayılarınla dolar — genel piyasa cümlesi değil.',
    });
  }

  if (deposits.length) {
    const rate = deposits[0]?.depositRatePct;
    notes.push({
      id: 'deposit',
      title: 'Nakit yastık',
      body:
        rate != null
          ? `Mevduatın yıllık ~%${rate.toLocaleString('tr-TR')}. Toplam envanter ₺${Math.round(input.totalValue).toLocaleString('tr-TR')}; bunun ₺${Math.round(input.depositValue + input.cashValue).toLocaleString('tr-TR')} nakit/mevduat. Bu bir getiri tahmini değil, senin yazdığın faiz.`
          : 'Mevduat satırın var. Vade ve oranı güncel tut; vade bitince hatırlatırız.',
    });
  } else if (input.positions.length) {
    notes.push({
      id: 'no-cash',
      title: 'Faiz / nakit yok',
      body: 'Sadece piyasa pozisyonu görünüyor. Acil nakit için ayrı bir mevduat veya nakit satırı eklemek stresi azaltır — zorunlu değil, envanter gerçeği.',
    });
  }

  const alertOnHold = input.alerts.filter((a) => held.has(a.symbol));
  const holdNoAlert = [...held].filter(
    (s) => !input.alerts.some((a) => a.symbol === s)
  );

  if (alertOnHold.length) {
    notes.push({
      id: 'alert-aligned',
      title: 'Alarmın taşıdığın hisste',
      body: `${alertOnHold
        .slice(0, 3)
        .map((a) => a.displaySymbol)
        .join(', ')} için hedef alarmın var. Tetiklenince karar senin; özet sadece eşleşmeyi gösterir.`,
      href: '/alerts',
    });
  } else if (holdNoAlert.length) {
    notes.push({
      id: 'no-alert',
      title: 'Taşıyorsun, hedef yok',
      body: `${holdNoAlert
        .slice(0, 3)
        .map((s) => s.replace('.IS', '').replace('USDT', ''))
        .join(', ')} envanterde; fiyat alarmı yok. İstersen alarm kur — kayıt, yarın da görmek içindir.`,
      href: '/alerts',
    });
  }

  if (watchOnly.length) {
    notes.push({
      id: 'watch',
      title: 'İzliyorsun, taşımıyorsun',
      body: `${watchOnly
        .slice(0, 4)
        .map((s) => s.replace('.IS', ''))
        .join(', ')} listende. Fırsat skoruna bakmak izlemeyi işleme çevirmez; meraktır.`,
      href: '/firsatlar',
    });
  }

  if (input.pnlPct <= -12) {
    notes.push({
      id: 'drawdown',
      title: 'Kâğıt zarar',
      body: `Envanter maliyetine göre %${input.pnlPct.toFixed(0)}. Bu bir sat sinyali değil. Nakit/mevduat dilimin varsa süre tanıma alanı vardır.`,
    });
  }

  return notes.slice(0, 4);
}
