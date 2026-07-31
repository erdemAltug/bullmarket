'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPercent, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ShareCardButtonProps {
  title: string;
  subtitle?: string;
  price: number;
  changePercent?: number;
  currency?: string;
  className?: string;
}

export function ShareCardButton({
  title,
  subtitle,
  price,
  changePercent = 0,
  currency = 'TRY',
  className,
}: ShareCardButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const up = changePercent >= 0;

  async function makePng() {
    if (!cardRef.current) return null;
    setBusy(true);
    try {
      return await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#09090b',
      });
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    const dataUrl = await makePng();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.download = `Bullsye-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = dataUrl;
    a.click();
  }

  async function copy() {
    const dataUrl = await makePng();
    if (!dataUrl) return;
    const blob = await (await fetch(dataUrl)).blob();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="ghost"
        className="gap-1.5 px-2 py-1 text-xs"
        onClick={() => setOpen((v) => !v)}
      >
        <Share2 className="size-3.5" />
        Paylaş
      </Button>

      {open ? (
        <div className="absolute right-0 top-9 z-40 w-72 rounded-xl border border-zinc-700 bg-zinc-950 p-3 shadow-2xl">
          <div
            ref={cardRef}
            className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-emerald-400">
                Bullsye
              </span>
              <span className="text-[10px] text-zinc-600">· canlı</span>
            </div>
            <p className="text-lg font-semibold text-zinc-50">{title}</p>
            {subtitle ? (
              <p className="text-xs text-zinc-500">{subtitle}</p>
            ) : null}
            <p className="mt-3 text-2xl font-semibold">
              {formatPrice(price, currency)}
            </p>
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                up ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {formatPercent(changePercent)}
            </p>
            <div
              className={cn(
                'mt-4 h-16 rounded-lg opacity-80',
                up
                  ? 'bg-gradient-to-t from-emerald-500/20 to-transparent'
                  : 'bg-gradient-to-t from-red-500/20 to-transparent'
              )}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-1 text-xs"
              disabled={busy}
              onClick={download}
            >
              <Download className="size-3.5" />
              İndir PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-1 text-xs"
              disabled={busy}
              onClick={copy}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
