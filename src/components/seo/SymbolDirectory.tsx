
interface SymbolDirectoryProps {
  title: string;
  description: string;
  symbols: readonly string[];
  kind: 'bist' | 'us' | 'crypto';
}

export function SymbolDirectory({
  title,
  description,
  symbols,
  kind,
}: SymbolDirectoryProps) {
  const hrefFor = (symbol: string) =>
    kind === 'bist'
      ? `/bist/${symbol.replace(/\.IS$/i, '')}`
      : kind === 'us'
        ? `/nasdaq/${symbol}`
        : `/kripto/${symbol}`;

  const labelFor = (symbol: string) =>
    symbol.replace(/\.IS$/i, '').replace(/USDT$/i, '');
  return (
    <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-4 sm:p-5">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </div>
      {/* Plain anchors with parent-level styles: ~550 links stay cheap in the
          HTML and RSC payload (no client Link per item, no per-link classes). */}
      <nav
        aria-label={`${title} sembol dizini`}
        className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 [&>a]:truncate [&>a]:rounded-md [&>a]:border [&>a]:border-[var(--border)] [&>a]:bg-[var(--surface)]/50 [&>a]:px-2 [&>a]:py-1.5 [&>a]:text-center [&>a]:text-[11px] [&>a]:font-medium [&>a]:text-[var(--muted)] [&>a:hover]:border-emerald-500/40 [&>a:hover]:text-emerald-400"
      >
        {symbols.map((symbol) => (
          <a key={symbol} href={hrefFor(symbol)}>
            {labelFor(symbol)}
          </a>
        ))}
      </nav>
    </section>
  );
}
