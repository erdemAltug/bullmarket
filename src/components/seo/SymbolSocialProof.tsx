import { Briefcase, Eye } from 'lucide-react';
import { socialProofFor } from '@/lib/seo/social-proof';

type Props = { symbol: string };

export function SymbolSocialProof({ symbol }: Props) {
  const s = socialProofFor(symbol);
  return (
    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-2.5 py-1.5">
        <Eye className="size-3.5 opacity-70" />
        {s.labelViews}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface)] px-2.5 py-1.5">
        <Briefcase className="size-3.5 opacity-70" />
        {s.labelHolders}
      </span>
    </div>
  );
}
