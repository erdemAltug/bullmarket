import NodeCache from 'node-cache';

type CacheEnvelope<T> = {
  value: T;
  updatedAt: number;
};

const globalForCache = globalThis as unknown as {
  appCache?: NodeCache;
  cacheInflight?: Map<string, Promise<unknown>>;
};

export const appCache =
  globalForCache.appCache ||
  new NodeCache({ stdTTL: 120, checkperiod: 30 });

const inflight =
  globalForCache.cacheInflight || new Map<string, Promise<unknown>>();

globalForCache.appCache = appCache;
globalForCache.cacheInflight = inflight;

/**
 * Fresh window serves memory. After that, callers still get the last payload
 * while one refresh runs. A 10s poll must not stampede Yahoo on every miss.
 */
export async function readThroughCache<T>(opts: {
  key: string;
  freshSec: number;
  staleSec: number;
  load: () => Promise<T>;
}): Promise<{ value: T; updatedAt: string; cached: boolean }> {
  const now = Date.now();
  const hit = appCache.get<CacheEnvelope<T>>(opts.key);
  const age = hit ? now - hit.updatedAt : Number.POSITIVE_INFINITY;

  if (hit && age < opts.freshSec * 1000) {
    return {
      value: hit.value,
      updatedAt: new Date(hit.updatedAt).toISOString(),
      cached: true,
    };
  }

  if (hit && age < opts.staleSec * 1000) {
    void startRefresh(opts.key, opts.staleSec, opts.load).catch(() => undefined);
    return {
      value: hit.value,
      updatedAt: new Date(hit.updatedAt).toISOString(),
      cached: true,
    };
  }

  const value = await startRefresh(opts.key, opts.staleSec, opts.load);
  const stored = appCache.get<CacheEnvelope<T>>(opts.key);
  return {
    value,
    updatedAt: new Date(stored?.updatedAt ?? Date.now()).toISOString(),
    cached: false,
  };
}

function startRefresh<T>(
  key: string,
  staleSec: number,
  load: () => Promise<T>
): Promise<T> {
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const job = load()
    .then((value) => {
      const envelope: CacheEnvelope<T> = { value, updatedAt: Date.now() };
      appCache.set(key, envelope, staleSec);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, job);
  return job;
}
