'use client';

import { useMemo, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SEARCH_CATALOG } from '@/lib/search-catalog';
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

const KINDS: { value: AlertKind; label: string; hint: string }[] = [
  {
    value: 'price_above',
    label: 'Fiyat hedefi (üst)',
    hint: 'Örn: THYAO ₺350 üstüne çıkınca',
  },
  {
    value: 'price_below',
    label: 'Fiyat hedefi (alt)',
    hint: 'Örn: fiyat bu seviyenin altına inince',
  },
  {
    value: 'change_above',
    label: 'Yüzdesel hareket',
    hint: 'Örn: 1 seans içinde %3+ hareket',
  },
  {
    value: 'rsi_above',
    label: 'RSI kırılımı (aşırı alım)',
    hint: 'Örn: RSI 70 üzerine çıkınca',
  },
  {
    value: 'rsi_below',
    label: 'RSI kırılımı (aşırı satım)',
    hint: 'Örn: RSI 30 altına inince',
  },
];

const ASSET_OPTIONS = [
  ...SEARCH_CATALOG.filter((i) => i.kind === 'bist' || i.kind === 'crypto').map(
    (i) => {
      const m = i.href.match(/\/(?:bist|crypto)\/([^/?]+)/);
      const raw = m ? decodeURIComponent(m[1]) : i.id;
      const isCrypto = i.kind === 'crypto';
      const symbol = isCrypto
        ? raw.endsWith('USDT')
          ? raw
          : `${raw}USDT`
        : raw.includes('.')
          ? raw
          : `${raw}.IS`;
      return {
        symbol,
        display: i.label.split('·')[0].trim(),
      };
    }
  ),
  { symbol: 'PGSUS.IS', display: 'PGSUS' },
  { symbol: 'AKBNK.IS', display: 'AKBNK' },
];

function defaultThreshold(kind: AlertKind): string {
  if (kind === 'rsi_above') return '70';
  if (kind === 'rsi_below') return '30';
  if (kind.startsWith('change')) return '3';
  return '';
}

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, ready } = useAlerts();
  const [symbol, setSymbol] = useState(ASSET_OPTIONS[0]?.symbol ?? 'THYAO.IS');
  const [kind, setKind] = useState<AlertKind>('price_above');
  const [threshold, setThreshold] = useState('350');
  const [pushStatus, setPushStatus] = useState<string>('');

  const selected = useMemo(
    () => ASSET_OPTIONS.find((a) => a.symbol === symbol),
    [symbol]
  );

  function onKindChange(k: AlertKind) {
    setKind(k);
    const d = defaultThreshold(k);
    if (d) setThreshold(d);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(threshold.replace(',', '.'));
    if (!Number.isFinite(n)) return;
    const displaySymbol =
      selected?.display ?? symbol.replace('.IS', '').replace('USDT', '');
    addAlert({ symbol, displaySymbol, kind, threshold: n });
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
          Fiyat hedefi, volatilite spike ve RSI kırılımları — tarayıcı bildirimi
          + (yapılandırıldıysa) e-posta
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
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-[var(--muted)]">
            Varlık
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {ASSET_OPTIONS.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.display}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--muted)]">
            Tetikleyici
            <select
              value={kind}
              onChange={(e) => onKindChange(e.target.value as AlertKind)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {KINDS.find((k) => k.value === kind)?.hint}
        </p>
        <label className="block text-xs text-[var(--muted)]">
          Eşik değeri
          <input
            type="number"
            step="any"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            required
          />
        </label>
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
          description="Yukarıdaki formdan fiyat, % hareket veya RSI alarmı kurun."
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
