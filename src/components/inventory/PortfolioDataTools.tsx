'use client';

import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import type { AssetClass, PortfolioPosition } from '@/types';

const CLASSES: AssetClass[] = ['bist', 'crypto', 'gold', 'cash', 'deposit'];

type ImportedPosition = Omit<PortfolioPosition, 'id'>;

function parseImport(raw: unknown): ImportedPosition[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { positions?: unknown }).positions)
      ? (raw as { positions: unknown[] }).positions
      : [];
  const out: ImportedPosition[] = [];
  for (const item of list.slice(0, 500)) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Record<string, unknown>;
    const assetClass = CLASSES.includes(p.assetClass as AssetClass)
      ? (p.assetClass as AssetClass)
      : null;
    const buyPrice = Number(p.buyPrice);
    const quantity = Number(p.quantity);
    const symbol = String(p.symbol ?? '').trim().toUpperCase().slice(0, 32);
    if (!assetClass || !symbol || !(buyPrice > 0) || !(quantity > 0)) continue;
    out.push({
      symbol,
      name: String(p.name ?? symbol).slice(0, 80),
      assetClass,
      buyPrice,
      quantity,
      date:
        typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(p.date)
          ? p.date.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      currency: p.currency === 'USD' ? 'USD' : 'TRY',
      depositRatePct:
        p.depositRatePct != null ? Number(p.depositRatePct) : undefined,
      depositTenorDays:
        p.depositTenorDays != null ? Number(p.depositTenorDays) : undefined,
    });
  }
  return out;
}

/** JSON backup / restore — guards guest inventories against lost storage. */
export function PortfolioDataTools({
  positions,
  onImport,
}: {
  positions: PortfolioPosition[];
  onImport: (p: ImportedPosition) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  function exportJson() {
    const payload = {
      app: 'bullsye',
      version: 1,
      exportedAt: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      positions: positions.map(({ id, ...rest }) => rest),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bullsye-envanter-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('inventory_export', { count: positions.length });
  }

  async function importFile(file: File) {
    try {
      const rows = parseImport(JSON.parse(await file.text()));
      if (!rows.length) {
        setMsg('Dosyada geçerli pozisyon bulunamadı.');
        return;
      }
      const seen = new Set(
        positions.map((p) => `${p.symbol}|${p.buyPrice}|${p.quantity}|${p.date}`)
      );
      let added = 0;
      for (const r of rows) {
        const key = `${r.symbol}|${r.buyPrice}|${r.quantity}|${r.date}`;
        if (seen.has(key)) continue;
        seen.add(key);
        onImport(r);
        added++;
      }
      setMsg(
        added
          ? `${added} pozisyon içe aktarıldı.`
          : 'Tüm pozisyonlar zaten envanterde.'
      );
      trackEvent('inventory_import', { count: added });
    } catch {
      setMsg('Dosya okunamadı — Bullsye JSON yedeği seçin.');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="gap-1.5 px-2.5 py-1.5 text-xs"
        disabled={!positions.length}
        onClick={exportJson}
      >
        <Download className="size-3.5" /> Yedekle (JSON)
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-1.5 px-2.5 py-1.5 text-xs"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-3.5" /> İçe aktar
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importFile(f);
          e.target.value = '';
        }}
      />
      {msg ? (
        <span className="text-xs text-[var(--muted)]" role="status">
          {msg}
        </span>
      ) : null}
    </div>
  );
}
