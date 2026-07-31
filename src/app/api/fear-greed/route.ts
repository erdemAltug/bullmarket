import { NextResponse } from 'next/server';
import axios from 'axios';
import { fetchHistory } from '@/lib/api/yahoo';
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

/** Simple BİST proxy from XU100 RSI + recent return */
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
    // Map RSI ~0-100 + return boost into 0-100 fear/greed
    let value = r;
    value += Math.max(-15, Math.min(15, ret20));
    value = Math.round(Math.max(0, Math.min(100, value)));
    return { value, note: bistNote(value) };
  } catch {
    return { value: 50, note: bistNote(50) };
  }
}

export async function GET() {
  const cacheKey = 'fear-greed:v1';
  const hit = appCache.get<FearGreedData>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const [cryptoRes, bist] = await Promise.all([
      axios.get<{ data: { value: string; value_classification: string }[] }>(
        'https://api.alternative.me/fng/?limit=1',
        { timeout: 10_000 }
      ),
      bistFearGreed(),
    ]);

    const row = cryptoRes.data.data?.[0];
    const cryptoVal = Number(row?.value ?? 50);

    const data: FearGreedData = {
      crypto: {
        value: cryptoVal,
        classification: row?.value_classification ?? classify(cryptoVal),
      },
      bist: {
        value: bist.value,
        classification: classify(bist.value),
        note: `XU100 RSI+getiri proxy (Alternative.me değil). ${bist.note}`,
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
