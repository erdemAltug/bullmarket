import { BellRing, Gauge, Mail, Radar } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const SCAN_ROWS = ['THYAO', 'ASELS', 'GARAN', 'NVDA', 'BTC', 'EREGL'];

function ScanVisual() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]/60 p-2">
      <div
        aria-hidden
        className="landing-scan pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent"
      />
      <ul className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-[var(--muted)]">
        {SCAN_ROWS.map((s) => (
          <li key={s} className="rounded bg-[var(--card)] px-1.5 py-1 text-center">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreVisual() {
  return (
    <div className="space-y-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)]/60 p-2.5">
      {[
        ['Momentum', 82],
        ['Değerleme', 64],
        ['Hedef fiyat', 71],
      ].map(([l, v], i) => (
        <div key={l as string}>
          <div className="flex justify-between text-[10px] text-[var(--muted)]">
            <span>{l}</span>
            <span>{v}</span>
          </div>
          <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="landing-bar h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${v}%`, animationDelay: `${600 + i * 200}ms`, animationIterationCount: 1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotifyVisual() {
  return (
    <div className="space-y-1.5">
      <div className="landing-float flex items-center gap-2 rounded-lg border border-[var(--accent)]/40 bg-[var(--background)]/80 px-2.5 py-1.5 text-[10px]">
        <BellRing className="size-3.5 text-[var(--accent)]" />
        <span>Alarm: hedef seviye geçildi</span>
      </div>
      <div className="landing-float landing-float-late flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)]/80 px-2.5 py-1.5 text-[10px]">
        <Mail className="size-3.5 text-[var(--accent)]" />
        <span>08:30 · Sabah özetin hazır</span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    icon: Radar,
    title: 'Biz tarıyoruz',
    line: '550+ BİST hissesi, NASDAQ, kripto ve TEFAS fonları her gün yeniden hesaplanır.',
    visual: <ScanVisual />,
  },
  {
    icon: Gauge,
    title: 'Tek skora indiriyoruz',
    line: 'Momentum, değerleme, hedef fiyat ve hacim 0–100 arası tek bir sayıya iner.',
    visual: <ScoreVisual />,
  },
  {
    icon: BellRing,
    title: 'Sen sadece haber alıyorsun',
    line: 'Alarmın tetiklenince e-posta gelir, her sabah en güçlü 5 skor kutunda.',
    visual: <NotifyVisual />,
  },
];

export function HowItWorks() {
  return (
    <section id="nasil" className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Nasıl çalışır</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Ekran başında beklemene gerek yok
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Takip işini Bullsye yapar, karar senin.</p>
        </Reveal>
        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[16%] right-[16%] top-[30px] hidden h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent md:block"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 140}>
              <div className="relative flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40">
                <span className="flex size-[60px] items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10">
                  <s.icon className="size-6 text-[var(--accent)]" />
                </span>
                <span className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                  Adım {i + 1}
                </span>
                <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.line}</p>
                <div className="mt-4">{s.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
