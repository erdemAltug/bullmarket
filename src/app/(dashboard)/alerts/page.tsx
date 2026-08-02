'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { useFx } from '@/hooks/useMarketData';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  ALERT_ASSET_GROUPS,
  assetSupportsRsi,
  filterAlertAssets,
  findAlertAsset,
  type AlertAssetOption,
} from '@/lib/alert-assets';
import { cn, formatPrice } from '@/lib/utils';
import type { AlertKind, PriceAlert } from '@/types';

const KIND_LABEL: Record<AlertKind, string> = {
  price_above: 'Fiyat üstü',
  price_below: 'Fiyat altı',
  change_above: '% hareket üstü',
  change_below: '% hareket altı',
  rsi_above: 'RSI aşırı alım',
  rsi_below: 'RSI aşırı satım',
};

const KINDS: {
  value: AlertKind;
  label: string;
  hint: string;
  needsRsi: boolean;
}[] = [
  {
    value: 'price_above',
    label: 'Fiyat üstü',
    hint: 'Fiyat eşiğin üzerine çıkınca',
    needsRsi: false,
  },
  {
    value: 'price_below',
    label: 'Fiyat altı',
    hint: 'Fiyat eşiğin altına inince',
    needsRsi: false,
  },
  {
    value: 'change_above',
    label: '% hareket üstü',
    hint: 'Günlük / 24s % değişim eşiği',
    needsRsi: false,
  },
  {
    value: 'rsi_above',
    label: 'RSI aşırı alım',
    hint: 'Hisse / kripto / ABD',
    needsRsi: true,
  },
  {
    value: 'rsi_below',
    label: 'RSI aşırı satım',
    hint: 'Hisse / kripto / ABD',
    needsRsi: true,
  },
];

function defaultThreshold(kind: AlertKind): string {
  if (kind === 'rsi_above') return '70';
  if (kind === 'rsi_below') return '30';
  if (kind.startsWith('change')) return '3';
  return '';
}

function formatThreshold(a: PriceAlert): string {
  if (a.kind.startsWith('rsi')) return String(a.threshold);
  if (a.kind.startsWith('change')) return `%${a.threshold}`;
  return formatPrice(a.threshold, 'TRY');
}

function useLiveQuoteMap() {
  const scanner = useMarketScanner();
  const fx = useFx();

  return useMemo(() => {
    const map = new Map<string, number>();
    const put = (k: string, price: number) => {
      map.set(k.toUpperCase(), price);
    };

    for (const c of scanner.commodities ?? []) {
      put(c.symbol, c.price);
    }
    for (const i of scanner.data ?? []) {
      put(i.symbol, i.price);
      put(i.displaySymbol, i.price);
      put(i.symbol.replace(/\.IS$/i, ''), i.price);
    }
    for (const r of fx.data?.rates ?? []) {
      put(r.code, r.forexSelling);
      if (r.code === 'USD') put('USDTRY', r.forexSelling);
    }
    return map;
  }, [scanner.commodities, scanner.data, fx.data?.rates]);
}

function liveFor(symbol: string, map: Map<string, number>): number | null {
  const k = symbol.toUpperCase();
  return (
    map.get(k) ??
    map.get(k.replace(/\.IS$/i, '')) ??
    map.get(k.replace(/USDT$/i, '')) ??
    null
  );
}

export default function AlertsPage() {
  const {
    alerts,
    addAlert,
    updateAlert,
    removeAlert,
    resetTriggered,
    ready,
    source,
  } = useAlerts();
  const liveMap = useLiveQuoteMap();

  const [composerOpen, setComposerOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [symbol, setSymbol] = useState('ALTIN');
  const [kind, setKind] = useState<AlertKind>('price_above');
  const [threshold, setThreshold] = useState('');
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKind, setEditKind] = useState<AlertKind>('price_above');
  const [editThreshold, setEditThreshold] = useState('');

  const filtered = useMemo(() => filterAlertAssets(query), [query]);
  const grouped = useMemo(() => {
    const map = new Map<string, AlertAssetOption[]>();
    for (const g of ALERT_ASSET_GROUPS) map.set(g, []);
    for (const a of filtered) map.get(a.group)?.push(a);
    return ALERT_ASSET_GROUPS.map((g) => ({
      group: g,
      items: map.get(g) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const selected = findAlertAsset(symbol);
  const rsiOk = assetSupportsRsi(symbol);
  const kindOptions = KINDS.filter((k) => !k.needsRsi || rsiOk);
  const livePrice = liveFor(symbol, liveMap);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      if (a.triggered !== b.triggered) return a.triggered ? -1 : 1;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [alerts]);

  const activeCount = alerts.filter((a) => !a.triggered).length;
  const firedCount = alerts.filter((a) => a.triggered).length;

  useEffect(() => {
    if (kind.startsWith('rsi') || kind.startsWith('change')) {
      setThreshold(defaultThreshold(kind));
      return;
    }
    if (livePrice != null) setThreshold(String(Number(livePrice.toFixed(4))));
  }, [symbol, kind, livePrice]);

  function pickAsset(a: AlertAssetOption) {
    setSymbol(a.symbol);
    setQuery('');
    setPickerOpen(false);
    setFormError('');
    setFormOk('');
    if (!a.supportsRsi && kind.startsWith('rsi')) setKind('price_above');
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormOk('');
    const raw = threshold.trim().replace(',', '.');
    if (!raw) {
      setFormError('Eşik değeri gerekli.');
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setFormError('Geçerli bir sayı girin.');
      return;
    }
    if (kind.startsWith('price') && n <= 0) {
      setFormError('Fiyat eşiği 0’dan büyük olmalı.');
      return;
    }
    if (kind.startsWith('rsi') && !rsiOk) {
      setFormError('Bu varlıkta RSI alarmı yok.');
      return;
    }
    const displaySymbol =
      selected?.display ?? symbol.replace('.IS', '').replace('USDT', '');
    addAlert({ symbol, displaySymbol, kind, threshold: n });
    setFormOk(`${displaySymbol} eklendi — listede görünüyor.`);
    setComposerOpen(false);
  }

  function startEdit(a: PriceAlert) {
    setEditingId(a.id);
    setEditKind(a.kind);
    setEditThreshold(String(a.threshold));
  }

  function saveEdit(a: PriceAlert) {
    const n = Number(editThreshold.replace(',', '.'));
    if (!Number.isFinite(n)) return;
    updateAlert(a.id, { kind: editKind, threshold: n });
    setEditingId(null);
  }

  async function enablePush() {
    if (!('Notification' in window)) {
      setPushStatus('Bu tarayıcı bildirim desteklemiyor.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPushStatus(
      perm === 'granted'
        ? 'Bildirimler açık.'
        : 'Bildirim izni verilmedi.'
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bell className="size-6 text-orange-400" />
            Alarmlar
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Aktif alarmlarını yönet · tetiklenince bildirim
            {source === 'neon' ? ' + e-posta' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              Aktif
            </p>
            <p className="font-mono text-lg font-bold tabular-nums">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              Tetiklenen
            </p>
            <p className="font-mono text-lg font-bold tabular-nums text-amber-400">
              {firedCount}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setComposerOpen(true);
              setFormOk('');
            }}
            className="gap-1.5 self-center"
          >
            <Plus className="size-4" /> Yeni alarm
          </Button>
        </div>
      </header>

      {/* LIST FIRST */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Alarmlarım
            {alerts.length ? (
              <span className="ml-2 text-[var(--muted)]">({alerts.length})</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={() => void enablePush()}
            className="text-xs text-[var(--muted)] underline-offset-2 hover:text-emerald-400 hover:underline"
          >
            Bildirim izni
          </button>
        </div>
        {pushStatus ? (
          <p className="text-xs text-emerald-400">{pushStatus}</p>
        ) : null}

        {!ready ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
              />
            ))}
          </div>
        ) : !sortedAlerts.length ? (
          <EmptyState
            icon={Bell}
            title="Henüz alarm yok"
            description="Aşağıdan veya “Yeni alarm” ile gram altın, hisse, kripto ekleyin."
          />
        ) : (
          <ul className="space-y-2">
            {sortedAlerts.map((a) => {
              const live = liveFor(a.symbol, liveMap);
              const editing = editingId === a.id;
              const editRsiOk = assetSupportsRsi(a.symbol);
              const editKinds = KINDS.filter((k) => !k.needsRsi || editRsiOk);

              return (
                <li
                  key={a.id}
                  className={cn(
                    'rounded-xl border bg-[var(--card)] px-4 py-3 transition-colors',
                    a.triggered
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-[var(--border)]'
                  )}
                >
                  {editing ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">{a.displaySymbol}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="text-xs text-[var(--muted)]">
                          Tetikleyici
                          <select
                            value={editKind}
                            onChange={(e) =>
                              setEditKind(e.target.value as AlertKind)
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            {editKinds.map((k) => (
                              <option key={k.value} value={k.value}>
                                {k.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs text-[var(--muted)]">
                          Eşik
                          <input
                            type="number"
                            step="any"
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className="gap-1"
                          onClick={() => saveEdit(a)}
                        >
                          <Check className="size-3.5" /> Kaydet
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="size-3.5" /> Vazgeç
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold tracking-tight">
                            {a.displaySymbol}
                          </p>
                          {a.triggered ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                              <BellRing className="size-3" /> Tetiklendi
                            </span>
                          ) : (
                            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          {KIND_LABEL[a.kind]} · eşik{' '}
                          <span className="font-mono text-[var(--foreground)]">
                            {formatThreshold(a)}
                          </span>
                          {live != null ? (
                            <>
                              {' '}
                              · canlı{' '}
                              <span className="font-mono tabular-nums text-[var(--foreground)]">
                                {live.toLocaleString('tr-TR', {
                                  maximumFractionDigits: 4,
                                })}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {a.triggered ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => resetTriggered(a.id)}
                            className="text-xs"
                          >
                            Yeniden kur
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => startEdit(a)}
                          className="text-[var(--muted)] hover:text-emerald-400"
                          aria-label="Düzenle"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeAlert(a.id)}
                          className="text-[var(--muted)] hover:text-rose-400"
                          aria-label="Sil"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* COMPOSER */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <button
          type="button"
          onClick={() => setComposerOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Plus className="size-4 text-emerald-400" />
            Yeni alarm kur
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-[var(--muted)] transition-transform',
              composerOpen && 'rotate-180'
            )}
          />
        </button>

        {composerOpen ? (
          <form
            onSubmit={submit}
            className="space-y-3 border-t border-[var(--border)] px-4 py-4"
          >
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              Sekme açıkken tarayıcı bildirimi · girişliysen e-posta da gider.
            </p>

            <div className="relative">
              <label className="block text-xs text-[var(--muted)]">
                Varlık
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={pickerOpen || query ? query : selected?.display ?? symbol}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPickerOpen(true);
                    }}
                    onFocus={() => {
                      setPickerOpen(true);
                      setQuery('');
                    }}
                    placeholder="Ara: Altın, THYAO, BTC…"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm"
                  />
                </div>
              </label>

              {pickerOpen ? (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
                  {grouped.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[var(--muted)]">
                      Sonuç yok
                    </p>
                  ) : (
                    grouped.map(({ group, items }) => (
                      <div key={group}>
                        <p className="sticky top-0 bg-[var(--card)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          {group}
                        </p>
                        {items.slice(0, group === 'BİST' || group === 'ABD' ? 40 : 20).map(
                          (a) => (
                            <button
                              key={a.symbol}
                              type="button"
                              onClick={() => pickAsset(a)}
                              className={cn(
                                'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-emerald-500/10',
                                a.symbol === symbol && 'bg-emerald-500/15 text-emerald-300'
                              )}
                            >
                              <span>{a.display}</span>
                              <span className="text-[10px] text-[var(--muted)]">
                                {a.symbol}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => setPickerOpen(false)}
                    className="sticky bottom-0 w-full border-t border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted)]"
                  >
                    Kapat
                  </button>
                </div>
              ) : null}
            </div>

            {selected ? (
              <p className="text-xs text-[var(--muted)]">
                Seçili:{' '}
                <span className="text-[var(--foreground)]">
                  {selected.group} · {selected.display}
                </span>
                {livePrice != null ? (
                  <>
                    {' '}
                    · canlı{' '}
                    <span className="font-mono tabular-nums text-emerald-400">
                      {livePrice.toLocaleString('tr-TR', {
                        maximumFractionDigits: 4,
                      })}
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-[var(--muted)]">
                Tetikleyici
                <select
                  value={
                    kindOptions.some((k) => k.value === kind)
                      ? kind
                      : 'price_above'
                  }
                  onChange={(e) => {
                    const k = e.target.value as AlertKind;
                    setKind(k);
                    setFormError('');
                    const d = defaultThreshold(k);
                    if (d) setThreshold(d);
                    else if (livePrice != null) {
                      setThreshold(String(Number(livePrice.toFixed(4))));
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  {kindOptions.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[var(--muted)]">
                Eşik
                <input
                  type="number"
                  step="any"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  required
                />
              </label>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              {KINDS.find((k) => k.value === kind)?.hint}
            </p>

            {formError ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {formError}
              </p>
            ) : null}
            {formOk ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                {formOk}
              </p>
            ) : null}

            <Button type="submit" className="w-full gap-1.5 sm:w-auto">
              <Plus className="size-4" /> Alarmı kaydet
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
