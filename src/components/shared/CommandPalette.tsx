'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bitcoin,
  Briefcase,
  Coins,
  Landmark,
  LayoutDashboard,
  LineChart,
  Map,
  Plus,
  Focus,
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
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWatchlist } from '@/hooks/useWatchlist';
import { SEARCH_CATALOG, type SearchItemKind } from '@/lib/search-catalog';

export const OPEN_COMMAND_EVENT = 'bullmarket:open-command';

const KIND_ICON: Record<SearchItemKind, typeof LayoutDashboard> = {
  nav: LayoutDashboard,
  bist: LineChart,
  crypto: Bitcoin,
  fx: Coins,
  us: Landmark,
};

const KIND_LABEL: Record<SearchItemKind, string> = {
  nav: 'Navigation',
  bist: 'BİST',
  crypto: 'Crypto',
  fx: 'FX',
  us: 'NASDAQ',
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { addSymbol } = useWatchlist({ enabled: open });
  const { addPosition } = usePortfolio({ enabled: open });

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

  function close() {
    setOpen(false);
  }

  function resolveSymbol(item: (typeof SEARCH_CATALOG)[number]): string | null {
    if (item.kind === 'bist') {
      const m = item.href.match(/\/bist\/([A-Za-z0-9]+)/);
      if (m) return `${m[1].toUpperCase()}.IS`;
      const q = item.href.match(/symbol=([^&]+)/);
      return q ? decodeURIComponent(q[1]) : null;
    }
    if (item.kind === 'crypto') {
      const m = item.href.match(/\/crypto\/([A-Za-z0-9]+)/);
      if (m) return m[1].toUpperCase();
      const q = item.href.match(/symbol=([^&]+)/);
      return q ? decodeURIComponent(q[1]) : null;
    }
    if (item.kind === 'us') {
      const m = item.href.match(/\/us\/([A-Za-z0-9.-]+)/);
      if (m) return m[1].toUpperCase();
      return null;
    }
    return null;
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function addToWatchlist(item: (typeof SEARCH_CATALOG)[number]) {
    const sym = resolveSymbol(item);
    if (sym) addSymbol(sym);
    close();
    router.push(item.href);
  }

  function addToPortfolio(item: (typeof SEARCH_CATALOG)[number]) {
    const sym = resolveSymbol(item);
    if (!sym && item.kind !== 'fx') return;

    let assetClass: 'bist' | 'crypto' | 'gold' = 'bist';
    let symbol = sym ?? 'GOLD';
    let currency: 'TRY' | 'USD' = 'TRY';

    if (item.kind === 'crypto') {
      assetClass = 'crypto';
      currency = 'USD';
    } else if (item.id === 'gold' || item.label.toLowerCase().includes('gold')) {
      assetClass = 'gold';
      symbol = 'GOLD';
    }

    addPosition({
      symbol,
      name: item.label,
      assetClass,
      buyPrice: 0,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      currency,
    });
    close();
    router.push('/portfolio');
  }

  function focusChart(item: (typeof SEARCH_CATALOG)[number]) {
    go(item.href);
  }

  const groups = (['nav', 'bist', 'crypto', 'fx'] as SearchItemKind[]).map(
    (kind) => ({
      kind,
      items: SEARCH_CATALOG.filter((i) => i.kind === kind),
    })
  );

  const actionable = SEARCH_CATALOG.filter(
    (i) => i.kind === 'bist' || i.kind === 'crypto'
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search Bullsye">
      <Command>
        <CommandInput placeholder="Ara · Enter = izleme listesine ekle…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem value="portfolio portföy" onSelect={() => go('/portfolio')}>
              <Briefcase className="size-4 text-zinc-400" />
              Portföyüm
              <CommandShortcut>P</CommandShortcut>
            </CommandItem>
            <CommandItem value="heatmap ısı" onSelect={() => go('/bist/heatmap')}>
              <Map className="size-4 text-zinc-400" />
              Isı Haritası
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Varlık aksiyonları">
            {actionable.map((item) => (
              <CommandItem
                key={`wl-${item.id}`}
                value={`watchlist ekle ${item.label} ${item.keywords}`}
                onSelect={() => addToWatchlist(item)}
              >
                <Plus className="size-4 text-emerald-400" />
                İzlemeye ekle · {item.label.split('·')[0].trim()}
              </CommandItem>
            ))}
            {actionable.slice(0, 6).map((item) => (
              <CommandItem
                key={`pf-${item.id}`}
                value={`portföy ekle ${item.label}`}
                onSelect={() => addToPortfolio(item)}
              >
                <Briefcase className="size-4 text-sky-400" />
                Portföye ekle · {item.label.split('·')[0].trim()}
              </CommandItem>
            ))}
            {actionable.map((item) => (
              <CommandItem
                key={`focus-${item.id}`}
                value={`grafik odakla ${item.label}`}
                onSelect={() => focusChart(item)}
              >
                <Focus className="size-4 text-amber-400" />
                Grafiği odakla · {item.label.split('·')[0].trim()}
              </CommandItem>
            ))}
          </CommandGroup>

          {groups.map(({ kind, items }) => (
            <CommandGroup key={kind} heading={KIND_LABEL[kind]}>
              {items.map((item) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords}`}
                    onSelect={() => {
                      if (item.kind === 'bist' || item.kind === 'crypto') {
                        addToWatchlist(item);
                      } else {
                        go(item.href);
                      }
                    }}
                  >
                    <Icon className="size-4 text-zinc-400" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger() {
  const [mod, setMod] = useState('Ctrl');

  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl');
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))}
      className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 sm:inline-flex"
    >
      <span>Search…</span>
      <kbd className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
        {mod}+K
      </kbd>
    </button>
  );
}
