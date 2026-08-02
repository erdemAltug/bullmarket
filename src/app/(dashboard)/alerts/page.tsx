'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Plus, Search, Trash2 } from 'lucide-react';
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
import { formatPrice } from '@/lib/utils';
import type { AlertKind } from '@/types';

const KIND_LABEL: Record<AlertKind, string> = {
  price_above: 'Fiyat üstü',
  price_below: 'Fiyat altı',
  change_above: 'Volatilite spike (% üstü)',
  change_below: '% değişim altı',
  rsi_above: 'RSI aşırı alım',
  rsi_below: 'RSI aşırı satım',
};

const KINDS: { value: AlertKind; label: string; hint: string; needsRsi: boolean }[] =
  [
    {
      value: 'price_above',
      label: 'Fiyat hedefi (üst)',
      hint: 'Örn: Gram Altın ₺6.500 üstü · THYAO ₺350 üstü',
      needsRsi: false,
    },
    {
      value: 'price_below',
      label: 'Fiyat hedefi (alt)',
      hint: 'Örn: fiyat bu seviyenin altına inince',
      needsRsi: false,
    },
    {
      value: 'change_above',
      label: 'Yüzdesel hareket',
      hint: 'Örn: 1 seans / 24s içinde %3+ hareket',
      needsRsi: false,
    },
    {
      value: 'rsi_above',
      label: 'RSI kırılımı (aşırı alım)',
      hint: 'Hisse / kripto / ABD için — emtia & dövizde yok',
      needsRsi: true,
    },
    {
      value: 'rsi_below',
      label: 'RSI kırılımı (aşırı satım)',
      hint: 'Hisse / kripto / ABD için — emtia & dövizde yok',
      needsRsi: true,
    },
  ];

function defaultThreshold(kind: AlertKind): string {
  if (kind === 'rsi_above') return '70';
  if (kind === 'rsi_below') return '30';
  if (kind.startsWith('change')) return '3';
  return '';
}

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, ready, source } = useAlerts();
  const scanner = useMarketScanner();
  const fx = useFx();
  const [query, setQuery] = useState('');
  const [symbol, setSymbol] = useState('ALTIN');
  const [kind, setKind] = useState<AlertKind>('price_above');
  const [threshold, setThreshold] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');

  const filtered = useMemo(() => filterAlertAssets(query), [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, AlertAssetOption[]>();
    for (const g of ALERT_ASSET_GROUPS) map.set(g, []);
    for (const a of filtered) {
      map.get(a.group)?.push(a);
    }
    return ALERT_ASSET_GROUPS.map((g) => ({
      group: g,
      items: map.get(g) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const selected = findAlertAsset(symbol);
  const rsiOk = assetSupportsRsi(symbol);
  const kindOptions = KINDS.filter((k) => !k.needsRsi || rsiOk);

  const livePrice = useMemo(() => {
    const key = symbol.toUpperCase();
    for (const c of scanner.commodities ?? []) {
      if (c.symbol.toUpperCase() === key) return c.price;
    }
    for (const i of scanner.data ?? []) {
      if (
        i.symbol.toUpperCase() === key ||
        i.displaySymbol.toUpperCase() === key ||
        i.symbol.replace(/\.IS$/i, '').toUpperCase() === key
      ) {
        return i.price;
      }
    }
    for (const r of fx.data?.rates ?? []) {
      if (r.code === key || (key === 'USDTRY' && r.code === 'USD')) {
        return r.forexSelling;
      }
    }
    return null;
  }, [symbol, scanner.commodities, scanner.data, fx.data?.rates]);

  useEffect(() => {
    if (filtered.length && !filtered.some((a) => a.symbol === symbol)) {
      setSymbol(filtered[0].symbol);
    }
  }, [filtered, symbol]);

  // Prefill price/target when asset or kind changes
  useEffect(() => {
    if (kind.startsWith('rsi') || kind.startsWith('change')) {
      const d = defaultThreshold(kind);
      if (d) setThreshold(d);
      return;
    }
    if (livePrice != null && Number.isFinite(livePrice)) {
      setThreshold(String(Number(livePrice.toFixed(4))));
    }
  }, [symbol, kind, livePrice]);

  function onSymbolChange(next: string) {
    setSymbol(next);
    setFormError('');
    setFormOk('');
    if (!assetSupportsRsi(next) && kind.startsWith('rsi')) {
      setKind('price_above');
    }
  }

  function onKindChange(k: AlertKind) {
    setKind(k);
    setFormError('');
    setFormOk('');
    const d = defaultThreshold(k);
    if (d) setThreshold(d);
    else if (livePrice != null) setThreshold(String(Number(livePrice.toFixed(4))));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormOk('');

    const raw = threshold.trim().replace(',', '.');
    if (!raw) {
      setFormError('Eşik değeri girin — canlı fiyat alanına yazıldıysa kontrol edin.');
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
      setFormError('Bu varlık için RSI alarmı yok.');
      return;
    }

    const displaySymbol =
      selected?.display ?? symbol.replace('.IS', '').replace('USDT', '');
    addAlert({ symbol, displaySymbol, kind, threshold: n });
    setFormOk(`${displaySymbol} alarmı kuruldu.`);
  }

  async function enablePush() {
    if (!('Notification' in window)) {
      setPushStatus('Bu tarayıcı bildirim desteklemiyor.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPushStatus(
      perm === 'granted'
        ? 'Tarayıcı bildirimleri açık — alarmlar tetiklenince toast gelecek.'
        : 'Bildirim izni verilmedi.'
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Bell className="size-6 text-orange-400" />
          Akıllı Piyasa Alarmları
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Gram altın, gümüş, döviz, BİST, ABD, kripto, fon &amp; ETF — ara ve kur
        </p>
        <p className="mt-2 max-w-2xl rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs leading-relaxed text-zinc-400">
          Giriş yapmışken alarm tetiklenirse e-posta da gider. Sekme kapalıyken
          tarayıcı bildirimi çalışmaz; e-posta için oturumu açık tutun.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
      >
        <p className="text-sm font-medium">Yeni alarm kur</p>

        <label className="block text-xs text-[var(--muted)]">
          Varlık ara
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Altın, GUMUS, THYAO, AAPL, BTC, AFT…"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)]"
            />
          </div>
        </label>

        <label className="block text-xs text-[var(--muted)]">
          Varlık ({filtered.length} sonuç)
          <select
            value={
              filtered.some((a) => a.symbol === symbol)
                ? symbol
                : (filtered[0]?.symbol ?? symbol)
            }
            onChange={(e) => onSymbolChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            size={Math.min(10, Math.max(4, filtered.length))}
          >
            {grouped.map(({ group, items }) => (
              <optgroup key={group} label={group}>
                {items.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.display}
                    {a.display !== a.symbol ? ` · ${a.symbol}` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-[var(--muted)]">
            Tetikleyici
            <select
              value={kindOptions.some((k) => k.value === kind) ? kind : 'price_above'}
              onChange={(e) => onKindChange(e.target.value as AlertKind)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {kindOptions.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--muted)]">
            Eşik değeri
            <input
              type="number"
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={
                kind.startsWith('change')
                  ? 'Örn: 3'
                  : kind.startsWith('rsi')
                    ? 'Örn: 70'
                    : 'Canlı fiyata göre hedef'
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              required
            />
          </label>
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {KINDS.find((k) => k.value === kind)?.hint}
          {selected ? ` · Seçili: ${selected.group} / ${selected.display}` : null}
          {livePrice != null
            ? ` · Canlı: ${livePrice.toLocaleString('tr-TR')}`
            : null}
        </p>

        {formError ? (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {formError}
          </p>
        ) : null}
        {formOk ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {formOk} ({source === 'neon' ? 'hesaba kaydedildi' : 'bu cihazda'})
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="gap-1.5">
            <Plus className="size-4" /> Alarm kur
          </Button>
          <Button type="button" variant="outline" onClick={() => void enablePush()}>
            Bildirim izni
          </Button>
        </div>
        {pushStatus ? (
          <p className="text-xs text-emerald-400">{pushStatus}</p>
        ) : null}
      </form>

      {!ready ? (
        <p className="text-sm text-[var(--muted)]">Yükleniyor…</p>
      ) : !alerts.length ? (
        <EmptyState
          icon={Bell}
          title="Henüz alarm yok"
          description="Gram altın, gümüş, hisse veya kripto için yukarıdan alarm kurun."
        />
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
            >
              <div>
                <p className="font-semibold">{a.displaySymbol}</p>
                <p className="text-xs text-[var(--muted)]">
                  {KIND_LABEL[a.kind]} · eşik{' '}
                  {a.kind.startsWith('change') || a.kind.startsWith('rsi')
                    ? a.kind.startsWith('rsi')
                      ? a.threshold
                      : `%${a.threshold}`
                    : formatPrice(a.threshold, 'TRY')}
                  {a.triggered ? (
                    <span className="ml-2 text-amber-400">· tetiklendi</span>
                  ) : null}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeAlert(a.id)}
                className="text-[var(--muted)] hover:text-rose-400"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
