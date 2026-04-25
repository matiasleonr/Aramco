import { cn } from '@/lib/utils'
import { CATEGORIA_COLORS } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'entrada' | 'salida' | 'success' | 'warning' | 'danger' | 'categoria'
  className?: string
  categoria?: string
}

export function Badge({ children, variant = 'default', className, categoria }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border'

  const variants: Record<string, string> = {
    default: 'bg-slate-700 text-slate-300 border-slate-600',
    entrada: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    salida: 'bg-red-400/10 text-red-400 border-red-400/20',
    success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    danger: 'bg-red-400/10 text-red-400 border-red-400/20',
    categoria: categoria ? CATEGORIA_COLORS[categoria] ?? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-700 text-slate-300 border-slate-600',
  }

  return (
    <span className={cn(base, variants[variant], className)}>
      {children}
    </span>
  )
}
