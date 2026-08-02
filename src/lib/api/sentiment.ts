import axios from 'axios';
import { appCache } from '@/lib/cache';

export interface CryptoFearGreed {
  value: number;
  /** English label from API */
  statusEn: string;
  /** Turkish UI label */
  status: string;
  updatedAt: string;
}

function classifyTr(v: number): string {
  if (v <= 25) return 'Aşırı Korku';
  if (v <= 45) return 'Korku';
  if (v <= 55) return 'Nötr';
  if (v <= 75) return 'Açgözlülük';
  return 'Aşırı Açgözlülük';
}

const CACHE_KEY = 'sentiment:fng:v1';

/** Live Crypto Fear & Greed from alternative.me (free). */
export async function fetchCryptoFearGreed(): Promise<CryptoFearGreed> {
  const hit = appCache.get<CryptoFearGreed>(CACHE_KEY);
  if (hit) return hit;

  const { data } = await axios.get<{
    data: { value: string; value_classification: string; timestamp: string }[];
  }>('https://api.alternative.me/fng/?limit=1', { timeout: 10_000 });

  const row = data.data?.[0];
  const value = Number(row?.value ?? 50);
  const statusEn = row?.value_classification ?? 'Neutral';
  const ts = row?.timestamp
    ? new Date(Number(row.timestamp) * 1000).toISOString()
    : new Date().toISOString();

  const result: CryptoFearGreed = {
    value,
    statusEn,
    status: classifyTr(value),
    updatedAt: ts,
  };

  appCache.set(CACHE_KEY, result, 300);
  return result;
}
