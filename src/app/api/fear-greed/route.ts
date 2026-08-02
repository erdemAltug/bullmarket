import { NextResponse } from 'next/server';
import { fetchHistory } from '@/lib/api/yahoo';
import { fetchCryptoFearGreed } from '@/lib/api/sentiment';
import { appCache } from '@/lib/cache';
import { rsi } from '@/lib/indicators';
import type { FearGreedData } from '@/types';

function classify(v: number): string {
  if (v <= 25) return 'Aşırı Korku';
  if (v <= 45) return 'Korku';
  if (v <= 55) return 'Nötr';
  if (v <= 75) return 'Açgözlülük';
  return 'Aşırı Açgözlülük';
}

function bistNote(v: number): string {
  if (v <= 25)
    return 'Tarihsel olarak dip/alım fırsatı bölgesine yakın; panik satışları artmış olabilir.';
  if (v <= 45)
    return 'Piyasa temkinli; seçici alımlar ve risk yönetimi ön planda.';
  if (v <= 55)
    return 'Duygu dengeli; trend ve haber akışını birlikte izlemek gerekir.';
  if (v <= 75)
    return 'İştah yüksek; kâr alma ve stop disiplinini gevşetmemek önemli.';
  return 'Tarihsel olarak köpük/kâr alma bölgesi; aşırı iyimserlik riski.';
}

async function bistFearGreed(): Promise<{ value: number; note: string }> {
  try {
    const pts = await fetchHistory('XU100.IS', '6M');
    const closes = pts.map((p) => p.price);
    const r = rsi(closes, 14) ?? 50;
    let ret20 = 0;
    if (closes.length > 21) {
      const a = closes[closes.length - 21];
      const b = closes[closes.length - 1];
      if (a > 0) ret20 = ((b - a) / a) * 100;
    }
    let value = r;
    value += Math.max(-15, Math.min(15, ret20));
    value = Math.round(Math.max(0, Math.min(100, value)));
    return { value, note: bistNote(value) };
  } catch {
    return { value: 50, note: bistNote(50) };
  }
}

export async function GET() {
  const cacheKey = 'fear-greed:v2';
  const hit = appCache.get<FearGreedData>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const [crypto, bist] = await Promise.all([
      fetchCryptoFearGreed(),
      bistFearGreed(),
    ]);

    const data: FearGreedData = {
      crypto: {
        value: crypto.value,
        classification: crypto.status,
      },
      bist: {
        value: bist.value,
        classification: classify(bist.value),
        note: bist.note,
      },
    };

    appCache.set(cacheKey, data, 300);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Fear & Greed failed',
      },
      { status: 502 }
    );
  }
}
