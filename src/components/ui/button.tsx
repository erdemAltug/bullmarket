import { cn } from '@/lib/utils';

export function Button({
  className,
  variant = 'default',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        variant === 'default' &&
          'bg-[var(--accent)] text-[#042f2e] hover:brightness-110',
        variant === 'ghost' &&
          'text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]',
        variant === 'outline' &&
          'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)]',
        className
      )}
      {...props}
    />
  );
}
