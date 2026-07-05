import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'ghost' | 'outline' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({
  className,
  variant = 'accent',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'btn-premium font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2'
  
  const variants: Record<string, string> = {
    accent: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:shadow-lg hover:shadow-amber-500/25 active:shadow-md',
    ghost: 'bg-transparent text-zinc-300 border border-zinc-800 hover:bg-zinc-800/80 hover:text-white',
    outline: 'bg-transparent text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-500/60',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25',
  }

  const sizes: Record<string, string> = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-6 text-base rounded-xl',
    lg: 'h-13 px-8 text-lg rounded-xl',
    icon: 'h-10 w-10 rounded-xl',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], loading && 'opacity-70 cursor-not-allowed', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
