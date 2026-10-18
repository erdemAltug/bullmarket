import type { Metadata } from 'next';

/** Thin matrix pages stay followable so the parent symbol URL keeps its links. */
export const NOINDEX_FOLLOW: Metadata['robots'] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};
