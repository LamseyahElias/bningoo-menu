import { cn } from '@/lib/utils'

interface BadgeProps {
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({ className, children, variant = 'default', size = 'sm', dot = false }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-zinc-800 text-zinc-300',
    accent: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    purple: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  }

  const dotColors: Record<string, string> = {
    accent: 'bg-amber-400',
    success: 'bg-emerald-400',
    warning: 'bg-orange-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    purple: 'bg-violet-400',
    default: 'bg-zinc-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
