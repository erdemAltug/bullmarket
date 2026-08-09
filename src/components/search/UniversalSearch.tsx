'use client';

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import {
  Bitcoin,
  Landmark,
  Layers,
  LineChart,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { useMarketAssets } from '@/hooks/useMarketAssets';
import { SEARCH_CATALOG } from '@/lib/search-catalog';
import { cn } from '@/lib/utils';
import type { MarketAsset, MarketAssetCategory } from '@/types/market-asset';
import type { ApiResponse } from '@/types';

export const OPEN_COMMAND_EVENT = 'bullmarket:open-command';

const CATEGORY_ICON: Record<MarketAssetCategory, typeof LineChart> = {
  bist: LineChart,
  us: Landmark,
  crypto: Bitcoin,
  etf: Layers,
  fon: Layers,
};

const CATEGORY_LABEL: Record<MarketAssetCategory, string> = {
  bist: 'BİST',
  us: 'ABD',
  crypto: 'Kripto',
  etf: 'ETF',
  fon: 'TEFAS',
};

const NAV_ITEMS = SEARCH_CATALOG.filter((i) => i.kind === 'nav');

async function prefetchAssetQuote(asset: MarketAsset) {
  if (asset.category === 'fon') return;
  try {
    const res = await fetch(
      `/api/market/asset/${encodeURIComponent(asset.quoteId)}`
    );
    const json = (await res.json()) as ApiResponse<unknown>;
    if (!json.success) return;
  } catch {
    /* navigation still proceeds */
  }
}

export function UniversalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [, startTransition] = useTransition();
  const [selecting, setSelecting] = useState(false);
  const router = useRouter();
  const { data: assets = [], isLoading } = useMarketAssets();

  const fuse = useMemo(() => {
    if (!assets.length) return null;
    return new Fuse(assets, {
      keys: [
        { name: 'symbol', weight: 0.55 },
        { name: 'name', weight: 0.3 },
        { name: 'exchange', weight: 0.1 },
        { name: 'category', weight: 0.05 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [assets]);

  const results = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q || !fuse) return assets.slice(0, 12);
    return fuse.search(q, { limit: 20 }).map((r) => r.item);
  }, [assets, deferredQuery, fuse]);

  const navHits = useMemo(() => {
    const q = deferredQuery.trim().toLocaleLowerCase('tr-TR');
    if (!q) return NAV_ITEMS.slice(0, 6);
    return NAV_ITEMS.filter(
      (n) =>
        n.label.toLocaleLowerCase('tr-TR').includes(q) ||
        n.keywords.toLocaleLowerCase('tr-TR').includes(q)
    ).slice(0, 6);
  }, [deferredQuery]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  async function selectAsset(asset: MarketAsset) {
    setSelecting(true);
    try {
      await prefetchAssetQuote(asset);
      startTransition(() => {
        setOpen(false);
        router.push(asset.href);
      });
    } finally {
      setSelecting(false);
    }
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Universal Search"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Hisse, kripto, fon ara… (Cmd/Ctrl+K)"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-500">
              <Loader2 className="size-4 animate-spin" />
              Varlık indeksi yükleniyor…
            </div>
          ) : (
            <>
              <CommandEmpty>Sonuç yok.</CommandEmpty>

              {navHits.length > 0 ? (
                <CommandGroup heading="Sayfalar">
                  {navHits.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`nav ${item.label} ${item.keywords}`}
                      onSelect={() => go(item.href)}
                    >
                      <Sparkles className="size-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              <CommandGroup
                heading={
                  deferredQuery.trim()
                    ? `Varlıklar · ${results.length}`
                    : `Popüler · ${assets.length} indeks`
                }
              >
                {results.map((asset) => {
                  const Icon = CATEGORY_ICON[asset.category];
                  return (
                    <CommandItem
                      key={`${asset.category}:${asset.symbol}`}
                      value={`${asset.symbol} ${asset.name} ${asset.exchange}`}
                      onSelect={() => selectAsset(asset)}
                      disabled={selecting}
                    >
                      <Icon className="size-4 text-zinc-400" />
                      <span className="font-medium text-zinc-100">
                        {asset.symbol}
                      </span>
                      <span className="truncate text-zinc-500">
                        {asset.name !== asset.symbol ? asset.name : asset.exchange}
                      </span>
                      <CommandShortcut>
                        {CATEGORY_LABEL[asset.category]}
                      </CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
        <p className="border-t border-zinc-800 px-3 py-2 text-[10px] text-zinc-600">
          Yerel Fuse.js · keystroke başına API yok · fiyat seçimde 60s cache
        </p>
      </Command>
    </CommandDialog>
  );
}

export function UniversalSearchTrigger() {
  const [mod, setMod] = useState('Ctrl');

  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl');
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))}
        aria-label="Ara"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 sm:hidden"
      >
        <Search className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))}
        className={cn(
          'hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 sm:inline-flex'
        )}
      >
        <span>Search…</span>
        <kbd className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
          {mod}+K
        </kbd>
      </button>
    </>
  );
}
