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
        variant === 'default' && 'bg-emerald-600 text-white hover:bg-emerald-500',
        variant === 'ghost' && 'text-zinc-300 hover:bg-zinc-800',
        variant === 'outline' &&
          'border border-zinc-700 text-zinc-200 hover:bg-zinc-800',
        className
      )}
      {...props}
    />
  );
}
