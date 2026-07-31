import NodeCache from 'node-cache';

const globalForCache = globalThis as unknown as { appCache: NodeCache };

export const appCache =
  globalForCache.appCache ||
  new NodeCache({ stdTTL: 15, checkperiod: 20 });

if (process.env.NODE_ENV !== 'production') {
  globalForCache.appCache = appCache;
}
