import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ className, label, error, icon, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50',
            'transition-all duration-200',
            icon && 'pl-10',
            error && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
