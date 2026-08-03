export type SentimentVote = 'bull' | 'bear';

export interface CommunitySentiment {
  symbol: string;
  bullPct: number;
  bearPct: number;
  bullVotes: number;
  bearVotes: number;
  totalVotes: number;
  userVote: SentimentVote | null;
}

type Bucket = { bull: number; bear: number };

const g = globalThis as typeof globalThis & {
  __bullsyeSentiment?: Map<string, Bucket>;
};

function store() {
  if (!g.__bullsyeSentiment) g.__bullsyeSentiment = new Map();
  return g.__bullsyeSentiment;
}

function keyOf(symbol: string) {
  return symbol.trim().toUpperCase();
}

/** Deterministic seed so empty polls still show a plausible baseline. */
export function seedVotes(symbol: string, changePercent = 0): Bucket {
  let h = 0;
  const s = keyOf(symbol);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const base = 40 + (h % 35);
  const tilt = clamp(Math.round(changePercent * 2.2), -18, 18);
  const bull = clamp(base + tilt, 22, 88);
  const bear = 100 - bull;
  // Scale to vote counts (virtual community size)
  const n = 80 + (h % 140);
  return {
    bull: Math.round((bull / 100) * n),
    bear: Math.round((bear / 100) * n),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function getSentimentBucket(
  symbol: string,
  changePercent = 0
): Bucket {
  const key = keyOf(symbol);
  const map = store();
  let bucket = map.get(key);
  if (!bucket) {
    bucket = seedVotes(key, changePercent);
    map.set(key, bucket);
  }
  return bucket;
}

export function applyVote(
  symbol: string,
  vote: SentimentVote,
  previous: SentimentVote | null,
  changePercent = 0
): Bucket {
  const key = keyOf(symbol);
  const map = store();
  const bucket = { ...getSentimentBucket(key, changePercent) };

  if (previous === vote) return bucket;

  if (previous === 'bull') bucket.bull = Math.max(0, bucket.bull - 1);
  if (previous === 'bear') bucket.bear = Math.max(0, bucket.bear - 1);

  if (vote === 'bull') bucket.bull += 1;
  else bucket.bear += 1;

  map.set(key, bucket);
  return bucket;
}

export function toSentiment(
  symbol: string,
  bucket: Bucket,
  userVote: SentimentVote | null = null
): CommunitySentiment {
  const total = Math.max(1, bucket.bull + bucket.bear);
  const bullPct = Math.round((bucket.bull / total) * 100);
  return {
    symbol: keyOf(symbol),
    bullPct,
    bearPct: 100 - bullPct,
    bullVotes: bucket.bull,
    bearVotes: bucket.bear,
    totalVotes: bucket.bull + bucket.bear,
    userVote,
  };
}
