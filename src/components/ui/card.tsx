import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  hover?: boolean
  elevated?: boolean
}

export function Card({ className, children, onClick, hover = false, elevated = false }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? 'card-elevated' : 'card-premium',
        hover && 'cursor-pointer hover:border-amber-500/30 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        'transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
